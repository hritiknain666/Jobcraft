"use client";

import Link from "next/link";

const chips = ["Match clarity", "Resume versions", "Career signals", "Application flow"];

export default function HomeFeatureStory() {
  return <section className="overflow-hidden bg-white py-24 sm:py-28">
    <div className="mx-auto max-w-[1380px] px-5 sm:px-8">
      <div className="mx-auto max-w-4xl text-center">
        <p className="text-xs font-black tracking-[.2em] text-violet-600">HOW JOBCRAFT FEELS</p>
        <h2 className="mt-4 text-4xl font-black tracking-[-.05em] sm:text-6xl">Less dashboard. More guidance.</h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">JobCraft should make the next useful action feel obvious — with context, visual signals and a workflow that stays connected from role discovery to outcome.</p>
      </div>

      <div className="story-marquee mt-10 overflow-hidden rounded-full border border-violet-100 bg-violet-50/80 py-3">
        <div className="story-marquee-track flex w-max gap-3 px-3">{[...chips,...chips,...chips].map((chip,i)=><span key={`${chip}-${i}`} className="rounded-full bg-white px-5 py-2 text-sm font-black text-violet-700 shadow-sm">{chip}</span>)}</div>
      </div>

      <article className="mt-16 grid gap-8 overflow-hidden rounded-[36px] border border-violet-100 bg-[linear-gradient(135deg,#fff7ff_0%,#f5f3ff_45%,#eef9ff_100%)] p-6 shadow-[0_40px_120px_rgba(76,29,149,.10)] sm:p-10 lg:grid-cols-[.76fr_1.24fr] lg:items-center lg:p-12">
        <div>
          <span className="inline-flex rounded-full bg-violet-600 px-3 py-1.5 text-xs font-black tracking-[.12em] text-white">01 · MATCH WITH CONTEXT</span>
          <h3 className="mt-6 text-4xl font-black tracking-[-.045em] sm:text-5xl">See what fits. See what doesn’t.</h3>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">A match score should not be a mystery. JobCraft makes the useful parts visible: what already aligns, what is missing, and what to do next.</p>
          <div className="mt-7 flex flex-wrap gap-2">{["SQL matched","Power BI matched","Experience aligned","Tableau gap"].map((x,i)=><span key={x} className={`rounded-full px-4 py-2 text-sm font-black ${i===3?"bg-amber-100 text-amber-800":"bg-emerald-100 text-emerald-800"}`}>{x}</span>)}</div>
          <Link href="/jobs" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#0a1024] px-6 py-3.5 font-black text-white shadow-lg transition hover:-translate-y-0.5">Explore jobs <span>→</span></Link>
        </div>

        <div className="relative min-h-[480px]">
          <div className="absolute inset-8 rounded-full bg-violet-300/30 blur-3xl"/>
          <div className="scene-card scene-main absolute inset-x-0 top-8 mx-auto w-[88%] rounded-[30px] border border-white/80 bg-white/95 p-6 shadow-[0_35px_90px_rgba(15,23,42,.16)] backdrop-blur-xl">
            <div className="flex items-center justify-between"><div><p className="text-xs font-black tracking-[.14em] text-violet-600">DATA ANALYST</p><h4 className="mt-2 text-3xl font-black">Strong fit</h4><p className="mt-2 text-sm text-slate-500">Bengaluru · Hybrid · ₹5.5–8.5 LPA</p></div><div className="match-pulse flex h-24 w-24 items-center justify-center rounded-full border-[10px] border-emerald-100 bg-emerald-50 text-2xl font-black text-emerald-600">87%</div></div>
            <div className="mt-6 rounded-2xl bg-slate-50 p-5"><div className="flex items-center justify-between text-sm font-black"><span>Overall fit</span><span className="text-emerald-600">87%</span></div><div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-200"><div className="story-score h-full rounded-full bg-emerald-500"/></div></div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2"><div className="rounded-2xl bg-emerald-50 p-4"><p className="text-xs font-black text-emerald-700">ALREADY STRONG</p><p className="mt-2 font-black">SQL · Power BI · Excel</p></div><div className="rounded-2xl bg-amber-50 p-4"><p className="text-xs font-black text-amber-700">REVIEW NEXT</p><p className="mt-2 font-black">Tableau</p></div></div>
          </div>
          <div className="scene-chip scene-chip-a absolute left-0 top-0 rounded-2xl border border-violet-100 bg-white px-4 py-3 shadow-xl"><p className="text-[10px] font-black text-violet-600">MATCH EXPLAINED</p><p className="mt-1 text-sm font-black">4 strengths · 1 gap</p></div>
          <div className="scene-chip scene-chip-b absolute bottom-10 right-0 rounded-2xl bg-[#0a1024] px-4 py-3 text-white shadow-xl"><p className="text-[10px] font-black text-violet-300">NEXT ACTION</p><p className="mt-1 text-sm font-black">Review role →</p></div>
        </div>
      </article>

      <article className="mt-8 grid gap-8 overflow-hidden rounded-[36px] border border-sky-100 bg-[linear-gradient(135deg,#effcff_0%,#f8fbff_55%,#f9f5ff_100%)] p-6 shadow-[0_40px_120px_rgba(2,132,199,.08)] sm:p-10 lg:grid-cols-[1.2fr_.8fr] lg:items-center lg:p-12">
        <div className="order-2 lg:order-1">
          <div className="relative min-h-[470px]">
            <div className="absolute left-12 top-10 h-72 w-72 rounded-full bg-sky-200/45 blur-3xl"/>
            <div className="scene-card scene-resume absolute left-[7%] top-6 w-[78%] rounded-[28px] border border-white/80 bg-white p-6 shadow-[0_35px_90px_rgba(15,23,42,.14)]">
              <div className="flex items-center justify-between"><div><p className="text-xs font-black tracking-[.14em] text-sky-600">RESUME WORKSPACE</p><h4 className="mt-2 text-2xl font-black">Data Analyst Resume</h4></div><span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700">PRIMARY</span></div>
              <div className="mt-6 space-y-3">{[["Professional summary","Ready"],["SQL + Power BI evidence","Strong"],["Certificates","2 selected"],["Role focus","Data Analyst"]].map(([a,b])=><div key={a} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"><span className="text-sm font-bold text-slate-600">{a}</span><span className="text-sm font-black">{b}</span></div>)}</div>
            </div>
            <div className="scene-card scene-resume-alt absolute bottom-4 right-4 w-[52%] rounded-[24px] border border-violet-100 bg-violet-600 p-5 text-white shadow-xl"><p className="text-[10px] font-black tracking-[.14em] text-violet-200">ROLE VERSION</p><p className="mt-2 text-xl font-black">Business Analyst</p><p className="mt-3 text-sm leading-6 text-violet-100">Different emphasis. Same truthful facts.</p></div>
            <div className="scene-chip scene-chip-c absolute left-0 bottom-20 rounded-2xl bg-white px-4 py-3 shadow-xl"><p className="text-[10px] font-black text-sky-600">CERTIFICATE READY</p><p className="mt-1 text-sm font-black">Google Data Analytics ✓</p></div>
          </div>
        </div>
        <div className="order-1 lg:order-2">
          <span className="inline-flex rounded-full bg-sky-600 px-3 py-1.5 text-xs font-black tracking-[.12em] text-white">02 · RESUME, WITHOUT THE CHAOS</span>
          <h3 className="mt-6 text-4xl font-black tracking-[-.045em] sm:text-5xl">One career story. Multiple focused versions.</h3>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">Keep your source material organised, then create role-focused versions without rewriting your history or inventing achievements.</p>
          <Link href="/resume" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-sky-600 px-6 py-3.5 font-black text-white shadow-lg transition hover:-translate-y-0.5">See resume tools <span>→</span></Link>
        </div>
      </article>

      <article className="mt-8 grid gap-8 overflow-hidden rounded-[36px] border border-emerald-100 bg-[linear-gradient(135deg,#f0fff8_0%,#f8fffb_48%,#f5f2ff_100%)] p-6 shadow-[0_40px_120px_rgba(5,150,105,.08)] sm:p-10 lg:grid-cols-[.78fr_1.22fr] lg:items-center lg:p-12">
        <div>
          <span className="inline-flex rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-black tracking-[.12em] text-white">03 · KEEP MOMENTUM VISIBLE</span>
          <h3 className="mt-6 text-4xl font-black tracking-[-.045em] sm:text-5xl">Know exactly where every opportunity stands.</h3>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">Saved, Applied, Screening, Interview, Offer — one clear pipeline so your job search stops living in browser tabs and memory.</p>
          <Link href="/applications" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 font-black text-white shadow-lg transition hover:-translate-y-0.5">Preview tracker <span>→</span></Link>
        </div>
        <div className="relative min-h-[460px]">
          <div className="absolute inset-10 rounded-full bg-emerald-200/35 blur-3xl"/>
          <div className="scene-card scene-track absolute inset-x-[4%] top-8 rounded-[30px] bg-[#0a1024] p-6 text-white shadow-[0_35px_90px_rgba(15,23,42,.22)]">
            <div className="grid grid-cols-4 gap-3">{[["Saved","12"],["Applied","8"],["Interview","3"],["Offer","1"]].map(([a,b],i)=><div key={a} className="rounded-2xl bg-white p-4 text-slate-950"><p className={`text-3xl font-black ${i===3?"text-emerald-600":""}`}>{b}</p><p className="mt-1 text-[10px] font-black text-slate-400">{a.toUpperCase()}</p></div>)}</div>
            <div className="mt-5 space-y-3">{[["Data Analyst","Interview","Aster Analytics"],["Business Analyst","Applied","Nova Systems"],["Graduate Analyst","Saved","Vertex Consulting"]].map(([role,status,company],i)=><div key={role} className="tracker-row flex items-center justify-between rounded-2xl bg-white/10 p-4" style={{animationDelay:`-${i*1.2}s`}}><div><p className="font-black">{role}</p><p className="mt-1 text-xs text-slate-400">{company}</p></div><span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-violet-200">{status}</span></div>)}</div>
          </div>
          <div className="scene-chip scene-chip-d absolute bottom-0 left-0 rounded-2xl border border-emerald-100 bg-white px-4 py-3 shadow-xl"><p className="text-[10px] font-black text-emerald-600">MOMENTUM</p><p className="mt-1 text-sm font-black">Interview moved ↑</p></div>
        </div>
      </article>
    </div>

    <style jsx>{`
      @keyframes marqueeStory { from { transform: translateX(0); } to { transform: translateX(-33.333%); } }
      @keyframes sceneFloat { 0%,100% { transform: translateY(0) rotate(-.3deg); } 50% { transform: translateY(-10px) rotate(.3deg); } }
      @keyframes chipFloatStory { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
      @keyframes scoreStory { 0% { width: 30%; } 65%,100% { width: 87%; } }
      @keyframes matchPulseStory { 0%,100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); } 50% { box-shadow: 0 0 0 12px rgba(16,185,129,.08); } }
      @keyframes trackerGlow { 0%,100% { background: rgba(255,255,255,.08); } 50% { background: rgba(139,92,246,.20); } }
      .story-marquee-track { animation: marqueeStory 28s linear infinite; }
      .scene-main,.scene-resume,.scene-track { animation: sceneFloat 7s ease-in-out infinite; }
      .scene-resume-alt { animation: sceneFloat 8.5s ease-in-out infinite reverse; }
      .scene-chip { animation: chipFloatStory 5.2s ease-in-out infinite; }
      .scene-chip-b,.scene-chip-c { animation-delay: -2.1s; }
      .scene-chip-d { animation-delay: -3.4s; }
      .story-score { animation: scoreStory 3.6s ease-in-out infinite alternate; }
      .match-pulse { animation: matchPulseStory 3.2s ease-in-out infinite; }
      .tracker-row { animation: trackerGlow 4.5s ease-in-out infinite; }
      @media (prefers-reduced-motion: reduce) { .story-marquee-track,.scene-main,.scene-resume,.scene-track,.scene-resume-alt,.scene-chip,.story-score,.match-pulse,.tracker-row { animation: none !important; } }
    `}</style>
  </section>;
}
