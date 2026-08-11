import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

function matchScore(jobSkills: string[], userSkills: string[]) {
  if (!userSkills.length || !jobSkills.length) return null;
  const normalized = new Set(userSkills.map((skill) => skill.toLowerCase()));
  const matches = jobSkills.filter((skill) => normalized.has(skill.toLowerCase())).length;
  return Math.round((matches / jobSkills.length) * 100);
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

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-2xl font-black text-indigo-600">JobCraft</Link>
          <div className="flex items-center gap-3">
            {user ? <Link href="/dashboard" className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold">Dashboard</Link> : <Link href="/auth/login" className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold">Log in</Link>}
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="max-w-3xl">
          <p className="font-bold text-indigo-600">INDIAN JOB SEARCH</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight">Find jobs that fit your skills.</h1>
          <p className="mt-3 text-slate-600">Search by role, location, salary, experience, skills, and work mode.</p>
        </div>

        <form className="mt-8 grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2 lg:grid-cols-3">
          <input name="q" defaultValue={params.q} placeholder="Job title or company" className="rounded-xl border border-slate-300 px-4 py-3" />
          <input name="location" defaultValue={params.location} placeholder="Location e.g. Bengaluru" className="rounded-xl border border-slate-300 px-4 py-3" />
          <select name="work_mode" defaultValue={params.work_mode ?? ""} className="rounded-xl border border-slate-300 px-4 py-3">
            <option value="">Any work mode</option><option>On-site</option><option>Hybrid</option><option>Remote</option>
          </select>
          <input name="experience" defaultValue={params.experience} type="number" min="0" step="1" placeholder="Max experience required" className="rounded-xl border border-slate-300 px-4 py-3" />
          <input name="salary" defaultValue={params.salary} type="number" min="0" step="0.5" placeholder="Minimum salary (LPA)" className="rounded-xl border border-slate-300 px-4 py-3" />
          <input name="skill" defaultValue={params.skill} placeholder="Skill e.g. SQL" className="rounded-xl border border-slate-300 px-4 py-3" />
          <div className="flex gap-3 md:col-span-2 lg:col-span-3">
            <button className="rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white hover:bg-indigo-700">Search jobs</button>
            <Link href="/jobs" className="rounded-xl border border-slate-300 px-6 py-3 font-bold text-slate-700">Clear filters</Link>
          </div>
        </form>

        {error ? <p className="mt-8 rounded-xl bg-red-50 p-4 text-red-700">Could not load jobs: {error.message}</p> : null}

        <div className="mt-8 space-y-4">
          {(jobs ?? []).map((job) => {
            const score = matchScore(job.skills ?? [], userSkills);
            return (
              <article key={job.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-sm font-bold text-indigo-600">{job.company}</p>
                    <h2 className="mt-1 text-2xl font-black">{job.title}</h2>
                    <p className="mt-2 text-slate-600">{job.location} • {job.work_mode} • {job.salary_min_lpa ? `₹${job.salary_min_lpa}–${job.salary_max_lpa} LPA` : "Salary not listed"} • {job.experience_min}–{job.experience_max ?? "+"} yrs</p>
                    <p className="mt-4 max-w-3xl leading-7 text-slate-600">{job.description}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {(job.skills ?? []).map((skill: string) => <span key={skill} className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold">{skill}</span>)}
                    </div>
                  </div>
                  <div className="min-w-32 text-right">
                    {score !== null ? <div className="inline-flex rounded-full bg-emerald-50 px-4 py-2 font-black text-emerald-700">{score}% match</div> : <div className="inline-flex rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600">Add skills for match</div>}
                    <div className="mt-4"><Link href={`/jobs/${job.id}`} className="inline-block rounded-xl bg-slate-950 px-5 py-3 font-bold text-white">View job</Link></div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {!jobs?.length && !error ? <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">No jobs matched your filters.</div> : null}
      </section>
    </main>
  );
}
