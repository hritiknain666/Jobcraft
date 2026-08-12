"use client";

const skills = ["SQL", "Power BI", "Excel"];

export default function HeroProductVisual() {
  return <div className="relative mx-auto min-h-[520px] w-full max-w-[620px]">
    <div className="absolute inset-10 rounded-full bg-violet-300/35 blur-[90px]" />
    <div className="absolute -right-8 top-6 h-36 w-36 rounded-full bg-sky-200/40 blur-3xl" />

    <div className="hero-scene relative mx-auto mt-6 w-[92%] overflow-hidden rounded-[32px] border border-white/70 bg-white/90 shadow-[0_45px_120px_rgba(15,23,42,.18)] backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#090d1f] text-[11px] font-black text-white">JC</span><div><p className="text-sm font-black">JobCraft workspace</p><p className="text-[11px] text-slate-400">Illustrative product preview</p></div></div>
        <div className="flex gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-400"/><span className="h-2 w-2 rounded-full bg-violet-400"/><span className="h-2 w-2 rounded-full bg-slate-200"/></div>
      </div>

      <div className="grid gap-4 p-5 sm:grid-cols-[1fr_165px] sm:p-6">
        <div>
          <div className="flex items-start justify-between gap-4"><div><p className="text-[11px] font-black tracking-[.15em] text-violet-600">TOP MATCH</p><p className="mt-2 text-xs font-bold text-slate-400">Sample role</p><h2 className="mt-1 text-3xl font-black tracking-[-.035em]">Data Analyst</h2><p className="mt-2 text-sm text-slate-500">Bengaluru · Hybrid · ₹5.5–8.5 LPA</p></div><div className="match-ring flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-[8px] border-emerald-100 bg-emerald-50 text-xl font-black text-emerald-600">87%</div></div>
          <div className="mt-5 flex flex-wrap gap-2">{skills.map((skill)=><span key={skill} className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700">{skill} ✓</span>)}<span className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-black text-amber-700">Tableau gap</span></div>
          <div className="mt-5 rounded-2xl bg-slate-50 p-4"><div className="flex justify-between text-sm"><b>Strong fit</b><b className="text-emerald-600">87%</b></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200"><div className="score-line h-full w-[87%] rounded-full bg-emerald-500"/></div><p className="mt-3 text-xs leading-5 text-slate-500">Matched skills, experience and preferences stay visible before you apply.</p></div>
        </div>

        <aside className="rounded-2xl bg-[#090d1f] p-4 text-white"><p className="text-[10px] font-black tracking-[.14em] text-violet-300">NEXT ACTIONS</p>{[["Resume","Tailor version"],["Tracker","Save role"],["Career","Review gap"]].map(([a,b],i)=><div key={a} className="action-row mt-3 rounded-xl bg-white/10 p-3" style={{animationDelay:`-${i*1.1}s`}}><p className="text-[10px] font-black text-white/45">{a.toUpperCase()}</p><p className="mt-1 text-sm font-black">{b}</p></div>)}</aside>
      </div>

      <div className="grid grid-cols-4 border-t border-slate-100 bg-[#fafafe]">{[["Saved","12"],["Applied","8"],["Interview","3"],["Offer","1"]].map(([label,value])=><div key={label} className="border-r border-slate-100 px-3 py-4 last:border-r-0"><p className="text-[9px] font-black tracking-wide text-slate-400">{label.toUpperCase()}</p><p className="mt-1 text-xl font-black">{value}</p></div>)}</div>
    </div>

    <div className="float-chip chip-one absolute -left-2 top-10 hidden rounded-2xl border border-white bg-white/95 px-4 py-3 shadow-xl sm:block"><p className="text-[10px] font-black text-violet-600">RESUME SIGNAL</p><p className="mt-1 text-sm font-black">Certificate ready ✓</p></div>
    <div className="float-chip chip-two absolute -right-4 top-28 hidden rounded-2xl bg-[#090d1f] px-4 py-3 text-white shadow-xl sm:block"><p className="text-[10px] font-black text-violet-300">MATCH EXPLAINED</p><p className="mt-1 text-sm font-black">4 strengths · 1 gap</p></div>
    <div className="float-chip chip-three absolute bottom-3 left-10 hidden rounded-2xl border border-violet-100 bg-violet-50 px-4 py-3 shadow-xl sm:block"><p className="text-[10px] font-black text-violet-600">TRACKER</p><p className="mt-1 text-sm font-black">Interview moved ↑</p></div>

    <style jsx>{`
      @keyframes sceneFloat { 0%,100% { transform: perspective(1200px) rotateY(-2deg) rotateX(1deg) translateY(0); } 50% { transform: perspective(1200px) rotateY(1deg) rotateX(-1deg) translateY(-10px); } }
      @keyframes chipFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-9px); } }
      @keyframes pulseRing { 0%,100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); } 50% { box-shadow: 0 0 0 10px rgba(16,185,129,.08); } }
      @keyframes scoreGrow { 0% { width: 25%; } 60%,100% { width: 87%; } }
      @keyframes rowGlow { 0%,100% { background: rgba(255,255,255,.08); } 50% { background: rgba(139,92,246,.22); } }
      .hero-scene { animation: sceneFloat 8s ease-in-out infinite; transform-style: preserve-3d; }
      .float-chip { animation: chipFloat 5.5s ease-in-out infinite; }
      .chip-two { animation-delay: -1.7s; }
      .chip-three { animation-delay: -3.1s; }
      .match-ring { animation: pulseRing 3.2s ease-in-out infinite; }
      .score-line { animation: scoreGrow 3.5s ease-in-out infinite alternate; }
      .action-row { animation: rowGlow 4s ease-in-out infinite; }
      @media (prefers-reduced-motion: reduce) { .hero-scene,.float-chip,.match-ring,.score-line,.action-row { animation: none !important; } }
    `}</style>
  </div>;
}
