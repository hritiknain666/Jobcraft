import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { calculateJobMatch } from "@/lib/job-match";
import { createTailoredResume } from "@/app/resume/tailor/actions";
import { saveApplication } from "@/app/applications/actions";
import { createCoverLetter } from "@/app/cover-letter/actions";

function initials(company:string){return company.split(" ").filter(Boolean).slice(0,2).map((word)=>word[0]).join("").toUpperCase()}

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
  const matchLabel = match.score >= 75 ? "Strong fit" : match.score >= 55 ? "Potential fit" : "Review first";

  return <main className="min-h-screen bg-[#f6f7fb] text-[#0b1020]">
    <header className="border-b border-slate-200/70 bg-white/90 backdrop-blur-xl"><div className="mx-auto flex max-w-[1240px] items-center justify-between px-5 py-4 sm:px-8"><Link href="/jobs" className="text-sm font-black text-violet-600">← Back to jobs</Link><Link href="/" className="flex items-center gap-2 font-black"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0b1020] text-xs text-white">JC</span><span>Job<span className="text-violet-600">Craft</span></span></Link>{user?<Link href="/dashboard" className="text-sm font-black text-slate-500">Dashboard</Link>:<Link href={`/jobs/${job.id}?auth=login`} scroll={false} className="text-sm font-black text-slate-500">Log in</Link>}</div></header>

    <div className="mx-auto max-w-[1240px] px-5 py-8 sm:px-8">
      <section className="relative overflow-hidden rounded-[34px] border border-violet-100 bg-[linear-gradient(135deg,#ffffff_0%,#f8f4ff_56%,#edf9ff_100%)] p-6 shadow-[0_30px_90px_rgba(79,70,229,.10)] sm:p-8 lg:p-10">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-violet-300/25 blur-3xl"/>
        <div className="relative grid gap-7 lg:grid-cols-[1fr_260px] lg:items-start">
          <div><div className="flex items-center gap-4"><span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0b1020] text-sm font-black text-white shadow-lg">{initials(job.company)}</span><div><div className="flex flex-wrap items-center gap-2"><p className="font-black text-violet-600">{job.company}</p><span className="rounded-full bg-amber-50 px-3 py-1 text-[10px] font-black text-amber-700">SAMPLE ROLE</span></div><p className="mt-1 text-sm text-slate-500">JobCraft prototype listing</p></div></div><h1 className="mt-6 max-w-4xl text-4xl font-black tracking-[-.055em] sm:text-5xl lg:text-6xl">{job.title}</h1><div className="mt-5 flex flex-wrap gap-2 text-sm font-bold text-slate-600"><span className="rounded-full bg-white px-3 py-2 shadow-sm">{job.location}</span><span className="rounded-full bg-white px-3 py-2 shadow-sm">{job.work_mode}</span><span className="rounded-full bg-white px-3 py-2 shadow-sm">{job.salary_min_lpa ? `₹${job.salary_min_lpa}–${job.salary_max_lpa} LPA` : "Salary not listed"}</span><span className="rounded-full bg-white px-3 py-2 shadow-sm">{job.experience_min}–{job.experience_max ?? "+"} yrs</span></div></div>
          {user?<div className="rounded-[26px] border border-emerald-100 bg-white/90 p-5 shadow-sm"><div className="flex items-end justify-between"><div><p className="text-[10px] font-black tracking-[.14em] text-emerald-700">YOUR MATCH</p><p className="mt-1 font-black">{matchLabel}</p></div><span className="text-4xl font-black text-emerald-600">{match.score}%</span></div><div className="mt-4 h-2.5 rounded-full bg-emerald-100"><div className="h-2.5 rounded-full bg-emerald-500" style={{width:`${match.score}%`}}/></div><p className="mt-3 text-xs leading-5 text-slate-500">Based on skills, experience, location, work mode and target role.</p></div>:<div className="rounded-[26px] border border-violet-100 bg-white/90 p-5 shadow-sm"><p className="text-[10px] font-black tracking-[.14em] text-violet-600">UNLOCK YOUR MATCH</p><p className="mt-2 font-black">See why this role fits.</p><p className="mt-2 text-sm leading-6 text-slate-500">Compare your profile with this job before you apply.</p><Link href={`/jobs/${job.id}?auth=signup`} scroll={false} className="mt-4 block rounded-xl bg-violet-600 px-4 py-3 text-center text-sm font-black text-white">Create profile →</Link></div>}
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_330px]">
        <div className="space-y-6">
          {user&&<section className="grid gap-4 sm:grid-cols-2"><div className="rounded-[26px] border border-emerald-100 bg-emerald-50 p-5"><p className="text-xs font-black tracking-[.13em] text-emerald-700">WHAT ALREADY FITS</p><div className="mt-4 space-y-2">{match.strengths.length?match.strengths.slice(0,4).map((item)=><div key={item} className="rounded-xl bg-white px-3 py-2.5 text-sm font-bold text-emerald-900">✓ {item}</div>):<p className="text-sm leading-6 text-emerald-900">Complete your profile for a stronger comparison.</p>}</div></div><div className="rounded-[26px] border border-amber-100 bg-amber-50 p-5"><p className="text-xs font-black tracking-[.13em] text-amber-700">CHECK BEFORE APPLYING</p><div className="mt-4 space-y-2">{match.improvements.length?match.improvements.slice(0,4).map((item)=><div key={item} className="rounded-xl bg-white px-3 py-2.5 text-sm font-bold text-amber-900">• {item}</div>):<p className="text-sm leading-6 text-amber-900">No major gaps based on the profile information saved.</p>}</div></div></section>}

          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><p className="text-xs font-black tracking-[.14em] text-slate-400">ABOUT THE ROLE</p><p className="mt-4 whitespace-pre-wrap leading-8 text-slate-600">{job.description}</p></section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><div className="flex items-end justify-between gap-4"><div><p className="text-xs font-black tracking-[.14em] text-slate-400">CORE SKILLS</p><h2 className="mt-2 text-2xl font-black">What the role asks for</h2></div>{user&&<span className="text-sm font-black text-emerald-600">{match.matchedSkills.length} matched</span>}</div><div className="mt-5 flex flex-wrap gap-2">{(job.skills??[]).map((skill:string)=>{const yes=match.matchedSkills.some((item)=>item.toLowerCase()===skill.toLowerCase());return <span key={skill} className={`rounded-xl px-3 py-2 text-sm font-black ${user&&yes?"bg-emerald-50 text-emerald-700":"bg-slate-100 text-slate-600"}`}>{skill}{user&&yes?" ✓":""}</span>})}</div></section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          {user?<>
            <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black tracking-[.13em] text-violet-600">NEXT ACTION</p><h2 className="mt-2 text-xl font-black">Move this application forward.</h2><div className="mt-5 space-y-3"><form action={saveApplication}><input type="hidden" name="jobId" value={job.id}/><input type="hidden" name="status" value={application?.status === "Saved" ? "Applied" : application?.status ?? "Saved"}/><button className="w-full rounded-xl bg-[#0b1020] px-5 py-3.5 font-black text-white">{application?`Tracker: ${application.status}`:"Save to tracker"}</button></form><form action={createCoverLetter}><input type="hidden" name="jobId" value={job.id}/><button className="w-full rounded-xl border border-slate-200 bg-white px-5 py-3.5 font-black">Create cover letter</button></form><Link href="/applications" className="block text-center text-sm font-black text-violet-600">Open tracker →</Link></div></div>
            <div className="rounded-[26px] border border-violet-100 bg-gradient-to-br from-violet-50 to-fuchsia-50 p-5"><p className="text-xs font-black tracking-[.13em] text-violet-600">RESUME FOR THIS ROLE</p><h2 className="mt-2 text-xl font-black">Bring the right evidence forward.</h2><p className="mt-2 text-sm leading-6 text-violet-900">Keep the facts the same. Change only the emphasis.</p>{resumes.length?<form action={createTailoredResume} className="mt-4 space-y-3"><input type="hidden" name="jobId" value={job.id}/><select name="resumeId" className="w-full rounded-xl border border-violet-200 bg-white px-4 py-3">{resumes.map((resume)=><option key={resume.id} value={resume.id}>{resume.name}{resume.is_primary?" (Primary)":""}</option>)}</select><button className="w-full rounded-xl bg-violet-600 px-5 py-3.5 font-black text-white">Create role version</button></form>:<Link href="/resume" className="mt-4 block rounded-xl bg-violet-600 px-5 py-3 text-center font-black text-white">Add a resume first</Link>}</div>
          </>:<div className="rounded-[26px] border border-violet-100 bg-gradient-to-br from-violet-50 to-fuchsia-50 p-5"><p className="text-xs font-black tracking-[.13em] text-violet-600">SEE YOUR FIT</p><h2 className="mt-2 text-xl font-black">Know before you apply.</h2><p className="mt-2 text-sm leading-6 text-violet-900">Create your profile to see matched skills, gaps and fit signals.</p><Link href={`/jobs/${job.id}?auth=signup`} scroll={false} className="mt-4 block rounded-xl bg-violet-600 px-5 py-3 text-center font-black text-white">Get started free</Link></div>}

          <div className="rounded-[24px] border border-amber-200 bg-amber-50 p-5"><p className="text-xs font-black tracking-[.13em] text-amber-700">PROTOTYPE NOTICE</p><p className="mt-2 text-sm leading-6 text-amber-900">This is a sample listing for testing JobCraft. It is not a live vacancy unless an employer link is shown below.</p></div>
        </aside>
      </div>

      <section className="mt-6 flex flex-col justify-between gap-4 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:p-6"><div><p className="font-black">Ready to continue?</p><p className="mt-1 text-sm text-slate-500">Review the employer page before submitting any real application.</p></div><div className="flex flex-wrap gap-2">{job.apply_url?<a href={job.apply_url} target="_blank" rel="noreferrer" className="rounded-xl bg-violet-600 px-6 py-3 font-black text-white">Apply on employer site ↗</a>:<button disabled className="rounded-xl bg-slate-100 px-6 py-3 font-black text-slate-400">Apply link unavailable</button>}{user&&<Link href="/profile" className="rounded-xl border border-slate-200 bg-white px-6 py-3 font-black">Improve profile</Link>}</div></section>
    </div>
  </main>;
}
