import Link from "next/link";
import WorkspaceShell from "@/components/workspace-shell";
import { createClient } from "@/lib/supabase/server";
import { calculateJobsListMatch, type JobsListProfile } from "@/lib/jobs-list-match";
import { getProviderAttribution } from "@/lib/job-sources/attribution";
import { getJobFacets, type JobFacets } from "@/lib/job-sources/facets";
import { normalizeLocationSearch } from "@/lib/job-sources/location-search";

const EMPTY_FACETS: JobFacets = { titles: [], locations: [], skills: [], workModes: [] };
const PAGE_SIZE = 24;

function safeSearchTerm(value: string | undefined) {
  return value?.trim().slice(0, 120).replace(/[(),{}"\\%*_]/g, " ").replace(/\s+/g, " ") ?? "";
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

  let profile: (JobsListProfile & { full_name?: string | null; headline?: string | null }) | null = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("full_name,headline,skills,experience_years,city,target_roles,preferred_work_modes")
      .eq("id", user.id)
      .maybeSingle();
    profile = data ?? null;
  }

  const facets = await getJobFacets(supabase).catch(() => EMPTY_FACETS);
  const searchTerm = safeSearchTerm(params.q);
  const skillTerm = safeSearchTerm(params.skill);
  const locationTerm = normalizeLocationSearch(params.location);
  const experience = finiteNumber(params.experience);
  const salary = finiteNumber(params.salary);
  const page = positivePage(params.page);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  // Freshness is enforced in the ingestion layer: aggregator listings age out,
  // while direct Greenhouse/Lever snapshots deactivate jobs when employers remove them.
  let query = supabase
    .from("jobs")
    .select("*", { count: "exact" })
    .eq("is_active", true)
    .is("duplicate_of", null)
    .neq("source", "JobCraft")
    .order("posted_at", { ascending: false });

  if (searchTerm) query = query.textSearch("search_document", searchTerm, { type: "websearch", config: "simple" });
  if (locationTerm) query = query.ilike("location_normalized", `%${locationTerm}%`);
  if (params.work_mode?.trim()) query = query.eq("work_mode", params.work_mode.trim().slice(0, 40));
  if (experience !== null) query = query.lte("experience_min", experience);
  if (salary !== null) query = query.gte("salary_max_lpa", salary);
  if (skillTerm) query = query.textSearch("search_document", skillTerm, { type: "websearch", config: "simple" });

  const { data: jobs, error, count } = await query.range(from, to);
  const resultCount = count ?? jobs?.length ?? 0;
  const totalPages = Math.max(1, Math.ceil(resultCount / PAGE_SIZE));
  const pageJobs = jobs ?? [];
  const profileStrength = profile ? Math.round(([profile.full_name, profile.headline, profile.city, profile.experience_years !== null && profile.experience_years !== undefined, (profile.skills?.length ?? 0) > 0, (profile.target_roles?.length ?? 0) > 0, (profile.preferred_work_modes?.length ?? 0) > 0].filter(Boolean).length / 7) * 100) : 0;

  return (
    <WorkspaceShell active="jobs" authenticated={Boolean(user)} name={profile?.full_name} headline={profile?.headline} strength={profileStrength}>
      <div className="jc-content-wrap">
        <section className="jc-discover-head">
          <div>
            <p className="jc-eyebrow">THE OPPORTUNITY MAP</p>
            <h1 className="jc-page-title">Discover roles</h1>
          </div>
          <a href="#job-filters" className="jc-button-secondary">☷ Filters⌄</a>
        </section>

        <form action="/jobs" className="jc-card jc-search-panel" id="job-filters">
          <div className="jc-search-row">
            <label className="jc-search-field">
              <SearchIcon />
              <input name="q" defaultValue={params.q ?? ""} placeholder="Search title, skill, or company" aria-label="Search title, skill, or company" />
            </label>
            <label className="jc-search-field">
              <LocationIcon />
              <input name="location" list="jc-locations" defaultValue={params.location ?? ""} placeholder="Location or city" aria-label="Location or city" />
            </label>
          </div>
          <datalist id="jc-locations">{facets.locations.slice(0, 80).map((location) => <option key={location} value={location} />)}</datalist>
          <datalist id="jc-skills">{facets.skills.slice(0, 120).map((skill) => <option key={skill} value={skill} />)}</datalist>
          <details className="jc-filter-details" open={Boolean(params.skill || params.work_mode || params.salary || params.experience)}>
            <summary>Advanced filters · skill, work mode, salary and experience</summary>
            <div className="jc-filter-grid">
              <input className="jc-input" name="skill" list="jc-skills" defaultValue={params.skill ?? ""} placeholder="Skill e.g. SQL" />
              <select className="jc-input" name="work_mode" defaultValue={params.work_mode ?? ""}>
                <option value="">Any work mode</option>
                {facets.workModes.map((mode) => <option key={mode} value={mode}>{mode}</option>)}
              </select>
              <input className="jc-input" name="salary" type="number" min="0" step="0.5" defaultValue={params.salary ?? ""} placeholder="Min salary LPA" />
              <input className="jc-input" name="experience" type="number" min="0" max="50" step="0.5" defaultValue={params.experience ?? ""} placeholder="Your experience" />
              <button className="jc-button-primary" type="submit">Apply filters →</button>
            </div>
          </details>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <button className="jc-button-primary" type="submit">Search roles →</button>
            {(searchTerm || params.location || params.skill || params.work_mode || params.salary || params.experience) ? <Link href="/jobs" className="jc-text-link">Clear all filters</Link> : null}
          </div>
        </form>

        <div className="jc-results-meta">
          <span><b>{resultCount}</b> role{resultCount === 1 ? "" : "s"} tuned to your direction</span>
          <span className="flex items-center gap-2 text-[#278363]">✣ {profile ? "Match engine active" : "Create a profile to activate matching"}</span>
        </div>

        {error ? <div className="jc-card p-5 text-red-700">Could not load jobs: {error.message}</div> : null}
        <section className="jc-role-grid">
          {pageJobs.map((job: any) => {
            const match = calculateJobsListMatch(job, profile);
            const attribution = getProviderAttribution(job.source, job.apply_url);
            return (
              <article key={job.id} className="jc-card jc-job-card">
                <Link href={`/jobs/${job.id}`} className="flex flex-1 flex-col text-inherit no-underline">
                  <div className="jc-job-card-top">
                    <span className="jc-company-square">{companyInitials(job.company)}</span>
                    <span className="jc-bookmark" aria-hidden="true">⌑</span>
                  </div>
                  <div className="jc-job-source">{job.company} <span className="ml-2 rounded-full bg-[#e4f0e9] px-2 py-1 text-[9px] normal-case tracking-normal text-[#278363]">Live role</span></div>
                  <h2 className="jc-job-title">{job.title}</h2>
                  <p className="jc-job-details">⌖ {job.location_normalized || job.location || "India"} · {job.work_mode || "Work mode not listed"} · {salaryText(job.salary_min_lpa, job.salary_max_lpa)}</p>
                  <div className="jc-job-card-footer">
                    <div className="jc-job-match">{match ? `${match.score}% match · ${Math.round(match.evidenceCoverage * 100)}% evidence` : "Build profile for match"}</div>
                    <div className="jc-job-age">{postedAge(job.posted_at)} · {job.source}</div>
                  </div>
                </Link>
                {attribution?.href ? (
                  <a href={attribution.href} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex w-fit text-[10px] font-extrabold uppercase tracking-[.08em] text-[#5f786f] no-underline hover:text-[#173f33]">
                    {attribution.label} ↗
                  </a>
                ) : null}
              </article>
            );
          })}
        </section>

        {!pageJobs.length && !error ? <div className="jc-card mt-5 p-12 text-center text-[#6f887f]">No roles matched. Try a wider search.</div> : null}
        {pageJobs.length > 0 ? <p className="mt-5 text-xs leading-6 text-[#789087]">Live vacancies retain their provider source and external application link. Always verify the provider listing before applying.</p> : null}

        {totalPages > 1 && !error ? (
          <nav aria-label="Job result pages" className="jc-pagination">
            {page > 1 ? <Link href={pageHref(params, page - 1)} className="jc-button-secondary">← Previous</Link> : <span className="jc-button-secondary opacity-40">← Previous</span>}
            <span className="text-sm font-bold text-[#718981]">Page {page} of {totalPages}</span>
            {page < totalPages ? <Link href={pageHref(params, page + 1)} className="jc-button-secondary">Next →</Link> : <span className="jc-button-secondary opacity-40">Next →</span>}
          </nav>
        ) : null}
      </div>
    </WorkspaceShell>
  );
}

function companyInitials(company: string) {
  return String(company || "JC").split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "JC";
}

function salaryText(min: number | null, max: number | null) {
  if (min && max) return `₹${min}–${max} LPA`;
  if (max) return `Up to ₹${max} LPA`;
  if (min) return `From ₹${min} LPA`;
  return "Salary not listed";
}

function postedAge(postedAt: string | null) {
  if (!postedAt) return "Recently posted";
  const ms = Date.now() - new Date(postedAt).getTime();
  if (!Number.isFinite(ms) || ms < 0) return "Recently posted";
  const hours = Math.floor(ms / 3_600_000);
  if (hours < 24) return `${Math.max(1, hours)}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function SearchIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>;
}

function LocationIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>;
}
