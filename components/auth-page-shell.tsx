import Link from "next/link";
import type { ReactNode } from "react";

type AuthPageShellProps = {
  mode: "login" | "signup";
  children: ReactNode;
};

export default function AuthPageShell({ mode, children }: AuthPageShellProps) {
  const isLogin = mode === "login";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fff7ff] text-[#090d1f]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(217,70,239,.28),transparent_28%),radial-gradient(circle_at_88%_20%,rgba(99,102,241,.22),transparent_30%),radial-gradient(circle_at_50%_88%,rgba(56,189,248,.18),transparent_34%)]" />
      <div className="pointer-events-none absolute left-[-120px] top-24 h-80 w-80 rounded-full bg-fuchsia-300/30 blur-3xl" />
      <div className="pointer-events-none absolute right-[-80px] top-[-60px] h-96 w-96 rounded-full bg-indigo-300/30 blur-3xl" />

      <div className="relative mx-auto grid min-h-screen max-w-[1380px] items-center gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[1.05fr_.95fr] lg:py-12">
        <section className="hidden lg:block">
          <Link href="/" className="inline-flex items-center gap-3 font-black tracking-tight">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#090d1f] text-sm text-white shadow-xl">JC</span>
            <span className="text-2xl">Job<span className="text-violet-600">Craft</span></span>
          </Link>

          <div className="mt-14 max-w-xl">
            <p className="text-xs font-black tracking-[.18em] text-violet-600">YOUR CAREER WORKSPACE</p>
            <h1 className="mt-4 text-5xl font-black leading-[1.02] tracking-[-.055em] xl:text-6xl">
              One place to turn a job search into a clear plan.
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              Discover roles, understand your fit, prepare stronger applications and keep every opportunity moving.
            </p>
          </div>

          <div className="mt-10 grid max-w-2xl gap-4 sm:grid-cols-2">
            {[
              ["87%", "Illustrative role match", "See why a role fits before applying."],
              ["ATS", "Resume workspace", "Keep truthful, role-specific versions ready."],
              ["→", "Application pipeline", "Track Saved, Applied, Interview and Offer."],
              ["01", "Next-step guidance", "Know what deserves your attention next."],
            ].map(([value, title, text]) => (
              <div key={title} className="rounded-[24px] border border-white/70 bg-white/70 p-5 shadow-[0_18px_50px_rgba(76,29,149,.08)] backdrop-blur-xl">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-600 text-sm font-black text-white">{value}</div>
                <p className="mt-5 font-black">{title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-[560px]">
          <div className="rounded-[34px] border border-white/80 bg-white/88 p-6 shadow-[0_35px_100px_rgba(76,29,149,.16)] backdrop-blur-2xl sm:p-9">
            <div className="flex items-center justify-between gap-4">
              <Link href="/" className="flex items-center gap-3 font-black lg:hidden">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#090d1f] text-xs text-white">JC</span>
                <span className="text-xl">Job<span className="text-violet-600">Craft</span></span>
              </Link>
              <span className="ml-auto rounded-full bg-violet-50 px-3 py-1.5 text-[11px] font-black tracking-[.1em] text-violet-700">
                {isLogin ? "WELCOME BACK" : "FREE TO START"}
              </span>
            </div>

            <div className="mt-7">
              <p className="text-xs font-black tracking-[.16em] text-violet-600">{isLogin ? "CONTINUE YOUR SEARCH" : "CREATE YOUR WORKSPACE"}</p>
              <h2 className="mt-3 text-4xl font-black tracking-[-.045em] sm:text-[2.75rem]">
                {isLogin ? "Pick up where you left off." : "Build your JobCraft account."}
              </h2>
              <p className="mt-3 leading-7 text-slate-500">
                {isLogin
                  ? "Your jobs, resumes, certificates and applications stay connected in one focused workspace."
                  : "Start with your real profile and build a more organised, transparent job search around it."}
              </p>
            </div>

            {children}

            <div className="mt-7 grid grid-cols-3 gap-2 border-t border-slate-100 pt-6 text-center">
              {[["India-first", "₹ / LPA"], ["Transparent", "Match signals"], ["Grounded", "No fake claims"]].map(([label, note]) => (
                <div key={label} className="rounded-2xl bg-slate-50 px-3 py-3">
                  <p className="text-xs font-black">{label}</p>
                  <p className="mt-1 text-[10px] text-slate-400">{note}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
