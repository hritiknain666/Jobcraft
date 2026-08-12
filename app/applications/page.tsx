import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deleteApplication, updateApplicationStatus } from "./actions";

const statuses = ["Saved", "Applied", "Screening", "Interview", "Offer", "Rejected"];

export default async function ApplicationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return <PublicApplicationsPreview />;

  const { data: applications } = await supabase.from("applications").select("id,status,created_at,updated_at,jobs(id,title,company,location,work_mode,salary_min_lpa,salary_max_lpa)").eq("user_id", user.id).order("updated_at", { ascending: false });
  const counts = Object.fromEntries(statuses.map(status => [status, applications?.filter((a: any) => a.status === status).length ?? 0]));
  const activeCount = (counts.Applied ?? 0) + (counts.Screening ?? 0) + (counts.Interview ?? 0);

  return <main className="min-h-screen bg-[#f7f8fc] text-[#090d1f]">
    <header className="border-b border-slate-200/70 bg-white"><div className="mx-auto flex max-w-[1200px] items-center justify-between px-5 py-4 sm:px-8"><Link href="/" className="flex items-center gap-3 font-black"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#090d1f] text-sm text-white">JC</span><span className="text-xl">Job<span className="text-violet-600">Craft</span></span></Link><div className="flex items-center gap-2"><Link href="/dashboard" className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold">Dashboard</Link><Link href="/jobs" className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white">Find jobs</Link></div></div></header>

    <section className="mx-auto max-w-[1200px] px-5 py-8 sm:px-8 lg:py-10"><div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><div><p className="text-xs font-black tracking-[.14em] text-violet-600">APPLICATION PIPELINE</p><h1 className="mt-2 text-4xl font-black tracking-[-.04em]">Keep every opportunity moving.</h1><p className="mt-3 max-w-2xl leading-7 text-slate-600">See what needs attention, update stages quickly and keep your job search organised in one place.</p></div><div className="rounded-2xl border border-slate-200 bg-white px-5 py-4"><p className="text-xs font-black tracking-[.12em] text-slate-400">ACTIVE APPLICATIONS</p><p className="mt-1 text-3xl font-black text-violet-600">{activeCount}</p></div></div>

    <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">{statuses.map(status=><div key={status} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><span className="text-sm font-black text-slate-600">{status}</span><span className={`h-2.5 w-2.5 rounded-full ${status==="Offer"?"bg-emerald-500":status==="Rejected"?"bg-slate-300":"bg-violet-500"}`}/></div><div className="mt-3 text-3xl font-black">{counts[status]}</div></div>)}</div>

    <div className="mt-10 flex items-center justify-between"><div><p className="text-xs font-black tracking-[.14em] text-violet-600">YOUR APPLICATIONS</p><h2 className="mt-2 text-2xl font-black">Recent activity</h2></div><Link href="/jobs" className="text-sm font-black text-violet-600">Add another job →</Link></div>

    <div className="mt-5 space-y-4">{applications?.length?applications.map((app:any)=>{const job=app.jobs;return <article key={app.id} className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm transition hover:border-violet-200 sm:p-6"><div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center"><div className="flex items-start gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-50 font-black text-violet-700">{job?.company?.slice(0,2).toUpperCase()??"JC"}</div><div><Link href={`/jobs/${job?.id}`} className="text-xl font-black hover:text-violet-600">{job?.title??"Job"}</Link><p className="mt-1 font-semibold text-slate-600">{job?.company}</p><p className="mt-2 text-sm text-slate-500">{job?.location} · {job?.work_mode}{job?.salary_min_lpa?` · ₹${job.salary_min_lpa}–${job.salary_max_lpa} LPA`:""}</p><div className="mt-3 flex flex-wrap items-center gap-2"><span className="rounded-full bg-violet-50 px-3 py-1.5 text-xs font-black text-violet-700">{app.status}</span><span className="text-xs text-slate-400">Updated {new Date(app.updated_at).toLocaleDateString("en-IN")}</span></div></div></div>
      <div className="flex flex-col gap-3 sm:flex-row"><form action={updateApplicationStatus} className="flex gap-2"><input type="hidden" name="id" value={app.id}/><select name="status" defaultValue={app.status} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold outline-none focus:border-violet-400">{statuses.map(status=><option key={status}>{status}</option>)}</select><button className="rounded-xl bg-[#090d1f] px-4 py-3 font-black text-white">Update</button></form><form action={deleteApplication}><input type="hidden" name="id" value={app.id}/><button className="rounded-xl border border-slate-200 px-4 py-3 font-black text-slate-600">Remove</button></form></div></div></article>}):<div className="rounded-[24px] border border-dashed border-slate-300 bg-white p-12 text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-xl font-black text-violet-700">→</div><h2 className="mt-5 text-2xl font-black">Your tracker is ready.</h2><p className="mx-auto mt-2 max-w-md leading-7 text-slate-600">Save a role or mark it as applied from a JobCraft job page and it will appear here automatically.</p><Link href="/jobs" className="mt-6 inline-block rounded-xl bg-violet-600 px-6 py-3.5 font-black text-white">Explore jobs →</Link></div>}</div>
    </section>
  </main>;
}

function PublicApplicationsPreview() {
  const preview = [
    ["Saved", "12", "Roles you want to review"],
    ["Applied", "8", "Applications already sent"],
    ["Interview", "3", "Opportunities in progress"],
    ["Offer", "1", "Successful outcomes"],
  ];

  return <main className="min-h-screen bg-[#f7f8fc] text-[#090d1f]">
    <header className="border-b border-slate-200/70 bg-white"><div className="mx-auto flex max-w-[1200px] items-center justify-between px-5 py-4 sm:px-8"><Link href="/" className="flex items-center gap-3 font-black"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#090d1f] text-sm text-white">JC</span><span className="text-xl">Job<span className="text-violet-600">Craft</span></span></Link><div className="flex items-center gap-2"><Link href="/applications?auth=login" scroll={false} className="hidden px-4 py-2.5 text-sm font-bold sm:block">Log in</Link><Link href="/applications?auth=signup" scroll={false} className="rounded-xl bg-[#090d1f] px-5 py-3 text-sm font-bold text-white">Get started</Link></div></div></header>

    <section className="mx-auto max-w-[1200px] px-5 py-14 sm:px-8 lg:py-20">
      <div className="grid gap-10 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
        <div><p className="text-xs font-black tracking-[.15em] text-violet-600">APPLICATION TRACKER</p><h1 className="mt-3 text-5xl font-black tracking-[-.05em]">See your whole job search in one place.</h1><p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">Keep saved roles, applications, interviews and offers organised so you always know what needs attention next.</p><div className="mt-8 flex flex-wrap gap-3"><Link href="/applications?auth=signup" scroll={false} className="rounded-xl bg-violet-600 px-6 py-3.5 font-black text-white">Start tracking free →</Link><Link href="/jobs" className="rounded-xl border border-slate-200 bg-white px-6 py-3.5 font-black">Explore jobs</Link></div><p className="mt-4 text-sm text-slate-500">You only need an account when you want to save and manage your own applications.</p></div>

        <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-[0_28px_80px_rgba(15,23,42,.10)] sm:p-6"><div className="flex items-center justify-between"><div><p className="text-xs font-black tracking-[.14em] text-violet-600">TRACKER PREVIEW</p><h2 className="mt-2 text-2xl font-black">Application pipeline</h2></div><span className="rounded-full bg-violet-50 px-3 py-1.5 text-xs font-black text-violet-700">ILLUSTRATIVE</span></div><div className="mt-6 grid gap-3 sm:grid-cols-2">{preview.map(([label,value,note])=><div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="flex items-center justify-between"><span className="text-sm font-black">{label}</span><span className={`h-2.5 w-2.5 rounded-full ${label==="Offer"?"bg-emerald-500":"bg-violet-500"}`}/></div><p className="mt-3 text-3xl font-black">{value}</p><p className="mt-1 text-xs leading-5 text-slate-500">{note}</p></div>)}</div><div className="mt-5 rounded-2xl bg-[#090d1f] p-5 text-white"><p className="text-xs font-black tracking-[.12em] text-violet-300">NEXT ACTION</p><div className="mt-2 flex items-center justify-between gap-4"><div><p className="font-black">Follow up on interview</p><p className="mt-1 text-sm text-slate-300">Keep progress visible instead of relying on memory.</p></div><span className="text-2xl">→</span></div></div></div>
      </div>
    </section>
  </main>;
}
