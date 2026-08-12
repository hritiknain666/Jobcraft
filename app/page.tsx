import Link from "next/link";
import HeroProductVisual from "@/components/hero-product-visual";

const features = [
  {
    eyebrow: "SMARTER JOB MATCHING",
    title: "See the jobs that fit you best.",
    text: "Compare your skills, experience and preferences with each role before you spend time applying.",
    cta: "Find my matches",
    href: "/jobs",
    tone: "violet",
    visual: "match",
  },
  {
    eyebrow: "RESUME FOR THE ROLE",
    title: "Make the right resume easier to send.",
    text: "Keep truthful resume versions ready and bring the most relevant experience, skills and credentials forward.",
    cta: "See resume tools",
    href: "/resume",
    tone: "sky",
    visual: "resume",
  },
  {
    eyebrow: "APPLICATION TRACKER",
    title: "Know exactly where every application stands.",
    text: "Saved, Applied, Screening, Interview, Offer or Rejected — keep the whole search visible in one place.",
    cta: "Open tracker",
    href: "/applications",
    tone: "emerald",
    visual: "tracker",
  },
  {
    eyebrow: "CAREER GUIDANCE",
    title: "Know what to improve next.",
    text: "Use your real job-search activity to spot repeated gaps, stronger opportunities and practical next actions.",
    cta: "See career guidance",
    href: "/career-assistant",
    tone: "amber",
    visual: "career",
  },
];

