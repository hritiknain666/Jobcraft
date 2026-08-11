import Link from "next/link";

const features = [
  { title: "Smart job discovery", text: "Search roles across India with filters for location, salary, experience, skills and work mode." },
  { title: "JobCraft match score", text: "Understand how your profile aligns with a role before you spend time applying." },
  { title: "ATS resume builder", text: "Create clean, professional resumes and keep tailored versions for different roles." },
  { title: "Application workspace", text: "Track saved roles, interviews, offers and follow-ups from one focused dashboard." },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f7fb] text-slate-950">
      <header className="border-b border-white/70 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-3 text-2xl font-black tracking-tight">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg">JC</span>
            <span>Job<span className="text-violet-600">Craft</span></span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-600 md:flex">
            <Link href="/jobs" className="transition hover:text-slate-950">Jobs</Link>
            <Link href="/resume" className="transition hover:text-slate-950">Resumes</Link>
            <Link href="/applications" className="transition hover:text-slate-950">Applications</Link>
            <Link href="/career-assistant" className="transition hover:text-slate-950">Career Assistant</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="hidden rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100 sm:block">Log in</Link>
            <Link href="/auth/signup" className="rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-slate-300/40 transition hover:-translate-y-0.5">Get started</Link>
          </div>
        </div>
      </header>

      <section className="relative bg-white">
        <div className="absolute inset-x-0 top-0 h-96 bg-[radial-gradient(circle_at_top_left,_rgba(124,58,237,0.13),_transparent_42%),radial-gradient(circle_at_80%_20%,_rgba(14,165,233,0.1),_transparent_36%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-14 px-6 py-20 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:py-28">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-4 py-2 text-sm font-bold text-violet-700">
              <span className="h-2 w-2 rounded-full bg-violet-500" /> Built for the Indian job market
            </div>
            <h1 className="mt-7 max-w-3xl text-5xl font-black leading-[1.02] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
              Your career search, <span className="bg-gradient-to-r from-violet-600 to-indigo-500 bg-clip-text text-transparent">crafted smarter.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">JobCraft brings job discovery, match scoring, resumes and application tracking into one focused workspace designed for India.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/jobs" className="rounded-2xl bg-violet-600 px-7 py-4 text-center font-bold text-white shadow-xl shadow-violet-200/60 transition hover:-translate-y-0.5 hover:bg-violet-700">Explore jobs</Link>
              <Link href="/resume" className="rounded-2xl border border-slate-200 bg-white px-7 py-4 text-center font-bold text-slate-900 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300">Build your resume</Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-7 gap-y-3 text-sm font-semibold text-slate-500">
              <span>✓ ATS-friendly</span><span>✓ India-first filters</span><span>✓ No credit card required</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl [perspective:1600px]">
            <div className="absolute -inset-8 rounded-[3rem] bg-gradient-to-br from-violet-200/40 via-sky-100/20 to-transparent blur-3xl" />
            <div className="relative min-h-[520px] [transform-style:preserve-3d]">
              <div className="absolute left-10 top-8 w-[78%] rounded-[2rem] border border-white/80 bg-white/90 p-5 shadow-[0_35px_80px_rgba(15,23,42,0.14)] backdrop-blur [transform:rotateY(-10deg)_rotateX(4deg)_translateZ(20px)]">
                <div className="flex items-center justify-between"><div><p className="text-xs font-black tracking-[0.18em] text-violet-600">RECOMMENDED ROLE</p><h2 className="mt-2 text-2xl font-black">Data Analyst</h2><p className="mt-1 text-sm text-slate-500">Bengaluru • Hybrid • ₹6–9 LPA</p></div><div className="flex h-20 w-20 items-center justify-center rounded-full border-[9px] border-emerald-100 bg-white text-xl font-black text-emerald-600">87%</div></div>
                <div className="mt-6 grid grid-cols-3 gap-3"><div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold text-slate-400">Skills</p><p className="mt-1 font-black">4/5</p></div><div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold text-slate-400">Experience</p><p className="mt-1 font-black">Strong</p></div><div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold text-slate-400">Work mode</p><p className="mt-1 font-black">Match</p></div></div>
                <div className="mt-5 flex flex-wrap gap-2">{["SQL","Excel","Power BI","Python"].map((skill) => <span key={skill} className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700">{skill} ✓</span>)}</div>
              </div>

              <div className="absolute bottom-16 right-0 w-[62%] rounded-[1.8rem] border border-white/80 bg-slate-950 p-5 text-white shadow-[0_30px_70px_rgba(15,23,42,0.28)] [transform:rotateY(12deg)_rotateX(-3deg)_translateZ(80px)]">
                <p className="text-xs font-black tracking-[0.16em] text-violet-300">APPLICATION FLOW</p>
                <div className="mt-4 space-y-3">{[["Saved","12"],["Applied","8"],["Interview","3"],["Offer","1"]].map(([label,value], index) => <div key={label} className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3"><div className="flex items-center gap-3"><span className={`h-2.5 w-2.5 rounded-full ${index === 3 ? "bg-emerald-400" : "bg-violet-400"}`} /><span className="font-semibold">{label}</span></div><span className="font-black">{value}</span></div>)}</div>
              </div>

              <div className="absolute left-0 top-72 rounded-2xl border border-violet-100 bg-violet-50/95 px-5 py-4 shadow-xl [transform:translateZ(120px)_rotate(-4deg)]"><p className="text-xs font-black text-violet-500">RESUME BOOST</p><p className="mt-1 text-2xl font-black text-violet-800">+18%</p><p className="mt-1 text-xs font-semibold text-violet-700">Match potential</p></div>
              <div className="absolute right-8 top-0 rounded-2xl border border-white/80 bg-white/90 px-4 py-3 shadow-xl [transform:translateZ(140px)_rotate(5deg)]"><p className="text-xs font-bold text-slate-400">Top skill</p><p className="mt-1 font-black">SQL</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200/80 bg-[#fafafe]">
        <div className="mx-auto grid max-w-7xl gap-4 px-6 py-6 sm:grid-cols-2 lg:grid-cols-4">{[["01","Discover"],["02","Match"],["03","Tailor"],["04","Track"]].map(([num,label]) => <div key={label} className="flex items-center gap-4 rounded-2xl bg-white px-5 py-4 shadow-sm"><span className="text-xs font-black text-violet-500">{num}</span><span className="font-black text-slate-900">{label}</span></div>)}</div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid gap-10 lg:grid-cols-[.75fr_1.25fr] lg:items-end"><div><p className="font-black tracking-[0.16em] text-violet-600">ONE CAREER WORKSPACE</p><h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Less switching. Better applications.</h2></div><p className="max-w-2xl text-lg leading-8 text-slate-600">JobCraft is designed to feel calm and focused: the right tools, one workflow, and enough intelligence to help you make stronger decisions without overwhelming you.</p></div>
        <div className="mt-12 grid gap-5 md:grid-cols-2">{features.map((feature, index) => <article key={feature.title} className="rounded-[1.8rem] border border-slate-200 bg-white p-7 shadow-[0_18px_45px_rgba(15,23,42,0.05)]"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black text-white">0{index + 1}</div><h3 className="mt-6 text-2xl font-black">{feature.title}</h3><p className="mt-3 max-w-xl leading-7 text-slate-600">{feature.text}</p></article>)}</div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="overflow-hidden rounded-[2.2rem] bg-slate-950 px-7 py-12 text-white sm:px-12 lg:flex lg:items-center lg:justify-between lg:py-14"><div><p className="font-bold text-violet-300">START WITH YOUR PROFILE</p><h2 className="mt-3 max-w-2xl text-4xl font-black tracking-tight">Build once. Apply smarter across every role.</h2><p className="mt-4 max-w-xl leading-7 text-slate-300">Create your JobCraft profile and resume now. AI upgrades will plug into the same workflow later.</p></div><Link href="/auth/signup" className="mt-8 inline-block rounded-2xl bg-white px-7 py-4 font-black text-slate-950 transition hover:-translate-y-0.5 lg:mt-0">Create free account</Link></div>
      </section>

      <footer className="border-t border-slate-200 bg-white"><div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between"><div><strong className="text-lg text-slate-950">Job<span className="text-violet-600">Craft</span></strong><p className="mt-1">Career tools designed for India.</p></div><div className="flex gap-5"><Link href="/jobs">Jobs</Link><Link href="/resume">Resumes</Link><Link href="/applications">Applications</Link></div></div></footer>
    </main>
  );
}
