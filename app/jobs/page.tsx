import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

function matchDetails(jobSkills: string[], userSkills: string[]) {
  if (!userSkills.length || !jobSkills.length) return null;
  const normalized = new Set(userSkills.map((skill) => skill.toLowerCase()));
  const matched = jobSkills.filter((skill) => normalized.has(skill.toLowerCase()));
  const missing = jobSkills.filter((skill) => !normalized.has(skill.toLowerCase()));
  return { score: Math.round((matched.length / jobSkills.length) * 100), matched, missing };
}

function initials(company: string) {
  return company.split(" ").filter(Boolean).slice(0, 2).map((word) => word[0]).join("").toUpperCase();
}

export default async function JobsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let userSkills: string[] = [];
  if (user) {
    const { data: profile } = await supabase.from("profiles").select("skills").eq("id", user.id).maybeSingle();
    userSkills = profile?.skills ?? [];
  }

  let query = supabase.from("jobs").select("*").order("posted_at", { ascending: false });
  if (params.q) query = query.or(`title.ilike.%${params.q}%,company.ilike.%${params.q}%,description.ilike.%${params.q}%`);
  if (params.location) query = query.ilike("location", `%${params.location}%`);
  if (params.work_mode) query = query.eq("work_mode", params.work_mode);
  if (params.experience) query = query.lte("experience_min", Number(params.experience));
  if (params.salary) query = query.gte("salary_max_lpa", Number(params.salary));
  if (params.skill) query = query.contains("skills", [params.skill]);
  const { data: jobs, error } = await query;

  return <main className="min-h-screen bg-[#f6f7fb] text-slate-950">
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl"><div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
      <Link href="/" className="flex items-center gap-3 font-black tracking-tight"><span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-sm text-white shadow-lg">JC</span><span className="text-xl">Job<span className="text-violet-600">Craft</span></span></Link>
      <nav className="hidden gap-7 text-sm font-semibold text-slate-500 md:flex"><Link href="/jobs" className="text-slate-950">Jobs</Link><Link href="/resume">Resumes</Link><Link href="/applications">Applications</Link></nav>
      {user ? <Link href="/dashboard" className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white">Dashboard</Link> : <div className="flex items-center gap-3"><Link href="/auth/login" className="text-sm font-bold">Log in</Link><Link href="/auth/signup" className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white">Get started</Link></div>}
    </div></header>

    <section className="border-b border-slate-200 bg-white"><div className="mx-auto max-w-7xl px-6 py-12 lg:py-16"><div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end"><div><div className="inline-flex rounded-full bg-violet-50 px-3 py-1.5 text-xs font-black tracking-[.14em] text-violet-700">INDIA-FIRST JOB DISCOVERY</div><h1 className="mt-4 max-w-3xl text-4xl font-black tracking-[-.035em] sm:text-5xl">Find work that fits your skills — not just your keywords.</h1><p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">Search roles across India and understand your fit before you spend time applying.</p></div><div className="rounded-2xl border border-violet-100 bg-violet-50 px-5 py-4 text-sm text-violet-900"><span className="font-black">{jobs?.length ?? 0}</span> roles in this search</div></div>

    <form className="mt-9 rounded-[1.6rem] border border-slate-200 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,.07)]"><div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      <input name="q" defaultValue={params.q} placeholder="Role, skill or company" className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none transition focus:border-violet-400 focus:bg-white"/><input name="location" defaultValue={params.location} placeholder="City e.g. Bengaluru" className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none focus:border-violet-400 focus:bg-white"/><select name="work_mode" defaultValue={params.work_mode ?? ""} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5"><option value="">Any work mode</option><option>On-site</option><option>Hybrid</option><option>Remote</option></select>
      <input name="experience" defaultValue={params.experience} type="number" min="0" placeholder="Maximum experience" className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5"/><input name="salary" defaultValue={params.salary} type="number" min="0" step="0.5" placeholder="Minimum salary (LPA)" className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5"/><input name="skill" defaultValue={params.skill} placeholder="Required skill e.g. SQL" className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5"/>
    </div><div className="mt-3 flex flex-wrap gap-3"><button className="rounded-xl bg-violet-600 px-6 py-3 font-bold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700">Search jobs</button><Link href="/jobs" className="rounded-xl border border-slate-200 px-6 py-3 font-bold text-slate-600 hover:bg-slate-50">Clear filters</Link></div></form></div></section>

    <section className="mx-auto max-w-7xl px-6 py-10">{error ? <p className="rounded-xl bg-red-50 p-4 text-red-700">Could not load jobs: {error.message}</p> : null}<div className="space-y-4">{(jobs ?? []).map((job) => { const match = matchDetails(job.skills ?? [], userSkills); return <article key={job.id} className="group rounded-[1.6rem] border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,.04)] transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-[0_20px_50px_rgba(15,23,42,.08)]"><div className="grid gap-6 lg:grid-cols-[1fr_210px]">
      <div><div className="flex items-start gap-4"><div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-slate-950 font-black text-white">{initials(job.company)}</div><div><p className="text-sm font-bold text-violet-600">{job.company}</p><h2 className="mt-1 text-2xl font-black tracking-tight">{job.title}</h2><div className="mt-2 flex flex-wrap gap-2 text-sm text-slate-500"><span>{job.location}</span><span>•</span><span>{job.work_mode}</span><span>•</span><span>{job.salary_min_lpa ? `₹${job.salary_min_lpa}–${job.salary_max_lpa} LPA` : "Salary not listed"}</span><span>•</span><span>{job.experience_min}–{job.experience_max ?? "+"} yrs</span></div></div></div>
      <p className="mt-5 max-w-3xl leading-7 text-slate-600">{job.description}</p><div className="mt-5 flex flex-wrap gap-2">{(job.skills ?? []).map((skill: string) => { const isMatched = match?.matched.some((item) => item.toLowerCase() === skill.toLowerCase()); return <span key={skill} className={`rounded-lg px-3 py-2 text-sm font-bold ${isMatched ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-700"}`}>{skill}{isMatched ? " ✓" : ""}</span>; })}</div></div>
      <aside className="flex flex-col justify-between rounded-2xl bg-slate-50 p-5">{match ? <div><div className="flex items-center justify-between"><span className="text-sm font-bold text-slate-500">JobCraft match</span><span className={`text-2xl font-black ${match.score >= 70 ? "text-emerald-600" : match.score >= 45 ? "text-amber-600" : "text-slate-700"}`}>{match.score}%</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-emerald-500" style={{width:`${match.score}%`}}/></div><p className="mt-3 text-xs leading-5 text-slate-500">{match.score >= 70 ? "Strong fit based on your saved skills." : match.missing.length ? `Improve fit: ${match.missing.slice(0,2).join(", ")}` : "Review the role details."}</p></div> : <div><p className="font-black">Unlock your match score</p><p className="mt-2 text-sm leading-6 text-slate-500">{user ? "Add skills to your profile to compare your fit." : "Create a profile to see matched and missing skills."}</p></div>}<Link href={`/jobs/${job.id}`} className="mt-5 block rounded-xl bg-slate-950 px-5 py-3 text-center font-bold text-white transition group-hover:bg-violet-600">View role →</Link></aside>
    </div></article>})}</div>{!jobs?.length && !error ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-600">No jobs matched your filters. Try widening your search.</div> : null}</section>
  </main>;
}
