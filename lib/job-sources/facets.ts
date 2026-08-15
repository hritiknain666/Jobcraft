import type { SupabaseClient } from "@supabase/supabase-js";

export type JobFacets = {
  titles: string[];
  locations: string[];
  skills: string[];
  workModes: string[];
};

const uniqueSorted = (values: string[]) =>
  [...new Set(values.map((value) => value.trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));

export async function getJobFacets(supabase: SupabaseClient): Promise<JobFacets> {
  const { data, error } = await supabase
    .from("jobs")
    .select("title,location_normalized,skills,work_mode")
    .eq("is_active", true)
    .is("duplicate_of", null)
    .neq("source", "JobCraft")
    .order("posted_at", { ascending: false })
    .limit(2000);

  if (error) throw error;
  const jobs = data ?? [];

  return {
    titles: uniqueSorted(jobs.map((job) => String(job.title ?? ""))),
    locations: uniqueSorted(jobs.map((job) => String(job.location_normalized ?? ""))),
    skills: uniqueSorted(jobs.flatMap((job) => Array.isArray(job.skills) ? job.skills.map(String) : [])),
    workModes: uniqueSorted(jobs.map((job) => String(job.work_mode ?? ""))),
  };
}