export default function Home() {
  return <main className="min-h-screen overflow-hidden bg-white text-[#0b1020]">
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-4 sm:px-8">
        <Link href="/" className="flex items-center gap-3 font-black tracking-tight">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0b1020] text-sm text-white">JC</span>
          <span className="text-xl">Job<span className="text-violet-600">Craft</span></span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-bold text-slate-500 lg:flex">
          <Link href="/jobs" className="transition hover:text-violet-600">Jobs</Link>
          <Link href="/resume" className="transition hover:text-violet-600">Resume</Link>
          <Link href="/applications" className="transition hover:text-violet-600">Applications</Link>
          <Link href="/career-assistant" className="transition hover:text-violet-600">Career Assistant</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/?auth=login" scroll={false} className="hidden px-4 py-2 text-sm font-black sm:block">Log in</Link>
          <Link href="/?auth=signup" scroll={false} className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:bg-violet-700">Join free</Link>
        </div>
      </div>
    </header>

    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#fff_0%,#fbf9ff_55%,#f7fbff_100%)]">
      <div className="absolute -left-32 top-24 h-96 w-96 rounded-full bg-violet-200/35 blur-3xl"/>
      <div className="absolute -right-16 top-16 h-[420px] w-[420px] rounded-full bg-sky-200/30 blur-3xl"/>
      <div className="relative mx-auto grid max-w-[1400px] gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:py-24">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-white px-4 py-2 text-sm font-black text-violet-700 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-violet-500"/> Built for job seekers in India
          </div>
          <h1 className="mt-7 text-[3.5rem] font-black leading-[.93] tracking-[-.07em] sm:text-6xl xl:text-[6rem]">No more blind applying.<br/><span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-indigo-500 bg-clip-text text-transparent">Know why a job fits.</span></h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">Find better-fit roles, prepare the right resume, and keep every application moving — without juggling five different tools.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/?auth=signup" scroll={false} className="rounded-xl bg-violet-600 px-7 py-4 text-center font-black text-white shadow-xl shadow-violet-200 transition hover:-translate-y-0.5 hover:bg-violet-700">Try JobCraft free →</Link>
            <Link href="/jobs" className="rounded-xl border border-slate-200 bg-white px-7 py-4 text-center font-black shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">Explore jobs</Link>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[["India-first","₹ salary, cities and work mode"],["Transparent","See matched and missing skills"],["Truthful","No invented experience"]].map(([a,b])=><div key={a} className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm"><p className="font-black">{a}</p><p className="mt-1 text-sm leading-6 text-slate-500">{b}</p></div>)}
          </div>
        </div>
        <HeroProductVisual />
      </div>
    </section>

    <section className="border-y border-slate-200 bg-white">
      <div className="mx-auto grid max-w-[1400px] gap-4 px-5 py-7 text-center sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
        {[["01","Find jobs"],["02","See your match"],["03","Prepare your resume"],["04","Track the outcome"]].map(([n,t])=><div key={n} className="flex items-center justify-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-50 text-xs font-black text-violet-700">{n}</span><span className="font-black text-slate-700">{t}</span></div>)}
      </div>
    </section>

    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-black tracking-[.18em] text-violet-600">ONE JOB SEARCH. ONE PLACE.</p>
          <h2 className="mt-4 text-4xl font-black tracking-[-.05em] sm:text-6xl">Everything you need to apply better.</h2>
        </div>

        <div className="mt-14 space-y-10">
          {features.map((feature, index)=><FeatureSection key={feature.title} feature={feature} reverse={index % 2 === 1}/>)}
        </div>
      </div>
    </section>

    <section className="bg-[#0b1020] py-20 text-white sm:py-24">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-xs font-black tracking-[.18em] text-violet-300">WHY JOBCRAFT</p>
            <h2 className="mt-4 text-4xl font-black tracking-[-.05em] sm:text-5xl">Spend less time guessing. Spend more time applying well.</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[["Better-fit roles","Focus on opportunities that line up with your real profile."],["Clearer gaps","See what is missing before you apply."],["Right resume","Keep role-focused versions without changing the truth."],["Visible progress","Know exactly what needs attention next."]].map(([title,text])=><div key={title} className="rounded-[24px] border border-white/10 bg-white/[.06] p-5"><h3 className="text-xl font-black">{title}</h3><p className="mt-2 leading-7 text-slate-300">{text}</p></div>)}
          </div>
        </div>
      </div>
    </section>

    <section className="bg-[linear-gradient(135deg,#f7f3ff_0%,#ffffff_45%,#eef9ff_100%)] py-20 sm:py-24">
      <div className="mx-auto max-w-[1100px] px-5 text-center sm:px-8">
        <p className="text-xs font-black tracking-[.18em] text-violet-600">START FREE</p>
        <h2 className="mt-4 text-4xl font-black tracking-[-.05em] sm:text-6xl">Your next application can be more focused.</h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">Build your profile once, then use JobCraft to find, prepare and track your next opportunities.</p>
        <Link href="/?auth=signup" scroll={false} className="mt-8 inline-flex rounded-xl bg-violet-600 px-7 py-4 font-black text-white shadow-xl shadow-violet-200 transition hover:-translate-y-0.5 hover:bg-violet-700">Create free account →</Link>
      </div>
    </section>

    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-5 px-5 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div><b className="text-lg text-slate-950">Job<span className="text-violet-600">Craft</span></b><p className="mt-1">Career tools designed for India.</p></div>
        <div className="flex flex-wrap gap-6 font-semibold"><Link href="/jobs">Jobs</Link><Link href="/resume">Resume</Link><Link href="/applications">Applications</Link><Link href="/career-assistant">Career Assistant</Link></div>
      </div>
    </footer>
  </main>;
}

function FeatureSection({feature,reverse}:{feature:any;reverse:boolean}) {
  const tone = feature.tone === "sky" ? "from-sky-50 to-white border-sky-100" : feature.tone === "emerald" ? "from-emerald-50 to-white border-emerald-100" : feature.tone === "amber" ? "from-amber-50 to-white border-amber-100" : "from-violet-50 to-white border-violet-100";
  return <article className={`grid gap-8 overflow-hidden rounded-[36px] border bg-gradient-to-br ${tone} p-6 shadow-[0_30px_90px_rgba(15,23,42,.07)] sm:p-10 lg:grid-cols-2 lg:items-center lg:p-12`}>
    <div className={reverse ? "lg:order-2" : ""}>
      <p className="text-xs font-black tracking-[.18em] text-violet-600">{feature.eyebrow}</p>
      <h3 className="mt-4 max-w-xl text-4xl font-black tracking-[-.045em] sm:text-5xl">{feature.title}</h3>
      <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">{feature.text}</p>
      <Link href={feature.href} className="mt-7 inline-flex rounded-xl bg-[#0b1020] px-6 py-3.5 font-black text-white transition hover:-translate-y-0.5">{feature.cta} →</Link>
    </div>
    <div className={reverse ? "lg:order-1" : ""}><FeatureVisual type={feature.visual}/></div>
  </article>;
}

