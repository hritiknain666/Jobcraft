import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateCareerAssistantResponse, isAiConfigured } from "@/lib/ai/openai";
import { logMonitoringEvent } from "@/lib/monitoring";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_PROMPT_LENGTH = 2_000;
const RATE_LIMIT = 10;
const RATE_WINDOW_SECONDS = 10 * 60;

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retry_after_seconds: number;
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  if (!isAiConfigured()) return NextResponse.json({ error: "AI is not configured yet." }, { status: 503 });

  let body: { prompt?: unknown; jobId?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const prompt = String(body.prompt ?? "").trim();
  const jobId = String(body.jobId ?? "").trim();
  if (!prompt) return NextResponse.json({ error: "Ask a career question first." }, { status: 400 });
  if (prompt.length > MAX_PROMPT_LENGTH) return NextResponse.json({ error: "Question is too long." }, { status: 400 });

  const admin = createAdminClient();
  const { data: rateRows, error: rateError } = await admin.rpc("consume_ai_rate_limit", {
    p_user_id: user.id,
    p_limit: RATE_LIMIT,
    p_window_seconds: RATE_WINDOW_SECONDS,
  });
  if (rateError) {
    logMonitoringEvent("error", "ai_rate_limit_check_failed", { error: rateError.message });
    return NextResponse.json({ error: "The AI assistant is temporarily unavailable." }, { status: 503 });
  }

  const rate = (Array.isArray(rateRows) ? rateRows[0] : rateRows) as RateLimitResult | null;
  if (!rate?.allowed) {
    const retryAfter = Math.max(1, rate?.retry_after_seconds ?? RATE_WINDOW_SECONDS);
    logMonitoringEvent("warn", "ai_rate_limit_blocked", { retryAfterSeconds: retryAfter });
    return NextResponse.json(
      { error: "Too many AI requests. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(retryAfter), "X-RateLimit-Remaining": "0" } }
    );
  }

  const [{ data: profile }, { data: applications }, { data: job }] = await Promise.all([
    supabase
      .from("profiles")
      .select("headline,city,experience_years,skills,target_roles,preferred_work_modes")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("applications")
      .select("status")
      .eq("user_id", user.id),
    jobId
      ? supabase
          .from("jobs")
          .select("title,company,location_normalized,location,work_mode,experience_min,experience_max,skills,description")
          .eq("id", jobId)
          .eq("is_active", true)
          .is("duplicate_of", null)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const applicationSummary = (applications ?? []).reduce<Record<string, number>>((summary, item) => {
    const status = String(item.status || "Unknown");
    summary[status] = (summary[status] ?? 0) + 1;
    return summary;
  }, {});

  const context = {
    profile: {
      headline: profile?.headline || null,
      city: profile?.city || null,
      experienceYears: profile?.experience_years ?? null,
      skills: profile?.skills ?? [],
      targetRoles: profile?.target_roles ?? [],
      preferredWorkModes: profile?.preferred_work_modes ?? [],
    },
    applications: applicationSummary,
    selectedJob: job
      ? {
          title: job.title,
          company: job.company,
          location: job.location_normalized || job.location || null,
          workMode: job.work_mode || null,
          experienceMin: job.experience_min ?? null,
          experienceMax: job.experience_max ?? null,
          skills: job.skills ?? [],
          description: String(job.description || "").slice(0, 8_000),
        }
      : null,
  };

  const instruction = [
    "You are JobCraft Career Assistant for the Indian job market.",
    "Give practical, concise career guidance grounded only in the supplied JobCraft context and the user's question.",
    "Never invent experience, qualifications, skills, salary data, employer facts, application outcomes, or resume claims.",
    "If evidence is missing, say what is missing and suggest the next useful action.",
    "Prefer specific next steps over generic encouragement.",
    "Do not claim that the user has applied, interviewed, or received an offer unless the supplied application summary supports it.",
  ].join(" ");

  try {
    const result = await generateCareerAssistantResponse({
      instruction,
      userPrompt: `JobCraft context:\n${JSON.stringify(context)}\n\nUser question:\n${prompt}`,
    });
    return NextResponse.json(
      { answer: result.text, model: result.model },
      { headers: { "X-RateLimit-Remaining": String(rate.remaining) } }
    );
  } catch (error) {
    logMonitoringEvent("error", "ai_request_failed", {
      error: error instanceof Error ? error.message : "Unknown AI request error",
    });
    return NextResponse.json({ error: "The AI assistant could not answer right now." }, { status: 502 });
  }
}
