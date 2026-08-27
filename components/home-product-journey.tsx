"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const jobs = [
  {
    title: "Data Analyst",
    company: "Aster Analytics",
    city: "Bengaluru",
    mode: "Hybrid",
    salary: "₹5.5–8.5 LPA",
    score: 87,
    skills: ["SQL", "Power BI", "Excel"],
    gap: "Tableau",
  },
  {
    title: "Business Analyst",
    company: "Nova Systems",
    city: "Gurugram",
    mode: "Hybrid",
    salary: "₹6–10 LPA",
    score: 81,
    skills: ["SQL", "Agile", "Jira"],
    gap: "BPMN",
  },
  {
    title: "Power BI Developer",
    company: "InsightWorks",
    city: "Hyderabad",
    mode: "Remote",
    salary: "₹7–12 LPA",
    score: 76,
    skills: ["Power BI", "DAX", "SQL"],
    gap: "Fabric",
  },
];

const stages = ["Saved", "Applied", "Interview", "Offer"];

export default function HomeProductJourney() {
  const [jobIndex, setJobIndex] = useState(0);
  const [stage, setStage] = useState(0);
  const [assistantStep, setAssistantStep] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setJobIndex((v) => (v + 1) % jobs.length), 3200);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setStage((v) => (v + 1) % stages.length), 2200);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setAssistantStep((v) => (v + 1) % 3), 2600);
    return () => window.clearInterval(id);
  }, []);

  const job = jobs[jobIndex];

  return (
    <section className="bg-white py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-black tracking-[.18em] text-violet-600">
            SEE JOBCRAFT IN ACTION
          </p>
          <h2 className="mt-3 text-4xl font-black tracking-[-.055em] sm:text-6xl">
            Search. Match. Prepare. Track.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-slate-500">
            Less explanation. More of the product doing the work.
          </p>
        </div>

        <article className="mt-12 grid gap-8 rounded-[36px] border border-violet-100 bg-[linear-gradient(135deg,#faf7ff_0%,#ffffff_48%,#eef8ff_100%)] p-5 shadow-[0_28px_90px_rgba(79,70,229,.10)] sm:p-8 lg:grid-cols-[.36fr_.64fr] lg:items-center lg:p-10">
          <div>
            <span className="inline-flex rounded-full bg-violet-600 px-3 py-1.5 text-xs font-black text-white">
              01 · FIND JOBS
            </span>
            <h3 className="mt-5 text-4xl font-black tracking-[-.045em]">Find jobs that fit you.</h3>
            <p className="mt-4 max-w-md text-lg leading-8 text-slate-600">
              Search by role, city, salary, experience and work mode.
            </p>
            <Link
              href="/jobs"
              className="mt-6 inline-flex rounded-xl bg-[#0b1020] px-5 py-3 font-black text-white"
            >
              Explore jobs →
            </Link>
          </div>

          <div className="relative min-h-[430px] overflow-hidden rounded-[30px] border border-white bg-white p-4 shadow-[0_25px_70px_rgba(15,23,42,.12)] sm:p-5">
            <div className="grid gap-3 md:grid-cols-[1fr_170px_auto]">
              <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-500">
                Data Analyst, SQL, Power BI...
              </div>
              <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-500">
                Bengaluru
              </div>
              <div className="rounded-xl bg-violet-600 px-5 py-3 text-center text-sm font-black text-white">
                Search
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {jobs.slice(0, 2).map((item, i) => (
                <div
                  key={item.title}
                  className={`job-result rounded-2xl border p-4 transition ${i === jobIndex % 2 ? "border-violet-300 bg-violet-50/60 shadow-lg" : "border-slate-200 bg-white"}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[9px] font-black text-amber-700">
                        SAMPLE ROLE
                      </span>
                      <h4 className="mt-3 text-lg font-black">{item.title}</h4>
                      <p className="mt-1 text-sm text-slate-500">
                        {item.city} · {item.mode}
                      </p>
                    </div>
                    <span className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-black text-emerald-700">
                      {item.score}%
                    </span>
                  </div>
                  <p className="mt-3 text-sm font-bold text-slate-600">{item.salary}</p>
                </div>
              ))}
            </div>
            <div className="search-scan absolute bottom-0 left-0 h-1 w-1/3 rounded-full bg-violet-500" />
          </div>
        </article>

        <article className="mt-8 grid gap-8 rounded-[36px] border border-emerald-100 bg-[linear-gradient(135deg,#f2fff8_0%,#ffffff_52%,#f4f1ff_100%)] p-5 sm:p-8 lg:grid-cols-[.62fr_.38fr] lg:items-center lg:p-10">
          <div className="order-2 lg:order-1">
            <div className="relative rounded-[30px] bg-white p-5 shadow-[0_25px_70px_rgba(15,23,42,.12)] sm:p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-black tracking-[.14em] text-violet-600">
                    {job.title.toUpperCase()}
                  </p>
                  <h4 className="mt-2 text-3xl font-black">Why this job fits</h4>
                  <p className="mt-2 text-sm text-slate-500">
                    {job.company} · {job.city} · {job.mode}
                  </p>
                </div>
                <div className="score-ring flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-[10px] border-emerald-100 bg-emerald-50 text-2xl font-black text-emerald-600">
                  {job.score}%
                </div>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-emerald-50 p-4">
                  <p className="text-xs font-black text-emerald-700">MATCHED</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {job.skills.map((skill) => (
                      <span
                        key={skill}
                        className="skill-pop rounded-lg bg-white px-3 py-2 text-xs font-black text-emerald-700"
                      >
                        {skill} ✓
                      </span>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl bg-amber-50 p-4">
                  <p className="text-xs font-black text-amber-700">MISSING</p>
                  <p className="mt-3 text-lg font-black text-amber-900">{job.gap}</p>
                  <p className="mt-1 text-xs text-amber-700">Only add it when it is true.</p>
                </div>
              </div>
              <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                <div className="flex justify-between text-sm font-black">
                  <span>Overall fit</span>
                  <span>{job.score}%</span>
                </div>
                <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="match-progress h-full rounded-full bg-emerald-500"
                    style={{ width: `${job.score}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <span className="inline-flex rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-black text-white">
              02 · SEE YOUR MATCH
            </span>
            <h3 className="mt-5 text-4xl font-black tracking-[-.045em]">Know why you match.</h3>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              Matched skills, missing skills and fit are shown clearly before you apply.
            </p>
          </div>
        </article>

        <article className="mt-8 grid gap-8 rounded-[36px] border border-sky-100 bg-[linear-gradient(135deg,#f0fbff_0%,#ffffff_50%,#f8f4ff_100%)] p-5 sm:p-8 lg:grid-cols-[.38fr_.62fr] lg:items-center lg:p-10">
          <div>
            <span className="inline-flex rounded-full bg-sky-600 px-3 py-1.5 text-xs font-black text-white">
              03 · PREPARE RESUME
            </span>
            <h3 className="mt-5 text-4xl font-black tracking-[-.045em]">Use the right resume.</h3>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              Keep the facts. Change the focus.
            </p>
            <Link
              href="/resume"
              className="mt-6 inline-flex rounded-xl bg-sky-600 px-5 py-3 font-black text-white"
            >
              Open resume tools →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="resume-sheet rounded-[28px] bg-white p-5 shadow-[0_22px_60px_rgba(15,23,42,.10)]">
              <p className="text-[10px] font-black tracking-[.14em] text-slate-400">
                SOURCE RESUME
              </p>
              <h4 className="mt-3 text-2xl font-black">Data Analyst</h4>
              <div className="mt-5 space-y-3">
                {["Summary", "SQL & Power BI", "Dashboard project", "Certificate"].map((x) => (
                  <div
                    key={x}
                    className="rounded-xl bg-slate-50 px-3 py-3 text-sm font-bold text-slate-600"
                  >
                    {x}
                  </div>
                ))}
              </div>
            </div>
            <div className="resume-sheet resume-sheet-alt rounded-[28px] bg-[#0b1020] p-5 text-white shadow-[0_22px_60px_rgba(15,23,42,.18)]">
              <p className="text-[10px] font-black tracking-[.14em] text-violet-300">
                ROLE VERSION
              </p>
              <h4 className="mt-3 text-2xl font-black">Business Analyst</h4>
              <div className="mt-5 space-y-3">
                {[
                  "Requirements first",
                  "SQL evidence higher",
                  "Agile project visible",
                  "Same real experience",
                ].map((x, i) => (
                  <div
                    key={x}
                    className={`rounded-xl px-3 py-3 text-sm font-bold ${i === 3 ? "bg-emerald-400/10 text-emerald-300" : "bg-white/10 text-white"}`}
                  >
                    {i === 3 ? "✓ " : "↕ "}
                    {x}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </article>

        <article className="mt-8 grid gap-8 rounded-[36px] border border-violet-100 bg-[linear-gradient(135deg,#fbf7ff_0%,#ffffff_52%,#f4fbff_100%)] p-5 sm:p-8 lg:grid-cols-[.62fr_.38fr] lg:items-center lg:p-10">
          <div className="order-2 lg:order-1 rounded-[30px] bg-[#0b1020] p-5 text-white shadow-[0_25px_70px_rgba(15,23,42,.18)] sm:p-6">
            <div className="grid grid-cols-4 gap-2">
              {stages.map((item, i) => (
                <div
                  key={item}
                  className={`rounded-xl p-3 text-center transition ${stage === i ? "bg-white text-slate-950 shadow-xl" : "bg-white/8"}`}
                >
                  <p className="text-xl font-black">{[12, 8, 3, 1][i]}</p>
                  <p
                    className={`mt-1 text-[9px] font-black ${stage === i ? "text-slate-400" : "text-white/45"}`}
                  >
                    {item.toUpperCase()}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-2xl bg-white/8 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-black">Data Analyst</p>
                  <p className="mt-1 text-xs text-slate-400">Aster Analytics</p>
                </div>
                <span className="rounded-full bg-violet-500/20 px-3 py-1.5 text-xs font-black text-violet-200">
                  {stages[stage]}
                </span>
              </div>
              <div className="mt-4 flex gap-2">
                {stages.map((x, i) => (
                  <span
                    key={x}
                    className={`h-2 flex-1 rounded-full ${i <= stage ? "bg-violet-400" : "bg-white/10"}`}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <span className="inline-flex rounded-full bg-violet-600 px-3 py-1.5 text-xs font-black text-white">
              04 · TRACK IT
            </span>
            <h3 className="mt-5 text-4xl font-black tracking-[-.045em]">Know where you stand.</h3>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              Saved. Applied. Interview. Offer.
            </p>
          </div>
        </article>

        <article className="mt-8 grid gap-8 rounded-[36px] border border-amber-100 bg-[linear-gradient(135deg,#fffaf0_0%,#ffffff_50%,#f7f4ff_100%)] p-5 sm:p-8 lg:grid-cols-[.38fr_.62fr] lg:items-center lg:p-10">
          <div>
            <span className="inline-flex rounded-full bg-amber-500 px-3 py-1.5 text-xs font-black text-white">
              05 · NEXT STEP
            </span>
            <h3 className="mt-5 text-4xl font-black tracking-[-.045em]">Know what to do next.</h3>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              Simple guidance from your profile and job search.
            </p>
            <Link
              href="/career-assistant"
              className="mt-6 inline-flex rounded-xl bg-[#0b1020] px-5 py-3 font-black text-white"
            >
              See career guidance →
            </Link>
          </div>
          <div className="rounded-[30px] bg-white p-5 shadow-[0_25px_70px_rgba(15,23,42,.12)] sm:p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 font-black text-white">
                JC
              </span>
              <div>
                <p className="font-black">Career Assistant</p>
                <p className="text-xs text-slate-400">Based on your saved activity</p>
              </div>
            </div>
            <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-600">
              What should I focus on next?
            </div>
            <div className="assistant-reply mt-4 rounded-2xl bg-violet-50 p-5">
              <p className="text-xs font-black text-violet-600">YOUR NEXT MOVE</p>
              <p className="mt-2 text-xl font-black">
                {
                  [
                    "Apply to your strongest matches first.",
                    "Close repeated skill gaps.",
                    "Use a role-focused resume version.",
                  ][assistantStep]
                }
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Keep the advice tied to real profile and application data.
              </p>
            </div>
          </div>
        </article>

        <article className="mt-8 grid gap-8 rounded-[36px] border border-slate-200 bg-[linear-gradient(135deg,#f8fafc_0%,#ffffff_48%,#f6f3ff_100%)] p-5 sm:p-8 lg:grid-cols-[.48fr_.52fr] lg:items-center lg:p-10">
          <div className="mx-auto w-full max-w-[310px] rounded-[38px] border-[8px] border-[#0b1020] bg-white p-3 shadow-[0_28px_80px_rgba(15,23,42,.18)]">
            <div className="rounded-[28px] bg-slate-50 p-3">
              <div className="flex items-center justify-between">
                <b className="text-sm">JobCraft</b>
                <span className="text-[10px] text-slate-400">9:41</span>
              </div>
              <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-[10px] font-black text-violet-600">TOP MATCH</p>
                <h4 className="mt-2 text-lg font-black">Data Analyst</h4>
                <p className="mt-1 text-xs text-slate-500">Bengaluru · Hybrid</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-600">87% match</span>
                  <span className="rounded-lg bg-violet-600 px-3 py-2 text-[10px] font-black text-white">
                    View
                  </span>
                </div>
              </div>
              <div className="mt-3 rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-[10px] font-black text-slate-400">APPLICATIONS</p>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  {[
                    ["Saved", "12"],
                    ["Interview", "3"],
                    ["Offer", "1"],
                  ].map(([a, b]) => (
                    <div key={a} className="rounded-xl bg-slate-50 p-2">
                      <b>{b}</b>
                      <p className="text-[8px] text-slate-400">{a}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-3 grid grid-cols-4 text-center text-[9px] font-black text-slate-500">
                <span>Home</span>
                <span>Jobs</span>
                <span>Track</span>
                <span>Resume</span>
              </div>
            </div>
          </div>
          <div>
            <span className="inline-flex rounded-full bg-slate-900 px-3 py-1.5 text-xs font-black text-white">
              06 · MOBILE
            </span>
            <h3 className="mt-5 text-4xl font-black tracking-[-.045em]">
              Built to work on the go.
            </h3>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              Search, review and track from your phone without losing the important details.
            </p>
          </div>
        </article>
      </div>

      <style jsx>{`
        @keyframes scan {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(420%);
          }
        }
        @keyframes ringPulse {
          0%,
          100% {
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
          }
          50% {
            box-shadow: 0 0 0 12px rgba(16, 185, 129, 0.08);
          }
        }
        @keyframes sheetFloat {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-7px);
          }
        }
        @keyframes replyGlow {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }
        .search-scan {
          animation: scan 3.2s linear infinite;
        }
        .score-ring {
          animation: ringPulse 3s ease-in-out infinite;
        }
        .resume-sheet {
          animation: sheetFloat 6s ease-in-out infinite;
        }
        .resume-sheet-alt {
          animation-delay: -3s;
        }
        .assistant-reply {
          animation: replyGlow 4.5s ease-in-out infinite;
        }
        .match-progress {
          transition: width 0.6s ease;
        }
        @media (prefers-reduced-motion: reduce) {
          .search-scan,
          .score-ring,
          .resume-sheet,
          .assistant-reply {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
}