function FeatureVisual({type}:{type:string}) {
  if (type === "resume") return <div className="relative mx-auto max-w-xl rounded-[30px] bg-white p-6 shadow-[0_28px_70px_rgba(15,23,42,.12)]"><div className="flex items-center justify-between"><div><p className="text-xs font-black text-sky-600">RESUME VERSION</p><h4 className="mt-2 text-2xl font-black">Data Analyst Resume</h4></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">PRIMARY</span></div><div className="mt-6 space-y-3">{[["Summary","Ready"],["SQL + Power BI","Strong"],["Certificates","2 selected"],["Target role","Data Analyst"]].map(([a,b])=><div key={a} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4"><span className="font-bold text-slate-600">{a}</span><span className="font-black">{b}</span></div>)}</div></div>;
  if (type === "tracker") return <div className="mx-auto max-w-xl rounded-[30px] bg-[#0b1020] p-6 text-white shadow-[0_28px_70px_rgba(15,23,42,.20)]"><div className="grid grid-cols-4 gap-2">{[["Saved","12"],["Applied","8"],["Interview","3"],["Offer","1"]].map(([a,b])=><div key={a} className="rounded-xl bg-white p-3 text-center text-slate-950"><p className="text-2xl font-black">{b}</p><p className="mt-1 text-[9px] font-black text-slate-400">{a.toUpperCase()}</p></div>)}</div><div className="mt-5 space-y-3">{[["Data Analyst","Interview"],["Business Analyst","Applied"],["Graduate Analyst","Saved"]].map(([a,b])=><div key={a} className="flex items-center justify-between rounded-2xl bg-white/10 p-4"><span className="font-black">{a}</span><span className="rounded-full bg-violet-500/20 px-3 py-1 text-xs font-black text-violet-200">{b}</span></div>)}</div></div>;
  if (type === "career") return <div className="mx-auto max-w-xl rounded-[30px] bg-white p-6 shadow-[0_28px_70px_rgba(15,23,42,.12)]"><p className="text-xs font-black text-amber-600">NEXT PRIORITIES</p>{[["01","Review stronger-fit jobs"],["02","Close repeated skill gaps"],["03","Improve application conversion"]].map(([n,t])=><div key={n} className="mt-4 flex gap-4 rounded-2xl bg-amber-50 p-4"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0b1020] text-xs font-black text-white">{n}</span><div><p className="font-black">{t}</p><p className="mt-1 text-sm text-slate-500">Based on your saved profile and job-search activity.</p></div></div>)}</div>;
  return <div className="mx-auto max-w-xl rounded-[30px] bg-white p-6 shadow-[0_28px_70px_rgba(15,23,42,.12)]"><div className="flex items-start justify-between"><div><p className="text-xs font-black text-violet-600">DATA ANALYST</p><h4 className="mt-2 text-3xl font-black">Strong fit</h4><p className="mt-2 text-sm text-slate-500">Bengaluru · Hybrid · ₹5.5–8.5 LPA</p></div><div className="flex h-24 w-24 items-center justify-center rounded-full border-[10px] border-emerald-100 bg-emerald-50 text-2xl font-black text-emerald-600">87%</div></div><div className="mt-6 flex flex-wrap gap-2">{["SQL ✓","Power BI ✓","Excel ✓"].map(x=><span key={x} className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700">{x}</span>)}<span className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-black text-amber-700">Tableau gap</span></div><div className="mt-5 h-2.5 overflow-hidden rounded-full bg-slate-200"><div className="h-full w-[87%] rounded-full bg-emerald-500"/></div></div>;
}
