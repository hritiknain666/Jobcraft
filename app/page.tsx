import Link from "next/link";
import HeroProductVisual from "@/components/hero-product-visual";
import HomeFeatureStory from "@/components/home-feature-story";

export default function Home() {
  return <main className="min-h-screen overflow-hidden bg-white text-[#090d1f]">
    <header className="sticky top-0 z-50 border-b border-violet-100/70 bg-white/82 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1380px] items-center justify-between px-5 py-4 sm:px-8">
        <Link href="/" className="flex items-center gap-3 font-black tracking-tight"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#090d1f] text-sm text-white shadow-lg">JC</span><span className="text-xl">Job<span className="text-violet-600">Craft</span></span></Link>
        <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-500 lg:flex"><Link href="/jobs" className="transition hover:text-violet-600">Jobs</Link><Link href="/resume" className="transition hover:text-violet-600">Resume</Link><Link href="/applications" className="transition hover:text-violet-600">Applications</Link><Link href="/career-assistant" className="transition hover:text-violet-600">Career Assistant</Link></nav>
        <div className="flex items-center gap-2"><Link href="/?auth=login" scroll={false} className="hidden px-4 py-2 text-sm font-bold sm:block">Log in</Link><Link href="/?auth=signup" scroll={false} className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5">Get started free</Link></div>
      </div>
    </header>

    <section className="relative overflow-hidden bg-[linear-gradient(135deg,#fff8ff_0%,#ffffff_38%,#f2f7ff_70%,#f5f2ff_100%)]">
      <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-fuchsia-200/35 blur-3xl"/>
      <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-sky-200/35 blur-3xl"/>
      <div className="absolute left-[42%] top-10 h-[560px] w-[560px] rounded-full border border-violet-100/70"/>
      <div className="relative mx-auto grid max-w-[1380px] gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[.92fr_1.08fr] lg:items-center lg:py-20 xl:py-24">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-white/90 px-4 py-2 text-sm font-black text-violet-700 shadow-sm"><span className="h-2 w-2 rounded-full bg-violet-500"/>India-first career workspace</div>
          <h1 className="mt-7 text-[3.3rem] font-black leading-[.94] tracking-[-.067em] sm:text-6xl xl:text-[5.7rem]">Find the signal.<br/><span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-indigo-500 bg-clip-text text-transparent">Move with confidence.</span></h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">Discover roles, understand your fit, prepare the right resume version and keep every application moving — in one connected workspace built around your next decision.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link href="/jobs" className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-7 py-4 text-center font-black text-white shadow-xl shadow-violet-200/70 transition hover:-translate-y-0.5">Explore jobs →</Link><Link href="/resume" className="rounded-xl border border-violet-100 bg-white/90 px-7 py-4 text-center font-black shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">See resume tools</Link></div>
          <div className="mt-9 flex flex-wrap gap-3 text-sm font-black text-slate-600">{["₹ salary context","Explainable match","Truthful tailoring","Application tracking"].map((item)=><span key={item} className="rounded-full border border-white bg-white/85 px-4 py-2 shadow-sm">✓ {item}</span>)}</div>
        </div>
        <HeroProductVisual />
      </div>
    </section>

    <section className="border-y border-violet-100/70 bg-white py-5">
      <div className="mx-auto flex max-w-[1380px] flex-wrap items-center justify-center gap-x-8 gap-y-3 px-5 text-sm font-black text-slate-500 sm:px-8 lg:justify-between">{["Discover better-fit roles","Understand match signals","Tailor truthful resumes","Track every application","Build career momentum"].map((x,i)=><div key={x} className="flex items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-50 text-[10px] text-violet-700">0{i+1}</span>{x}</div>)}</div>
    </section>

    <HomeFeatureStory />

    <section className="relative overflow-hidden bg-[linear-gradient(135deg,#fff9fe_0%,#f8f7ff_50%,#eefbff_100%)] py-24 sm:py-28">
      <div className="absolute left-[-6rem] top-16 h-72 w-72 rounded-full bg-violet-200/40 blur-3xl"/>
      <div className="absolute right-[-4rem] bottom-0 h-80 w-80 rounded-full bg-cyan-200/35 blur-3xl"/>
      <div className="relative mx-auto grid max-w-[1380px] gap-10 px-5 sm:px-8 lg:grid-cols-[.82fr_1.18fr] lg:items-center">
        <div>
          <p className="text-xs font-black tracking-[.2em] text-violet-600">WHY JOBCRAFT EXISTS</p>
          <h2 className="mt-4 text-4xl font-black tracking-[-.05em] sm:text-6xl">A job search should feel directed, not chaotic.</h2>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">The product is built around one question: what is the most useful next move? That is why jobs, match signals, resumes, credentials and applications stay connected.</p>
          <Link href="/?auth=signup" scroll={false} className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#090d1f] px-6 py-3.5 font-black text-white shadow-lg transition hover:-translate-y-0.5">Create your workspace <span>→</span></Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {[["01","Less noise","Filter around role, salary, experience, skills and work mode."],["02","Clearer fit","See why a role may fit instead of trusting a mystery percentage."],["03","Reusable proof","Keep resumes, projects and credentials ready for the right role."],["04","Visible momentum","Know what is saved, applied, interviewing or complete."]].map(([n,title,text],i)=><article key={n} className={`rounded-[28px] border p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl ${i===0?"border-violet-100 bg-violet-50/80":i===1?"border-sky-100 bg-sky-50/80":i===2?"border-fuchsia-100 bg-fuchsia-50/70":"border-emerald-100 bg-emerald-50/70"}`}><div className="flex items-center justify-between"><span className="text-xs font-black tracking-[.16em] text-slate-400">{n}</span><span className="h-2.5 w-2.5 rounded-full bg-violet-500"/></div><h3 className="mt-7 text-2xl font-black">{title}</h3><p className="mt-3 leading-7 text-slate-600">{text}</p></article>)}
        </div>
      </div>
    </section>

    <section className="bg-white px-5 py-20 sm:px-8">
      <div className="relative mx-auto max-w-[1380px] overflow-hidden rounded-[36px] bg-[linear-gradient(120deg,#6d28d9_0%,#4f46e5_48%,#0ea5e9_100%)] px-7 py-14 text-white shadow-[0_35px_100px_rgba(79,70,229,.24)] sm:px-12 lg:flex lg:items-center lg:justify-between lg:py-16">
        <div className="absolute -right-16 -top-20 h-72 w-72 rounded-full bg-white/15 blur-3xl"/>
        <div className="relative"><p className="text-xs font-black tracking-[.2em] text-violet-100">START WITH THE CORE WORKFLOW</p><h2 className="mt-4 max-w-3xl text-4xl font-black tracking-[-.045em] sm:text-5xl">Build your profile once. Make every next application easier.</h2><p className="mt-4 max-w-2xl text-lg leading-8 text-violet-100">Start with the useful foundation now. Smarter AI assistance can enhance the workflow later without replacing the facts you control.</p></div>
        <Link href="/?auth=signup" scroll={false} className="relative mt-8 inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-7 py-4 font-black text-slate-950 shadow-xl transition hover:-translate-y-0.5 lg:mt-0">Create free account <span>→</span></Link>
      </div>
    </section>

    <footer className="border-t border-violet-100 bg-white"><div className="mx-auto flex max-w-[1380px] flex-col gap-5 px-5 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8"><div><b className="text-lg text-slate-950">Job<span className="text-violet-600">Craft</span></b><p className="mt-1">Career tools designed for India.</p></div><div className="flex flex-wrap gap-6 font-semibold"><Link href="/jobs">Jobs</Link><Link href="/resume">Resume</Link><Link href="/applications">Applications</Link><Link href="/career-assistant">Career Assistant</Link></div></div></footer>
  </main>;
}
