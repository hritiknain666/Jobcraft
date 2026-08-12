import Link from "next/link";

const features = [
  {
    eyebrow: "JOB MATCHING",
    title: "Know why a role fits before you apply.",
    text: "JobCraft compares your saved skills, experience and preferences with each role and explains the signals behind the match.",
    href: "/jobs",
    cta: "Explore job matching",
    preview: <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-xs font-black text-violet-600">DATA ANALYST</p><p className="mt-1 text-sm font-bold text-slate-500">Bengaluru · Hybrid</p></div><span className="text-3xl font-black text-emerald-600">87%</span></div><div className="mt-4 flex flex-wrap gap-2">{["SQL ✓","Power BI ✓","Excel ✓"].map(x=><span key={x} className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">{x}</span>)}<span className="rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">Tableau gap</span></div></div>,
  },
  {
    eyebrow: "RESUME WORKSPACE",
    title: "Build multiple resume versions without losing control.",
    text: "Keep ATS-friendly versions together, choose a primary resume and tailor only from facts you actually provide.",
    href: "/resume",
    cta: "See resume tools",
    preview: <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-black text-violet-600">RESUME VERSIONS</p>{[["Data Analyst Resume","Primary"],["Business Analyst Resume","Ready"],["Graduate Resume","Draft"]].map(([a,b])=><div key={a} className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-3"><span className="text-sm font-bold">{a}</span><span className="text-xs font-black text-slate-400">{b}</span></div>)}</div>,
  },
  {
    eyebrow: "APPLICATION TRACKER",
    title: "See every opportunity in one pipeline.",
    text: "Move roles through Saved, Applied, Screening, Interview, Offer or Rejected so your job search never becomes a spreadsheet mess.",
    href: "/?auth=login",
    cta: "Open your tracker",
    preview: <div className="grid grid-cols-3 gap-2">{[["Applied","8"],["Interview","3"],["Offer","1"]].map(([a,b])=><div key={a} className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm"><p className="text-2xl font-black">{b}</p><p className="mt-1 text-[10px] font-black text-slate-400">{a.toUpperCase()}</p></div>)}</div>,
  },
  {
    eyebrow: "CERTIFICATES",
    title: "Keep useful credentials ready for the right resume.",
    text: "Store certificate details once, keep proof private and include relevant credentials in the resume version that needs them.",
    href: "/?auth=signup",
    cta: "Add certificates",
    preview: <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-black text-violet-600">CERTIFICATIONS</p><div className="mt-4 rounded-xl bg-slate-50 p-4"><p className="font-black">Google Data Analytics</p><p className="mt-1 text-sm text-slate-500">Google · Credential saved</p><span className="mt-3 inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">Ready for resume</span></div></div>,
  },
  {
    eyebrow: "CAREER ASSISTANT",
    title: "Turn your job-search activity into clear next steps.",
    text: "Use your profile, match patterns and application history to understand where to focus instead of getting generic career advice.",
    href: "/career-assistant",
    cta: "Preview career guidance",
    preview: <div className="rounded-2xl bg-[#090d1f] p-4 text-white shadow-sm"><p className="text-xs font-black text-violet-300">NEXT PRIORITIES</p>{["Strengthen repeated skill gaps","Review stronger-fit roles","Improve application conversion"].map((x,i)=><div key={x} className="mt-3 flex gap-3 rounded-xl bg-white/10 p-3"><span className="text-xs font-black text-violet-300">0{i+1}</span><span className="text-sm font-bold">{x}</span></div>)}</div>,
  },
  {
    eyebrow: "ONE WORKSPACE",
    title: "Move from discovering a role to tracking the outcome.",
    text: "The best part of JobCraft is not one isolated tool. It is the connection between jobs, matching, resumes, certificates and applications.",
    href: "/?auth=signup",
    cta: "Create your workspace",
    preview: <div className="rounded-2xl border border-violet-100 bg-violet-50/70 p-4"><div className="flex flex-wrap items-center justify-between gap-2 text-xs font-black text-violet-700"><span>DISCOVER</span><span>→</span><span>MATCH</span><span>→</span><span>TAILOR</span><span>→</span><span>TRACK</span></div><p className="mt-5 text-sm leading-6 text-slate-600">One connected workflow instead of five disconnected tools.</p></div>,
  },
];

export default function BestOfJobCraft() {
  return <section className="bg-white py-20 sm:py-24">
    <div className="mx-auto max-w-[1380px] px-5 sm:px-8">
      <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
        <div><p className="text-xs font-black tracking-[.18em] text-violet-600">SEE THE PRODUCT BEFORE YOU SIGN UP</p><h2 className="mt-4 text-4xl font-black tracking-[-.045em] sm:text-5xl">The best of JobCraft, visible upfront.</h2></div>
        <p className="max-w-2xl text-lg leading-8 text-slate-600">People should understand the value before creating an account. Here is how the core parts of JobCraft work together across a real job search.</p>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {features.map((feature) => <article key={feature.title} className="group flex min-h-[430px] flex-col rounded-[28px] border border-slate-200 bg-[#fafafe] p-5 transition hover:-translate-y-1 hover:border-violet-200 hover:shadow-[0_25px_70px_rgba(15,23,42,.09)] sm:p-6">
          <div className="min-h-[150px]">{feature.preview}</div>
          <div className="mt-7 flex flex-1 flex-col"><p className="text-xs font-black tracking-[.14em] text-violet-600">{feature.eyebrow}</p><h3 className="mt-3 text-2xl font-black tracking-[-.025em]">{feature.title}</h3><p className="mt-3 flex-1 leading-7 text-slate-600">{feature.text}</p><Link href={feature.href} className="mt-6 inline-flex items-center gap-2 text-sm font-black text-violet-600">{feature.cta} <span className="transition group-hover:translate-x-1">→</span></Link></div>
        </article>)}
      </div>
    </div>
  </section>;
}
