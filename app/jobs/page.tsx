import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

function matchDetails(jobSkills:string[],userSkills:string[]){if(!userSkills.length||!jobSkills.length)return null;const n=new Set(userSkills.map(s=>s.toLowerCase()));const matched=jobSkills.filter(s=>n.has(s.toLowerCase()));const missing=jobSkills.filter(s=>!n.has(s.toLowerCase()));return{score:Math.round(matched.length/jobSkills.length*100),matched,missing}}
function initials(company:string){return company.split(" ").filter(Boolean).slice(0,2).map(w=>w[0]).join("").toUpperCase()}

export default async function JobsPage({searchParams}:{searchParams:Promise<Record<string,string|undefined>>}){
  const params=await searchParams;
  const supabase=await createClient();
  const{data:{user}}=await supabase.auth.getUser();
  let userSkills:string[]=[];
  if(user){const{data:p}=await supabase.from("profiles").select("skills").eq("id",user.id).maybeSingle();userSkills=p?.skills??[]}

  let query=supabase.from("jobs").select("*").eq("is_active",true).order("posted_at",{ascending:false});
  if(params.q)query=query.or(`title.ilike.%${params.q}%,company.ilike.%${params.q}%,description.ilike.%${params.q}%`);
  if(params.location)query=query.ilike("location",`%${params.location}%`);
  if(params.work_mode)query=query.eq("work_mode",params.work_mode);
  if(params.experience)query=query.lte("experience_min",Number(params.experience));
  if(params.salary)query=query.gte("salary_max_lpa",Number(params.salary));
  if(params.skill)query=query.contains("skills",[params.skill]);
  const{data:jobs,error}=await query;

  return <main className="min-h-screen bg-[#f6f7fb] text-[#0b1020]">
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-4 sm:px-8">
        <Link href="/" className="flex items-center gap-3 font-black"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0b1020] text-sm text-white">JC</span><span className="text-xl">Job<span className="text-violet-600">Craft</span></span></Link>
        <nav className="hidden gap-8 text-sm font-bold text-slate-500 md:flex"><Link href="/jobs" className="text-slate-950">Jobs</Link><Link href="/resume" className="hover:text-slate-950">Resume</Link><Link href="/applications" className="hover:text-slate-950">Applications</Link><Link href="/career-assistant" className="hover:text-slate-950">Career Assistant</Link></nav>
        {user?<Link href="/dashboard" className="rounded-xl bg-[#0b1020] px-5 py-3 text-sm font-black text-white">Dashboard</Link>:<div className="flex items-center gap-3"><Link href="/jobs?auth=login" scroll={false} className="hidden text-sm font-black sm:block">Log in</Link><Link href="/jobs?auth=signup" scroll={false} className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-black text-white">Join free</Link></div>}
      </div>
    </header>

    <section className="relative overflow-hidden border-b border-slate-200/70 bg-white">
      <div className="absolute -left-20 top-8 h-64 w-64 rounded-full bg-violet-200/35 blur-3xl"/>
      <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-sky-200/30 blur-3xl"/>
      <div className="relative mx-auto max-w-[1400px] px-5 py-10 sm:px-8 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[.82fr_1.18fr] lg:items-center">
          <div>
            <p className="text-xs font-black tracking-[.18em] text-violet-600">JOB DISCOVERY</p>
            <h1 className="mt-3 text-4xl font-black tracking-[-.055em] sm:text-5xl">Find the roles worth opening.</h1>
            <p className="mt-4 max-w-xl text-lg leading-8 text-slate-600">Search by role, city, salary, experience, skills and work mode. Then see the fit before you apply.</p>
          </div>
          <div className="rounded-[28px] border border-violet-100 bg-[linear-gradient(135deg,#f7f2ff_0%,#ffffff_48%,#eef9ff_100%)] p-5 shadow-[0_24px_70px_rgba(79,70,229,.10)]">
            <div className="flex items-center justify-between gap-4"><div><p className="text-[10px] font-black tracking-[.15em] text-violet-600">WHAT YOU GET</p><p className="mt-1 text-xl font-black">Search + match in one view</p></div><span className="rounded-full bg-white px-3 py-1.5 text-xs font-black text-slate-500 shadow-sm">INDIA-FIRST</span></div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">{[["₹ LPA","Salary context"],["Skills","Matched + missing"],["Mode","Remote / Hybrid / On-site"]].map(([a,b])=><div key={a} className="rounded-2xl bg-white p-4 shadow-sm"><p className="text-sm font-black text-violet-700">{a}</p><p className="mt-1 text-xs leading-5 text-slate-500">{b}</p></div>)}</div>
          </div>
        </div>

        <form className="mt-8 rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_20px_55px_rgba(15,23,42,.08)]">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-6">
            <input name="q" defaultValue={params.q} placeholder="Role, skill or company" className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none transition focus:border-violet-400 focus:bg-white lg:col-span-2"/>
            <input name="location" defaultValue={params.location} placeholder="City" className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none transition focus:border-violet-400 focus:bg-white"/>
            <select name="work_mode" defaultValue={params.work_mode??""} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5"><option value="">Any work mode</option><option>On-site</option><option>Hybrid</option><option>Remote</option></select>
            <input name="salary" defaultValue={params.salary} type="number" min="0" step="0.5" placeholder="Min LPA" className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5"/>
            <input name="skill" defaultValue={params.skill} placeholder="Skill e.g. SQL" className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5"/>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3"><button className="rounded-xl bg-violet-600 px-6 py-3.5 font-black text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5">Search jobs</button><Link href="/jobs" className="rounded-xl border border-slate-200 bg-white px-6 py-3.5 font-black text-slate-600">Clear</Link><div className="ml-auto hidden gap-2 lg:flex">{["SQL","Power BI","Business Analysis"].map(skill=><Link key={skill} href={`/jobs?skill=${encodeURIComponent(skill)}`} className="rounded-full bg-slate-100 px-3 py-2 text-xs font-black text-slate-600 hover:bg-violet-50 hover:text-violet-700">{skill}</Link>)}</div></div>
        </form>
      </div>
    </section>

    <section className="mx-auto grid max-w-[1400px] gap-6 px-5 py-8 sm:px-8 lg:grid-cols-[1fr_300px]">
      <div>
        <div className="mb-4 flex items-end justify-between gap-4"><div><p className="text-xs font-black tracking-[.14em] text-violet-600">RESULTS</p><h2 className="mt-1 text-2xl font-black">{jobs?.length??0} sample roles</h2></div>{!user&&<Link href="/jobs?auth=signup" scroll={false} className="text-sm font-black text-violet-600">Create profile for match →</Link>}</div>
        {error&&<p className="mb-4 rounded-xl bg-red-50 p-4 text-red-700">Could not load jobs: {error.message}</p>}
        <div className="space-y-4">{(jobs??[]).map(job=>{const match=matchDetails(job.skills??[],userSkills);const tone=match&&match.score>=70?"text-emerald-600":match&&match.score>=45?"text-amber-600":"text-slate-700";return <article key={job.id} className="group overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,.05)] transition hover:-translate-y-1 hover:border-violet-200 hover:shadow-[0_24px_55px_rgba(15,23,42,.10)]"><div className="grid lg:grid-cols-[1fr_215px]"><div className="p-5 sm:p-6"><div className="flex gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#0b1020] text-sm font-black text-white">{initials(job.company)}</div><div><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-black text-violet-600">{job.company}</p><span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-black text-amber-700">SAMPLE ROLE</span></div><h3 className="mt-1 text-2xl font-black">{job.title}</h3><p className="mt-2 text-sm text-slate-500">{job.location} · {job.work_mode} · {job.salary_min_lpa?`₹${job.salary_min_lpa}–${job.salary_max_lpa} LPA`:"Salary not listed"}</p></div></div><p className="mt-5 line-clamp-2 leading-7 text-slate-600">{job.description}</p><div className="mt-4 flex flex-wrap gap-2">{(job.skills??[]).slice(0,6).map((skill:string)=>{const yes=match?.matched.some(x=>x.toLowerCase()===skill.toLowerCase());return <span key={skill} className={`rounded-lg px-3 py-1.5 text-xs font-black ${yes?"bg-emerald-50 text-emerald-700":"bg-slate-100 text-slate-600"}`}>{skill}{yes?" ✓":""}</span>})}</div></div><aside className="border-t border-slate-100 bg-slate-50/70 p-5 lg:border-l lg:border-t-0">{match?<><div className="flex items-end justify-between"><div><p className="text-[10px] font-black tracking-[.14em] text-slate-400">YOUR MATCH</p><p className="mt-1 font-black">{match.score>=70?"Strong fit":match.score>=45?"Potential fit":"Review first"}</p></div><span className={`text-3xl font-black ${tone}`}>{match.score}%</span></div><div className="mt-3 h-2 rounded-full bg-slate-200"><div className="h-2 rounded-full bg-emerald-500" style={{width:`${match.score}%`}}/></div><p className="mt-3 text-xs leading-5 text-slate-500">{match.missing.length?`${match.missing.length} listed skill gap${match.missing.length===1?"":"s"}.`:"Core listed skills covered."}</p></>:<><p className="text-[10px] font-black tracking-[.14em] text-violet-600">UNLOCK YOUR FIT</p><p className="mt-2 font-black">See matched + missing skills</p><p className="mt-2 text-xs leading-5 text-slate-500">Add your profile skills to make each role easier to judge.</p></>}<Link href={`/jobs/${job.id}`} className="mt-5 block rounded-xl bg-[#0b1020] px-4 py-3 text-center text-sm font-black text-white transition group-hover:bg-violet-600">View role →</Link></aside></div></article>})}</div>
        {!jobs?.length&&!error&&<div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-600">No sample roles matched. Try a wider search.</div>}
      </div>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-[24px] border border-amber-200 bg-amber-50 p-5"><p className="text-xs font-black tracking-[.14em] text-amber-700">PROTOTYPE DATA</p><p className="mt-2 font-black text-amber-950">These are sample roles.</p><p className="mt-2 text-sm leading-6 text-amber-900">They demonstrate search and matching only. They are not live employer vacancies yet.</p></div>
        <div className="rounded-[24px] border border-violet-100 bg-white p-5 shadow-sm"><p className="text-xs font-black tracking-[.14em] text-violet-600">HOW MATCH WORKS</p><div className="mt-4 space-y-3">{[["Skills","Core role skills"],["Experience","Your years vs role need"],["Location","City preference"],["Work mode","Remote, Hybrid or On-site"]].map(([a,b],i)=><div key={a} className="flex gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-xs font-black text-violet-700">{i+1}</span><div><p className="text-sm font-black">{a}</p><p className="text-xs text-slate-500">{b}</p></div></div>)}</div></div>
      </aside>
    </section>
  </main>
}
