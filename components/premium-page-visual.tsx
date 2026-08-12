"use client";

import { useEffect, useState } from "react";

type Variant = "dashboard" | "jobs" | "resume" | "applications" | "assistant";

type PremiumPageVisualProps = {
  variant: Variant;
  compact?: boolean;
};

const frames: Record<Variant, { eyebrow: string; title: string; note: string; chips: string[]; accent: string }[]> = {
  dashboard: [
    { eyebrow: "NEXT BEST ACTION", title: "Review your strongest matches", note: "Use your profile, resume and activity to focus the search.", chips: ["87% match", "3 interviews", "Resume ready"], accent: "bg-violet-500" },
    { eyebrow: "CAREER MOMENTUM", title: "One workspace, fewer loose ends", note: "Jobs, resumes, applications and guidance stay connected.", chips: ["Saved 12", "Applied 8", "Offer 1"], accent: "bg-emerald-500" },
  ],
  jobs: [
    { eyebrow: "MATCH SIGNAL", title: "Data Analyst · 87%", note: "SQL, Power BI and Excel align. Tableau is the visible gap.", chips: ["SQL ✓", "Power BI ✓", "Tableau gap"], accent: "bg-emerald-500" },
    { eyebrow: "SEARCH CONTEXT", title: "Filter the noise before you apply", note: "Salary, experience, city, work mode and skills stay visible.", chips: ["Hybrid", "₹5.5–8.5 LPA", "2 yrs"], accent: "bg-violet-500" },
  ],
  resume: [
    { eyebrow: "RESUME VERSION", title: "Data Analyst Resume", note: "ATS-friendly, factual and ready for the roles you are targeting.", chips: ["Primary", "ATS-ready", "4 certificates"], accent: "bg-violet-500" },
    { eyebrow: "TRUTHFUL TAILORING", title: "Change emphasis, never invent facts", note: "JobCraft should only use experience, skills and proof you actually supplied.", chips: ["SQL", "Power BI", "Projects"], accent: "bg-emerald-500" },
  ],
  applications: [
    { eyebrow: "PIPELINE", title: "Keep every opportunity moving", note: "See where applications stall and what needs your attention next.", chips: ["Applied 8", "Interview 3", "Offer 1"], accent: "bg-violet-500" },
    { eyebrow: "FOLLOW-THROUGH", title: "Your search should not disappear into tabs", note: "Track stage changes in one place instead of relying on memory.", chips: ["Saved", "Screening", "Interview"], accent: "bg-emerald-500" },
  ],
  assistant: [
    { eyebrow: "CAREER SIGNAL", title: "Close repeated skill gaps first", note: "Prioritise gaps that show up across several strong-fit roles.", chips: ["SQL strong", "Tableau gap", "Cloud gap"], accent: "bg-violet-500" },
    { eyebrow: "NEXT PRIORITY", title: "Improve application conversion", note: "Use your own tracker data to decide what to change next.", chips: ["5 applied", "1 interview", "20% rate"], accent: "bg-emerald-500" },
  ],
};

export default function PremiumPageVisual({ variant, compact = false }: PremiumPageVisualProps) {
  const [index, setIndex] = useState(0);
  const items = frames[variant];

  useEffect(() => {
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % items.length), 4200);
    return () => window.clearInterval(timer);
  }, [items.length]);

  const active = items[index];

  return <div className={`relative overflow-hidden rounded-[28px] border border-white/10 bg-[#090d1f] text-white shadow-[0_30px_90px_rgba(15,23,42,.20)] ${compact ? "p-5" : "p-6 sm:p-7"}`}>
    <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-violet-600/30 blur-3xl" />
    <div className="absolute -bottom-20 left-1/4 h-48 w-48 rounded-full bg-sky-500/10 blur-3xl" />

    <div className="relative">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-[10px] font-black tracking-[.18em] text-violet-300"><span className={`h-2 w-2 rounded-full ${active.accent} jc-pulse`} />LIVE PRODUCT SIGNAL</div>
        <div className="flex gap-1.5">{items.map((_, i) => <button key={i} aria-label={`Show product signal ${i + 1}`} onClick={() => setIndex(i)} className={`h-1.5 rounded-full transition-all ${i === index ? "w-7 bg-white" : "w-2 bg-white/25"}`} />)}</div>
      </div>

      <div key={`${variant}-${index}`} className="jc-rise mt-7">
        <p className="text-xs font-black tracking-[.15em] text-violet-300">{active.eyebrow}</p>
        <h3 className={`${compact ? "text-2xl" : "text-3xl sm:text-[2rem]"} mt-2 font-black tracking-[-.04em]`}>{active.title}</h3>
        <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">{active.note}</p>
        <div className="mt-5 flex flex-wrap gap-2">{active.chips.map((chip) => <span key={chip} className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-black text-white/90 backdrop-blur">{chip}</span>)}</div>
      </div>

      <div className="mt-7 grid grid-cols-4 gap-2">
        {[32, 66, 48, 84].map((height, i) => <div key={i} className="flex h-16 items-end rounded-xl bg-white/[.05] p-2"><div className={`w-full rounded-lg ${i === 3 ? "bg-violet-400" : "bg-white/20"}`} style={{ height: `${height}%` }} /></div>)}
      </div>
    </div>
  </div>;
}
