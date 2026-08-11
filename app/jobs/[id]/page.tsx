import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function calculateMatch(jobSkills: string[], userSkills: string[]) {
  const normalized = new Set(userSkills.map((skill) => skill.toLowerCase()));
  const matched = jobSkills.filter((skill) => normalized.has(skill.toLowerCase()));
  const missing = jobSkills.filter((skill) => !normalized.has(skill.toLowerCase()));
  const score = jobSkills.length ? Math.round((matched.length / jobSkills.length) * 100) : 0;
  return { matched, missing, score };
}

export default async function JobDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: job } = await supabase.from("jobs").select("*").eq("id", id).maybeSingle();
  if (!job) notFound();

  const { data: { user } } = await supabase.auth.getUser();
  let userSkills: string[] = [];
  if (user) {
    const { data: profile } = await supabase.from("profiles").select("skills").eq("id", user.id).maybeSingle();
    userSkills = profile?.skills ?? [];
  }

  const match = calculateMatch(job.skills ?? [], userSkills);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <Link href="/jobs" className="text-sm font-bold text-indigo-600">← Back to jobs</Link>
        <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="font-bold text-indigo-600">{job.company}</p>
              <h1 className="mt-2 text-4xl font-black">{job.title}</h1>
              <p className="mt-3 text-slate-600">{job.location} • {job.work_mode} • {job.salary_min_lpa ? `₹${job.salary_min_lpa}–${job.salary_max_lpa} LPA` : "Salary not listed"}</p>
            </div>
            {user ? <div className="rounded-2xl bg-emerald-50 p-5 text-center"><div className="text-3xl font-black text-emerald-700">{match.score}%</div><div className="mt-1 text-sm font-bold text-emerald-700">Profile match</div></div> : <Link href="/auth/login" className="rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white">Log in for match score</Link>}
          </div>

          <div className="mt-8 border-t border-slate-100 pt-8">
            <h2 className="text-xl font-black">About the role</h2>
            <p className="mt-3 leading-8 text-slate-600">{job.description}</p>
          </div>

          {user && <div className="mt-8 grid gap-5 border-t border-slate-100 pt-8 md:grid-cols-2">
            <div className="rounded-2xl bg-emerald-50 p-5">
              <h2 className="font-black text-emerald-800">Matched skills</h2>
              <div className="mt-3 flex flex-wrap gap-2">{match.matched.length ? match.matched.map((skill) => <span key={skill} className="rounded-lg bg-white px-3 py-2 text-sm font-bold text-emerald-700">{skill}</span>) : <span className="text-sm text-emerald-800">No matched skills yet.</span>}</div>
            </div>
            <div className="rounded-2xl bg-amber-50 p-5">
              <h2 className="font-black text-amber-800">Skills to strengthen</h2>
              <div className="mt-3 flex flex-wrap gap-2">{match.missing.length ? match.missing.map((skill) => <span key={skill} className="rounded-lg bg-white px-3 py-2 text-sm font-bold text-amber-700">{skill}</span>) : <span className="text-sm text-amber-800">You cover all listed skills.</span>}</div>
            </div>
          </div>}

          <div className="mt-8 flex flex-wrap gap-3">
            {job.apply_url ? <a href={job.apply_url} target="_blank" rel="noreferrer" className="rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white">Apply now</a> : <button disabled className="rounded-xl bg-slate-200 px-6 py-3 font-bold text-slate-500">Apply link coming soon</button>}
            {user ? <Link href="/resume" className="rounded-xl border border-slate-300 px-6 py-3 font-bold">Improve resume</Link> : null}
          </div>
        </div>
      </div>
    </main>
  );
}
