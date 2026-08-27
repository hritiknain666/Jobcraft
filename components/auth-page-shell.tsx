import Link from "next/link";
import type { ReactNode } from "react";

type AuthPageShellProps = {
  mode: "login" | "signup";
  children: ReactNode;
};

export default function AuthPageShell({ mode, children }: AuthPageShellProps) {
  const isLogin = mode === "login";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f5f2ea] text-[#173f33]">
      <div className="pointer-events-none absolute left-[-140px] top-[-80px] h-96 w-96 rounded-full bg-[#f49a48]/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-160px] right-[-100px] h-[460px] w-[460px] rounded-full bg-[#278363]/10 blur-3xl" />

      <div className="relative mx-auto grid min-h-screen max-w-[1380px] items-center gap-10 px-5 py-8 sm:px-8 lg:grid-cols-[1.05fr_.95fr] lg:py-12">
        <section className="hidden lg:block">
          <Link href="/" className="inline-flex items-center gap-3 text-[#173f33] no-underline">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f49a48] text-xl">
              ✣
            </span>
            <span className="jc-serif text-3xl font-bold">JobCraft</span>
          </Link>

          <div className="mt-14 max-w-xl">
            <p className="jc-eyebrow">YOUR CAREER WORKSPACE</p>
            <h1 className="jc-serif mt-4 text-5xl font-bold leading-[1.02] tracking-[-.055em] xl:text-6xl">
              One place to turn a job search into a clear plan.
            </h1>
            <p className="mt-5 text-lg leading-8 text-[#6f887f]">
              Discover roles, understand the evidence behind your fit, prepare stronger applications
              and keep every opportunity moving.
            </p>
          </div>

          <div className="mt-10 grid max-w-2xl gap-4 sm:grid-cols-2">
            {[
              ["87%", "Illustrative role match", "See why a role fits before applying."],
              ["ATS", "Resume studio", "Keep truthful, role-specific versions ready."],
              ["→", "Application plan", "Track Saved, Applied, Interview and Offer."],
              ["01", "Next-step guidance", "Know what deserves your attention next."],
            ].map(([value, title, text]) => (
              <div key={title} className="jc-card p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#19483a] text-sm font-black text-white">
                  {value}
                </div>
                <p className="mt-5 font-black text-[#173f33]">{title}</p>
                <p className="mt-2 text-sm leading-6 text-[#789087]">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-[560px]">
          <div className="rounded-[30px] border border-[#d9d2c6] bg-[#fbfaf6]/95 p-6 shadow-[0_35px_100px_rgba(18,60,48,.14)] backdrop-blur-2xl sm:p-9">
            <div className="flex items-center justify-between gap-4">
              <Link
                href="/"
                className="flex items-center gap-3 text-[#173f33] no-underline lg:hidden"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f49a48] text-lg">
                  ✣
                </span>
                <span className="jc-serif text-2xl font-bold">JobCraft</span>
              </Link>
              <span className="ml-auto rounded-full bg-[#eee5d7] px-3 py-1.5 text-[10px] font-black tracking-[.1em] text-[#278363]">
                {isLogin ? "WELCOME BACK" : "FREE TO START"}
              </span>
            </div>

            <div className="mt-7">
              <p className="jc-eyebrow">
                {isLogin ? "CONTINUE YOUR SEARCH" : "CREATE YOUR WORKSPACE"}
              </p>
              <h2 className="jc-serif mt-3 text-4xl font-bold leading-tight tracking-[-.045em] text-[#173f33] sm:text-[2.75rem]">
                {isLogin ? "Pick up where you left off." : "Build your JobCraft account."}
              </h2>
              <p className="mt-3 leading-7 text-[#789087]">
                {isLogin
                  ? "Your roles, resumes, certificates and applications stay connected in one focused workspace."
                  : "Start with your real profile and build a more organised, transparent job search around it."}
              </p>
            </div>

            {children}

            <div className="mt-7 grid grid-cols-3 gap-2 border-t border-[#e6e1d8] pt-6 text-center">
              {[
                ["India-first", "₹ / LPA"],
                ["Transparent", "Match evidence"],
                ["Grounded", "No fake claims"],
              ].map(([label, note]) => (
                <div key={label} className="rounded-[14px] bg-[#efede7] px-3 py-3">
                  <p className="text-xs font-black text-[#173f33]">{label}</p>
                  <p className="mt-1 text-[9px] text-[#789087]">{note}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
