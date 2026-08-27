"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const jobs = [
  {
    role: "Data Analyst",
    company: "Aster Analytics",
    city: "Bengaluru",
    mode: "Hybrid",
    salary: "₹5.5–8.5 LPA",
    score: 87,
    skills: ["SQL", "Power BI", "Excel"],
  },
  {
    role: "Business Analyst",
    company: "Nova Systems",
    city: "Gurugram",
    mode: "Hybrid",
    salary: "₹6–10 LPA",
    score: 81,
    skills: ["SQL", "Agile", "Jira"],
  },
  {
    role: "Power BI Developer",
    company: "InsightWorks",
    city: "Hyderabad",
    mode: "Remote",
    salary: "₹7–12 LPA",
    score: 76,
    skills: ["Power BI", "DAX", "SQL"],
  },
];

const stages = ["Saved", "Applied", "Interview", "Offer"];

export default function HomeFeatureStory() {
  const [activeJob, setActiveJob] = useState(0);
  const [stage, setStage] = useState(1);

  useEffect(() => {
    const timer = window.setInterval(
      () => setActiveJob((value) => (value + 1) % jobs.length),
      3400,
    );
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setStage((value) => (value + 1) % stages.length), 2200);
    return () => window.clearInterval(timer);
  }, []);

  const current = jobs[activeJob];

  return (
    <section className="overflow-hidden bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-[1380px] px-5 sm:px-8">
        <div className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
          <article className="relative overflow-hidden rounded-[34px] border border-violet-100 bg-[linear-gradient(135deg,#f9f5ff_0%,#ffffff_48%,#eef8ff_100%)] p-6 shadow-[0_30px_90px_rgba(79,70,229,.10)] sm:p-8 lg:p-10">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-300/25 blur-3xl" />
            <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
              <div>
                <p className="text-xs font-black tracking-[.18em] text-violet-600">
                  LIVE PRODUCT PREVIEW
                </p>
                <h2 className="mt-3 max-w-2xl text-4xl font-black tracking-[-.05em] sm:text-5xl">
                  Find a job. See the fit. Decide faster.
                </h2>
                <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
                  Less reading. More doing. Search, compare and move to the next step from one
                  screen.
                </p>
              </div>
              <Link
                href="/jobs"
                className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#0a1024] px-5 py-3.5 font-black text-white shadow-lg transition hover:-translate-y-0.5"
              >
                Open jobs <span>→</span>
              </Link>
            </div>

            <div className="relative mt-9 rounded-[28px] border border-white/80 bg-white/90 p-4 shadow-[0_28px_80px_rgba(15,23,42,.12)] backdrop-blur-xl sm:p-5">
              <div className="flex flex-col gap-3 md:flex-row">
                <div className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-bold text-slate-500">
                  Data Analyst, SQL, Power BI...
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-bold text-slate-500 md:w-44">
                  Bengaluru
                </div>
                <div className="rounded-2xl bg-violet-600 px-5 py-3.5 text-center text-sm font-black text-white">
                  Search
                </div>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_220px]">
                <div className="job-live-card rounded-[24px] border border-slate-200 bg-white p-5">
                  <div className="flex items-start justify-between gap-5">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-violet-50 px-3 py-1 text-[10px] font-black text-violet-700">
                          SAMPLE ROLE
                        </span>
                        <span className="live-dot rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black text-emerald-700">
                          ● LIVE PREVIEW
                        </span>
                      </div>
                      <h3 className="mt-3 text-2xl font-black">{current.role}</h3>
                      <p className="mt-1 font-bold text-slate-500">{current.company}</p>
                      <p className="mt-3 text-sm text-slate-500">
                        {current.city} · {current.mode} · {current.salary}
                      </p>
                    </div>
                    <div className="score-pulse flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-[8px] border-emerald-100 bg-emerald-50 text-xl font-black text-emerald-600">
                      {current.score}%
                    </div>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {current.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700"
                      >
                        {skill} ✓
                      </span>
                    ))}
                    <span className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-black text-amber-700">
                      1 skill gap
                    </span>
                  </div>
                  <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                    <div className="flex items-center justify-between text-sm font-black">
                      <span>Why it fits</span>
                      <span className="text-emerald-600">Strong match</span>
                    </div>
                    <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="match-line h-full rounded-full bg-emerald-500"
                        style={{ width: `${current.score}%` }}
                      />
                    </div>
                    <p className="mt-3 text-xs leading-5 text-slate-500">
                      Skills, experience and preferences stay visible before you apply.
                    </p>
                  </div>
                </div>

                <div className="rounded-[24px] bg-[#0a1024] p-4 text-white">
                  <p className="text-[10px] font-black tracking-[.14em] text-violet-300">
                    NEXT STEPS
                  </p>
                  {[
                    ["1", "Check match"],
                    ["2", "Fix resume"],
                    ["3", "Save role"],
                  ].map(([n, label], i) => (
                    <div
                      key={label}
                      className={`next-step mt-3 rounded-2xl p-3 ${i === activeJob % 3 ? "bg-violet-500/25" : "bg-white/8"}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-xs font-black">
                          {n}
                        </span>
                        <p className="text-sm font-black">{label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </article>

          <article className="relative overflow-hidden rounded-[34px] bg-[linear-gradient(145deg,#171c35_0%,#25184d_52%,#111827_100%)] p-6 text-white shadow-[0_30px_90px_rgba(15,23,42,.22)] sm:p-8 lg:p-10">
            <div className="absolute -right-16 top-0 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />
            <div className="relative">
              <p className="text-xs font-black tracking-[.18em] text-violet-300">
                YOUR APPLICATIONS
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-[-.04em] sm:text-4xl">
                Know where you stand.
              </h2>
              <p className="mt-3 max-w-md leading-7 text-slate-300">
                The tracker moves with you, so nothing gets lost in tabs, notes or memory.
              </p>

              <div className="mt-8 grid grid-cols-4 gap-2">
                {stages.map((item, i) => (
                  <div
                    key={item}
                    className={`rounded-2xl p-3 text-center transition ${stage === i ? "bg-white text-slate-950 shadow-xl" : "bg-white/8 text-white"}`}
                  >
                    <p className="text-lg font-black">{[12, 8, 3, 1][i]}</p>
                    <p
                      className={`mt-1 text-[9px] font-black ${stage === i ? "text-slate-400" : "text-white/45"}`}
                    >
                      {item.toUpperCase()}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-[24px] bg-white/8 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-black">Data Analyst</p>
                    <p className="mt-1 text-xs text-slate-400">Aster Analytics</p>
                  </div>
                  <span className="stage-chip rounded-full bg-violet-500/25 px-3 py-1.5 text-xs font-black text-violet-200">
                    {stages[stage]}
                  </span>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  {stages.map((item, i) => (
                    <div
                      key={item}
                      className={`h-2 flex-1 rounded-full ${i <= stage ? "bg-violet-400" : "bg-white/10"}`}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-5 rounded-[24px] bg-emerald-400/10 p-4">
                <p className="text-[10px] font-black tracking-[.14em] text-emerald-300">
                  WHAT TO DO NEXT
                </p>
                <p className="mt-2 text-lg font-black">
                  {stage < 2 ? "Keep the application moving" : "Prepare for the next conversation"}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Simple guidance based on where the opportunity is now.
                </p>
              </div>
            </div>
          </article>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-3">
          {[
            [
              "Resume check",
              "See what to move up, what to keep, and what not to invent.",
              "/resume",
              "bg-sky-50 border-sky-100 text-sky-700",
            ],
            [
              "Career next step",
              "Spot repeated skill gaps across the roles you actually want.",
              "/career-assistant",
              "bg-violet-50 border-violet-100 text-violet-700",
            ],
            [
              "Application tracker",
              "Move every role from saved to applied to interview to offer.",
              "/applications",
              "bg-emerald-50 border-emerald-100 text-emerald-700",
            ],
          ].map(([title, text, href, tone], i) => (
            <Link
              key={title}
              href={href}
              className={`mini-motion-card group rounded-[28px] border p-6 transition hover:-translate-y-1 hover:shadow-xl ${tone}`}
              style={{ animationDelay: `-${i * 1.4}s` }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black tracking-[.14em]">0{i + 1}</span>
                <span className="text-xl transition group-hover:translate-x-1">→</span>
              </div>
              <h3 className="mt-8 text-2xl font-black text-slate-950">{title}</h3>
              <p className="mt-3 leading-7 text-slate-600">{text}</p>
            </Link>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes cardBreath {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }
        @keyframes pulseScore {
          0%,
          100% {
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(16, 185, 129, 0.09);
          }
        }
        @keyframes liveBlink {
          0%,
          100% {
            opacity: 0.55;
          }
          50% {
            opacity: 1;
          }
        }
        @keyframes stepGlow {
          0%,
          100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(3px);
          }
        }
        .job-live-card {
          animation: cardBreath 6s ease-in-out infinite;
        }
        .score-pulse {
          animation: pulseScore 3s ease-in-out infinite;
        }
        .live-dot {
          animation: liveBlink 1.8s ease-in-out infinite;
        }
        .next-step {
          animation: stepGlow 4s ease-in-out infinite;
        }
        .mini-motion-card {
          animation: cardBreath 7s ease-in-out infinite;
        }
        .match-line {
          transition: width 0.7s ease;
        }
        @media (prefers-reduced-motion: reduce) {
          .job-live-card,
          .score-pulse,
          .live-dot,
          .next-step,
          .mini-motion-card {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
}
