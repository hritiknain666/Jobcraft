"use client";

import { useState } from "react";
import Link from "next/link";

type Step = "discover" | "match" | "tailor" | "track";

const steps: { key: Step; number: string; label: string; title: string; text: string }[] = [
  {
    key: "discover",
    number: "01",
    label: "Discover",
    title: "Search by what actually matters",
    text: "Filter roles by city, salary, experience, skills and work mode instead of scrolling through noise.",
  },
  {
    key: "match",
    number: "02",
    label: "Match",
    title: "Understand your fit before applying",
    text: "JobCraft compares your saved profile with the role and shows matched skills, gaps and fit signals.",
  },
  {
    key: "tailor",
    number: "03",
    label: "Tailor",
    title: "Prepare the right resume version",
    text: "Bring the most relevant truthful skills, experience, projects and certificates forward for the role.",
  },
  {
    key: "track",
    number: "04",
    label: "Track",
    title: "Keep every application moving",
    text: "Save roles and move them through applied, screening, interview, offer or rejected without losing context.",
  },
];

export default function ProductShowcase() {
  const [active, setActive] = useState<Step>("match");
  const current = steps.find((step) => step.key === active)!;

  return (
    <section className="relative overflow-hidden bg-[#090d1f] py-20 text-white lg:py-24">
      <div className="absolute left-[-10rem] top-12 h-80 w-80 rounded-full bg-violet-600/20 blur-3xl" />
      <div className="absolute right-[-8rem] bottom-0 h-80 w-80 rounded-full bg-sky-500/10 blur-3xl" />
      <div className="relative mx-auto max-w-[1380px] px-5 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-[.72fr_1.28fr] lg:items-end">
          <div>
            <p className="text-xs font-black tracking-[.18em] text-violet-300">SEE THE WORKFLOW</p>
            <h2 className="mt-4 max-w-xl text-4xl font-black tracking-[-.045em] sm:text-5xl">
              One job search. One connected workspace.
            </h2>
          </div>
          <p className="max-w-2xl text-lg leading-8 text-slate-300">
            JobCraft is designed around the decision a job seeker makes next — not around a pile of
            disconnected tools. Explore the four stages below.
          </p>
        </div>

        <div className="mt-10 grid gap-3 md:grid-cols-4">
          {steps.map((step) => {
            const selected = active === step.key;
            return (
              <button
                key={step.key}
                onClick={() => setActive(step.key)}
                className={`rounded-2xl border p-4 text-left transition ${selected ? "border-violet-400/60 bg-white text-slate-950 shadow-[0_18px_50px_rgba(124,58,237,.18)]" : "border-white/10 bg-white/[.05] text-white hover:bg-white/[.09]"}`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-black tracking-[.15em] ${selected ? "text-violet-600" : "text-violet-300"}`}
                  >
                    {step.number}
                  </span>
                  <span
                    className={`h-2 w-2 rounded-full ${selected ? "bg-violet-600" : "bg-white/20"}`}
                  />
                </div>
                <p className="mt-3 font-black">{step.label}</p>
              </button>
            );
          })}
        </div>

        <div className="mt-6 overflow-hidden rounded-[30px] border border-white/10 bg-[#11162a] shadow-[0_35px_100px_rgba(0,0,0,.28)]">
          <div className="grid lg:grid-cols-[.42fr_.58fr]">
            <div className="flex flex-col justify-between border-b border-white/10 p-6 sm:p-8 lg:border-b-0 lg:border-r">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-violet-500/10 px-3 py-1.5 text-xs font-black text-violet-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-400" /> PRODUCT PREVIEW
                </div>
                <h3 className="mt-6 text-3xl font-black tracking-[-.03em]">{current.title}</h3>
                <p className="mt-4 leading-7 text-slate-300">{current.text}</p>
              </div>
              <Link
                href={
                  active === "discover"
                    ? "/jobs"
                    : active === "tailor"
                      ? "/resume"
                      : active === "track"
                        ? "/applications"
                        : "/auth/signup"
                }
                className="mt-8 inline-flex w-fit items-center gap-2 rounded-xl bg-white px-5 py-3 font-black text-slate-950 transition hover:-translate-y-0.5"
              >
                Try this flow <span>→</span>
              </Link>
            </div>

            <div className="bg-[#f6f7fb] p-4 text-slate-950 sm:p-6 lg:p-8">
              <div className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_22px_60px_rgba(15,23,42,.12)]">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#090d1f] text-[10px] font-black text-white">
                      JC
                    </span>
                    <div>
                      <p className="text-xs font-black">JobCraft</p>
                      <p className="text-[10px] text-slate-400">Career workspace</p>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-slate-200" />
                    <span className="h-2 w-2 rounded-full bg-slate-200" />
                    <span className="h-2 w-2 rounded-full bg-violet-400" />
                  </div>
                </div>
                {active === "discover" && <DiscoverPreview />}
                {active === "match" && <MatchPreview />}
                {active === "tailor" && <TailorPreview />}
                {active === "track" && <TrackPreview />}
              </div>
              <p className="mt-3 text-center text-[11px] text-slate-400">
                Illustrative JobCraft product preview — not a live employer listing.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            "Private resume storage",
            "Truthful tailoring only",
            "India-first filters",
            "Application tracking",
          ].map((item) => (
            <div
              key={item}
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.04] px-4 py-3 text-sm font-bold text-slate-300"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400/10 text-xs text-emerald-300">
                ✓
              </span>
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DiscoverPreview() {
  return (
    <div className="p-5 sm:p-6">
      <div className="grid gap-2 sm:grid-cols-[1.3fr_1fr_auto]">
        <div className="rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-500">
          Data Analyst, SQL, Power BI...
        </div>
        <div className="rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-500">Bengaluru</div>
        <div className="rounded-xl bg-violet-600 px-4 py-3 text-center text-xs font-black text-white">
          Search
        </div>
      </div>
      <div className="mt-5 space-y-3">
        {[
          ["Data Analyst", "Bengaluru · Hybrid", "₹5.5–8.5 LPA", "SQL · Power BI · Excel"],
          ["Junior Data Analyst", "Mumbai · On-site", "₹4–6.5 LPA", "Excel · SQL · Power BI"],
        ].map(([title, meta, salary, skills]) => (
          <div key={title} className="rounded-2xl border border-slate-200 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="rounded-md bg-amber-50 px-2 py-1 text-[9px] font-black text-amber-700">
                  SAMPLE ROLE
                </span>
                <h4 className="mt-2 font-black">{title}</h4>
                <p className="mt-1 text-xs text-slate-500">
                  {meta} · {salary}
                </p>
                <p className="mt-3 text-[11px] font-semibold text-slate-500">{skills}</p>
              </div>
              <span className="rounded-xl bg-slate-950 px-3 py-2 text-[10px] font-black text-white">
                View role
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MatchPreview() {
  return (
    <div className="p-5 sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black text-violet-600">DATA ANALYST</p>
          <h4 className="mt-1 text-2xl font-black">87% Match · Strong fit</h4>
          <p className="mt-2 text-xs text-slate-500">Based on your saved profile signals</p>
        </div>
        <div className="flex h-20 w-20 items-center justify-center rounded-full border-[8px] border-emerald-100 bg-emerald-50 text-xl font-black text-emerald-600">
          87%
        </div>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-emerald-50 p-4">
          <p className="text-xs font-black text-emerald-700">MATCHED SKILLS</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {["SQL ✓", "Power BI ✓", "Excel ✓"].map((x) => (
              <span
                key={x}
                className="rounded-lg bg-white px-2.5 py-1.5 text-xs font-bold text-emerald-700"
              >
                {x}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-2xl bg-amber-50 p-4">
          <p className="text-xs font-black text-amber-700">IMPROVE FIT</p>
          <p className="mt-3 text-sm font-bold">Tableau</p>
          <p className="mt-1 text-xs leading-5 text-amber-800">
            Only add it when you genuinely have the skill or evidence.
          </p>
        </div>
      </div>
      <div className="mt-4 rounded-2xl bg-slate-50 p-4">
        <div className="flex items-center justify-between text-xs font-bold">
          <span>Overall fit</span>
          <span>87%</span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-slate-200">
          <div className="h-2 w-[87%] rounded-full bg-emerald-500" />
        </div>
      </div>
    </div>
  );
}

function TailorPreview() {
  return (
    <div className="p-5 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 p-4">
          <p className="text-[10px] font-black tracking-[.12em] text-slate-400">SOURCE RESUME</p>
          <h4 className="mt-2 font-black">Data Analyst Resume</h4>
          <div className="mt-4 space-y-2">
            {[
              "SQL & reporting experience",
              "Power BI dashboard project",
              "Excel analysis",
              "Google Data Analytics certificate",
            ].map((x) => (
              <div key={x} className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                {x}
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-violet-200 bg-violet-50/50 p-4">
          <p className="text-[10px] font-black tracking-[.12em] text-violet-600">
            ROLE-FOCUSED VERSION
          </p>
          <h4 className="mt-2 font-black">Data Analyst · Bengaluru</h4>
          <div className="mt-4 space-y-2">
            {[
              "Move SQL + Power BI higher",
              "Bring dashboard project forward",
              "Keep certificate visible",
              "Do not invent Tableau",
            ].map((x, i) => (
              <div
                key={x}
                className={`rounded-lg px-3 py-2 text-xs font-semibold ${i === 3 ? "bg-amber-50 text-amber-700" : "bg-white text-slate-700"}`}
              >
                {i === 3 ? "!" : "✓"} {x}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-3 rounded-xl bg-slate-950 px-4 py-3 text-xs font-bold text-white">
        <span className="text-emerald-400">✓</span> Truthful tailoring: relevance changes, facts do
        not.
      </div>
    </div>
  );
}

function TrackPreview() {
  return (
    <div className="p-5 sm:p-6">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          ["Saved", "12"],
          ["Applied", "8"],
          ["Interview", "3"],
          ["Offer", "1"],
        ].map(([label, count]) => (
          <div key={label} className="rounded-xl bg-slate-50 p-3">
            <p className="text-[10px] font-black text-slate-400">{label.toUpperCase()}</p>
            <p className="mt-1 text-2xl font-black">{count}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 space-y-3">
        {[
          ["Data Analyst", "Aster Analytics", "Interview"],
          ["Business Analyst", "Nova Systems India", "Applied"],
          ["Graduate Analyst", "Vertex Consulting", "Saved"],
        ].map(([role, company, status], i) => (
          <div
            key={role}
            className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-xs font-black text-violet-700">
                {i + 1}
              </span>
              <div>
                <h4 className="text-sm font-black">{role}</h4>
                <p className="text-[11px] text-slate-500">{company}</p>
              </div>
            </div>
            <span
              className={`rounded-full px-3 py-1.5 text-[10px] font-black ${status === "Interview" ? "bg-emerald-50 text-emerald-700" : status === "Applied" ? "bg-violet-50 text-violet-700" : "bg-slate-100 text-slate-600"}`}
            >
              {status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
