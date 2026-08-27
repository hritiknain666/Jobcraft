"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createTailoredResume(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const jobId = String(formData.get("jobId") ?? "");
  const resumeId = String(formData.get("resumeId") ?? "");
  if (!jobId) redirect("/jobs");

  const [{ data: job }, { data: profile }, { data: resume }] = await Promise.all([
    supabase.from("jobs").select("id,title,company,skills,description").eq("id", jobId).single(),
    supabase
      .from("profiles")
      .select("full_name,headline,skills,target_roles")
      .eq("id", user.id)
      .maybeSingle(),
    resumeId
      ? supabase
          .from("resumes")
          .select("id,name,parsed_text,structured_data")
          .eq("id", resumeId)
          .eq("user_id", user.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  if (!job) redirect("/jobs");

  const userSkills: string[] = profile?.skills ?? [];
  const jobSkills: string[] = job.skills ?? [];
  const relevantSkills = jobSkills.filter((skill) =>
    userSkills.some((own) => own.toLowerCase() === skill.toLowerCase()),
  );

  const content = {
    candidate_name: profile?.full_name ?? "Candidate",
    target_role: job.title,
    company: job.company,
    headline: profile?.headline ?? `Candidate targeting ${job.title} roles`,
    relevant_skills: relevantSkills,
    source_resume_name: resume?.name ?? null,
    source_text: resume?.parsed_text ?? null,
    guidance: [
      `Lead with truthful experience and projects most relevant to ${job.title}.`,
      relevantSkills.length
        ? `Prioritize proven skills: ${relevantSkills.join(", ")}.`
        : "Add only job-relevant skills you genuinely possess.",
      "Use measurable outcomes where they are supported by your real experience.",
      "Do not add qualifications, employers, projects, or achievements that are not true.",
    ],
  };

  const { data, error } = await supabase
    .from("tailored_resumes")
    .insert({
      user_id: user.id,
      source_resume_id: resume?.id ?? null,
      job_id: job.id,
      title: `${job.title} — ${job.company}`,
      content,
    })
    .select("id")
    .single();

  if (error) redirect(`/jobs/${jobId}?error=${encodeURIComponent(error.message)}`);
  redirect(`/resume/tailor/${data.id}`);
}
