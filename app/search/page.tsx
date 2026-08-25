import Link from "next/link";
import WorkspaceShell from "@/components/workspace-shell";
import { createClient } from "@/lib/supabase/server";
import type { JobRecord, ProfileRecord } from "@/lib/types/jobcraft";

const TOOLS = [
  { title: "Discover roles", href: "/jobs", description: "Search live jobs by title, company, skill, location, salary and work mode.", keywords: "jobs roles vacancies search skill company location salary" },
  { title: "Applications", href: "/applications", description: "Track saved roles, applications, interviews, offers and closed applications.", keywords: "applications tracker saved applied interview offer rejected" },
  { title: "My profile", href: "/profile", description: "Manage your name, city, experience, skills, target roles and work preferences.", keywords: "profile skills target roles experience city work preference onboarding" },
  { title: "Settings", href: "/settings", description: "Manage your JobCraft account, privacy links and sign-out controls.", keywords: "settings account privacy terms logout sign out" },
  { title: "Resume studio", href: "/resume", description: "Build, upload and manage ATS-friendly resume versions from one place.", keywords: "resume cv upload document studio builder build ats create" },
  { title: "Resume tailoring", href: "/resume/tailor", description: "Create a role-focused resume version without changing the facts.", keywords: "resume tailor tailoring job specific cv" },
  { title: "Certificates", href: "/certificates", description: "Keep relevant professional certificates and credentials organised.", keywords: "certificate certification credential course qualification" },
  { title: "Cover letters", href: "/cover-letter", description: "Prepare role-specific cover-letter drafts grounded in your information.", keywords: "cover letter application letter draft" },
  { title: "AI Assistant", href: "/career-assistant", description: "Get career priorities and model-backed career assistance from one place.", keywords: "ai assistant career advice interview resume job help" },
] as const;

