import Link from "next/link";
import WorkspaceShell from "@/components/workspace-shell";
import { createClient } from "@/lib/supabase/server";
import { calculateJobMatch } from "@/lib/job-match";
import { jobFreshnessCutoff } from "@/lib/job-sources/freshness";

export default async function CareerAssistantPage({ searchParams }: { searchParams: Promise<{ mode?: string; jobId?: string }> }) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return <PublicAssistantPreview />;

  const [{ data: profile }, { data: jobs }, { data: applications }, { data: resumes }, { data: certificates }] = await Promise.all([
    supabase.from("profiles").select("full_name,skills,experience_years,city,preferred_work_modes,target_roles,headline").eq("id", user.id).maybeSingle(),
    supabase.from("jobs").select("id,title,company,skills,experience_min,location,work_mode,salary_min_lpa,salary_max_lpa,posted_at").eq("is_active", true).gte("posted_at", jobFreshnessCutoff()).limit(30),
    supabase.from("applications").select("status").eq("user_id", user.id),
    supabase.from("resumes").select("id").eq("user_id", user.id),
    supabase.from("certificates").select("id").eq("user_id", user.id),
  ]);

  let selectedJob: any = null;
  if (params.mode === "interview" && params.jobId) {
    const { data } = await supabase.from("jobs").select("id,title,company,description,skills,location,work_mode").eq("id", params.jobId).eq("is_active", true).maybeSingle();
    selectedJob = data;
  }

  const matches = (jobs ?? []).map((job) => ({
    job,
    match: calculateJobMatch({
      jobSkills: job.skills ?? [],
      userSkills: profile?.skills ?? [],
      jobMinExperience: job.experience_min,
      userExperience: profile?.experience_years,
      jobLocation: job.location,
      userCity: profile?.city,
      jobWorkMode: job.work_mode,
      preferredWorkModes: profile?.preferred_work_modes ?? [],
      targetRoles: profile?.target_roles ?? [],
      jobTitle: job.title,
    }),
  })).sort((a, b) => {
    const coverage = b.match.evidenceCoverage - a.match.evidenceCoverage;
    return Math.abs(coverage) > .25 ? coverage : b.match.score - a.match.score;
  }).slice(0, 5);

  const interviews = applications?.filter((item) => ["Interview", "Offer"].includes(item.status)).length ?? 0;
  const applied = applications?.filter((item) => item.status !== "Saved").length ?? 0;
  const interviewRate = applied ? Math.round((interviews / applied) * 100) : 0;
  const topMissing = Array.from(new Set(matches.flatMap((item) => item.match.missingSkills))).slice(0, 6);
  const priorities = [
    !(profile?.skills?.length) ? ["Complete your skills", "Add your strongest real skills so matching reflects what you can actually do.", "/profile"] : null,
    !(profile?.target_roles?.length) ? ["Focus your target roles", "Choose 1–3 role families so JobCraft can rank opportunities more intelligently.", "/profile"] : null,
    !(resumes?.length) ? ["Create a resume", "Build or upload an ATS-friendly resume before applying at scale.", "/resume"] : null,
    !(certificates?.length) ? ["Add useful credentials", "Save relevant professional certificates so they are ready for resume versions.", "/certificates"] : null,
    applied >= 5 && interviewRate < 20 ? ["Improve application conversion", "Your interview rate is low. Prioritise stronger-fit roles and sharpen factual evidence in your resume.", "/applications"] : null,
    topMissing.length ? ["Close the right skill gaps", `Repeated gaps in strong matches: ${topMissing.slice(0,4).join(", ")}. Focus only on skills that support your target direction.`, "/jobs"] : null,
  ].filter(Boolean) as string[][];

  const strength = profile ? Math.round(([profile.full_name, profile.headline, profile.city, profile.experience_years !== null && profile.experience_years !== undefined, (profile.skills?.length ?? 0) > 0, (profile.target_roles?.length ?? 0) > 0, (profile.preferred_work_modes?.length ?? 0) > 0].filter(Boolean).length / 7) * 100) : 0;
  const interviewQuestions = selectedJob ? buildInterviewQuestions(selectedJob, profile?.skills ?? []) : [];

  return (
    <WorkspaceShell active="career-assistant" name={profile?.full_name} headline={profile?.headline} strength={strength}>
      <div className="jc-content-wrap">
        <section className="jc-tool-hero">
          <div><p className="jc-eyebrow">YOUR NEXT BEST MOVE</p><h1 className="jc-page-title">Career assistant</h1><p className="jc-page-copy">Turn your profile, match patterns and application history into a short, practical list of priorities.</p></div>
          <div className="flex flex-wrap gap-2"><Link href="/jobs" className="jc-button-primary">Explore roles →</Link><Link href="/profile" className="jc-button-secondary">Update profile</Link></div>
        </section>

        {selectedJob ? (
          <section className="jc-dark-card mt-6 p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="jc-eyebrow !text-[#f49a48]">INTERVIEW PREP</p><h2 className="jc-section-title !mt-3 !text-white">Prepare for {selectedJob.title}</h2><p className="mt-2 text-sm text-[#b5c7c0]">{selectedJob.company} · {selectedJob.location || "India"}</p></div><Link href={`/jobs/${selectedJob.id}`} className="text-sm font-extrabold text-[#f49a48] no-underline">Open job ↗</Link></div>
            <div className="mt-6 grid gap-3 md:grid-cols-2">{interviewQuestions.map((question, index) => <div key={question} className="rounded-[16px] border border-white/10 bg-white/5 p-4 text-sm leading-6 text-white"><span className="mr-2 text-[#f49a48]">0{index + 1}</span>{question}</div>)}</div>
            <p className="mt-5 text-[11px] leading-5 text-[#9bb3aa]">These questions are grounded in the job title, listed skills and your saved profile. They are not AI-generated yet.</p>
          </section>
        ) : null}

        <section className="jc-stats-grid">
          <Stat label="Applications sent" value={String(applied)} note="saved roles excluded" />
          <Stat label="Interview rate" value={`${interviewRate}%`} note="interview + offer conversion" />
          <Stat label="Profile skills" value={String(profile?.skills?.length ?? 0)} note="used by match scoring" />
          <Stat label="Certificates" value={String(certificates?.length ?? 0)} note="ready for resumes" />
        </section>

        <section className="jc-tool-grid">
          <article className="jc-card jc-tool-panel">
            <div className="flex items-start justify-between gap-4"><div><p className="jc-eyebrow">PRIORITY ACTIONS</p><h2 className="jc-section-title">What to work on next</h2></div><span className="jc-ready-pill">Grounded</span></div>
            <div className="jc-tool-list">
              {priorities.length ? priorities.slice(0, 5).map(([title, text, href], index) => <Link key={title} href={href} className="jc-tool-list-item group flex gap-4 text-inherit no-underline"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#173f33] text-xs font-black text-white transition group-hover:bg-[#278363]">0{index + 1}</span><span><b className="block text-sm">{title}</b><span className="mt-1 block text-xs leading-6 text-[#789087]">{text}</span></span></Link>) : <div className="rounded-[18px] bg-[#e9f4ed] p-5 text-[#285844]"><b>Your foundation looks strong.</b><p className="mt-2 text-xs leading-6">Focus on quality applications to high-evidence roles and keep your tracker current.</p></div>}
            </div>
            <p className="mt-5 text-[11px] leading-5 text-[#789087]">This MVP guidance is deterministic, not model-generated. It only uses data already in your JobCraft profile, applications and current job listings.</p>
          </article>

          <section>
            <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="jc-eyebrow">STRONGEST OPPORTUNITIES</p><h2 className="jc-section-title">Jobs worth reviewing first</h2></div><Link href="/jobs" className="jc-text-link">All roles ↗</Link></div>
            <div className="jc-tool-list">
              {matches.map(({ job, match }) => <Link key={job.id} href={`/jobs/${job.id}`} className="jc-card p-5 text-inherit no-underline transition hover:-translate-y-0.5 hover:border-[#b9c9c2]"><div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="jc-eyebrow !text-[10px]">{job.company}</p><h3 className="jc-section-title !mt-2 !text-[22px]">{job.title}</h3><p className="mt-2 text-xs text-[#789087]">{job.location || "India"} · {job.work_mode || "Mode not listed"}{job.salary_min_lpa ? ` · ₹${job.salary_min_lpa}–${job.salary_max_lpa} LPA` : ""}</p><div className="mt-3 flex flex-wrap gap-2">{match.matchedSkills.slice(0,2).map((skill) => <span key={skill} className="jc-chip">✓ {skill}</span>)}{match.missingSkills.slice(0,1).map((skill) => <span key={skill} className="jc-chip !bg-[#f7e0c7]">Gap · {skill}</span>)}</div></div><div className="min-w-[105px] rounded-[18px] bg-[#efede7] px-5 py-4 text-center"><p className="jc-serif m-0 text-3xl text-[#278363]">{match.score}%</p><p className="mt-1 text-[9px] font-black tracking-[.12em] text-[#789087]">{Math.round(match.evidenceCoverage * 100)}% EVIDENCE</p></div></div></Link>)}
              {!matches.length ? <div className="jc-card p-8 text-sm leading-6 text-[#789087]">No current roles are available to compare yet.</div> : null}
            </div>
          </section>
        </section>
      </div>
    </WorkspaceShell>
  );
}

function buildInterviewQuestions(job: any, userSkills: string[]) {
  const jobSkills = (job.skills ?? []).filter(Boolean).slice(0, 4);
  const matched = jobSkills.filter((skill: string) => userSkills.some((own) => own.toLowerCase() === String(skill).toLowerCase()));
  const focus = matched[0] || jobSkills[0];
  const second = matched[1] || jobSkills[1];
  return [
    `Walk me through your background and why it fits this ${job.title} role.`,
    focus ? `Tell me about a real example where you used ${focus} and what result you achieved.` : `Which part of your experience best prepares you for this role?`,
    second ? `How would you approach a task in this role that requires ${second}?` : `Describe a difficult problem you solved and how you measured success.`,
    `Why do you want to work with ${job.company}, and what would you want to learn in your first 90 days?`,
    `Which requirement in this job description is your strongest evidence, and which one would you need to strengthen?`,
    `What questions would you ask the interviewer to understand expectations, team priorities and success measures?`,
  ];
}

function PublicAssistantPreview() {
  return <WorkspaceShell active="career-assistant" authenticated={false} name="Your profile" headline="Candidate" strength={0}><div className="jc-content-wrap"><section className="jc-tool-hero"><div><p className="jc-eyebrow">YOUR NEXT BEST MOVE</p><h1 className="jc-page-title">Career assistant</h1><p className="jc-page-copy">Practical priorities should come from your real profile and job-search activity—not generic advice.</p></div><Link href="/career-assistant?auth=signup" scroll={false} className="jc-button-primary">Create your workspace →</Link></section><section className="jc-profile-layout"><article className="jc-dark-card jc-profile-identity"><p className="jc-eyebrow !text-[#f49a48]">A CLEAR SIGNAL</p><h2 className="jc-section-title !mt-4 !text-white">Know what matters next.</h2><p className="mt-3 text-sm leading-7 text-[#a4b9b1]">JobCraft can surface repeated skill gaps, weak application conversion and missing profile evidence once your own data exists.</p></article><article className="jc-card jc-toolkit-card"><p className="jc-eyebrow">EXAMPLE PRIORITIES</p><h2 className="jc-section-title">Grounded, useful actions</h2><div className="jc-tool-list">{["Strengthen repeated skill gaps", "Improve profile evidence", "Review higher-fit roles first", "Track interview conversion"].map((item) => <div key={item} className="jc-tool-list-item text-sm font-bold">✓ {item}</div>)}</div></article></section></div></WorkspaceShell>;
}

function Stat({ label, value, note }: { label: string; value: string; note: string }) {
  return <div className="jc-card jc-stat-card"><div className="jc-stat-top"><span>{label}</span><span className="jc-stat-icon">✣</span></div><div className="jc-stat-value">{value}</div><div className="jc-stat-note">{note}</div></div>;
}