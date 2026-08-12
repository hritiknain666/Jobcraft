"use client";

const words = ["less noise", "better fit", "clear next steps", "truthful resumes", "visible progress", "more confidence"];

const cards = [
  ["01", "Find signal", "Focus on roles that actually match your direction."],
  ["02", "Understand the fit", "See matched and missing signals before applying."],
  ["03", "Reuse your proof", "Keep resumes and credentials connected to the search."],
  ["04", "Keep momentum", "Track every application without losing context."],
];

export default function WhyJobCraftMotion() {
  return <section className="relative overflow-hidden bg-[#090d1f] py-20 text-white sm:py-24">
    <div className="absolute inset-0 opacity-70 [background:radial-gradient(circle_at_20%_15%,rgba(124,58,237,.35),transparent_28%),radial-gradient(circle_at_85%_80%,rgba(14,165,233,.16),transparent_30%)]"/>

    <div className="relative mx-auto max-w-[1380px] px-5 sm:px-8">
      <div className="grid gap-10 lg:grid-cols-[.85fr_1.15fr] lg:items-end">
        <div>
          <p className="text-xs font-black tracking-[.18em] text-violet-300">WHY JOBCRAFT EXISTS</p>
          <h2 className="mt-4 text-4xl font-black tracking-[-.045em] sm:text-5xl">A serious job search should feel clear, not chaotic.</h2>
        </div>
        <p className="max-w-2xl text-lg leading-8 text-slate-300">JobCraft is built to reduce noise and make the next useful action obvious — from discovering a role to tracking the outcome.</p>
      </div>

      <div className="mt-10 overflow-hidden rounded-2xl border border-white/10 bg-white/5 py-4 backdrop-blur">
        <div className="motion-marquee flex w-max gap-3 px-3">
          {[...words, ...words].map((word, i) => <span key={`${word}-${i}`} className="rounded-full border border-white/10 bg-white/10 px-5 py-2.5 text-sm font-black text-white/90">{word}</span>)}
        </div>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {cards.map(([num,title,text], i) => <article key={num} className={`motion-float rounded-[24px] border border-white/10 bg-white/[.06] p-6 backdrop-blur-xl ${i%2===0?"motion-delay-a":"motion-delay-b"}`}>
          <div className="flex items-center justify-between"><span className="text-xs font-black tracking-[.16em] text-violet-300">{num}</span><span className="h-2.5 w-2.5 rounded-full bg-violet-400 shadow-[0_0_20px_rgba(167,139,250,.7)]"/></div>
          <h3 className="mt-8 text-2xl font-black tracking-tight">{title}</h3>
          <p className="mt-3 leading-7 text-slate-300">{text}</p>
        </article>)}
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
        <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[.06] p-6 sm:p-8">
          <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-violet-500/20 blur-3xl"/>
          <p className="text-xs font-black tracking-[.16em] text-violet-300">FROM CHAOS TO CONTEXT</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-4">
            {[["Discover","01"],["Match","02"],["Tailor","03"],["Track","04"]].map(([label,n],i)=><div key={label} className="group relative rounded-2xl border border-white/10 bg-black/10 p-4"><p className="text-xs font-black text-white/35">{n}</p><p className="mt-5 text-lg font-black">{label}</p>{i<3&&<span className="absolute -right-2 top-1/2 hidden -translate-y-1/2 text-violet-300 sm:block">→</span>}</div>)}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-violet-500/10 p-6 sm:p-8">
          <p className="text-xs font-black tracking-[.16em] text-violet-300">THE RESULT</p>
          <p className="mt-4 text-3xl font-black tracking-[-.035em]">Less admin. Better decisions. More confident applications.</p>
          <p className="mt-4 leading-7 text-slate-300">Not more tabs. Not more generic advice. One connected workspace that keeps the important signals visible.</p>
        </div>
      </div>
    </div>

    <style jsx>{`
      @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
      @keyframes floaty { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
      .motion-marquee { animation: marquee 24s linear infinite; }
      .motion-float { animation: floaty 6s ease-in-out infinite; }
      .motion-delay-a { animation-delay: 0s; }
      .motion-delay-b { animation-delay: -3s; }
      @media (prefers-reduced-motion: reduce) {
        .motion-marquee, .motion-float { animation: none !important; }
      }
    `}</style>
  </section>;
}
