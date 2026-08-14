function initials(company: string) {
  return company.split(" ").filter(Boolean).slice(0, 2).map((word) => word[0]).join("").toUpperCase();
}

export function JobCardMain({ job, match }: { job: any; match: any }) {
  return (
    <div className="p-5 sm:p-6">
      <div className="flex gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#0b1020] text-sm font-black text-white">{initials(job.company)}</div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-black text-violet-600">{job.company}</p>
            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-black text-amber-700">SAMPLE ROLE</span>
          </div>
          <h3 className="mt-1 text-2xl font-black">{job.title}</h3>
          <p className="mt-2 text-sm text-slate-500">{job.location} · {job.work_mode} · {job.salary_min_lpa ? `₹${job.salary_min_lpa}–${job.salary_max_lpa} LPA` : "Salary not listed"}</p>
        </div>
      </div>
      <p className="mt-5 line-clamp-2 leading-7 text-slate-600">{job.description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {(job.skills ?? []).slice(0, 6).map((skill: string) => {
          const matched = match?.matched.includes(skill);
          return <span key={skill} className={`rounded-lg px-3 py-1.5 text-xs font-black ${matched ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{skill}{matched ? " ✓" : ""}</span>;
        })}
      </div>
    </div>
  );
}
