import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { saveProfile } from "./actions";

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ error?: string; message?: string }> }) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase.from("profiles").select("full_name,phone,city,headline,experience_years,skills,target_roles,preferred_work_modes").eq("id", user.id).maybeSingle();
  const modes = profile?.preferred_work_modes ?? [];
  const completeness = [profile?.full_name, profile?.city, profile?.headline, profile?.experience_years !== null && profile?.experience_years !== undefined, (profile?.skills?.length ?? 0) > 0, (profile?.target_roles?.length ?? 0) > 0, modes.length > 0].filter(Boolean).length;
  const strength = Math.round((completeness / 7) * 100);

  return <main className="min-h-screen bg-[#f7f8fc] text-[#090d1f]">
    <header className="border-b border-slate-200/70 bg-white"><div className="mx-auto flex max-w-[1200px] items-center justify-between px-5 py-4 sm:px-8"><Link href="/" className="flex items-center gap-3 font-black"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#090d1f] text-sm text-white">JC</span><span className="text-xl">Job<span className="text-violet-600">Craft</span></span></Link><Link href="/dashboard" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold">← Dashboard</Link></div></header>

    <section className="mx-auto grid max-w-[1200px] gap-6 px-5 py-8 sm:px-8 lg:grid-cols-[.68fr_1.32fr] lg:py-10">
      <aside className="space-y-5"><div className="rounded-[26px] bg-[#090d1f] p-7 text-white"><p className="text-xs font-black tracking-[.14em] text-violet-300">PROFILE STRENGTH</p><div className="mt-4 flex items-end justify-between"><div><h1 className="text-3xl font-black">Make matching work for you.</h1><p className="mt-3 leading-7 text-slate-300">JobCraft uses your skills, target roles, experience, city and work preferences to rank jobs more usefully.</p></div></div><div className="mt-6 flex items-center gap-4"><div className="flex h-20 w-20 items-center justify-center rounded-full border-[8px] border-violet-400/30 bg-white/5 text-xl font-black">{strength}%</div><p className="text-sm leading-6 text-slate-300">The more complete this profile is, the more useful your match score becomes.</p></div></div>
      <div className="rounded-[24px] border border-slate-200 bg-white p-6"><p className="text-sm font-black">What this changes</p><div className="mt-4 space-y-4 text-sm text-slate-600">{[["Skills","Improves matched and missing skill signals."],["Target roles","Helps prioritise relevant job titles."],["Work mode","Lets us score remote, hybrid or on-site fit."],["City","Improves location relevance."]].map(([a,b])=><div key={a}><b className="text-slate-900">{a}</b><p className="mt-1 leading-5">{b}</p></div>)}</div></div></aside>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,.05)] sm:p-8"><p className="text-xs font-black tracking-[.14em] text-violet-600">YOUR CAREER PROFILE</p><h2 className="mt-2 text-3xl font-black tracking-[-.035em]">Tell us what a good opportunity looks like.</h2><p className="mt-3 max-w-2xl leading-7 text-slate-600">Keep it factual. JobCraft will use this data for recommendations and match scoring.</p>
      {params.error&&<p className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">{params.error}</p>}{params.message&&<p className="mt-5 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{params.message}</p>}
      <form action={saveProfile} className="mt-8 grid gap-5 md:grid-cols-2">
        <Field label="Full name" name="fullName" required defaultValue={profile?.full_name ?? user.user_metadata?.full_name ?? ""}/><Field label="Phone" name="phone" type="tel" defaultValue={profile?.phone ?? ""}/><Field label="City" name="city" placeholder="e.g. Bengaluru" defaultValue={profile?.city ?? ""}/><Field label="Experience (years)" name="experienceYears" type="number" min="0" max="50" step="0.5" defaultValue={profile?.experience_years ?? ""}/>
        <div className="md:col-span-2"><Field label="Professional headline" name="headline" placeholder="e.g. Data Analyst | SQL | Power BI" defaultValue={profile?.headline ?? ""}/><p className="mt-2 text-xs text-slate-500">Use a short headline that reflects the work you actually do or are targeting.</p></div>
        <div className="md:col-span-2"><Field label="Skills" name="skills" placeholder="SQL, Power BI, Excel, Python" defaultValue={(profile?.skills ?? []).join(", ")}/><p className="mt-2 text-xs text-slate-500">Comma separated. Only include skills you can genuinely demonstrate.</p></div>
        <div className="md:col-span-2"><Field label="Target roles" name="targetRoles" placeholder="Data Analyst, Business Analyst" defaultValue={(profile?.target_roles ?? []).join(", ")}/><p className="mt-2 text-xs text-slate-500">Add 1–3 roles you would seriously consider applying for.</p></div>
        <fieldset className="md:col-span-2"><legend className="text-sm font-black">Preferred work mode</legend><div className="mt-3 grid gap-3 sm:grid-cols-3">{["On-site","Hybrid","Remote"].map(mode=><label key={mode} className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 font-semibold transition hover:border-violet-300"><input type="checkbox" name="workMode" value={mode} defaultChecked={modes.includes(mode)} className="h-4 w-4 accent-violet-600"/>{mode}</label>)}</div></fieldset>
        <div className="md:col-span-2 flex flex-col gap-3 border-t border-slate-100 pt-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-slate-500">You can update this any time as your job search changes.</p><button className="rounded-xl bg-violet-600 px-6 py-3.5 font-black text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700">Save profile</button></div>
      </form></section>
    </section>
  </main>;
}

function Field({label,name,defaultValue,placeholder="",type="text",required=false,min,max,step}:{label:string;name:string;defaultValue:string|number;placeholder?:string;type?:string;required?:boolean;min?:string|number;max?:string|number;step?:string|number}){return <label className="block text-sm font-black">{label}<input name={name} required={required} type={type} min={min} max={max} step={step} defaultValue={defaultValue} placeholder={placeholder} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 font-normal outline-none transition focus:border-violet-400 focus:bg-white"/></label>}
