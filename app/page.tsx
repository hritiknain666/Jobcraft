import Link from "next/link";
import ProductShowcase from "@/components/product-showcase";
import BestOfJobCraft from "@/components/best-of-jobcraft";
import WhyJobCraftMotion from "@/components/why-jobcraft-motion";
import HeroProductVisual from "@/components/hero-product-visual";

export default function Home() {
  return <main className="min-h-screen overflow-hidden bg-[#f8f8fc] text-[#090d1f]">
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1380px] items-center justify-between px-5 py-4 sm:px-8">
        <Link href="/" className="flex items-center gap-3 font-black tracking-tight"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#090d1f] text-sm text-white shadow-lg">JC</span><span className="text-xl">Job<span className="text-violet-600">Craft</span></span></Link>
        <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-500 lg:flex"><Link href="/jobs" className="hover:text-slate-950">Jobs</Link><Link href="/resume" className="hover:text-slate-950">Resume</Link><Link href="/applications" className="hover:text-slate-950">Applications</Link><Link href="/career-assistant" className="hover:text-slate-950">Career Assistant</Link></nav>
        <div className="flex items-center gap-2"><Link href="/?auth=login" scroll={false} className="hidden px-4 py-2 text-sm font-bold sm:block">Log in</Link><Link href="/?auth=signup" scroll={false} className="rounded-xl bg-[#090d1f] px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5">Get started free</Link></div>
      </div>
    </header>

    <section className="relative overflow-hidden bg-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_20%,rgba(124,58,237,.16),transparent_30%),radial-gradient(circle_at_85%_20%,rgba(14,165,233,.10),transparent_28%)]"/>
      <div className="absolute left-1/2 top-12 h-[520px] w-[520px] -translate-x-1/2 rounded-full border border-violet-100/60"/>
      <div className="relative mx-auto grid max-w-[1380px] gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[.95fr_1.05fr] lg:items-center lg:py-20 xl:py-24">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50/90 px-4 py-2 text-sm font-bold text-violet-700"><span className="h-2 w-2 rounded-full bg-violet-500"/>Career workspace built for India</div>
          <h1 className="mt-7 text-[3.35rem] font-black leading-[.95] tracking-[-.065em] sm:text-6xl xl:text-[5.6rem]">Stop guessing.<br/><span className="bg-gradient-to-r from-violet-600 via-indigo-500 to-violet-500 bg-clip-text text-transparent">Apply with context.</span></h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">Discover roles, understand the match, prepare the right resume version and keep every application moving — without turning your job search into five disconnected tools.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link href="/jobs" className="rounded-xl bg-violet-600 px-7 py-4 text-center font-black text-white shadow-xl shadow-violet-200/60 transition hover:-translate-y-0.5 hover:bg-violet-700">Explore jobs →</Link><Link href="/resume" className="rounded-xl border border-slate-200 bg-white px-7 py-4 text-center font-black shadow-sm transition hover:border-violet-200 hover:shadow-lg">See resume tools</Link></div>
          <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">{[["India-first","Salary, city & work-mode context"],["Transparent","Explainable match signals"],["Grounded","No fabricated experience"]].map(([title,text])=><div key={title} className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm backdrop-blur"><p className="text-sm font-black">{title}</p><p className="mt-1 text-xs leading-5 text-slate-500">{text}</p></div>)}</div>
        </div>
        <HeroProductVisual />
      </div>
    </section>

    <section className="border-y border-slate-200/70 bg-[#fafafe]"><div className="mx-auto grid max-w-[1380px] gap-3 px-5 py-5 text-sm sm:grid-cols-2 sm:px-8 lg:grid-cols-4">{["Discover better-fit roles","Understand match signals","Tailor truthful resumes","Track every application"].map((x,i)=><div key={x} className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 font-black shadow-sm"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50 text-xs text-violet-700">0{i+1}</span>{x}</div>)}</div></section>

    <ProductShowcase />
    <BestOfJobCraft />
    <WhyJobCraftMotion />

    <section className="mx-auto max-w-[1380px] px-5 py-20 sm:px-8"><div className="relative overflow-hidden rounded-[32px] bg-[#090d1f] px-7 py-12 text-white sm:px-12 lg:flex lg:items-center lg:justify-between lg:py-14"><div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-violet-600/20 blur-3xl"/><div className="relative"><p className="text-xs font-black tracking-[.18em] text-violet-300">START YOUR WORKSPACE</p><h2 className="mt-4 max-w-2xl text-4xl font-black tracking-[-.04em]">Build your profile once. Make every next application easier.</h2><p className="mt-4 max-w-xl leading-7 text-slate-300">Start with the core workflow today. Smarter AI assistance can enhance it later without replacing the facts you control.</p></div><Link href="/?auth=signup" scroll={false} className="relative mt-8 inline-block shrink-0 rounded-xl bg-white px-7 py-4 font-black text-slate-950 transition hover:-translate-y-0.5 lg:mt-0">Create free account →</Link></div></section>

    <footer className="border-t border-slate-200 bg-white"><div className="mx-auto flex max-w-[1380px] flex-col gap-5 px-5 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8"><div><b className="text-lg text-slate-950">Job<span className="text-violet-600">Craft</span></b><p className="mt-1">Career tools designed for India.</p></div><div className="flex flex-wrap gap-6 font-semibold"><Link href="/jobs">Jobs</Link><Link href="/resume">Resume</Link><Link href="/applications">Applications</Link><Link href="/career-assistant">Career Assistant</Link></div></div></footer>
  </main>;
}
