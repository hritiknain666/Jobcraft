import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/auth/actions";
import { calculateJobMatch } from "@/lib/job-match";

const stages = ["Saved", "Applied", "Screening", "Interview", "Offer", "Rejected"];

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const [
    { data: profile },
    { count: resumeCount },
    { data: applications },
    { data: jobs },
  ] = await Promise.all([
    supabase.from("profiles").select("full_name,city,headline,experience_years,target_roles,skills,preferred_work_modes").eq("id", user.id).maybeSingle(),
    supabase.from("resumes").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("applications").select("id,status,updated_at,jobs(id,title,company)").eq("user_id", user.id).order("updated_at", { ascending: false }),
    supabase.from("jobs").select("id,title,company,location,work_mode,salary_min_lpa,salary_max_lpa,experience_min,skills").order("posted_at", { ascending: false }).limit(8),
  ]);

  const skills = profile?.skills ?? [];
  const targetRoles = profile?.target_roles ?? [];
  const preferredWorkModes = profile?.preferred_work_modes ?? [];
  const hasResume = (resumeCount ?? 0) > 0;
  const profileFields = [profile?.full_name, profile?.city, profile?.headline, skills.length, targetRoles.length, profile?.experience_years !== null && profile?.experience_years !== undefined];
  const completed = profileFields.filter(Boolean).length + (hasResume ? 1 : 0);
  const profileStrength = Math.round((completed / 7) * 100);
  const applicationCount = applications?.length ?? 0;
  const interviewCount = applications?.filter((a: any) => a.status === "Interview").length ?? 0;
  const offerCount = applications?.filter((a: any) => a.status === "Offer").length ?? 0;

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
  })).sort((a: any, b: any) => b.match.score - a.match.score).slice(0, 3);

  const nextAction = !profile?.full_name || !targetRoles.length || !skills.length
    ? { title: "Complete your career profile", text: "Add your target roles and core skills so JobCraft can rank jobs around you.", href: "/profile", cta: "Complete profile" }
    : !hasResume
      ? { title: "Add your first resume", text: "Your resume unlocks the next layer of tailoring and role-specific application workflows.", href: "/resume", cta: "Add resume" }
      : { title: "Review your strongest job matches", text: "Your profile is ready. Start with roles where your current skills and preferences line up best.", href: "/jobs", cta: "View matches" };

  return <main className="min-h-screen bg-[#f7f8fc] text-[#090d1f]">
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl"><div className="mx-auto flex max-w-[1380px] items-center justify-between px-5 py-4 sm:px-8"><Link href="/" className="flex items-center gap-3 font-black"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#090d1f] text-sm text-white">JC</span><span className="text-xl">Job<span className="text-violet-600">Craft</span></span></Link><nav className="hidden items-center gap-7 text-sm font-semibold text-slate-500 lg:flex"><Link href="/jobs">Jobs</Link><Link href="/resume">Resume</Link><Link href="/applications">Applications</Link><Link href="/career-assistant">Career Assistant</Link></nav><div className="flex items-center gap-2"><Link href="/profile" className="hidden rounded-xl px-4 py-2.5 text-sm font-bold hover:bg-slate-100 sm:block">Profile</Link><form action={logout}><button className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold">Log out</button></form></div></div></header>

    <section className="mx-auto max-w-[1380px] px-5 py-8 sm:px-8 lg:py-10">
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><div><p className="text-sm font-black tracking-[.14em] text-violet-600">YOUR CAREER WORKSPACE</p><h1 className="mt-2 text-3xl font-black tracking-[-.04em] sm:text-4xl">Good to see you, {profile?.full_name?.split(" ")[0] ?? "there"}.</h1><p className="mt-3 text-slate-600">One place to decide what to apply for, prepare stronger applications and keep momentum.</p></div><form action="/jobs" className="flex w-full max-w-xl gap-2"><input name="q" placeholder="Search role, skill or company" className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm outline-none focus:border-violet-400"/><button className="rounded-xl bg-violet-600 px-5 py-3 font-bold text-white">Search jobs</button></form></div>

      <div className="mt-8 grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
        <div className="relative overflow-hidden rounded-[28px] bg-[#090d1f] p-7 text-white shadow-[0_25px_70px_rgba(15,23,42,.18)] sm:p-8"><div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-violet-600/25 blur-3xl"/><div className="relative max-w-2xl"><p className="text-xs font-black tracking-[.15em] text-violet-300">BEST NEXT STEP</p><h2 className="mt-4 text-3xl font-black tracking-[-.035em]">{nextAction.title}</h2><p className="mt-3 max-w-xl leading-7 text-slate-300">{nextAction.text}</p><Link href={nextAction.href} className="mt-7 inline-block rounded-xl bg-white px-6 py-3.5 font-black text-slate-950">{nextAction.cta} →</Link></div></div>
        <div className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-[0_12px_35px_rgba(15,23,42,.05)]"><div className="flex items-start justify-between"><div><p className="text-sm font-black">Profile strength</p><p className="mt-1 text-sm text-slate-500">Better data means better matching.</p></div><span className="text-3xl font-black text-violet-600">{profileStrength}%</span></div><div className="mt-5 h-2.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-violet-600" style={{ width: `${profileStrength}%` }}/></div><div className="mt-6 space-y-3 text-sm">{[["Career profile",Boolean(profile?.full_name&&skills.length&&targetRoles.length)],["Resume",hasResume],["Preferences",Boolean(profile?.city||preferredWorkModes.length)]].map(([label,ready])=><div key={String(label)} className="flex items-center justify-between"><span className="font-semibold text-slate-600">{String(label)}</span><span className={`font-black ${ready?"text-emerald-600":"text-slate-400"}`}>{ready?"Ready":"Add"}</span></div>)}</div></div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[["Applications",applicationCount,"/applications"],["Interviews",interviewCount,"/applications"],["Offers",offerCount,"/applications"],["Resumes",resumeCount??0,"/resume"]].map(([label,value,href])=><Link key={String(label)} href={String(href)} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-200"><p className="text-sm font-bold text-slate-500">{String(label)}</p><p className="mt-2 text-3xl font-black">{String(value)}</p></Link>)}</div>

      <div className="mt-10 grid gap-8 xl:grid-cols-[1.35fr_.65fr]">
        <section><div className="flex items-end justify-between gap-4"><div><p className="text-xs font-black tracking-[.14em] text-violet-600">RECOMMENDED FOR YOU</p><h2 className="mt-2 text-2xl font-black">Start with your strongest matches</h2></div><Link href="/jobs" className="text-sm font-black text-violet-600">View all jobs →</Link></div><div className="mt-5 space-y-4">{recommendations.length?recommendations.map((job:any)=><Link key={job.id} href={`/jobs/${job.id}`} className="group block rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md"><div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-bold text-violet-600">{job.company}</p><h3 className="mt-1 text-xl font-black">{job.title}</h3><p className="mt-2 text-sm text-slate-500">{job.location} · {job.work_mode} · {job.salary_min_lpa?`₹${job.salary_min_lpa}–${job.salary_max_lpa} LPA`:"Salary not listed"}</p><div className="mt-3 flex flex-wrap gap-2">{job.match.matchedSkills.slice(0,3).map((skill:string)=><span key={skill} className="rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-bold text-emerald-700">{skill} ✓</span>)}{job.match.missingSkills.slice(0,1).map((skill:string)=><span key={skill} className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-500">Missing: {skill}</span>)}</div></div><div className="min-w-[110px] rounded-2xl bg-slate-50 p-4 text-center"><p className="text-3xl font-black text-emerald-600">{job.match.score}%</p><p className="mt-1 text-xs font-black text-slate-400">MATCH</p></div></div></Link>):<div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-slate-600">Add your skills and target roles to unlock useful recommendations.</div>}</div></section>

        <aside><p className="text-xs font-black tracking-[.14em] text-violet-600">YOUR WORKFLOW</p><h2 className="mt-2 text-2xl font-black">Everything you need next</h2><div className="mt-5 space-y-3">{[["Find better-fit jobs","Use salary, skills, experience and work-mode filters.","/jobs"],["Build or update resume","Keep ATS-friendly versions ready for different roles.","/resume"],["Track applications","Move roles through saved, applied, interview and offer.","/applications"],["Career guidance","Review skill gaps and practical next steps.","/career-assistant"]].map(([title,text,href],i)=><Link key={title} href={href} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-violet-200"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-sm font-black text-violet-700">0{i+1}</span><span><b className="block">{title}</b><span className="mt-1 block text-sm leading-5 text-slate-500">{text}</span></span></Link>)}</div></aside>
      </div>

      {applications?.length ? <section className="mt-10"><div className="flex items-center justify-between"><div><p className="text-xs font-black tracking-[.14em] text-violet-600">RECENT ACTIVITY</p><h2 className="mt-2 text-2xl font-black">Keep your applications moving</h2></div><Link href="/applications" className="text-sm font-black text-violet-600">Open tracker →</Link></div><div className="mt-5 grid gap-3 md:grid-cols-3">{applications.slice(0,3).map((app:any)=><Link key={app.id} href="/applications" className="rounded-2xl border border-slate-200 bg-white p-5"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">{stages.includes(app.status)?app.status:"Updated"}</span><h3 className="mt-4 font-black">{app.jobs?.title??"Application"}</h3><p className="mt-1 text-sm text-slate-500">{app.jobs?.company}</p></Link>)}</div></section>:null}
    </section>
  </main>;
}
