"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createCoverLetter(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const jobId = String(formData.get("jobId") ?? "");
  if (!jobId) redirect("/jobs");

  const [{ data: job }, { data: profile }] = await Promise.all([
    supabase.from("jobs").select("id,title,company,skills").eq("id", jobId).single(),
    supabase.from("profiles").select("full_name,headline,skills,city").eq("id", user.id).maybeSingle(),
  ]);
  if (!job) redirect("/jobs");

  const ownSkills: string[] = profile?.skills ?? [];
  const relevant = (job.skills ?? []).filter((skill: string) => ownSkills.some((own) => own.toLowerCase() === skill.toLowerCase()));
  const name = profile?.full_name || "Candidate";
  const body = `Dear Hiring Manager,\n\nI am writing to express my interest in the ${job.title} position at ${job.company}. ${profile?.headline ? `My background as ${profile.headline} aligns well with this opportunity.` : "I am interested in contributing my skills and experience to this role."}\n\n${relevant.length ? `My relevant skills include ${relevant.join(", ")}. ` : ""}I would welcome the opportunity to discuss how my real experience, projects, and capabilities can contribute to your team.\n\nThank you for considering my application. I look forward to the opportunity to speak with you.\n\nSincerely,\n${name}`;

  const { data, error } = await supabase.from("cover_letters").insert({ user_id: user.id, job_id: job.id, title: `${job.title} — ${job.company}`, body }).select("id").single();
  if (error) redirect(`/jobs/${jobId}?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/cover-letter");
  redirect(`/cover-letter?id=${data.id}`);
}
