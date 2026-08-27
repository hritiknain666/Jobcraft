"use client";

import { useEffect, useState } from "react";

type Variant =
  | "dashboard"
  | "jobs"
  | "resume"
  | "applications"
  | "assistant"
  | "profile"
  | "certificates"
  | "coverLetter";
type PremiumPageVisualProps = { variant: Variant; compact?: boolean };

const variants: Record<
  Variant,
  { label: string; accent: string; title: string; subtitle: string }
> = {
  dashboard: {
    label: "WORKSPACE",
    accent: "bg-violet-500",
    title: "Your next best move",
    subtitle: "Jobs, resumes and applications stay connected.",
  },
  jobs: {
    label: "JOB MATCH",
    accent: "bg-emerald-500",
    title: "See the fit before you apply",
    subtitle: "Skills, salary, work mode and gaps in one view.",
  },
  resume: {
    label: "RESUME STUDIO",
    accent: "bg-sky-500",
    title: "Build the right version",
    subtitle: "Keep the facts, change the emphasis.",
  },
  applications: {
    label: "APPLICATION FLOW",
    accent: "bg-violet-500",
    title: "Know exactly where things stand",
    subtitle: "Move every role from saved to outcome.",
  },
  assistant: {
    label: "CAREER GUIDE",
    accent: "bg-amber-400",
    title: "Know what to improve next",
    subtitle: "Turn real activity into clear priorities.",
  },
  profile: {
    label: "CAREER PROFILE",
    accent: "bg-violet-500",
    title: "Give matching better context",
    subtitle: "Skills, roles and preferences sharpen every recommendation.",
  },
  certificates: {
    label: "CREDENTIAL LIBRARY",
    accent: "bg-emerald-500",
    title: "Keep proof ready, privately",
    subtitle: "Save real credentials once and reuse them where relevant.",
  },
  coverLetter: {
    label: "COVER LETTER",
    accent: "bg-sky-500",
    title: "Write for the role, not from scratch",
    subtitle: "Ground every draft in the job and facts you supplied.",
  },
};

