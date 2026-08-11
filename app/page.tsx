const features = [
  { icon: "🔎", title: "AI Job Search", text: "Search relevant Indian jobs with filters for location, salary, experience, skills and work mode." },
  { icon: "🤖", title: "AI Job Matching", text: "Upload your resume and see how well your experience and skills match each opportunity." },
  { icon: "📄", title: "Resume Builder", text: "Create ATS-friendly professional resumes and keep different versions for different roles." },
  { icon: "✍️", title: "Resume Tailoring", text: "Adapt your existing resume to a selected job while keeping your experience truthful." },
  { icon: "📨", title: "Cover Letters", text: "Generate job-specific cover letters using your real background and the job description." },
  { icon: "📊", title: "Application Tracker", text: "Track saved, applied, interview, rejected and offer stages from one dashboard." },
  { icon: "🧑‍💻", title: "Career Assistant", text: "Understand skill gaps, improve your applications and discover roles that fit your profile." },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <a href="#" className="text-2xl font-black tracking-tight text-indigo-600">JobCraft</a>
          <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-600 md:flex">
            <a href="#features" className="hover:text-indigo-600">Features</a>
            <a href="#how-it-works" className="hover:text-indigo-600">How it works</a>
            <a href="#" className="hover:text-indigo-600">Jobs</a>
          </nav>
          <div className="flex items-center gap-3">
            <button className="hidden rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 sm:block">Log in</button>
            <button className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-indigo-700">Get started</button>
          </div>
        </div>
      </header>

      <section className="overflow-hidden bg-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-2 lg:items-center lg:py-28">
          <div>
            <div className="mb-5 inline-flex rounded-full bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-700">AI career platform built for India 🇮🇳</div>
            <h1 className="max-w-3xl text-5xl font-black leading-tight tracking-tight sm:text-6xl">Find jobs you’re actually <span className="text-indigo-600">a match for.</span></h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">Upload your resume once. JobCraft helps you discover better-fit jobs, understand your match score, tailor your resume and track every application.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button className="rounded-xl bg-indigo-600 px-7 py-4 font-bold text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700">Upload resume — free</button>
              <button className="rounded-xl border border-slate-300 bg-white px-7 py-4 font-bold text-slate-800 hover:bg-slate-50">Browse jobs</button>
            </div>
            <p className="mt-4 text-sm text-slate-500">No credit card required • ATS-friendly • Built for Indian job seekers</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-xl shadow-slate-200/50">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-indigo-600">RECOMMENDED FOR YOU</p>
                  <h2 className="mt-2 text-2xl font-black">Data Analyst</h2>
                  <p className="mt-1 text-slate-500">Bengaluru • Hybrid • ₹6–9 LPA</p>
                </div>
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-8 border-emerald-100 text-xl font-black text-emerald-600">87%</div>
              </div>
              <div className="mt-6 border-t border-slate-100 pt-5">
                <p className="font-bold">Why you match</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["SQL ✓", "Power BI ✓", "Excel ✓", "Python ✓"].map((skill) => <span key={skill} className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">{skill}</span>)}
                  <span className="rounded-lg bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700">Tableau — missing</span>
                </div>
                <button className="mt-6 w-full rounded-xl bg-slate-950 px-5 py-3.5 font-bold text-white">View match details</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-6 py-20">
        <div className="max-w-2xl">
          <p className="font-bold text-indigo-600">EVERYTHING IN ONE PLACE</p>
          <h2 className="mt-3 text-4xl font-black tracking-tight">Your complete AI job-search toolkit</h2>
          <p className="mt-4 text-lg text-slate-600">From discovering a role to preparing your application and tracking the result.</p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <article key={feature.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-3xl">{feature.icon}</div>
              <h3 className="mt-5 text-xl font-black">{feature.title}</h3>
              <p className="mt-3 leading-7 text-slate-600">{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <p className="font-bold text-indigo-300">HOW JOBCRAFT WORKS</p>
          <h2 className="mt-3 text-4xl font-black tracking-tight">One resume. A smarter job search.</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-4">
            {["Upload your resume", "Get AI-matched jobs", "Tailor your application", "Track your progress"].map((step, index) => (
              <div key={step}>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500 font-black">{index + 1}</div>
                <h3 className="mt-5 text-lg font-bold">{step}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <strong className="text-lg text-slate-900">JobCraft</strong>
          <span>Built to help Indian job seekers make better applications.</span>
        </div>
      </footer>
    </main>
  );
}
