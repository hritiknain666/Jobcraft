import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { saveResumeDraft } from "./actions";

export default async function ResumeBuilderPage({ searchParams }: { searchParams: Promise<{ id?: string; saved?: string; error?: string }> }) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  let resume: any = null;
  if (params.id) {
    const { data } = await supabase.from("resumes").select("*").eq("id", params.id).eq("user_id", user.id).maybeSingle();
    resume = data;
  }
  const d = resume?.structured_data ?? {};
  const completed = [d.full_name,d.email,d.headline,d.summary,(d.skills??[]).length,d.education,d.experience].filter(Boolean).length;
  const strength = Math.round((completed / 7) * 100);

  return <main className="min-h-screen bg-[#f7f8fc] text-[#090d1f]">
    <header className="border-b border-slate-200/70 bg-white"><div className="mx-auto flex max-w-[1380px] items-center justify-between px-5 py-4 sm:px-8"><Link href="/" className="flex items-center gap-3 font-black"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#090d1f] text-sm text-white">JC</span><span className="text-xl">Job<span className="text-violet-600">Craft</span></span></Link><Link href="/resume" className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold">← My resumes</Link></div></header>

    <section className="mx-auto max-w-[1380px] px-5 py-8 sm:px-8 lg:py-10"><div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><div><p className="text-xs font-black tracking-[.14em] text-violet-600">ATS RESUME BUILDER</p><h1 className="mt-2 text-4xl font-black tracking-[-.04em]">Build a clean resume that reads well.</h1><p className="mt-3 max-w-2xl leading-7 text-slate-600">Keep the structure simple, factual and easy for recruiters and applicant tracking systems to scan.</p></div><div className="rounded-2xl border border-slate-200 bg-white px-5 py-4"><div className="flex items-center justify-between gap-6"><div><p className="text-xs font-black tracking-[.12em] text-slate-400">RESUME STRENGTH</p><p className="mt-1 text-sm font-bold text-slate-600">Complete the core sections</p></div><span className="text-3xl font-black text-violet-600">{strength}%</span></div><div className="mt-3 h-2 w-52 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-violet-600" style={{width:`${strength}%`}}/></div></div></div>
    {params.saved&&<p className="mt-5 rounded-xl bg-emerald-50 p-4 text-emerald-800">Resume saved successfully.</p>}{params.error&&<p className="mt-5 rounded-xl bg-red-50 p-4 text-red-700">{params.error}</p>}

    <div className="mt-8 grid gap-6 xl:grid-cols-[1.05fr_.95fr]">
      <form action={saveResumeDraft} className="space-y-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,.05)] sm:p-8"><input type="hidden" name="id" value={resume?.id ?? ""}/>
        <SectionTitle step="01" title="Basics" text="Start with the information recruiters expect at the top."/>
        <Field label="Resume name" name="name" defaultValue={resume?.name ?? "JobCraft Resume"} hint="Internal label only, e.g. Data Analyst Resume"/>
        <div className="grid gap-4 sm:grid-cols-2"><Field label="Full name" name="full_name" defaultValue={d.full_name ?? ""}/><Field label="Email" name="email" defaultValue={d.email ?? user.email ?? ""}/><Field label="Phone" name="phone" defaultValue={d.phone ?? ""}/><Field label="City" name="city" defaultValue={d.city ?? ""}/></div>
        <Field label="Professional headline" name="headline" defaultValue={d.headline ?? ""} placeholder="Data Analyst | SQL | Power BI" hint="Keep this specific and truthful."/>

        <div className="border-t border-slate-100 pt-2"><SectionTitle step="02" title="Professional story" text="Show what you can do without adding anything you cannot defend in an interview."/></div>
        <Area label="Professional summary" name="summary" defaultValue={d.summary ?? ""} placeholder="2–4 concise lines about your background, strengths and target work." hint="Avoid generic claims like hardworking or passionate unless supported by evidence."/>
        <Field label="Skills" name="skills" defaultValue={(d.skills ?? []).join(", ")} placeholder="SQL, Power BI, Excel, Python" hint="Comma separated. Prioritise skills relevant to your target jobs."/>

        <div className="border-t border-slate-100 pt-2"><SectionTitle step="03" title="Evidence" text="Education, experience and projects should prove the skills above."/></div>
        <Area label="Experience" name="experience" defaultValue={d.experience ?? ""} placeholder="Role, company, dates, responsibilities and measurable achievements" hint="Use action + task + result where possible. Never invent metrics."/>
        <Area label="Projects" name="projects" defaultValue={d.projects ?? ""} placeholder="Project name, tools used, what you built or analysed, and outcome"/>
        <Area label="Education" name="education" defaultValue={d.education ?? ""} placeholder="Degree, institution, location, dates"/>
        <Area label="Certifications" name="certifications" defaultValue={d.certifications ?? ""}/>
        <div className="sticky bottom-3 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur"><button className="w-full rounded-xl bg-violet-600 px-5 py-3.5 font-black text-white transition hover:bg-violet-700">Save resume</button></div>
      </form>

      <aside className="xl:sticky xl:top-24 xl:self-start"><section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,.05)] sm:p-8"><div className="flex items-center justify-between"><div><p className="text-xs font-black tracking-[.14em] text-violet-600">ATS PREVIEW</p><p className="mt-1 text-sm text-slate-500">Preview updates after you save.</p></div><span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700">Simple layout</span></div><div className="mt-7 border border-slate-200 bg-white p-7 shadow-sm"><h2 className="text-3xl font-black tracking-tight">{d.full_name || "Your Name"}</h2><p className="mt-1 font-semibold text-slate-600">{d.headline || "Professional headline"}</p><p className="mt-2 text-sm text-slate-500">{[d.email,d.phone,d.city].filter(Boolean).join(" • ") || "email • phone • city"}</p><Preview title="Summary" text={d.summary}/><Preview title="Skills" text={(d.skills??[]).join(" • ")}/><Preview title="Experience" text={d.experience}/><Preview title="Projects" text={d.projects}/><Preview title="Education" text={d.education}/><Preview title="Certifications" text={d.certifications}/></div></section>
      <section className="mt-5 rounded-[24px] border border-violet-100 bg-violet-50 p-6"><p className="text-sm font-black text-violet-950">JobCraft resume rules</p><ul className="mt-3 space-y-2 text-sm leading-6 text-violet-900"><li>• Keep information factual.</li><li>• Prefer measurable outcomes when you genuinely have them.</li><li>• Use standard section names and simple formatting.</li><li>• Tailor emphasis to the job later; never fabricate experience.</li></ul></section></aside>
    </div></section>
  </main>;
}

