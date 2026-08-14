import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { JobsListProfile } from "@/lib/jobs-list-match";
import { getJobFacets, type JobFacets } from "@/lib/job-sources/facets";
import { JobCard } from "./_components/job-card";
import { JobsHeader } from "./_components/jobs-header";
import { JobsSearchHero } from "./_components/jobs-search-hero";
import { JobsSidebar } from "./_components/jobs-sidebar";

const EMPTY_FACETS: JobFacets = { titles: [], locations: [], skills: [], workModes: [] };

export default async function JobsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile: JobsListProfile | null = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("skills,experience_years,city,target_roles,preferred_work_modes")
      .eq("id", user.id)
      .maybeSingle();
    profile = data ?? null;
  }

  const facets = await getJobFacets(supabase).catch(() => EMPTY_FACETS);

  let query = supabase.from("jobs").select("*").eq("is_active", true).order("posted_at", { ascending: false });
  if (params.q) query = query.or(`title.ilike.%${params.q}%,company.ilike.%${params.q}%,description.ilike.%${params.q}%`);
  if (params.location) query = query.ilike("location", `%${params.location}%`);
  if (params.work_mode) query = query.eq("work_mode", params.work_mode);
  if (params.experience) query = query.lte("experience_min", Number(params.experience));
  if (params.salary) query = query.gte("salary_max_lpa", Number(params.salary));
  if (params.skill) query = query.contains("skills", [params.skill]);

  const { data: jobs, error } = await query;
  const resultCount = jobs?.length ?? 0;
  const sampleCount = (jobs ?? []).filter((job) => job.source === "JobCraft").length;
  const liveCount = resultCount - sampleCount;

  return (
    <main className="min-h-screen bg-[#f6f7fb] text-[#0b1020]">
      <JobsHeader loggedIn={Boolean(user)} />
      <JobsSearchHero params={params} facets={facets} />

      <section className="mx-auto grid max-w-[1400px] gap-6 px-5 py-8 sm:px-8 lg:grid-cols-[1fr_300px]">
        <div>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black tracking-[.14em] text-violet-600">RESULTS</p>
              <h2 className="mt-1 text-2xl font-black">{resultCount} role{resultCount === 1 ? "" : "s"}</h2>
              {resultCount > 0 && <p className="mt-1 text-xs text-slate-500">{liveCount > 0 ? `${liveCount} live · ` : ""}{sampleCount > 0 ? `${sampleCount} sample` : ""}</p>}
            </div>
            {!user && <Link href="/jobs?auth=signup" scroll={false} className="text-sm font-black text-violet-600">Create profile for match →</Link>}
          </div>

          {error && <p className="mb-4 rounded-xl bg-red-50 p-4 text-red-700">Could not load jobs: {error.message}</p>}
          <div className="space-y-4">{(jobs ?? []).map((job) => <JobCard key={job.id} job={job} profile={profile} />)}</div>
          {!jobs?.length && !error && <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-600">No roles matched. Try a wider search.</div>}
        </div>

        <JobsSidebar hasLiveJobs={liveCount > 0} />
      </section>
    </main>
  );
}
