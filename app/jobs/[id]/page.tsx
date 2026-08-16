import Link from "next/link";
import { notFound } from "next/navigation";
import WorkspaceShell from "@/components/workspace-shell";
import { createClient } from "@/lib/supabase/server";
import { calculateJobMatch, getJobMatchLabel, getMatchConfidenceLabel } from "@/lib/job-match";
import { getProviderAttribution } from "@/lib/job-sources/attribution";
import { createTailoredResume } from "@/app/resume/tailor/actions";
import { saveApplication } from "@/app/applications/actions";
import { createCoverLetter } from "@/app/cover-letter/actions";

export default async function JobDetailsPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ apply?: string }> }) {
  const [{ id }, queryParams] = await Promise.all([params, searchParams]);
  const supabase = await createClient();
  const { data: job } = await supabase.from("jobs").select("*").eq("id", id).eq("is_active", true).is("duplicate_of", null).maybeSingle();
  if (!job) notFound();

  const { data: { user } } = await supabase.auth.getUser();
  let profile: any = null;
  let resumes: any[] = [];
  let application: any = null;
  if (user) {
    const [profileResult, resumeResult, appResult] = await Promise.all([
      supabase.from("profiles").select("full_name,headline,skills,experience_years,city,preferred_work_modes,target_roles").eq("id", user.id).maybeSingle(),
      supabase.from("resumes").select("id,name,is_primary").eq("user_id", user.id).order("is_primary", { ascending: false }),
      supabase.from("applications").select("id,status").eq("user_id", user.id).eq("job_id", id).maybeSingle(),
    ]);
    profile = profileResult.data;
    resumes = resumeResult.data ?? [];
    application = appResult.data;
  }

  const match = calculateJobMatch({
    jobSkills: job.skills ?? [], userSkills: profile?.skills ?? [], jobMinExperience: job.experience_min,
    userExperience: profile?.experience_years, jobLocation: job.location_normalized || job.location, userCity: profile?.city,
    jobWorkMode: job.work_mode, preferredWorkModes: profile?.preferred_work_modes ?? [], targetRoles: profile?.target_roles ?? [], jobTitle: job.title,
  });

  const isSample = String(job.source ?? "").trim() === "JobCraft";
  const attribution = getProviderAttribution(job.source, job.apply_url);
  const strength = profile ? Math.round(([profile.full_name, profile.headline, profile.city, profile.experience_years !== null && profile.experience_years !== undefined, (profile.skills?.length ?? 0) > 0, (profile.target_roles?.length ?? 0) > 0, (profile.preferred_work_modes?.length ?? 0) > 0].filter(Boolean).length / 7) * 100) : 0;
  const experienceLabel = job.experience_min !== null && job.experience_min !== undefined ? `${job.experience_min}${job.experience_max !== null && job.experience_max !== undefined ? `–${job.experience_max}` : "+"} yrs` : "Experience not listed";

  return (
    <WorkspaceShell active="jobs" authenticated={Boolean(user)} name={profile?.full_name} headline={profile?.headline} strength={strength}>
      <div className="jc-content-wrap">
        <div className="mb-5"><Link href="/jobs" className="jc-text-link">← Back to discover roles</Link></div>
        {queryParams.apply === "unavailable" ? <div className="jc-card mb-5 border border-[#e6c8a5] !bg-[#fbf0df] p-4 text-sm font-bold text-[#795939]">That application link is no longer available. JobCraft will hide the listing when closure is confirmed.</div> : null}

        <section className="jc-card p-7 sm:p-9">
          <div className="grid gap-8 xl:grid-cols-[1fr_300px] xl:items-start">
            <div>
              <div className="flex flex-wrap items-center gap-4">
                <span className="jc-company-square">{companyInitials(job.company)}</span>
                <div><div className="flex flex-wrap items-center gap-2"><p className="jc-eyebrow !text-[10px]">{job.company}</p><span className={`rounded-full px-3 py-1 text-[9px] font-black ${isSample ? "bg-[#f7e0c7] text-[#795939]" : "bg-[#e4f0e9] text-[#278363]"}`}>{isSample ? "SAMPLE ROLE" : "LIVE ROLE"}</span></div><p className="mt-2 text-xs text-[#789087]">{isSample ? "JobCraft prototype listing" : "Aggregated live vacancy"}</p></div>
              </div>
              <h1 className="jc-page-title mt-7 !text-[clamp(2.7rem,5vw,4.8rem)]">{job.title}</h1>
              <div className="mt-6 flex flex-wrap gap-2"><span className="jc-chip">⌖ {job.location_normalized || job.location || "India"}</span><span className="jc-chip">{job.work_mode || "Work mode not listed"}</span><span className="jc-chip">{salaryText(job.salary_min_lpa, job.salary_max_lpa)}</span><span className="jc-chip">{experienceLabel}</span></div>
            </div>

            {user ? <article className="rounded-[20px] bg-[#efede7] p-5"><div className="flex items-end justify-between gap-4"><div><p className="jc-eyebrow !text-[9px]">YOUR MATCH</p><b className="mt-2 block text-sm">{getJobMatchLabel(match.score, match.confidence)}</b></div><span className="jc-serif text-4xl text-[#278363]">{match.score}%</span></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-[#d9ded8]"><div className="h-full rounded-full bg-[#278363]" style={{ width: `${match.score}%` }} /></div><p className="mt-3 text-[10px] font-bold uppercase tracking-[.08em] text-[#789087]">{getMatchConfidenceLabel(match.confidence)} · {Math.round(match.evidenceCoverage * 100)}% evidence</p><p className="mt-2 text-[11px] leading-5 text-[#789087]">Only known job fields and your saved profile contribute to this score.</p></article> : <article className="rounded-[20px] bg-[#efede7] p-5"><p className="jc-eyebrow !text-[9px]">UNLOCK YOUR FIT</p><h2 className="jc-section-title !mt-3 !text-[21px]">See matched skills and gaps.</h2><p className="jc-section-subtitle">Build your career signal before deciding whether a role is worth your time.</p><Link href={`/jobs/${job.id}?auth=signup`} scroll={false} className="jc-button-primary mt-4 w-full">Create profile →</Link></article>}
          </div>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_330px]">
          <div className="space-y-6">
            {user ? <div className="grid gap-4 md:grid-cols-2"><article className="jc-card p-5"><p className="jc-eyebrow">WHAT ALREADY FITS</p><div className="mt-4 grid gap-2">{match.strengths.length ? match.strengths.slice(0, 4).map((item) => <div key={item} className="rounded-[13px] bg-[#e9f4ed] px-3 py-3 text-xs font-bold leading-5 text-[#285844]">✓ {item}</div>) : <p className="text-xs leading-6 text-[#789087]">Not enough known profile/job signals yet.</p>}</div></article><article className="jc-card p-5"><p className="jc-eyebrow !text-[#c77a34]">CHECK BEFORE APPLYING</p><div className="mt-4 grid gap-2">{match.improvements.length ? match.improvements.slice(0, 4).map((item) => <div key={item} className="rounded-[13px] bg-[#f8ead9] px-3 py-3 text-xs font-bold leading-5 text-[#76573b]">• {item}</div>) : <p className="text-xs leading-6 text-[#789087]">No major gaps are visible in the structured data currently available.</p>}</div></article></div> : null}

            <article className="jc-card p-6 sm:p-8"><p className="jc-eyebrow">ABOUT THE ROLE</p><h2 className="jc-section-title">Role description</h2><p className="mt-5 whitespace-pre-wrap text-sm leading-8 text-[#5f786f]">{job.description}</p></article>

            <article className="jc-card p-6 sm:p-8"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="jc-eyebrow">CORE SKILLS</p><h2 className="jc-section-title">What the role asks for</h2></div>{user && job.skills?.length ? <span className="jc-ready-pill">{match.matchedSkills.length} matched</span> : null}</div><div className="mt-5 flex flex-wrap gap-2">{(job.skills ?? []).map((skill: string) => <span key={skill} className={`jc-chip ${user && match.matchedSkills.includes(skill) ? "!bg-[#e3f0e8] !text-[#278363]" : ""}`}>{user && match.matchedSkills.includes(skill) ? "✓ " : ""}{skill}</span>)}{!job.skills?.length ? <p className="text-xs leading-6 text-[#789087]">No structured skill list was supplied. Use the description as the source of truth; JobCraft search can still match skill terms found in the title or description.</p> : null}</div></article>
          </div>

          <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
            {user ? <>
              <article className="jc-dark-card jc-tool-panel">
                <p className="jc-eyebrow !text-[#f49a48]">NEXT ACTION</p><h2 className="jc-section-title !text-white">Move this role forward.</h2>
                <div className="mt-5 grid gap-3">
                  {job.apply_url && !isSample ? <a href={`/api/jobs/${job.id}/apply`} target="_blank" rel="noopener noreferrer" className="w-full rounded-[14px] bg-[#f49a48] px-5 py-3.5 text-center text-sm font-black text-[#173f33] no-underline">View / apply ↗</a> : <span className="w-full rounded-[14px] bg-white/5 px-5 py-3.5 text-center text-sm font-black text-white/50">Application link unavailable</span>}
                  {!application ? <form action={saveApplication}><input type="hidden" name="jobId" value={job.id} /><input type="hidden" name="status" value="Saved" /><button className="w-full rounded-[14px] border border-white/15 bg-white/5 px-5 py-3.5 text-sm font-black text-white">Save to application plan</button></form> : application.status === "Saved" ? <form action={saveApplication}><input type="hidden" name="jobId" value={job.id} /><input type="hidden" name="status" value="Applied" /><button className="w-full rounded-[14px] border border-white/15 bg-white/5 px-5 py-3.5 text-sm font-black text-white">Mark as applied</button></form> : <Link href="/applications" className="w-full rounded-[14px] border border-white/15 bg-white/5 px-5 py-3.5 text-center text-sm font-black text-white no-underline">Tracker · {application.status}</Link>}
                  <form action={createCoverLetter}><input type="hidden" name="jobId" value={job.id} /><button className="w-full rounded-[14px] border border-white/15 bg-white/5 px-5 py-3.5 text-sm font-black text-white">Create cover letter</button></form>
                  <Link href="/applications" className="text-center text-xs font-extrabold text-[#f49a48] no-underline">Open application plan →</Link>
                </div>
              </article>

              <article className="jc-card jc-tool-panel"><p className="jc-eyebrow">RESUME FOR THIS ROLE</p><h2 className="jc-section-title">Bring the right evidence forward.</h2><p className="jc-section-subtitle">Keep the facts the same. Change only the emphasis.</p>{resumes.length ? <form action={createTailoredResume} className="mt-4 grid gap-3"><input type="hidden" name="jobId" value={job.id} /><select name="resumeId" className="jc-input">{resumes.map((resume) => <option key={resume.id} value={resume.id}>{resume.name}{resume.is_primary ? " (Primary)" : ""}</option>)}</select><button className="jc-button-primary">Create role version →</button></form> : <Link href="/resume" className="jc-button-primary mt-4 w-full">Add a resume first →</Link>}</article>
            </> : <article className="jc-dark-card jc-tool-panel"><p className="jc-eyebrow !text-[#f49a48]">SEE YOUR FIT</p><h2 className="jc-section-title !text-white">Know before you apply.</h2><p className="mt-3 text-sm leading-6 text-[#a4b9b1]">Create your profile to see matched skills, gaps and evidence coverage.</p><Link href={`/jobs/${job.id}?auth=signup`} scroll={false} className="mt-5 block rounded-[14px] bg-[#f49a48] px-5 py-3.5 text-center text-sm font-black text-[#173f33]">Get started →</Link></article>}

            {isSample ? <article className="jc-card p-5 !bg-[#fbf0df]"><p className="jc-eyebrow !text-[#b86e2d]">PROTOTYPE NOTICE</p><p className="mt-3 text-xs leading-6 text-[#5f786f]">This is a JobCraft sample listing for testing search and matching. It is not presented as a live employer vacancy.</p></article> : attribution?.requiredPerListing && attribution.href ? <article className="jc-card p-4"><p className="text-[10px] leading-5 text-[#789087]">Required source attribution</p><a href={attribution.href} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-[10px] font-semibold text-[#789087] no-underline">{attribution.label} ↗</a></article> : null}
          </aside>
        </section>

        <section className="jc-card mt-6 flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center"><div><b className="text-sm">Ready to continue?</b><p className="mt-1 text-xs text-[#789087]">{isSample ? "Sample roles are for testing; use live listings for real applications." : "Review the original listing before submitting anything."}</p></div>{job.apply_url && !isSample ? <a href={`/api/jobs/${job.id}/apply`} target="_blank" rel="noopener noreferrer" className="jc-button-primary">View / apply ↗</a> : <span className="jc-button-secondary opacity-50">Application link unavailable</span>}</section>
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