function SectionTitle({step,title,text}:{step:string;title:string;text:string}){return <div className="mb-4 flex gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#090d1f] text-xs font-black text-white">{step}</span><div><h2 className="text-xl font-black">{title}</h2><p className="mt-1 text-sm leading-6 text-slate-500">{text}</p></div></div>}
function Field({label,name,defaultValue,placeholder="",hint}:{label:string;name:string;defaultValue:string;placeholder?:string;hint?:string}){return <label className="block text-sm font-black">{label}<input name={name} defaultValue={defaultValue} placeholder={placeholder} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 font-normal outline-none focus:border-violet-400 focus:bg-white"/>{hint&&<span className="mt-2 block text-xs font-normal leading-5 text-slate-500">{hint}</span>}</label>}
function Area({label,name,defaultValue,placeholder="",hint}:{label:string;name:string;defaultValue:string;placeholder?:string;hint?:string}){return <label className="block text-sm font-black">{label}<textarea name={name} defaultValue={defaultValue} placeholder={placeholder} rows={5} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 font-normal outline-none focus:border-violet-400 focus:bg-white"/>{hint&&<span className="mt-2 block text-xs font-normal leading-5 text-slate-500">{hint}</span>}</label>}
function Preview({title,text}:{title:string;text?:string}){return <div className="mt-6 border-t border-slate-200 pt-4"><h3 className="text-xs font-black uppercase tracking-[.12em]">{title}</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{text || `Add ${title.toLowerCase()} in the form.`}</p></div>}
