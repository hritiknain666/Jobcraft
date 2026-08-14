export function JobsSidebar() {
  return (
    <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
      <div className="rounded-[24px] border border-amber-200 bg-amber-50 p-5">
        <p className="text-xs font-black tracking-[.14em] text-amber-700">PROTOTYPE DATA</p>
        <p className="mt-2 font-black text-amber-950">These are sample roles.</p>
        <p className="mt-2 text-sm leading-6 text-amber-900">They demonstrate search and matching only. They are not live employer vacancies yet.</p>
      </div>
      <div className="rounded-[24px] border border-violet-100 bg-white p-5 shadow-sm">
        <p className="text-xs font-black tracking-[.14em] text-violet-600">HOW MATCH WORKS</p>
        <div className="mt-4 space-y-3">
          {[["Skills", "Core role skills"], ["Experience", "Your years vs role need"], ["Location", "City preference"], ["Work mode", "Remote, Hybrid or On-site"]].map(([title, copy], index) => (
            <div key={title} className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-xs font-black text-violet-700">{index + 1}</span>
              <div><p className="text-sm font-black">{title}</p><p className="text-xs text-slate-500">{copy}</p></div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
