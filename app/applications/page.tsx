import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { deleteApplication, updateApplicationStatus } from "./actions";

const statuses = ["Saved", "Applied", "Screening", "Interview", "Offer", "Rejected"];

export default async function ApplicationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: applications } = await supabase
    .from("applications")
    .select("id,status,created_at,updated_at,jobs(id,title,company,location,work_mode,salary_min_lpa,salary_max_lpa)")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  return <main className="min-h-screen bg-slate-50 text-slate-950"><div className="mx-auto max-w-6xl px-6 py-10">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="font-bold text-indigo-600">APPLICATION TRACKER</p><h1 className="mt-2 text-4xl font-black">Stay on top of every application</h1><p className="mt-3 text-slate-600">Move jobs through Saved, Applied, Interview, Offer and Rejected stages.</p></div><Link href="/jobs" className="rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white">Find jobs</Link></div>

    <div className="mt-10 grid gap-4 sm:grid-cols-3 lg:grid-cols-6">{statuses.map((status) => <div key={status} className="rounded-2xl border border-slate-200 bg-white p-4"><div className="text-sm font-bold text-slate-500">{status}</div><div className="mt-2 text-2xl font-black">{applications?.filter((a) => a.status === status).length ?? 0}</div></div>)}</div>

    <div className="mt-8 space-y-4">{applications?.length ? applications.map((app: any) => {
      const job = app.jobs;
      return <article key={app.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between"><div><Link href={`/jobs/${job?.id}`} className="text-xl font-black hover:text-indigo-600">{job?.title ?? "Job"}</Link><p className="mt-1 font-semibold text-slate-600">{job?.company}</p><p className="mt-2 text-sm text-slate-500">{job?.location} • {job?.work_mode}</p></div><div className="flex flex-col gap-3 sm:flex-row"><form action={updateApplicationStatus} className="flex gap-2"><input type="hidden" name="id" value={app.id}/><select name="status" defaultValue={app.status} className="rounded-xl border border-slate-300 bg-white px-4 py-3">{statuses.map((status) => <option key={status}>{status}</option>)}</select><button className="rounded-xl bg-slate-950 px-4 py-3 font-bold text-white">Update</button></form><form action={deleteApplication}><input type="hidden" name="id" value={app.id}/><button className="rounded-xl border border-slate-300 px-4 py-3 font-bold text-slate-700">Remove</button></form></div></div></article>;
    }) : <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center"><h2 className="text-xl font-black">No applications yet</h2><p className="mt-2 text-slate-600">Save a job or mark it as applied from a JobCraft job page.</p></div>}</div>
  </div></main>;
}
