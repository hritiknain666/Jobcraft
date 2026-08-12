import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { calculateJobMatch } from "@/lib/job-match";

export default async function CareerAssistantPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const [{ data: profile }, { data: jobs }, { data: applications }, { data: resumes }, { data: certificates }] = await Promise.all([
    supabase.from("profiles").select("skills,experience_years,city,preferred_work_modes,target_roles,headline").eq("id", user.id).maybeSingle(),
    supabase.from("jobs").select("id,title,company,skills,experience_min,location,work_mode,salary_min_lpa,salary_max_lpa").eq("is_active", true).limit(30),
    supabase.from("applications").select("status").eq("user_id", user.id),
    supabase.from("resumes").select("id").eq("user_id", user.id),
    supabase.from("certificates").select("id").eq("user_id", user.id),
  ]);

  const matches = (jobs ?? []).map((job) => ({ job, match: calculateJobMatch({ jobSkills: job.skills ?? [], userSkills: profile?.skills ?? [], jobMinExperience: job.experience_min, userExperience: profile?.experience_years, jobLocation: job.location, userCity: profile?.city, jobWorkMode: job.work_mode, preferredWorkModes: profile?.preferred_work_modes ?? [], targetRoles: profile?.target_roles ?? [], jobTitle: job.title }) })).sort((a, b) => b.match.score - a.match.score).slice(0, 5);
  const interviews = applications?.filter((a) => ["Interview", "Offer"].includes(a.status)).length ?? 0;
  const applied = applications?.filter((a) => a.status !== "Saved").length ?? 0;
  const interviewRate = applied ? Math.round((interviews / applied) * 100) : 0;
  const topMissing = Array.from(new Set(matches.flatMap((item) => item.match.missingSkills))).slice(0, 6);

  const priorities = [
    !(profile?.skills?.length) ? ["Complete your skills", "Add your strongest real skills so matching reflects what you can actually do.", "/profile"] : null,
    !(profile?.target_roles?.length) ? ["Focus your target roles", "Choose 1–3 role families so JobCraft can rank opportunities more intelligently.", "/profile"] : null,
    !(resumes?.length) ? ["Create a resume", "Build or upload an ATS-friendly resume before applying at scale.", "/resume"] : null,
    !(certificates?.length) ? ["Add useful credentials", "Save relevant professional certificates so they are ready for resume versions.", "/certificates"] : null,
    applied >= 5 && interviewRate < 20 ? ["Improve application conversion", "Your interview rate is low. Prioritise stronger-fit jobs and sharpen evidence in your resume.", "/applications"] : null,
    topMissing.length ? ["Close the right skill gaps", `Repeated gaps in strong matches: ${topMissing.slice(0,4).join(", ")}. Focus only on skills that support your target direction.`, "/jobs"] : null,
  ].filter(Boolean) as string[][];

  return <main className="min-h-screen bg-[#f7f8fc] text-[#090d1f]"><div className="mx-auto max-w-[1280px] px-5 py-9 sm:px-8">
    <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><div><Link href="/dashboard" className="text-sm font-black text-violet-600">← Dashboard</Link><p className="mt-5 text-xs font-black tracking-[.15em] text-violet-600">CAREER ASSISTANT</p><h1 className="mt-2 text-4xl font-black tracking-[-.04em] sm:text-5xl">Turn your job-search data into next steps.</h1><p className="mt-3 max-w-2xl leading-7 text-slate-600">This MVP uses your profile, matching and application history to give practical guidance without inventing facts. Conversational AI comes later.</p></div><Link href="/jobs" className="rounded-xl bg-violet-600 px-6 py-3.5 font-bold text-white">Explore recommended jobs →</Link></div>

    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Stat label="Applications sent" value={String(applied)} note="Excludes saved roles"/><Stat label="Interview / offer rate" value={`${interviewRate}%`} note="From submitted applications"/><Stat label="Profile skills" value={String(profile?.skills?.length ?? 0)} note="Used for matching"/><Stat label="Certificates" value={String(certificates?.length ?? 0)} note="Available for resumes"/></div>

    <div className="mt-8 grid gap-6 xl:grid-cols-[.75fr_1.25fr]"><section className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm"><p className="text-xs font-black tracking-[.14em] text-violet-600">PRIORITY ACTIONS</p><h2 className="mt-2 text-2xl font-black">What to work on next</h2><div className="mt-5 space-y-3">{priorities.length ? priorities.slice(0,5).map(([title,text,href],i)=><Link key={title} href={href} className="flex gap-4 rounded-2xl border border-slate-200 p-4 transition hover:border-violet-200 hover:bg-violet-50/30"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#090d1f] text-xs font-black text-white">0{i+1}</span><span><b>{title}</b><span className="mt-1 block text-sm leading-6 text-slate-500">{text}</span></span></Link>) : <div className="rounded-2xl bg-emerald-50 p-5 text-emerald-900"><b>Your foundation looks strong.</b><p className="mt-2 text-sm leading-6">Focus on quality applications to high-match roles and keep your tracker updated.</p></div>}</div></section>

    <section><div className="flex items-end justify-between"><div><p className="text-xs font-black tracking-[.14em] text-violet-600">STRONGEST OPPORTUNITIES</p><h2 className="mt-2 text-2xl font-black">Jobs worth reviewing first</h2></div><Link href="/jobs" className="text-sm font-black text-violet-600">All jobs →</Link></div><div className="mt-5 space-y-3">{matches.map(({ job, match }) => <Link key={job.id} href={`/jobs/${job.id}`} className="block rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-200"><div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-bold text-violet-600">{job.company}</p><h3 className="mt-1 text-xl font-black">{job.title}</h3><p className="mt-2 text-sm text-slate-500">{job.location} · {job.work_mode}{job.salary_min_lpa?` · ₹${job.salary_min_lpa}–${job.salary_max_lpa} LPA`:""}</p><div className="mt-3 flex flex-wrap gap-2">{match.matchedSkills.slice(0,3).map((skill)=><span key={skill} className="rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-bold text-emerald-700">{skill} ✓</span>)}{match.missingSkills.slice(0,2).map((skill)=><span key={skill} className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-500">Missing: {skill}</span>)}</div></div><div className="rounded-2xl bg-slate-50 px-5 py-4 text-center"><p className="text-3xl font-black text-emerald-600">{match.score}%</p><p className="mt-1 text-xs font-black text-slate-400">MATCH</p></div></div></Link>)}</div></section></div>

    <section className="mt-8 rounded-[26px] bg-[#090d1f] p-7 text-white"><div className="flex flex-col justify-between gap-5 md:flex-row md:items-center"><div><p className="text-xs font-black tracking-[.14em] text-violet-300">COMING LATER</p><h2 className="mt-2 text-2xl font-black">Conversational career coaching</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">AI will eventually explain these signals conversationally, compare role options and help rewrite truthful resume content — while the underlying profile and matching data remain the source of truth.</p></div><span className="rounded-full bg-white/10 px-4 py-2 text-sm font-black text-violet-200">AI phase</span></div></section>
  </div></main>;
}

function Stat({label,value,note}:{label:string;value:string;note:string}){return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm font-bold text-slate-500">{label}</p><p className="mt-2 text-3xl font-black">{value}</p><p className="mt-1 text-xs text-slate-400">{note}</p></div>}
