import Link from "next/link";

type SearchParams = Record<string, string | undefined>;

export function JobsSearchHero({ params }: { params: SearchParams }) {
  return (
    <section className="relative overflow-hidden border-b border-slate-200/70 bg-white">
      <div className="absolute -left-20 top-8 h-64 w-64 rounded-full bg-violet-200/35 blur-3xl" />
      <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-sky-200/30 blur-3xl" />
      <div className="relative mx-auto max-w-[1400px] px-5 py-10 sm:px-8 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[.82fr_1.18fr] lg:items-center">
          <div>
            <p className="text-xs font-black tracking-[.18em] text-violet-600">JOB DISCOVERY</p>
            <h1 className="mt-3 text-4xl font-black tracking-[-.055em] sm:text-5xl">Find the roles worth opening.</h1>
            <p className="mt-4 max-w-xl text-lg leading-8 text-slate-600">Search by role, city, salary, experience, skills and work mode. Then see the fit before you apply.</p>
          </div>
          <div className="rounded-[28px] border border-violet-100 bg-[linear-gradient(135deg,#f7f2ff_0%,#ffffff_48%,#eef9ff_100%)] p-5 shadow-[0_24px_70px_rgba(79,70,229,.10)]">
            <div className="flex items-center justify-between gap-4">
              <div><p className="text-[10px] font-black tracking-[.15em] text-violet-600">WHAT YOU GET</p><p className="mt-1 text-xl font-black">Search + match in one view</p></div>
              <span className="rounded-full bg-white px-3 py-1.5 text-xs font-black text-slate-500 shadow-sm">INDIA-FIRST</span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[["₹ LPA", "Salary context"], ["Skills", "Matched + missing"], ["Mode", "Remote / Hybrid / On-site"]].map(([title, copy]) => (
                <div key={title} className="rounded-2xl bg-white p-4 shadow-sm"><p className="text-sm font-black text-violet-700">{title}</p><p className="mt-1 text-xs leading-5 text-slate-500">{copy}</p></div>
              ))}
            </div>
          </div>
        </div>

        <form className="mt-8 rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_20px_55px_rgba(15,23,42,.08)]">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-6">
            <input name="q" defaultValue={params.q} placeholder="Role, skill or company" className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none transition focus:border-violet-400 focus:bg-white lg:col-span-2" />
            <input name="location" defaultValue={params.location} placeholder="City" className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none transition focus:border-violet-400 focus:bg-white" />
            <select name="work_mode" defaultValue={params.work_mode ?? ""} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5"><option value="">Any work mode</option><option>On-site</option><option>Hybrid</option><option>Remote</option></select>
            <input name="salary" defaultValue={params.salary} type="number" min="0" step="0.5" placeholder="Min LPA" className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5" />
            <input name="skill" defaultValue={params.skill} placeholder="Skill e.g. SQL" className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5" />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button className="rounded-xl bg-violet-600 px-6 py-3.5 font-black text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5">Search jobs</button>
            <Link href="/jobs" className="rounded-xl border border-slate-200 bg-white px-6 py-3.5 font-black text-slate-600">Clear</Link>
            <div className="ml-auto hidden gap-2 lg:flex">
              {["SQL", "Power BI", "Business Analysis"].map((skill) => <Link key={skill} href={`/jobs?skill=${encodeURIComponent(skill)}`} className="rounded-full bg-slate-100 px-3 py-2 text-xs font-black text-slate-600 hover:bg-violet-50 hover:text-violet-700">{skill}</Link>)}
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
