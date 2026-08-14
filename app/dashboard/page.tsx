import Link from "next/link";
import WorkspaceShell from "@/components/workspace-shell";
import { createClient } from "@/lib/supabase/server";
import { calculateJobMatch } from "@/lib/job-match";
import { jobFreshnessCutoff } from "@/lib/job-sources/freshness";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return <GuestWorkspace />;

  const [{ data: profile }, { count: resumeCount }, { data: applications }, { data: jobs }] = await Promise.all([
    supabase.from("profiles").select("full_name,city,headline,experience_years,target_roles,skills,preferred_work_modes").eq("id", user.id).maybeSingle(),
    supabase.from("resumes").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("applications").select("id,status,created_at,updated_at,jobs(id,title,company,location,work_mode)").eq("user_id", user.id).order("updated_at", { ascending: false }),
    supabase.from("jobs").select("id,title,company,location,work_mode,salary_min_lpa,salary_max_lpa,experience_min,skills,source,posted_at").eq("is_active", true).gte("posted_at", jobFreshnessCutoff()).order("posted_at", { ascending: false }).limit(18),
  ]);

  const skills = profile?.skills ?? [];
  const targetRoles = profile?.target_roles ?? [];
  const preferredWorkModes = profile?.preferred_work_modes ?? [];
  const hasResume = (resumeCount ?? 0) > 0;
  const completed = [
    profile?.full_name,
    profile?.city,
    profile?.headline,
    profile?.experience_years !== null && profile?.experience_years !== undefined,
    skills.length > 0,
    targetRoles.length > 0,
    preferredWorkModes.length > 0,
    hasResume,
  ].filter(Boolean).length;
  const profileStrength = Math.round((completed / 8) * 100);
  const displayName = profile?.full_name?.trim() || user.user_metadata?.full_name || "Your profile";
  const firstName = displayName.split(/\s+/)[0] || "there";

  const recommendations = (jobs ?? []).map((job: any) => ({
    ...job,
    match: calculateJobMatch({
      jobSkills: job.skills ?? [],
      userSkills: skills,
      jobMinExperience: job.experience_min,
      userExperience: profile?.experience_years,
      jobLocation: job.location,
      userCity: profile?.city,
      jobWorkMode: job.work_mode,
      preferredWorkModes,
      targetRoles,
      jobTitle: job.title,
    }),
  })).sort((a: any, b: any) => {
    const evidenceGap = b.match.evidenceCoverage - a.match.evidenceCoverage;
    return Math.abs(evidenceGap) > .25 ? evidenceGap : b.match.score - a.match.score;
  }).slice(0, 4);

  const savedCount = applications?.filter((item: any) => item.status === "Saved").length ?? 0;
  const motionCount = applications?.filter((item: any) => ["Applied", "Screening", "Interview"].includes(item.status)).length ?? 0;
  const interviewCount = applications?.filter((item: any) => item.status === "Interview").length ?? 0;
  const newMatchCount = recommendations.filter((job: any) => job.match.score >= 55).length;
  const currentDate = new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "2-digit", month: "short" }).format(new Date()).toUpperCase();

  const upcoming = (applications ?? [])
    .filter((item: any) => ["Applied", "Screening", "Interview"].includes(item.status))
    .slice(0, 2);

  return (
    <WorkspaceShell active="workspace" name={displayName} headline={profile?.headline} strength={profileStrength} authenticated>
      <div className="jc-content-wrap">
        <section className="jc-dashboard-head">
          <div>
            <p className="jc-eyebrow">{currentDate} · YOUR WORKSPACE</p>
            <h1 className="jc-page-title">Good to see you, {firstName}.</h1>
          </div>
          <Link href="/jobs" className="jc-button-primary">✣ Find your next role <span>↗</span></Link>
        </section>

        <section className="jc-stats-grid" aria-label="Career search summary">
          <StatCard label="New matches" value={newMatchCount} note="roles tuned to you" icon="↗" />
          <StatCard label="Saved roles" value={savedCount} note="worth a closer look" icon="✣" />
          <StatCard label="In motion" value={motionCount} note="applications active" icon="▣" />
          <StatCard label="Interviews" value={interviewCount} note="conversations ahead" icon="▦" />
        </section>

        <section className="jc-dashboard-grid">
          <div className="jc-card jc-section-card">
            <div className="jc-section-head">
              <div>
                <p className="jc-eyebrow">CURATED FOR YOUR SIGNAL</p>
                <h2 className="jc-section-title">Roles worth your energy</h2>
                <p className="jc-section-subtitle">A short list of opportunities that fit where you&apos;re headed.</p>
              </div>
              <Link href="/jobs" className="jc-text-link">View all</Link>
            </div>
            <div className="jc-role-list">
              {recommendations.length ? recommendations.map((job: any) => (
                <Link key={job.id} href={`/jobs/${job.id}`} className="jc-role-row">
                  <span className="jc-company-dot">{companyInitials(job.company)}</span>
                  <span className="jc-role-copy">
                    <b>{job.title}</b>
                    <span>{job.company} · {job.location || "India"} · {job.work_mode || "Mode not listed"}</span>
                  </span>
                  <span className="jc-role-meta">
                    <span className="jc-match-pill">{job.match.score}% match</span>
                    <span className="jc-role-salary">{salaryText(job.salary_min_lpa, job.salary_max_lpa)}</span>
                  </span>
                  <span aria-hidden="true">›</span>
                </Link>
              )) : (
                <div className="py-10 text-sm leading-6 text-[#6f887f]">Add target roles and skills to your profile, then JobCraft will rank the strongest available roles here.</div>
              )}
            </div>
          </div>

          <div className="jc-dark-card jc-coming-card">
            <div className="jc-section-head">
              <div><p className="jc-eyebrow">KEEP THE MOMENTUM</p><h2 className="jc-section-title">Coming up</h2></div>
              <span className="text-xl text-[#9bb3aa]">◷</span>
            </div>
            <div className="jc-upcoming-list">
              {upcoming.length ? upcoming.map((item: any) => (
                <Link href="/applications" key={item.id} className="jc-upcoming-item text-inherit no-underline">
                  <span className="jc-upcoming-badge">{companyInitials(item.jobs?.company || "JC").slice(0, 1)}</span>
                  <span className="jc-upcoming-copy">
                    <b>{item.status === "Interview" ? "Prepare for your interview" : item.status === "Screening" ? "Screening in progress" : "Follow up with recruiter"}</b>
                    <span>{item.jobs?.company || "Application"} · {item.jobs?.title || "Role"}</span>
                    <span className="jc-upcoming-date">{new Date(item.updated_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
                  </span>
                </Link>
              )) : (
                <div className="pt-3">
                  <p className="text-sm font-bold">Your plan is clear.</p>
                  <p className="mt-2 text-xs leading-6 text-[#9bb3aa]">Save a role or move an application forward and the next action will appear here.</p>
                </div>
              )}
            </div>
            <Link href="/applications" className="mt-5 inline-block text-sm font-extrabold text-[#f49a48] no-underline">Open application plan ↗</Link>
          </div>
        </section>

        <section className="jc-card jc-activity-card">
          <div className="jc-section-head">
            <div><p className="jc-eyebrow">A CLEAR TRAIL</p><h2 className="jc-section-title">Recent activity</h2></div>
            <Link href="/applications" className="jc-text-link">See applications ↗</Link>
          </div>
          <div className="jc-activity-grid">
            {(applications ?? []).slice(0, 4).map((item: any) => (
              <div key={item.id} className="jc-activity-item">
                <b>{activityTitle(item.status)}</b>
                <span>{item.jobs?.company || "JobCraft"} · {item.jobs?.title || "Application"} · {new Date(item.updated_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</span>
              </div>
            ))}
            {!applications?.length && <>
              <div className="jc-activity-item"><b>Profile signal ready</b><span>{profileStrength}% complete · strengthen it from My profile</span></div>
              <div className="jc-activity-item"><b>{hasResume ? "Resume workspace ready" : "Resume still to add"}</b><span>{hasResume ? `${resumeCount} saved resume version${resumeCount === 1 ? "" : "s"}` : "Build or upload your first factual resume"}</span></div>
            </>}
          </div>
        </section>
      </div>
    </WorkspaceShell>
  );
}

function GuestWorkspace() {
  const currentDate = new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "2-digit", month: "short" }).format(new Date()).toUpperCase();
  return (
    <WorkspaceShell active="workspace" name="Your profile" headline="Log in to activate your workspace" strength={0} authenticated={false}>
      <div className="jc-content-wrap">
        <section className="jc-dashboard-head">
          <div>
            <p className="jc-eyebrow">{currentDate} · JOBCRAFT WORKSPACE</p>
            <h1 className="jc-page-title">Your career workspace is ready.</h1>
            <p className="jc-page-copy max-w-2xl">This is the real JobCraft product. Log in when you want to search roles, build your profile, prepare resumes, tailor applications or use career tools.</p>
          </div>
          <Link href="/dashboard?auth=login" scroll={false} className="jc-button-primary">Log in to JobCraft <span>→</span></Link>
        </section>

        <section className="jc-stats-grid" aria-label="Locked career search summary">
          <LockedStat label="New matches" note="personalised after login" />
          <LockedStat label="Saved roles" note="your shortlist" />
          <LockedStat label="In motion" note="active applications" />
          <LockedStat label="Interviews" note="your conversations" />
        </section>

        <section className="jc-dashboard-grid">
          <div className="jc-card jc-section-card">
            <div className="jc-section-head">
              <div>
                <p className="jc-eyebrow">YOUR JOBCRAFT TOOLKIT</p>
                <h2 className="jc-section-title">Everything stays in one workspace</h2>
                <p className="jc-section-subtitle">See the full product before you sign in. Your personal data only appears after authentication.</p>
              </div>
            </div>
            <div className="jc-role-list">
              {[
                ["JM", "Job matching", "Search roles and see evidence-aware fit signals.", "/jobs"],
                ["RB", "Resume builder", "Create factual ATS-friendly resume versions.", "/resume/builder"],
                ["RT", "Resume tailoring", "Prepare a role-specific version from real evidence.", "/resume/tailor"],
                ["CL", "Cover letters", "Create grounded role-specific application drafts.", "/cover-letter"],
              ].map(([mark, title, text, href]) => (
                <Link key={title} href={href} className="jc-role-row">
                  <span className="jc-company-dot">{mark}</span>
                  <span className="jc-role-copy"><b>{title}</b><span>{text}</span></span>
                  <span className="jc-role-meta"><span className="jc-match-pill">Login required</span></span>
                  <span aria-hidden="true">›</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="jc-dark-card jc-coming-card">
            <div className="jc-section-head">
              <div><p className="jc-eyebrow">CAREER TOOLS</p><h2 className="jc-section-title">Built around your search</h2></div>
            </div>
            <div className="mt-6 space-y-4 text-sm leading-6 text-[#b5c7c0]">
              <p><b className="text-white">Resume Studio</b><br/>Build, upload and manage resume versions.</p>
              <p><b className="text-white">Certificates</b><br/>Keep credentials and private proof organised.</p>
              <p><b className="text-white">Career Assistant</b><br/>Turn your profile and application history into priorities.</p>
              <p><b className="text-white">Application Plan</b><br/>Track saved roles through interview and offer.</p>
            </div>
            <Link href="/dashboard?auth=signup" scroll={false} className="mt-7 inline-block text-sm font-extrabold text-[#f49a48] no-underline">Create your workspace ↗</Link>
          </div>
        </section>

        <section className="jc-card jc-activity-card">
          <div className="jc-section-head">
            <div><p className="jc-eyebrow">PRIVATE BY DEFAULT</p><h2 className="jc-section-title">Your data appears only after login</h2></div>
          </div>
          <div className="jc-activity-grid">
            <div className="jc-activity-item"><b>Profile signal</b><span>Skills, target roles, experience, city and work preferences.</span></div>
            <div className="jc-activity-item"><b>Career documents</b><span>Resumes, certificates, tailored versions and cover letters.</span></div>
            <div className="jc-activity-item"><b>Application history</b><span>Saved roles, applications, interviews and offers.</span></div>
            <div className="jc-activity-item"><b>Match insights</b><span>Only known job data and profile evidence contribute to fit signals.</span></div>
          </div>
        </section>
      </div>
    </WorkspaceShell>
  );
}

function StatCard({ label, value, note, icon }: { label: string; value: number; note: string; icon: string }) {
  return <div className="jc-card jc-stat-card"><div className="jc-stat-top"><span>{label}</span><span className="jc-stat-icon">{icon}</span></div><div className="jc-stat-value">{value}</div><div className="jc-stat-note">{note}</div></div>;
}

function LockedStat({ label, note }: { label: string; note: string }) {
  return <div className="jc-card jc-stat-card"><div className="jc-stat-top"><span>{label}</span><span className="jc-stat-icon">◌</span></div><div className="jc-stat-value">—</div><div className="jc-stat-note">{note}</div></div>;
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

function activityTitle(status: string) {
  if (status === "Saved") return "Role saved";
  if (status === "Interview") return "Interview coming up";
  if (status === "Offer") return "Offer received";
  if (status === "Rejected") return "Application closed";
  return "Application moved forward";
}
