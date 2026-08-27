"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const features = [
  {
    key: "match",
    label: "Job Match",
    eyebrow: "JOB MATCHING",
    title: "Know why a role fits before you spend time on it.",
    text: "See matched skills, missing skills, experience and preference signals together — not a mysterious number on its own.",
    href: "/jobs",
  },
  {
    key: "resume",
    label: "Resume",
    eyebrow: "RESUME WORKSPACE",
    title: "Keep multiple resume versions organised and grounded.",
    text: "Build ATS-friendly versions, keep a primary resume and tailor only from facts you actually provide.",
    href: "/resume",
  },
  {
    key: "tracker",
    label: "Tracker",
    eyebrow: "APPLICATION TRACKER",
    title: "Turn your job search into a visible pipeline.",
    text: "Keep Saved, Applied, Screening, Interview and Offer stages connected to the jobs you are actually pursuing.",
    href: "/applications",
  },
  {
    key: "career",
    label: "Career Assistant",
    eyebrow: "CAREER ASSISTANT",
    title: "Know the next useful action instead of getting generic advice.",
    text: "Use your profile, match patterns and application history to surface practical priorities.",
    href: "/career-assistant",
  },
];

export default function BestOfJobCraft() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setActive((v) => (v + 1) % features.length), 5200);
    return () => window.clearInterval(id);
  }, []);
  const feature = features[active];

  return (
    <section className="relative overflow-hidden bg-white py-20 sm:py-28">
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-violet-50/80 to-transparent" />
      <div className="relative mx-auto max-w-[1380px] px-5 sm:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-black tracking-[.18em] text-violet-600">
            SEE THE PRODUCT BEFORE YOU SIGN UP
          </p>
          <h2 className="mt-4 text-4xl font-black tracking-[-.05em] sm:text-6xl">
            JobCraft should feel useful before you create an account.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            Explore the core workflow visually. Each part connects to the next instead of living as
            a separate tool.
          </p>
        </div>

        <div className="mt-12 flex gap-2 overflow-x-auto pb-2 sm:justify-center">
          {features.map((item, i) => (
            <button
              key={item.key}
              onClick={() => setActive(i)}
              className={`shrink-0 rounded-full px-5 py-3 text-sm font-black transition ${i === active ? "bg-[#090d1f] text-white shadow-lg" : "border border-slate-200 bg-white text-slate-500 hover:border-violet-200 hover:text-violet-700"}`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-8 grid overflow-hidden rounded-[34px] border border-slate-200 bg-[#f7f8fc] shadow-[0_30px_100px_rgba(15,23,42,.10)] lg:grid-cols-[.78fr_1.22fr]">
          <div className="flex flex-col justify-between p-7 sm:p-10 lg:p-12">
            <div>
              <p className="text-xs font-black tracking-[.16em] text-violet-600">
                {feature.eyebrow}
              </p>
              <h3 className="mt-4 text-3xl font-black tracking-[-.04em] sm:text-4xl">
                {feature.title}
              </h3>
              <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">{feature.text}</p>
            </div>
            <div className="mt-8">
              <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-slate-200">
                <div key={active} className="feature-progress h-full rounded-full bg-violet-600" />
              </div>
              <Link
                href={feature.href}
                className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3.5 font-black text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5"
              >
                Open {feature.label} <span>→</span>
              </Link>
            </div>
          </div>

          <div className="relative min-h-[470px] overflow-hidden bg-[#0b1021] p-5 sm:p-8 lg:p-10">
            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-violet-500/25 blur-3xl" />
            <div className="absolute -bottom-20 left-12 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl" />
            <div key={feature.key} className="preview-enter relative h-full">
              {feature.key === "match" && <MatchPreview />}
              {feature.key === "resume" && <ResumePreview />}
              {feature.key === "tracker" && <TrackerPreview />}
              {feature.key === "career" && <CareerPreview />}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes progress {
          from {
            width: 0;
          }
          to {
            width: 100%;
          }
        }
        @keyframes enter {
          from {
            opacity: 0;
            transform: translateY(14px) scale(0.985);
          }
          to {
            opacity: 1;
            transform: none;
          }
        }
        .feature-progress {
          animation: progress 5.2s linear forwards;
        }
        .preview-enter {
          animation: enter 0.55s ease both;
        }
        @media (prefers-reduced-motion: reduce) {
          .feature-progress,
          .preview-enter {
            animation: none !important;
          }
          .feature-progress {
            width: 100%;
          }
        }
      `}</style>
    </section>
  );
}

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto h-full max-w-2xl rounded-[28px] border border-white/10 bg-white/[.07] p-4 shadow-2xl backdrop-blur-xl sm:p-5">
      {children}
    </div>
  );
}
function MatchPreview() {
  return (
    <Frame>
      <div className="rounded-2xl bg-white p-5 text-slate-950">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-black text-violet-600">TOP MATCH</p>
            <h4 className="mt-2 text-2xl font-black">Data Analyst</h4>
            <p className="mt-1 text-sm text-slate-500">Bengaluru · Hybrid · ₹5.5–8.5 LPA</p>
          </div>
          <span className="text-4xl font-black text-emerald-600">87%</span>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {["SQL ✓", "Power BI ✓", "Excel ✓"].map((x) => (
            <span
              key={x}
              className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700"
            >
              {x}
            </span>
          ))}
          <span className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-black text-amber-700">
            Tableau gap
          </span>
        </div>
        <div className="mt-5 rounded-xl bg-slate-50 p-4">
          <p className="text-sm font-black">Why it fits</p>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Strong skill overlap, matching work mode, relevant experience range.
          </p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-emerald-400/10 p-4 text-emerald-200">
          <p className="text-xs font-black">STRENGTH</p>
          <p className="mt-2 font-black">4 matching signals</p>
        </div>
        <div className="rounded-2xl bg-amber-400/10 p-4 text-amber-200">
          <p className="text-xs font-black">GAP</p>
          <p className="mt-2 font-black">1 skill to review</p>
        </div>
      </div>
    </Frame>
  );
}
function ResumePreview() {
  return (
    <Frame>
      <div className="grid h-full gap-4 sm:grid-cols-[180px_1fr]">
        <aside className="rounded-2xl bg-white/10 p-3 text-white">
          {[
            ["Data Analyst", "Primary"],
            ["Business Analyst", "Ready"],
            ["Graduate", "Draft"],
          ].map(([a, b], i) => (
            <div
              key={a}
              className={`mb-2 rounded-xl p-3 ${i === 0 ? "bg-white text-slate-950" : "bg-white/5"}`}
            >
              <p className="text-sm font-black">{a}</p>
              <p
                className={`mt-1 text-[10px] font-black ${i === 0 ? "text-violet-600" : "text-white/40"}`}
              >
                {b.toUpperCase()}
              </p>
            </div>
          ))}
        </aside>
        <div className="rounded-2xl bg-white p-5 text-slate-950">
          <p className="text-[10px] font-black tracking-[.14em] text-violet-600">ATS PREVIEW</p>
          <h4 className="mt-3 text-2xl font-black">Your Name</h4>
          <p className="text-sm font-semibold text-slate-500">Data Analyst · SQL · Power BI</p>
          <div className="mt-5 border-t border-slate-200 pt-4">
            <p className="text-[10px] font-black">SUMMARY</p>
            <div className="mt-2 space-y-2">
              <div className="h-2 rounded bg-slate-100" />
              <div className="h-2 w-4/5 rounded bg-slate-100" />
            </div>
          </div>
          <div className="mt-5 border-t border-slate-200 pt-4">
            <p className="text-[10px] font-black">CERTIFICATIONS</p>
            <p className="mt-2 text-sm text-slate-500">Google Data Analytics · Credential saved</p>
          </div>
        </div>
      </div>
    </Frame>
  );
}
function TrackerPreview() {
  return (
    <Frame>
      <div className="grid grid-cols-4 gap-2">
        {[
          ["Saved", "12"],
          ["Applied", "8"],
          ["Interview", "3"],
          ["Offer", "1"],
        ].map(([a, b], i) => (
          <div key={a} className="rounded-2xl bg-white p-4 text-center text-slate-950">
            <p className={`text-3xl font-black ${i === 3 ? "text-emerald-600" : ""}`}>{b}</p>
            <p className="mt-1 text-[9px] font-black text-slate-400">{a.toUpperCase()}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 space-y-3">
        {[
          ["Data Analyst", "Interview", "Aster Analytics"],
          ["Business Analyst", "Applied", "Nova Systems"],
          ["BI Developer", "Saved", "InsightWorks"],
        ].map(([a, b, c], i) => (
          <div
            key={a}
            className="flex items-center justify-between rounded-2xl bg-white/[.08] p-4 text-white"
          >
            <div>
              <p className="font-black">{a}</p>
              <p className="mt-1 text-xs text-white/45">{c}</p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-black ${i === 0 ? "bg-violet-400/20 text-violet-200" : "bg-white/10 text-white/60"}`}
            >
              {b}
            </span>
          </div>
        ))}
      </div>
    </Frame>
  );
}
function CareerPreview() {
  return (
    <Frame>
      <div className="rounded-2xl bg-white p-5 text-slate-950">
        <p className="text-xs font-black text-violet-600">NEXT PRIORITIES</p>
        <h4 className="mt-2 text-2xl font-black">What should you work on next?</h4>
        {[
          ["01", "Review repeated skill gaps", "Tableau appears across several target roles."],
          [
            "02",
            "Prioritise stronger matches",
            "Focus first on roles above your current match baseline.",
          ],
          ["03", "Improve conversion", "Track where applications are stalling."],
        ].map(([n, a, b]) => (
          <div key={n} className="mt-4 flex gap-3 rounded-xl bg-slate-50 p-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#090d1f] text-[10px] font-black text-white">
              {n}
            </span>
            <div>
              <p className="font-black">{a}</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">{b}</p>
            </div>
          </div>
        ))}
      </div>
    </Frame>
  );
}
