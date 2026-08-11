import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { calculateJobMatch } from "@/lib/job-match";

export default async function CareerAssistantPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const [{ data: profile }, { data: jobs }, { data: applications }, { data: resumes }] = await Promise.all([
    supabase.from("profiles").select("skills,experience_years,city,preferred_work_modes,target_roles,headline").eq("id", user.id).maybeSingle(),
    supabase.from("jobs").select("id,title,company,skills,experience_min,location,work_mode").eq("is_active", true).limit(30),
    supabase.from("applications").select("status").eq("user_id", user.id),
    supabase.from("resumes").select("id").eq("user_id", user.id),
  ]);

  const matches = (jobs ?? []).map((job) => ({ job, match: calculateJobMatch({ jobSkills: job.skills ?? [], userSkills: profile?.skills ?? [], jobMinExperience: job.experience_min, userExperience: profile?.experience_years, jobLocation: job.location, userCity: profile?.city, jobWorkMode: job.work_mode, preferredWorkModes: profile?.preferred_work_modes ?? [], targetRoles: profile?.target_roles ?? [], jobTitle: job.title }) })).sort((a, b) => b.match.score - a.match.score).slice(0, 5);

  const interviews = applications?.filter((a) => ["Interview", "Offer"].includes(a.status)).length ?? 0;
  const applied = applications?.filter((a) => a.status !== "Saved").length ?? 0;
  const interviewRate = applied ? Math.round((interviews / applied) * 100) : 0;
  const topMissing = Array.from(new Set(matches.flatMap((item) => item.match.missingSkills))).slice(0, 6);

  const advice = [
    !(profile?.skills?.length) ? "Add your strongest real skills to your profile so JobCraft can match you accurately." : null,
    !(profile?.target_roles?.length) ? "Add 1–3 target roles to focus your job search." : null,
    !(resumes?.length) ? "Upload or build an ATS-friendly resume before applying." : null,
    applied >= 5 && interviewRate < 20 ? "Your interview conversion is currently low. Review role fit and strengthen measurable achievements in your resume." : null,
    topMissing.length ? `Common skill gaps across your best matches: ${topMissing.join(", ")}. Prioritize only the ones relevant to your career direction.` : null,
  ].filter(Boolean);

  return <main className="min-h-screen bg-slate-50 px-6 py-10"><div className="mx-auto max-w-6xl"><div><p className="font-bold text-indigo-600">CAREER ASSISTANT</p><h1 className="mt-2 text-4xl font-black">Your JobCraft career insights</h1><p className="mt-3 max-w-2xl text-slate-600">This version uses your profile, jobs and application history. Later the AI assistant will turn this data into conversational coaching.</p></div>
  <div className="mt-8 grid gap-5 md:grid-cols-3"><Stat label="Applications" value={String(applied)}/><Stat label="Interview / offer rate" value={`${interviewRate}%`}/><Stat label="Profile skills" value={String(profile?.skills?.length ?? 0)}/></div>
  <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-7"><h2 className="text-2xl font-black">What should I improve?</h2><div className="mt-5 space-y-3">{advice.length ? advice.map((item) => <div key={item as string} className="rounded-xl bg-amber-50 p-4 text-amber-950">• {item}</div>) : <div className="rounded-xl bg-emerald-50 p-4 text-emerald-900">Your basic profile setup looks strong. Focus on quality applications to high-match jobs.</div>}</div></section>
  <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-7"><h2 className="text-2xl font-black">Jobs you should consider</h2><div className="mt-5 grid gap-4 md:grid-cols-2">{matches.map(({ job, match }) => <Link key={job.id} href={`/jobs/${job.id}`} className="rounded-2xl border border-slate-200 p-5 hover:border-indigo-300"><div className="flex items-start justify-between gap-4"><div><h3 className="font-black">{job.title}</h3><p className="mt-1 text-sm text-slate-600">{job.company} • {job.location}</p></div><span className="rounded-full bg-emerald-50 px-3 py-2 text-sm font-black text-emerald-700">{match.score}%</span></div></Link>)}</div></section>
  </div></main>;
}
function Stat({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl border border-slate-200 bg-white p-6"><div className="text-sm font-bold text-slate-500">{label}</div><div className="mt-2 text-3xl font-black">{value}</div></div>; }
