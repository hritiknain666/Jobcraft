import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { calculateJobMatch } from "@/lib/job-match";
import { createTailoredResume } from "@/app/resume/tailor/actions";

export default async function JobDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: job } = await supabase.from("jobs").select("*").eq("id", id).maybeSingle();
  if (!job) notFound();

  const { data: { user } } = await supabase.auth.getUser();
  let profile: any = null;
  let resumes: any[] = [];
  if (user) {
    const [profileResult, resumeResult] = await Promise.all([
      supabase.from("profiles").select("skills,experience_years,city,preferred_work_modes,target_roles").eq("id", user.id).maybeSingle(),
      supabase.from("resumes").select("id,name,is_primary").eq("user_id", user.id).order("is_primary", { ascending: false }),
    ]);
    profile = profileResult.data;
    resumes = resumeResult.data ?? [];
  }

  const match = calculateJobMatch({
    jobSkills: job.skills ?? [], userSkills: profile?.skills ?? [], jobMinExperience: job.experience_min,
    userExperience: profile?.experience_years, jobLocation: job.location, userCity: profile?.city,
    jobWorkMode: job.work_mode, preferredWorkModes: profile?.preferred_work_modes ?? [], targetRoles: profile?.target_roles ?? [], jobTitle: job.title,
  });

  return <main className="min-h-screen bg-slate-50 text-slate-950"><div className="mx-auto max-w-5xl px-6 py-10">
    <Link href="/jobs" className="text-sm font-bold text-indigo-600">← Back to jobs</Link>
    <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between"><div><p className="font-bold text-indigo-600">{job.company}</p><h1 className="mt-2 text-4xl font-black">{job.title}</h1><p className="mt-3 text-slate-600">{job.location} • {job.work_mode} • {job.salary_min_lpa ? `₹${job.salary_min_lpa}–${job.salary_max_lpa} LPA` : "Salary not listed"}</p></div>
      {user ? <div className="rounded-2xl bg-emerald-50 p-5 text-center"><div className="text-3xl font-black text-emerald-700">{match.score}%</div><div className="mt-1 text-sm font-bold text-emerald-700">JobCraft match</div></div> : <Link href="/auth/login" className="rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white">Log in for match score</Link>}</div>

      <section className="mt-8 border-t border-slate-100 pt-8"><h2 className="text-xl font-black">About the role</h2><p className="mt-3 leading-8 text-slate-600">{job.description}</p></section>

      {user && <><div className="mt-8 grid gap-5 border-t border-slate-100 pt-8 md:grid-cols-2"><div className="rounded-2xl bg-emerald-50 p-5"><h2 className="font-black text-emerald-800">Why you match</h2><ul className="mt-3 space-y-2 text-sm text-emerald-900">{match.strengths.length ? match.strengths.map((item) => <li key={item}>✓ {item}</li>) : <li>Complete your JobCraft profile for a stronger match analysis.</li>}</ul><div className="mt-4 flex flex-wrap gap-2">{match.matchedSkills.map((skill) => <span key={skill} className="rounded-lg bg-white px-3 py-2 text-sm font-bold text-emerald-700">{skill}</span>)}</div></div>
      <div className="rounded-2xl bg-amber-50 p-5"><h2 className="font-black text-amber-800">How to improve</h2><ul className="mt-3 space-y-2 text-sm text-amber-900">{match.improvements.length ? match.improvements.map((item) => <li key={item}>• {item}</li>) : <li>Your profile aligns strongly with the listed requirements.</li>}</ul></div></div>

      <section className="mt-8 rounded-2xl border border-indigo-100 bg-indigo-50 p-6"><h2 className="text-xl font-black text-indigo-950">Tailor your resume for this job</h2><p className="mt-2 text-sm text-indigo-900">JobCraft will emphasize relevant information you already provided. It will never invent experience or qualifications.</p>
      {resumes.length ? <form action={createTailoredResume} className="mt-5 flex flex-col gap-3 sm:flex-row"><input type="hidden" name="jobId" value={job.id}/><select name="resumeId" className="min-w-0 flex-1 rounded-xl border border-indigo-200 bg-white px-4 py-3">{resumes.map((resume) => <option key={resume.id} value={resume.id}>{resume.name}{resume.is_primary ? " (Primary)" : ""}</option>)}</select><button className="rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white">Tailor resume</button></form> : <Link href="/resume" className="mt-5 inline-block rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white">Upload a resume first</Link>}</section></>}

      <div className="mt-8 flex flex-wrap gap-3">{job.apply_url ? <a href={job.apply_url} target="_blank" rel="noreferrer" className="rounded-xl bg-slate-950 px-6 py-3 font-bold text-white">Apply on employer site</a> : <button disabled className="rounded-xl bg-slate-200 px-6 py-3 font-bold text-slate-500">Apply link coming soon</button>} {user ? <Link href="/profile" className="rounded-xl border border-slate-300 px-6 py-3 font-bold">Improve profile</Link> : null}</div>
    </div>
  </div></main>;
}
