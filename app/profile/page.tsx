import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { saveProfile } from "./actions";

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ error?: string; message?: string }> }) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name,phone,city,headline,experience_years,skills,target_roles,preferred_work_modes")
    .eq("id", user.id)
    .maybeSingle();

  const modes = profile?.preferred_work_modes ?? [];

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between gap-4">
          <Link href="/dashboard" className="text-2xl font-black text-indigo-600">JobCraft</Link>
          <Link href="/dashboard" className="text-sm font-bold text-slate-600">← Dashboard</Link>
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="font-bold text-indigo-600">YOUR PROFILE</p>
          <h1 className="mt-2 text-3xl font-black">Tell JobCraft what you’re looking for</h1>
          <p className="mt-2 text-slate-600">We’ll use this later to improve your job recommendations and match scores.</p>

          {params.error && <p className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">{params.error}</p>}
          {params.message && <p className="mt-5 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{params.message}</p>}

          <form action={saveProfile} className="mt-8 grid gap-5 md:grid-cols-2">
            <label className="text-sm font-bold">Full name
              <input name="fullName" required defaultValue={profile?.full_name ?? user.user_metadata?.full_name ?? ""} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3" />
            </label>
            <label className="text-sm font-bold">Phone
              <input name="phone" type="tel" defaultValue={profile?.phone ?? ""} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3" />
            </label>
            <label className="text-sm font-bold">City
              <input name="city" placeholder="e.g. Bengaluru" defaultValue={profile?.city ?? ""} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3" />
            </label>
            <label className="text-sm font-bold">Experience (years)
              <input name="experienceYears" type="number" min="0" max="50" step="0.5" defaultValue={profile?.experience_years ?? ""} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3" />
            </label>
            <label className="text-sm font-bold md:col-span-2">Professional headline
              <input name="headline" placeholder="e.g. Data Analyst | SQL | Power BI" defaultValue={profile?.headline ?? ""} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3" />
            </label>
            <label className="text-sm font-bold md:col-span-2">Skills <span className="font-normal text-slate-500">(comma separated)</span>
              <input name="skills" placeholder="SQL, Power BI, Excel, Python" defaultValue={(profile?.skills ?? []).join(", ")} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3" />
            </label>
            <label className="text-sm font-bold md:col-span-2">Target roles <span className="font-normal text-slate-500">(comma separated)</span>
              <input name="targetRoles" placeholder="Data Analyst, Business Analyst" defaultValue={(profile?.target_roles ?? []).join(", ")} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3" />
            </label>

            <fieldset className="md:col-span-2">
              <legend className="text-sm font-bold">Preferred work mode</legend>
              <div className="mt-3 flex flex-wrap gap-4 text-sm">
                {["On-site", "Hybrid", "Remote"].map((mode) => (
                  <label key={mode} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <input type="checkbox" name="workMode" value={mode} defaultChecked={modes.includes(mode)} />
                    {mode}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="md:col-span-2">
              <button className="rounded-xl bg-indigo-600 px-6 py-3.5 font-bold text-white hover:bg-indigo-700">Save profile</button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
