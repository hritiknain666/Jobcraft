import { NextRequest, NextResponse } from "next/server";
import { safeExternalUrl } from "@/lib/job-sources/safe-external-url";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

async function applicationTarget(id: string) {
  const supabase = await createClient();
  const { data: job } = await supabase
    .from("jobs")
    .select("apply_url,is_active,duplicate_of,source")
    .eq("id", id)
    .eq("is_active", true)
    .is("duplicate_of", null)
    .neq("source", "JobCraft")
    .maybeSingle();

  return { supabase, target: safeExternalUrl(job?.apply_url) };
}

function redirectToTarget(request: NextRequest, id: string, target: string | null) {
  if (!target) {
    return NextResponse.redirect(new URL(`/jobs/${id}?apply=unavailable`, request.url), 302);
  }

  const response = NextResponse.redirect(target, 302);
  response.headers.set("Referrer-Policy", "no-referrer");
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const { target } = await applicationTarget(id);
  return redirectToTarget(request, id, target);
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const { supabase, target } = await applicationTarget(id);

  if (!target) return redirectToTarget(request, id, null);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    const { data: existing } = await supabase
      .from("applications")
      .select("id")
      .eq("user_id", user.id)
      .eq("job_id", id)
      .maybeSingle();

    if (!existing) {
      // Tracking should never block access to the real application page. RLS and
      // the unique (user_id, job_id) constraint remain the final safety guards.
      await supabase.from("applications").insert({
        user_id: user.id,
        job_id: id,
        status: "Saved",
      });
    }
  }

  return redirectToTarget(request, id, target);
}
