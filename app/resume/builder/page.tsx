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

  return <main className="min-h-screen bg-slate-50 px-6 py-10"><div className="mx-auto max-w-6xl">
    <div className="flex items-end justify-between gap-4"><div><Link href="/resume" className="text-sm font-bold text-indigo-600">← My resumes</Link><h1 className="mt-2 text-4xl font-black">ATS Resume Builder</h1><p className="mt-2 text-slate-600">A clean, Indian-market friendly resume structure designed for ATS readability.</p></div></div>
    {params.saved && <p className="mt-5 rounded-xl bg-emerald-50 p-4 text-emerald-800">Resume saved.</p>}{params.error && <p className="mt-5 rounded-xl bg-red-50 p-4 text-red-700">{params.error}</p>}

    <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
      <form action={saveResumeDraft} className="space-y-5 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
        <input type="hidden" name="id" value={resume?.id ?? ""}/>
        <Field label="Resume name" name="name" defaultValue={resume?.name ?? "JobCraft Resume"}/>
        <div className="grid gap-4 sm:grid-cols-2"><Field label="Full name" name="full_name" defaultValue={d.full_name ?? ""}/><Field label="Email" name="email" defaultValue={d.email ?? user.email ?? ""}/><Field label="Phone" name="phone" defaultValue={d.phone ?? ""}/><Field label="City" name="city" defaultValue={d.city ?? ""}/></div>
        <Field label="Professional headline" name="headline" defaultValue={d.headline ?? ""} placeholder="Data Analyst | SQL | Power BI"/>
        <Area label="Professional summary" name="summary" defaultValue={d.summary ?? ""}/>
        <Field label="Skills (comma separated)" name="skills" defaultValue={(d.skills ?? []).join(", ")}/>
        <Area label="Education" name="education" defaultValue={d.education ?? ""} placeholder="Degree, institution, location, dates"/>
        <Area label="Experience" name="experience" defaultValue={d.experience ?? ""} placeholder="Role, company, dates, responsibilities and measurable achievements"/>
        <Area label="Projects" name="projects" defaultValue={d.projects ?? ""}/>
        <Area label="Certifications" name="certifications" defaultValue={d.certifications ?? ""}/>
        <button className="w-full rounded-xl bg-indigo-600 px-5 py-3.5 font-bold text-white">Save resume</button>
      </form>

      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"><p className="text-xs font-black tracking-widest text-slate-400">LIVE ATS PREVIEW</p><h2 className="mt-4 text-3xl font-black">{d.full_name || "Your Name"}</h2><p className="mt-1 font-semibold text-slate-600">{d.headline || "Professional headline"}</p><p className="mt-2 text-sm text-slate-500">{[d.email, d.phone, d.city].filter(Boolean).join(" • ") || "email • phone • city"}</p>
      <Preview title="Summary" text={d.summary}/><Preview title="Skills" text={(d.skills ?? []).join(" • ")}/><Preview title="Experience" text={d.experience}/><Preview title="Education" text={d.education}/><Preview title="Projects" text={d.projects}/><Preview title="Certifications" text={d.certifications}/></section>
    </div>
  </div></main>;
}

function Field({ label, name, defaultValue, placeholder = "" }: { label: string; name: string; defaultValue: string; placeholder?: string }) { return <label className="block text-sm font-bold">{label}<input name={name} defaultValue={defaultValue} placeholder={placeholder} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"/></label>; }
function Area({ label, name, defaultValue, placeholder = "" }: { label: string; name: string; defaultValue: string; placeholder?: string }) { return <label className="block text-sm font-bold">{label}<textarea name={name} defaultValue={defaultValue} placeholder={placeholder} rows={5} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"/></label>; }
function Preview({ title, text }: { title: string; text?: string }) { return <div className="mt-7 border-t border-slate-200 pt-4"><h3 className="text-sm font-black uppercase tracking-wide">{title}</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{text || `Add ${title.toLowerCase()} in the form.`}</p></div>; }
