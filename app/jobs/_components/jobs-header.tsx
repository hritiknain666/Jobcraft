import Link from "next/link";

export function JobsHeader({ loggedIn }: { loggedIn: boolean }) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-4 sm:px-8">
        <Link href="/" className="flex items-center gap-3 font-black">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0b1020] text-sm text-white">JC</span>
          <span className="text-xl">Job<span className="text-violet-600">Craft</span></span>
        </Link>
        <nav className="hidden gap-8 text-sm font-bold text-slate-500 md:flex">
          <Link href="/jobs" className="text-slate-950">Jobs</Link>
          <Link href="/resume" className="hover:text-slate-950">Resume</Link>
          <Link href="/applications" className="hover:text-slate-950">Applications</Link>
          <Link href="/career-assistant" className="hover:text-slate-950">Career Assistant</Link>
        </nav>
        {loggedIn ? (
          <Link href="/dashboard" className="rounded-xl bg-[#0b1020] px-5 py-3 text-sm font-black text-white">Dashboard</Link>
        ) : (
          <div className="flex items-center gap-3">
            <Link href="/jobs?auth=login" scroll={false} className="hidden text-sm font-black sm:block">Log in</Link>
            <Link href="/jobs?auth=signup" scroll={false} className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-black text-white">Join free</Link>
          </div>
        )}
      </div>
    </header>
  );
}
