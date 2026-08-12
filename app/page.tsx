import Link from "next/link";
import ProductShowcase from "@/components/product-showcase";

const pillars = [
  ["01", "Find signal, not noise", "Search by role, salary, experience, city, skills and work mode — then focus on jobs worth your time."],
  ["02", "Know why a role fits", "See the match signals behind a role instead of relying on a mysterious percentage alone."],
  ["03", "Reuse your career proof", "Keep resumes, projects and certificates organised so each application starts from facts you already trust."],
  ["04", "Keep momentum visible", "Track saved roles, applications, interviews and offers in one simple workflow."],
];

export default function Home() {
  return <main className="min-h-screen overflow-hidden bg-[#f8f8fc] text-[#090d1f]">
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1380px] items-center justify-between px-5 py-4 sm:px-8">
        <Link href="/" className="flex items-center gap-3 font-black tracking-tight"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#090d1f] text-sm text-white shadow-lg">JC</span><span className="text-xl">Job<span className="text-violet-600">Craft</span></span></Link>
        <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-500 lg:flex"><Link href="/jobs" className="hover:text-slate-950">Jobs</Link><Link href="/resume" className="hover:text-slate-950">Resume</Link><Link href="/applications" className="hover:text-slate-950">Applications</Link><Link href="/career-assistant" className="hover:text-slate-950">Career Assistant</Link></nav>
        <div className="flex items-center gap-2"><Link href="/auth/login" className="hidden px-4 py-2 text-sm font-bold sm:block">Log in</Link><Link href="/auth/signup" className="rounded-xl bg-[#090d1f] px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5">Get started free</Link></div>
      </div>
    </header>

    <section className="relative bg-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_20%,rgba(124,58,237,.14),transparent_30%),radial-gradient(circle_at_85%_20%,rgba(14,165,233,.09),transparent_28%)]"/>
      <div className="relative mx-auto grid max-w-[1380px] gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.02fr_.98fr] lg:items-center lg:py-24">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50/90 px-4 py-2 text-sm font-bold text-violet-700"><span className="h-2 w-2 rounded-full bg-violet-500"/>Career workspace built for India</div>
          <h1 className="mt-7 text-[3.35rem] font-black leading-[.96] tracking-[-.06em] sm:text-6xl lg:text-[5.4rem]">Stop guessing.<br/><span className="bg-gradient-to-r from-violet-600 via-indigo-500 to-violet-500 bg-clip-text text-transparent">Apply with context.</span></h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">JobCraft helps you discover roles, understand your fit, prepare the right resume version and keep every application moving — in one focused workspace.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link href="/jobs" className="rounded-xl bg-violet-600 px-7 py-4 text-center font-black text-white shadow-xl shadow-violet-200/60 transition hover:-translate-y-0.5 hover:bg-violet-700">Explore jobs →</Link><Link href="/resume" className="rounded-xl border border-slate-200 bg-white px-7 py-4 text-center font-black shadow-sm transition hover:border-slate-300">See resume tools</Link></div>
          <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">{[["India-first","Salary, city & work-mode filters"],["Transparent","Explainable match signals"],["Grounded","No fabricated experience"]].map(([title,text])=><div key={title} className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm backdrop-blur"><p className="text-sm font-black">{title}</p><p className="mt-1 text-xs leading-5 text-slate-500">{text}</p></div>)}</div>
        </div>

        <div className="relative mx-auto w-full max-w-xl">
          <div className="absolute inset-10 rounded-full bg-violet-200/50 blur-3xl"/>
          <div className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_40px_110px_rgba(15,23,42,.17)]">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#090d1f] text-[11px] font-black text-white">JC</span><div><p className="text-sm font-black">Your job search</p><p className="text-[11px] text-slate-400">Illustrative product preview</p></div></div><span className="rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-black text-emerald-700">PROFILE READY</span></div>
            <div className="p-5 sm:p-6">
              <div className="flex items-start justify-between gap-5"><div><p className="text-xs font-black tracking-[.12em] text-violet-600">TOP MATCH</p><p className="mt-2 text-sm font-bold text-slate-400">Sample role</p><h2 className="mt-1 text-3xl font-black tracking-tight">Data Analyst</h2><p className="mt-2 text-sm text-slate-500">Bengaluru · Hybrid · ₹5.5–8.5 LPA</p></div><div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-[8px] border-emerald-100 bg-emerald-50 text-xl font-black text-emerald-600">87%</div></div>
              <div className="mt-5 flex flex-wrap gap-2">{["SQL ✓","Power BI ✓","Excel ✓"].map(x=><span key={x} className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">{x}</span>)}<span className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700">Tableau missing</span></div>
              <div className="mt-5 rounded-2xl bg-slate-50 p-4"><div className="flex items-center justify-between text-sm"><span className="font-black">Strong fit</span><span className="font-bold text-emerald-600">87%</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full w-[87%] rounded-full bg-emerald-500"/></div><p className="mt-3 text-xs leading-5 text-slate-500">Matched skills, experience and preferences are visible before you apply.</p></div>
            </div>
            <div className="grid grid-cols-4 border-t border-slate-100 bg-[#fafafe]">{[["Saved","12"],["Applied","8"],["Interview","3"],["Offer","1"]].map(([label,value])=><div key={label} className="border-r border-slate-100 px-3 py-4 last:border-r-0"><p className="text-[9px] font-black tracking-wide text-slate-400">{label.toUpperCase()}</p><p className="mt-1 text-xl font-black">{value}</p></div>)}</div>
          </div>
          <div className="absolute -bottom-5 -left-3 hidden rounded-2xl border border-violet-100 bg-white px-4 py-3 shadow-xl sm:block"><p className="text-[10px] font-black text-violet-600">RESUME SIGNAL</p><p className="mt-1 text-sm font-black">Certificate ready ✓</p></div>
          <div className="absolute -right-3 top-20 hidden rounded-2xl border border-slate-200 bg-[#090d1f] px-4 py-3 text-white shadow-xl sm:block"><p className="text-[10px] font-black text-violet-300">NEXT STEP</p><p className="mt-1 text-sm font-black">Review role →</p></div>
        </div>
      </div>
    </section>

    <section className="border-y border-slate-200/70 bg-[#fafafe]"><div className="mx-auto grid max-w-[1380px] gap-3 px-5 py-5 text-sm sm:grid-cols-2 sm:px-8 lg:grid-cols-4">{["Discover better-fit roles","Understand match signals","Tailor truthful resumes","Track every application"].map((x,i)=><div key={x} className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 font-black shadow-sm"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50 text-xs text-violet-700">0{i+1}</span>{x}</div>)}</div></section>

    <ProductShowcase />

    <section className="mx-auto max-w-[1380px] px-5 py-20 sm:px-8 lg:py-24">
      <div className="grid gap-8 lg:grid-cols-[.75fr_1.25fr] lg:items-end"><div><p className="text-xs font-black tracking-[.18em] text-violet-600">WHY JOBCRAFT EXISTS</p><h2 className="mt-4 text-4xl font-black tracking-[-.045em] sm:text-5xl">A calmer way to run a serious job search.</h2></div><p className="max-w-2xl text-lg leading-8 text-slate-600">The goal is not to give you more tabs, more noise or a fake sense of intelligence. It is to make the next useful action obvious.</p></div>
      <div className="mt-12 grid gap-4 md:grid-cols-2">{pillars.map(([num,title,text])=><article key={num} className="group rounded-[26px] border border-slate-200 bg-white p-7 transition hover:-translate-y-1 hover:border-violet-200 hover:shadow-[0_22px_60px_rgba(15,23,42,.08)]"><div className="flex items-center justify-between"><span className="text-xs font-black tracking-[.15em] text-violet-600">{num}</span><span className="h-8 w-8 rounded-full border border-slate-200 transition group-hover:border-violet-200 group-hover:bg-violet-50"/></div><h3 className="mt-8 text-2xl font-black tracking-tight">{title}</h3><p className="mt-3 max-w-xl leading-7 text-slate-600">{text}</p></article>)}</div>
    </section>

    <section className="mx-auto max-w-[1380px] px-5 pb-20 sm:px-8"><div className="relative overflow-hidden rounded-[32px] bg-[#090d1f] px-7 py-12 text-white sm:px-12 lg:flex lg:items-center lg:justify-between lg:py-14"><div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-violet-600/20 blur-3xl"/><div className="relative"><p className="text-xs font-black tracking-[.18em] text-violet-300">START YOUR WORKSPACE</p><h2 className="mt-4 max-w-2xl text-4xl font-black tracking-[-.04em]">Build your profile once. Make every next application easier.</h2><p className="mt-4 max-w-xl leading-7 text-slate-300">Start with the core workflow today. Smarter AI assistance can enhance it later without replacing the facts you control.</p></div><Link href="/auth/signup" className="relative mt-8 inline-block shrink-0 rounded-xl bg-white px-7 py-4 font-black text-slate-950 transition hover:-translate-y-0.5 lg:mt-0">Create free account →</Link></div></section>

    <footer className="border-t border-slate-200 bg-white"><div className="mx-auto flex max-w-[1380px] flex-col gap-5 px-5 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8"><div><b className="text-lg text-slate-950">Job<span className="text-violet-600">Craft</span></b><p className="mt-1">Career tools designed for India.</p></div><div className="flex flex-wrap gap-6 font-semibold"><Link href="/jobs">Jobs</Link><Link href="/resume">Resume</Link><Link href="/applications">Applications</Link><Link href="/career-assistant">Career Assistant</Link></div></div></footer>
  </main>;
}
