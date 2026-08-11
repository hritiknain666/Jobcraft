import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { deleteResume, setPrimaryResume, uploadResume } from "./actions";

export default async function ResumePage({ searchParams }: { searchParams: Promise<{ error?: string; uploaded?: string }> }) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: resumes } = await supabase.from("resumes").select("id,name,is_primary,storage_path,created_at,structured_data").eq("user_id", user.id).order("is_primary", { ascending: false }).order("created_at", { ascending: false });

  return <main className="min-h-screen bg-slate-50 px-6 py-10"><div className="mx-auto max-w-6xl"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="font-bold text-indigo-600">MY RESUMES</p><h1 className="mt-2 text-4xl font-black">Manage your resumes</h1><p className="mt-2 text-slate-600">Upload an existing resume or build an ATS-friendly version in JobCraft.</p></div><Link href="/resume/builder" className="rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white">Build a resume</Link></div>
  {params.error && <p className="mt-5 rounded-xl bg-red-50 p-4 text-red-700">{params.error}</p>}{params.uploaded && <p className="mt-5 rounded-xl bg-emerald-50 p-4 text-emerald-800">Resume uploaded successfully.</p>}
  <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-7"><h2 className="text-xl font-black">Upload resume</h2><form action={uploadResume} className="mt-5 grid gap-4 md:grid-cols-[1fr_1fr_auto]"><input name="name" placeholder="Resume name e.g. Data Analyst" className="rounded-xl border border-slate-300 px-4 py-3"/><input name="file" type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" required className="rounded-xl border border-slate-300 bg-white px-4 py-3"/><button className="rounded-xl bg-slate-950 px-5 py-3 font-bold text-white">Upload</button></form><p className="mt-3 text-xs text-slate-500">PDF or DOCX, maximum 5 MB. Files are stored privately.</p></section>
  <section className="mt-8 grid gap-4 md:grid-cols-2">{resumes?.length ? resumes.map((resume: any) => <article key={resume.id} className="rounded-2xl border border-slate-200 bg-white p-6"><div className="flex items-start justify-between gap-4"><div><h2 className="text-xl font-black">{resume.name}</h2><p className="mt-1 text-sm text-slate-500">{resume.storage_path ? "Uploaded resume" : "JobCraft resume"}</p></div>{resume.is_primary && <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">Primary</span>}</div><div className="mt-5 flex flex-wrap gap-2">{!resume.storage_path && <Link href={`/resume/builder?id=${resume.id}`} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold">Edit</Link>}{!resume.is_primary && <form action={setPrimaryResume}><input type="hidden" name="id" value={resume.id}/><button className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold">Set primary</button></form>}<form action={deleteResume}><input type="hidden" name="id" value={resume.id}/><button className="rounded-xl border border-red-200 px-4 py-2 text-sm font-bold text-red-700">Delete</button></form></div></article>) : <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-slate-600">No resumes yet. Upload one or build your first JobCraft resume.</div>}</section>
  </div></main>;
}