export default function PremiumPageVisual({ variant, compact = false }: PremiumPageVisualProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setStep((value) => (value + 1) % 4), 2600);
    return () => window.clearInterval(timer);
  }, []);

  const meta = variants[variant];

  return (
    <div
      className={`relative overflow-hidden rounded-[30px] border border-white/10 bg-[#0a1024] text-white shadow-[0_30px_90px_rgba(15,23,42,.22)] ${compact ? "p-5" : "p-6 sm:p-7"}`}
    >
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-500/25 blur-3xl" />
      <div className="absolute -bottom-24 left-12 h-56 w-56 rounded-full bg-sky-400/10 blur-3xl" />
      <div className="relative">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[10px] font-black tracking-[.18em] text-violet-200">
            <span className={`h-2 w-2 rounded-full ${meta.accent} pulse-dot`} />
            {meta.label}
          </div>
          <div className="rounded-full border border-white/10 bg-white/[.07] px-3 py-1 text-[10px] font-black text-white/60">
            LIVE PREVIEW
          </div>
        </div>
        <div className="mt-5">
          <h3
            className={`${compact ? "text-2xl" : "text-3xl sm:text-[2rem]"} font-black tracking-[-.04em]`}
          >
            {meta.title}
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-300">{meta.subtitle}</p>
        </div>
        <div className="mt-6">
          {variant === "jobs" && <JobsScene step={step} />}
          {variant === "resume" && <ResumeScene step={step} />}
          {variant === "applications" && <ApplicationsScene step={step} />}
          {variant === "assistant" && <AssistantScene step={step} />}
          {variant === "dashboard" && <DashboardScene step={step} />}
          {variant === "profile" && <ProfileScene step={step} />}
          {variant === "certificates" && <CertificatesScene step={step} />}
          {variant === "coverLetter" && <CoverLetterScene step={step} />}
        </div>
      </div>
      <style jsx>{`
        @keyframes pulseDot {
          0%,
          100% {
            opacity: 0.5;
            transform: scale(0.9);
          }
          50% {
            opacity: 1;
            transform: scale(1.15);
          }
        }
        @keyframes floatPanel {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }
        .pulse-dot {
          animation: pulseDot 1.8s ease-in-out infinite;
        }
        .float-panel {
          animation: floatPanel 5s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .pulse-dot,
          .float-panel {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}

function JobsScene({ step }: { step: number }) {
  const roles = [
    ["Data Analyst", "87%", "SQL · Power BI · Excel"],
    ["Business Analyst", "81%", "SQL · Jira · Agile"],
    ["Power BI Developer", "76%", "Power BI · DAX · SQL"],
    ["Graduate Analyst", "72%", "Excel · SQL · Communication"],
  ];
  const current = roles[step];
  return (
    <div className="grid gap-3 sm:grid-cols-[1fr_128px]">
      <div className="float-panel rounded-[22px] border border-white/10 bg-white/[.07] p-4 backdrop-blur">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-black text-violet-200">SAMPLE ROLE</p>
            <p className="mt-1 text-lg font-black">{current[0]}</p>
            <p className="mt-1 text-xs text-white/45">Bengaluru · Hybrid · ₹5.5–8.5 LPA</p>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-full border-[6px] border-emerald-400/25 bg-emerald-400/10 text-sm font-black text-emerald-300">
            {current[1]}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {current[2].split(" · ").map((skill) => (
            <span
              key={skill}
              className="rounded-lg bg-emerald-400/10 px-2.5 py-1.5 text-[10px] font-black text-emerald-200"
            >
              {skill} ✓
            </span>
          ))}
          <span className="rounded-lg bg-amber-400/10 px-2.5 py-1.5 text-[10px] font-black text-amber-200">
            1 gap
          </span>
        </div>
      </div>
      <div className="grid grid-rows-3 gap-2">
        {["Match", "Resume", "Save"].map((item, i) => (
          <div
            key={item}
            className={`rounded-xl border p-3 text-xs font-black transition ${i === step % 3 ? "border-violet-400/30 bg-violet-400/15 text-white" : "border-white/10 bg-white/[.05] text-white/45"}`}
          >
            {i + 1}. {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function ResumeScene({ step }: { step: number }) {
  const sections = ["Summary", "Skills", "Experience", "Certificates"];
  return (
    <div className="grid gap-3 sm:grid-cols-[.8fr_1.2fr]">
      <div className="rounded-[20px] border border-white/10 bg-white/[.06] p-4">
        <p className="text-[10px] font-black text-sky-200">ROLE</p>
        <p className="mt-2 font-black">Data Analyst</p>
        <div className="mt-4 space-y-2">
          {["SQL", "Power BI", "Excel"].map((x) => (
            <div
              key={x}
              className="rounded-lg bg-emerald-400/10 px-3 py-2 text-xs font-black text-emerald-200"
            >
              {x} ✓
            </div>
          ))}
          <div className="rounded-lg bg-amber-400/10 px-3 py-2 text-xs font-black text-amber-200">
            Tableau gap
          </div>
        </div>
      </div>
      <div className="float-panel rounded-[20px] bg-white p-4 text-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[9px] font-black tracking-[.13em] text-violet-600">RESUME PREVIEW</p>
            <p className="mt-1 font-black">Data Analyst Resume</p>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-black">ATS</span>
        </div>
        <div className="mt-4 space-y-2">
          {sections.map((x, i) => (
            <div
              key={x}
              className={`rounded-xl px-3 py-2 text-xs font-bold transition ${i === step ? "bg-violet-50 text-violet-700 ring-1 ring-violet-100" : "bg-slate-50 text-slate-500"}`}
            >
              {x}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ApplicationsScene({ step }: { step: number }) {
  const stages = ["Saved", "Applied", "Interview", "Offer"];
  return (
    <div>
      <div className="grid grid-cols-4 gap-2">
        {stages.map((x, i) => (
          <div
            key={x}
            className={`rounded-xl p-3 text-center transition ${i === step ? "bg-white text-slate-950 shadow-lg" : "border border-white/10 bg-white/[.06] text-white"}`}
          >
            <p className="text-lg font-black">{[12, 8, 3, 1][i]}</p>
            <p
              className={`mt-1 text-[8px] font-black ${i === step ? "text-slate-400" : "text-white/35"}`}
            >
              {x.toUpperCase()}
            </p>
          </div>
        ))}
      </div>
      <div className="float-panel mt-3 rounded-[20px] border border-white/10 bg-white/[.07] p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-black">Data Analyst</p>
            <p className="mt-1 text-xs text-white/40">Aster Analytics</p>
          </div>
          <span className="rounded-full bg-violet-400/15 px-3 py-1 text-xs font-black text-violet-200">
            {stages[step]}
          </span>
        </div>
        <div className="mt-4 flex gap-2">
          {stages.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-violet-400" : "bg-white/10"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function AssistantScene({ step }: { step: number }) {
  const prompts = [
    "What skill should I improve?",
    "Which role should I review first?",
    "Why am I not getting interviews?",
    "What should I do next?",
  ];
  const answers = [
    "Tableau appears across several strong-match roles.",
    "Your strongest current fit is Data Analyst at 87%.",
    "Focus on stronger-fit roles and clearer resume evidence.",
    "Review the two highest-match roles before applying again.",
  ];
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/[.06] p-4">
      <div className="rounded-2xl bg-white p-4 text-slate-900">
        <p className="text-[10px] font-black text-violet-600">YOU</p>
        <p className="mt-1 text-sm font-black">{prompts[step]}</p>
      </div>
      <div className="float-panel mt-3 rounded-2xl bg-violet-400/10 p-4">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500 text-[10px] font-black">
            JC
          </span>
          <p className="text-[10px] font-black text-violet-200">JOBCRAFT</p>
        </div>
        <p className="mt-3 text-sm leading-6 text-white/80">{answers[step]}</p>
      </div>
    </div>
  );
}

function DashboardScene({ step }: { step: number }) {
  const items = ["Review 87% match", "Update resume", "Move application", "Check next skill gap"];
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-[20px] border border-white/10 bg-white/[.06] p-4">
        <p className="text-[10px] font-black text-violet-200">TODAY</p>
        <p className="mt-2 text-xl font-black">{items[step]}</p>
        <p className="mt-2 text-xs leading-5 text-white/45">
          One clear action based on your current workspace.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[
          ["Matches", "6"],
          ["Applied", "8"],
          ["Interview", "3"],
          ["Offer", "1"],
        ].map(([a, b]) => (
          <div key={a} className="rounded-xl bg-white/[.07] p-3 text-center">
            <p className="text-xl font-black">{b}</p>
            <p className="mt-1 text-[8px] font-black text-white/35">{a.toUpperCase()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfileScene({ step }: { step: number }) {
  const fields = [
    ["Skills", "SQL · Power BI · Excel"],
    ["Target roles", "Data Analyst · Business Analyst"],
    ["Work mode", "Hybrid · Remote"],
    ["Location", "Bengaluru"],
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-[120px_1fr]">
      <div className="flex items-center justify-center rounded-[22px] border border-white/10 bg-white/[.06] p-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border-[8px] border-violet-400/25 bg-violet-400/10 text-lg font-black">
          {[58, 72, 86, 100][step]}%
        </div>
      </div>
      <div className="rounded-[22px] border border-white/10 bg-white/[.06] p-3">
        {fields.map(([a, b], i) => (
          <div
            key={a}
            className={`rounded-xl px-3 py-2.5 transition ${i === step ? "bg-white text-slate-950" : "text-white/55"}`}
          >
            <p className="text-[9px] font-black tracking-[.12em]">{a.toUpperCase()}</p>
            <p className="mt-1 text-xs font-black">{b}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CertificatesScene({ step }: { step: number }) {
  const items = ["Certificate name", "Issuer + date", "Credential ID", "Private proof"];
  return (
    <div className="float-panel rounded-[22px] bg-white p-4 text-slate-900">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[9px] font-black tracking-[.13em] text-emerald-600">CREDENTIAL</p>
          <p className="mt-1 font-black">Data Analytics Certificate</p>
          <p className="mt-1 text-xs text-slate-400">Professional credential</p>
        </div>
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-black text-emerald-700">
          PRIVATE PROOF
        </span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {items.map((item, i) => (
          <div
            key={item}
            className={`rounded-xl p-3 text-xs font-black transition ${i === step ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100" : "bg-slate-50 text-slate-500"}`}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function CoverLetterScene({ step }: { step: number }) {
  const focus = ["Target role", "Relevant skills", "Why this company", "Concise closing"];
  return (
    <div className="grid gap-3 sm:grid-cols-[.7fr_1.3fr]">
      <div className="rounded-[20px] border border-white/10 bg-white/[.06] p-4">
        <p className="text-[10px] font-black text-sky-200">DRAFT CHECK</p>
        <div className="mt-3 space-y-2">
          {focus.map((x, i) => (
            <div
              key={x}
              className={`rounded-lg px-3 py-2 text-xs font-black transition ${i === step ? "bg-sky-400/15 text-sky-100" : "bg-white/[.05] text-white/40"}`}
            >
              {i < step ? "✓ " : ""}
              {x}
            </div>
          ))}
        </div>
      </div>
      <div className="float-panel rounded-[20px] bg-white p-4 text-slate-900">
        <p className="text-[9px] font-black tracking-[.13em] text-violet-600">
          ROLE-SPECIFIC DRAFT
        </p>
        <p className="mt-3 text-xs leading-5 text-slate-500">Dear Hiring Manager,</p>
        <p className={`mt-2 rounded-lg p-2 text-xs leading-5 ${step === 0 ? "bg-sky-50" : ""}`}>
          I am applying for the <b>Data Analyst</b> role.
        </p>
        <p className={`mt-1 rounded-lg p-2 text-xs leading-5 ${step === 1 ? "bg-sky-50" : ""}`}>
          My experience with <b>SQL, Power BI and Excel</b> aligns with the listed requirements.
        </p>
        <p className="mt-2 text-[10px] font-black text-emerald-600">
          Grounded in saved profile data
        </p>
      </div>
    </div>
  );
}
