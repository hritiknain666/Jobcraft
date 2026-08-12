import Link from "next/link";
import HeroProductVisual from "@/components/hero-product-visual";
import HomeProductJourney from "@/components/home-product-journey";

export default function Home() {
  return <main className="min-h-screen overflow-hidden bg-white text-[#0b1020]">
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-4 sm:px-8">
        <Link href="/" className="flex items-center gap-3 font-black tracking-tight"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0b1020] text-sm text-white">JC</span><span className="text-xl">Job<span className="text-violet-600">Craft</span></span></Link>
        <nav className="hidden items-center gap-8 text-sm font-bold text-slate-500 lg:flex"><Link href="/jobs" className="transition hover:text-violet-600">Jobs</Link><Link href="/resume" className="transition hover:text-violet-600">Resume</Link><Link href="/applications" className="transition hover:text-violet-600">Applications</Link><Link href="/career-assistant" className="transition hover:text-violet-600">Career Assistant</Link></nav>
        <div className="flex items-center gap-2"><Link href="/?auth=login" scroll={false} className="hidden px-4 py-2 text-sm font-black sm:block">Log in</Link><Link href="/?auth=signup" scroll={false} className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:bg-violet-700">Join free</Link></div>
      </div>
    </header>

    <section className="relative overflow-hidden bg-[linear-gradient(135deg,#fff9ff_0%,#ffffff_40%,#f2f8ff_100%)]">
      <div className="absolute -left-24 top-16 h-80 w-80 rounded-full bg-violet-200/40 blur-3xl"/>
      <div className="absolute right-0 top-0 h-[430px] w-[430px] rounded-full bg-sky-200/30 blur-3xl"/>
      <div className="relative mx-auto grid max-w-[1400px] gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:py-20 xl:py-24">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-white px-4 py-2 text-sm font-black text-violet-700 shadow-sm"><span className="h-2 w-2 rounded-full bg-violet-500"/>Built for job seekers in India</div>
          <h1 className="mt-7 text-[3.45rem] font-black leading-[.93] tracking-[-.07em] sm:text-6xl xl:text-[5.9rem]">Find the right job.<br/><span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-indigo-500 bg-clip-text text-transparent">Know why it fits.</span></h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">Search better. Match smarter. Send the right resume. Track what happens next.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link href="/jobs" className="rounded-xl bg-violet-600 px-7 py-4 text-center font-black text-white shadow-xl shadow-violet-200 transition hover:-translate-y-0.5 hover:bg-violet-700">Find jobs →</Link><Link href="/?auth=signup" scroll={false} className="rounded-xl border border-slate-200 bg-white px-7 py-4 text-center font-black shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">Create free account</Link></div>
          <div className="mt-8 flex flex-wrap gap-3 text-sm font-black text-slate-600">{["₹ salary filters","Match score","Resume versions","Application tracker"].map((x)=><span key={x} className="rounded-full border border-white bg-white/90 px-4 py-2 shadow-sm">✓ {x}</span>)}</div>
        </div>
        <HeroProductVisual />
      </div>
    </section>

    <section className="border-y border-slate-200 bg-white py-5"><div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-center gap-x-8 gap-y-3 px-5 text-sm font-black text-slate-500 sm:px-8 lg:justify-between">{["Find jobs","See your match","Prepare resume","Track applications","Know what’s next"].map((x,i)=><div key={x} className="flex items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-50 text-[10px] text-violet-700">0{i+1}</span>{x}</div>)}</div></section>

    <HomeProductJourney />

    <section className="relative overflow-hidden bg-[#0b1020] py-20 text-white sm:py-24">
      <div className="absolute left-[-8rem] top-0 h-80 w-80 rounded-full bg-violet-600/20 blur-3xl"/>
      <div className="absolute right-[-6rem] bottom-0 h-80 w-80 rounded-full bg-sky-500/10 blur-3xl"/>
      <div className="relative mx-auto grid max-w-[1200px] gap-8 px-5 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-center">
        <div><p className="text-xs font-black tracking-[.18em] text-violet-300">READY WHEN YOU ARE</p><h2 className="mt-4 max-w-3xl text-4xl font-black tracking-[-.05em] sm:text-6xl">Less guessing. Better applications.</h2><p className="mt-4 max-w-xl text-lg leading-8 text-slate-300">Build your profile once, then use JobCraft to find, prepare and track your next opportunities.</p></div>
        <Link href="/?auth=signup" scroll={false} className="inline-flex rounded-xl bg-white px-7 py-4 font-black text-slate-950 shadow-xl transition hover:-translate-y-0.5">Start free →</Link>
      </div>
    </section>

    <footer className="border-t border-slate-200 bg-white"><div className="mx-auto flex max-w-[1400px] flex-col gap-5 px-5 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8"><div><b className="text-lg text-slate-950">Job<span className="text-violet-600">Craft</span></b><p className="mt-1">Career tools designed for India.</p></div><div className="flex flex-wrap gap-6 font-semibold"><Link href="/jobs">Jobs</Link><Link href="/resume">Resume</Link><Link href="/applications">Applications</Link><Link href="/career-assistant">Career Assistant</Link></div></div></footer>
  </main>;
}
