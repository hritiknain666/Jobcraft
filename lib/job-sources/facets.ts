import type { SupabaseClient } from "@supabase/supabase-js";
import { jobFreshnessCutoff } from "./freshness";

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
    .select("title,location,skills,work_mode")
    .eq("is_active", true)
    .gte("posted_at", jobFreshnessCutoff())
    .order("posted_at", { ascending: false })
    .limit(1000);

  if (error) throw error;
  const jobs = data ?? [];

  return {
    titles: uniqueSorted(jobs.map((job) => String(job.title ?? ""))),
    locations: uniqueSorted(jobs.map((job) => String(job.location ?? ""))),
    skills: uniqueSorted(jobs.flatMap((job) => Array.isArray(job.skills) ? job.skills.map(String) : [])),
    workModes: uniqueSorted(jobs.map((job) => String(job.work_mode ?? ""))),
  };
}
