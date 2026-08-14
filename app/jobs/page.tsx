import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { JobsListProfile } from "@/lib/jobs-list-match";
import { getJobFacets, type JobFacets } from "@/lib/job-sources/facets";
import { jobFreshnessCutoff } from "@/lib/job-sources/freshness";
import { JobCard } from "./_components/job-card";
import { JobsHeader } from "./_components/jobs-header";
import { JobsSearchHero } from "./_components/jobs-search-hero";
import { JobsSidebar } from "./_components/jobs-sidebar";

const EMPTY_FACETS: JobFacets = { titles: [], locations: [], skills: [], workModes: [] };
const PAGE_SIZE = 24;

function safeSearchTerm(value: string | undefined) {
  return value
    ?.trim()
    .slice(0, 120)
    .replace(/[(),{}"\\%*_]/g, " ")
    .replace(/\s+/g, " ") ?? "";
}

function finiteNumber(value: string | undefined) {
  if (!value?.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function positivePage(value: string | undefined) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? Math.min(parsed, 10_000) : 1;
}

function pageHref(params: Record<string, string | undefined>, page: number) {
  const next = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (key !== "page" && value?.trim()) next.set(key, value);
  }
  if (page > 1) next.set("page", String(page));
  const query = next.toString();
  return query ? `/jobs?${query}` : "/jobs";
}

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
  const searchTerm = safeSearchTerm(params.q);
  const skillTerm = safeSearchTerm(params.skill);
  const experience = finiteNumber(params.experience);
  const salary = finiteNumber(params.salary);
  const page = positivePage(params.page);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("jobs")
    .select("*", { count: "exact" })
    .eq("is_active", true)
    .gte("posted_at", jobFreshnessCutoff())
    .order("posted_at", { ascending: false });

  if (searchTerm) query = query.or(`title.ilike.%${searchTerm}%,company.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
  if (params.location?.trim()) query = query.ilike("location", `%${safeSearchTerm(params.location)}%`);
  if (params.work_mode?.trim()) query = query.eq("work_mode", params.work_mode.trim().slice(0, 40));
  if (experience !== null) query = query.lte("experience_min", experience);
  if (salary !== null) query = query.gte("salary_max_lpa", salary);
  if (skillTerm) {
    query = query.or(`skills.cs.{"${skillTerm}"},title.ilike.%${skillTerm}%,description.ilike.%${skillTerm}%`);
  }

  const { data: jobs, error, count } = await query.range(from, to);
  const resultCount = count ?? jobs?.length ?? 0;
  const totalPages = Math.max(1, Math.ceil(resultCount / PAGE_SIZE));
  const pageJobs = jobs ?? [];
  const sampleCount = pageJobs.filter((job) => job.source === "JobCraft").length;
  const liveCount = pageJobs.length - sampleCount;

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
              {pageJobs.length > 0 && (
                <p className="mt-1 text-xs text-slate-500">
                  {totalPages > 1 ? `Page ${page} of ${totalPages} · ` : ""}
                  {liveCount > 0 ? `${liveCount} live on this page · ` : ""}
                  {sampleCount > 0 ? `${sampleCount} sample on this page` : ""}
                </p>
              )}
            </div>
            {!user && <Link href="/jobs?auth=signup" scroll={false} className="text-sm font-black text-violet-600">Create profile for match →</Link>}
          </div>

          {error && <p className="mb-4 rounded-xl bg-red-50 p-4 text-red-700">Could not load jobs: {error.message}</p>}
          <div className="space-y-4">{pageJobs.map((job) => <JobCard key={job.id} job={job} profile={profile} />)}</div>
          {!pageJobs.length && !error && <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-600">No roles matched. Try a wider search.</div>}

          {totalPages > 1 && !error && (
            <nav aria-label="Job result pages" className="mt-8 flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4">
              {page > 1
                ? <Link href={pageHref(params, page - 1)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-black">← Previous</Link>
                : <span className="rounded-xl border border-slate-100 px-4 py-2 text-sm font-black text-slate-300">← Previous</span>}
              <span className="text-sm font-bold text-slate-500">Page {page} of {totalPages}</span>
              {page < totalPages
                ? <Link href={pageHref(params, page + 1)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-black">Next →</Link>
                : <span className="rounded-xl border border-slate-100 px-4 py-2 text-sm font-black text-slate-300">Next →</span>}
            </nav>
          )}
        </div>

        <JobsSidebar hasLiveJobs={liveCount > 0} />
      </section>
    </main>
  );
}
