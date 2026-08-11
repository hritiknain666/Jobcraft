import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function TailoredResumePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: tailored } = await supabase.from("tailored_resumes").select("*").eq("id", id).eq("user_id", user.id).maybeSingle();
  if (!tailored) notFound();
  const content = tailored.content as { candidate_name?: string; target_role?: string; company?: string; headline?: string; relevant_skills?: string[]; guidance?: string[] };

  return <main className="min-h-screen bg-slate-50 px-6 py-10"><div className="mx-auto max-w-4xl">
    <Link href="/jobs" className="text-sm font-bold text-indigo-600">← Back to jobs</Link>
    <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <p className="font-bold text-indigo-600">TAILORED RESUME PLAN</p>
      <h1 className="mt-2 text-3xl font-black">{tailored.title}</h1>
      <p className="mt-3 text-slate-600">This version is built only from information already in your JobCraft profile/resume. It will not invent experience.</p>
      <section className="mt-8 border-t border-slate-100 pt-7"><h2 className="text-xl font-black">Professional headline</h2><p className="mt-3 rounded-xl bg-slate-50 p-4 text-slate-700">{content.headline}</p></section>
      <section className="mt-7"><h2 className="text-xl font-black">Skills to emphasize</h2><div className="mt-3 flex flex-wrap gap-2">{content.relevant_skills?.length ? content.relevant_skills.map((skill) => <span key={skill} className="rounded-lg bg-indigo-50 px-3 py-2 text-sm font-bold text-indigo-700">{skill}</span>) : <span className="text-slate-500">Complete your profile skills to improve tailoring.</span>}</div></section>
      <section className="mt-7"><h2 className="text-xl font-black">Tailoring guidance</h2><ul className="mt-3 space-y-3">{content.guidance?.map((item) => <li key={item} className="rounded-xl border border-slate-200 p-4 text-slate-700">✓ {item}</li>)}</ul></section>
      <div className="mt-8 rounded-2xl bg-amber-50 p-5 text-sm leading-6 text-amber-900"><strong>Next AI step:</strong> once the AI API is connected, JobCraft will rewrite the real resume sections against the job description while preserving factual accuracy.</div>
    </div>
  </div></main>;
}