function cleanQuery(value: string | undefined) {
  return (value ?? "")
    .trim()
    .slice(0, 120)
    .replace(/[(),{}"\\%*_]/g, " ")
    .replace(/\s+/g, " ");
}

function matchesTool(query: string, tool: (typeof TOOLS)[number]) {
  if (!query) return true;
  const haystack = `${tool.title} ${tool.description} ${tool.keywords}`.toLowerCase();
  return query.toLowerCase().split(/\s+/).every((part) => haystack.includes(part));
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;
  const q = cleanQuery(params.q);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile: ProfileRecord | null = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("full_name,headline,city,experience_years,skills,target_roles,preferred_work_modes")
      .eq("id", user.id)
      .maybeSingle();
    profile = data;
  }

  const toolResults = TOOLS.filter((tool) => matchesTool(q, tool));

  let jobs: JobRecord[] = [];
  let jobError: string | null = null;
  if (q) {
    const { data, error } = await supabase
      .from("jobs")
      .select("id,title,company,location_normalized,location,work_mode,salary_min_lpa,salary_max_lpa,posted_at")
      .eq("is_active", true)
      .is("duplicate_of", null)
      .neq("source", "JobCraft")
      .textSearch("search_document", q, { type: "websearch", config: "simple" })
      .order("posted_at", { ascending: false })
      .limit(30);
    jobs = (data ?? []) as JobRecord[];
    jobError = error?.message ?? null;
  }

  const strength = profile ? Math.round(([
    profile.full_name,
    profile.headline,
    profile.city,
    profile.experience_years !== null && profile.experience_years !== undefined,
    (profile.skills?.length ?? 0) > 0,
    (profile.target_roles?.length ?? 0) > 0,
    (profile.preferred_work_modes?.length ?? 0) > 0,
  ].filter(Boolean).length / 7) * 100) : 0;

  return (
    <WorkspaceShell active="workspace" authenticated={Boolean(user)} name={profile?.full_name} headline={profile?.headline} strength={strength}>
      <div className="jc-content-wrap">
        <section className="jc-tool-hero">
          <div>
            <p className="jc-eyebrow">SEARCH ALL OF JOBCRAFT</p>
            <h1 className="jc-page-title">Find a job or tool.</h1>
            <p className="jc-page-copy">Search job titles, companies, skills, job-description text and JobCraft features from one place.</p>
          </div>
        </section>

        <form action="/search" method="get" role="search" className="jc-card mt-5 flex flex-col gap-3 p-4 sm:flex-row">
          <input autoFocus type="search" name="q" defaultValue={q} placeholder="Try: data analyst, Power BI, resume, interview..." className="jc-input flex-1" aria-label="Search jobs and JobCraft tools" />
          <button className="jc-button-primary" type="submit">Search JobCraft →</button>
        </form>

        {!q ? (
          <section className="mt-8">
            <div className="mb-4"><p className="jc-eyebrow">QUICK ACCESS</p><h2 className="jc-section-title">Useful tools</h2></div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{toolResults.map((tool) => <ToolCard key={tool.href} tool={tool} />)}</div>
          </section>
        ) : (
          <>
            <section className="mt-8">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3"><div><p className="jc-eyebrow">JOBCRAFT TOOLS</p><h2 className="jc-section-title">{toolResults.length} matching tool{toolResults.length === 1 ? "" : "s"}</h2></div></div>
              {toolResults.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{toolResults.map((tool) => <ToolCard key={tool.href} tool={tool} />)}</div> : <div className="jc-card p-6 text-sm text-[#789087]">No JobCraft tool matched “{q}”.</div>}
            </section>

            <section className="mt-10">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div><p className="jc-eyebrow">LIVE JOBS</p><h2 className="jc-section-title">{jobs.length} matching role{jobs.length === 1 ? "" : "s"}</h2></div>
                <Link href={`/jobs?q=${encodeURIComponent(q)}`} className="jc-text-link">Open full job search ↗</Link>
              </div>
              {jobError ? <div className="jc-card p-5 text-sm text-red-700">Job search is temporarily unavailable: {jobError}</div> : null}
              {!jobError && jobs.length ? <div className="grid gap-4 md:grid-cols-2">{jobs.map((job) => <Link key={job.id} href={`/jobs/${job.id}`} className="jc-card p-5 text-inherit no-underline transition hover:-translate-y-0.5 hover:border-[#b9c9c2]"><p className="jc-eyebrow !text-[10px]">{job.company}</p><h3 className="jc-section-title !mt-2 !text-[22px]">{job.title}</h3><p className="mt-2 text-xs leading-6 text-[#789087]">{job.location_normalized || job.location || "India"} · {job.work_mode || "Work mode not listed"} · {salaryText(job.salary_min_lpa, job.salary_max_lpa)}</p></Link>)}</div> : null}
              {!jobError && !jobs.length ? <div className="jc-card p-6 text-sm text-[#789087]">No live jobs matched “{q}”. Try a broader title, company or skill.</div> : null}
            </section>
          </>
        )}
      </div>
    </WorkspaceShell>
  );
}

function ToolCard({ tool }: { tool: (typeof TOOLS)[number] }) {
  return <Link href={tool.href} className="jc-card p-5 text-inherit no-underline transition hover:-translate-y-0.5 hover:border-[#b9c9c2]"><div className="flex items-start justify-between gap-4"><div><p className="jc-eyebrow !text-[10px]">JOBCRAFT TOOL</p><h3 className="jc-section-title !mt-2 !text-[22px]">{tool.title}</h3></div><span className="text-xl text-[#278363]">↗</span></div><p className="mt-3 text-xs leading-6 text-[#789087]">{tool.description}</p></Link>;
}

function salaryText(min: number | null, max: number | null) {
  if (min && max) return `₹${min}–${max} LPA`;
  if (max) return `Up to ₹${max} LPA`;
  if (min) return `From ₹${min} LPA`;
  return "Salary not listed";
}
