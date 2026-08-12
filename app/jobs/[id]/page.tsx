import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { calculateJobMatch } from "@/lib/job-match";
import { createTailoredResume } from "@/app/resume/tailor/actions";
import { saveApplication } from "@/app/applications/actions";
import { createCoverLetter } from "@/app/cover-letter/actions";

export default async function JobDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: job } = await supabase.from("jobs").select("*").eq("id", id).maybeSingle();
  if (!job) notFound();

  const { data: { user } } = await supabase.auth.getUser();
  let profile: any = null;
  let resumes: any[] = [];
  let application: any = null;
  if (user) {
    const [profileResult, resumeResult, appResult] = await Promise.all([
      supabase.from("profiles").select("skills,experience_years,city,preferred_work_modes,target_roles").eq("id", user.id).maybeSingle(),
      supabase.from("resumes").select("id,name,is_primary").eq("user_id", user.id).order("is_primary", { ascending: false }),
      supabase.from("applications").select("id,status").eq("user_id", user.id).eq("job_id", id).maybeSingle(),
    ]);
    profile = profileResult.data;
    resumes = resumeResult.data ?? [];
    application = appResult.data;
  }

  const match = calculateJobMatch({ jobSkills: job.skills ?? [], userSkills: profile?.skills ?? [], jobMinExperience: job.experience_min, userExperience: profile?.experience_years, jobLocation: job.location, userCity: profile?.city, jobWorkMode: job.work_mode, preferredWorkModes: profile?.preferred_work_modes ?? [], targetRoles: profile?.target_roles ?? [], jobTitle: job.title });
  const matchLabel = match.score >= 75 ? "Strong fit" : match.score >= 55 ? "Potential fit" : "Needs review";

  return <main className="min-h-screen bg-[radial-gradient(circle_at_10%_10%,rgba(124,58,237,.12),transparent_26%),radial-gradient(circle_at_90%_18%,rgba(56,189,248,.10),transparent_24%),#f8f9ff] text-[#090d1f]">
    <div className="mx-auto max-w-[1220px] px-5 py-8 sm:px-8">
      <div className="flex items-center justify-between gap-4"><Link href="/jobs" className="text-sm font-black text-violet-600">← Back to jobs</Link>{user&&<Link href="/dashboard" className="text-sm font-black text-slate-500">Dashboard</Link>}</div>

      <section className="relative mt-5 overflow-hidden rounded-[34px] border border-white/80 bg-white/90 shadow-[0_28px_90px_rgba(15,23,42,.10)] backdrop-blur-xl">
        <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-violet-200/40 blur-3xl"/>
        <div className="relative p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-start">
            <div><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-black text-violet-600">{job.company}</p><span className="rounded-full bg-amber-50 px-3 py-1 text-[10px] font-black tracking-wide text-amber-700">SAMPLE ROLE</span></div><h1 className="mt-3 max-w-3xl text-4xl font-black tracking-[-.05em] sm:text-5xl lg:text-6xl">{job.title}</h1><div className="mt-5 flex flex-wrap gap-2 text-sm text-slate-600"><span className="rounded-full bg-slate-100 px-3 py-1.5">{job.location}</span><span className="rounded-full bg-slate-100 px-3 py-1.5">{job.work_mode}</span><span className="rounded-full bg-slate-100 px-3 py-1.5">{job.salary_min_lpa ? `₹${job.salary_min_lpa}–${job.salary_max_lpa} LPA` : "Salary not listed"}</span><span className="rounded-full bg-slate-100 px-3 py-1.5">{job.experience_min}–{job.experience_max ?? "+"} yrs</span></div></div>
            {user?<div className="min-w-[230px] rounded-[24px] border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm"><div className="flex items-end justify-between"><div><p className="text-xs font-black tracking-[.12em] text-emerald-700">JOBCRAFT MATCH</p><p className="mt-1 font-black text-emerald-950">{matchLabel}</p></div><span className="text-4xl font-black text-emerald-600">{match.score}%</span></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-emerald-100"><div className="h-full rounded-full bg-emerald-500" style={{width:`${match.score}%`}}/></div></div>:<div className="min-w-[230px] rounded-[24px] border border-violet-100 bg-gradient-to-br from-violet-50 to-white p-5"><p className="text-xs font-black tracking-[.12em] text-violet-600">SEE YOUR MATCH</p><p className="mt-2 text-sm leading-6 text-slate-600">Compare your real skills, experience and preferences with this role.</p><Link href={`/jobs/${job.id}?auth=login`} scroll={false} className="mt-4 block rounded-xl bg-violet-600 px-5 py-3 text-center font-black text-white shadow-lg shadow-violet-200">Log in for match score</Link></div>}
          </div>

          <div className="mt-9 grid gap-8 lg:grid-cols-[1fr_330px]"><div>
            <section className="border-t border-slate-100 pt-7"><p className="text-xs font-black tracking-[.14em] text-slate-400">ABOUT THE ROLE</p><p className="mt-4 whitespace-pre-wrap leading-8 text-slate-600">{job.description}</p></section>
            <section className="mt-8 border-t border-slate-100 pt-7"><p className="text-xs font-black tracking-[.14em] text-slate-400">CORE SKILLS</p><div className="mt-4 flex flex-wrap gap-2">{(job.skills??[]).map((skill:string)=>{const yes=match.matchedSkills.some((item)=>item.toLowerCase()===skill.toLowerCase());return <span key={skill} className={`rounded-xl px-3 py-2 text-sm font-bold ${user&&yes?"bg-emerald-50 text-emerald-700":"bg-slate-100 text-slate-600"}`}>{skill}{user&&yes?" ✓":""}</span>})}</div></section>
            {user&&<section className="mt-8 grid gap-4 sm:grid-cols-2"><div className="rounded-[22px] border border-emerald-100 bg-emerald-50 p-5"><h2 className="font-black text-emerald-950">Why this may fit</h2><ul className="mt-3 space-y-2 text-sm leading-6 text-emerald-900">{match.strengths.length?match.strengths.map((item)=><li key={item}>✓ {item}</li>):<li>Complete your profile for a stronger analysis.</li>}</ul></div><div className="rounded-[22px] border border-amber-100 bg-amber-50 p-5"><h2 className="font-black text-amber-950">What to review</h2><ul className="mt-3 space-y-2 text-sm leading-6 text-amber-900">{match.improvements.length?match.improvements.map((item)=><li key={item}>• {item}</li>):<li>No major gaps based on the information saved in your profile.</li>}</ul></div></section>}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">{user?<><div className="rounded-[24px] border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5 shadow-sm"><p className="text-xs font-black tracking-[.13em] text-violet-600">APPLICATION TOOLS</p><h2 className="mt-2 text-xl font-black">Prepare before you apply</h2><div className="mt-5 space-y-3"><form action={saveApplication}><input type="hidden" name="jobId" value={job.id}/><input type="hidden" name="status" value={application?.status === "Saved" ? "Applied" : application?.status ?? "Saved"}/><button className="w-full rounded-xl bg-[#090d1f] px-5 py-3 font-bold text-white">{application?`Tracker: ${application.status}`:"Save to tracker"}</button></form><form action={createCoverLetter}><input type="hidden" name="jobId" value={job.id}/><button className="w-full rounded-xl border border-slate-200 bg-white px-5 py-3 font-bold">Create cover letter</button></form><Link href="/applications" className="block text-center text-sm font-black text-violet-600">Open tracker →</Link></div></div><div className="rounded-[24px] border border-violet-100 bg-gradient-to-br from-violet-50 to-fuchsia-50 p-5"><h2 className="font-black text-violet-950">Tailor your resume</h2><p className="mt-2 text-sm leading-6 text-violet-900">Reorder emphasis around relevant information you already provided. Never invent experience.</p>{resumes.length?<form action={createTailoredResume} className="mt-4 space-y-3"><input type="hidden" name="jobId" value={job.id}/><select name="resumeId" className="w-full rounded-xl border border-violet-200 bg-white px-4 py-3">{resumes.map((resume)=><option key={resume.id} value={resume.id}>{resume.name}{resume.is_primary?" (Primary)":""}</option>)}</select><button className="w-full rounded-xl bg-violet-600 px-5 py-3 font-bold text-white">Create tailored version</button></form>:<Link href="/resume" className="mt-4 inline-block rounded-xl bg-violet-600 px-5 py-3 font-bold text-white">Add a resume first</Link>}</div></>:<div className="rounded-[24px] border border-violet-100 bg-gradient-to-br from-violet-50 to-fuchsia-50 p-5"><p className="text-xs font-black tracking-[.13em] text-violet-600">YOUR FIT, EXPLAINED</p><h2 className="mt-2 text-xl font-black text-violet-950">See why this role may fit</h2><p className="mt-2 text-sm leading-6 text-violet-900">Create a profile to compare skills, experience, location and work-mode preferences.</p><Link href={`/jobs/${job.id}?auth=signup`} scroll={false} className="mt-4 block rounded-xl bg-violet-600 px-5 py-3 text-center font-bold text-white">Get started free</Link></div>}</aside></div>
        </div>

        <div className="relative border-t border-slate-100 bg-gradient-to-r from-slate-50 to-violet-50/40 px-6 py-5 sm:px-8"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><p className="font-black">Ready to continue?</p><p className="mt-1 text-sm text-slate-500">Review the employer page before submitting any application.</p></div><div className="flex flex-wrap gap-2">{job.apply_url?<a href={job.apply_url} target="_blank" rel="noreferrer" className="rounded-xl bg-violet-600 px-6 py-3 font-bold text-white">Apply on employer site ↗</a>:<button disabled className="rounded-xl bg-slate-200 px-6 py-3 font-bold text-slate-500">Apply link unavailable</button>}{user&&<Link href="/profile" className="rounded-xl border border-slate-200 bg-white px-6 py-3 font-bold">Improve profile</Link>}</div></div></div>
      </section>
    </div>
  </main>;
}
