import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/auth/actions";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const [{ data: profile }, { count: resumeCount }, { count: applicationCount }] = await Promise.all([
    supabase.from("profiles").select("full_name,city,target_roles,skills").eq("id", user.id).maybeSingle(),
    supabase.from("resumes").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("applications").select("id", { count: "exact", head: true }).eq("user_id", user.id),
  ]);

  const profileReady = Boolean(profile?.full_name && (profile?.target_roles?.length ?? 0) > 0);
  const hasResume = (resumeCount ?? 0) > 0;

  const cards = [
    ["👤", "Profile", profileReady ? "Profile ready for matching." : "Add skills, city and target roles.", "/profile"],
    ["📄", "Resumes", `${resumeCount ?? 0} resume${resumeCount === 1 ? "" : "s"} saved.`, "/resume"],
    ["🔎", "Job matches", "Search jobs and see your JobCraft match score.", "/jobs"],
    ["📊", "Applications", `${applicationCount ?? 0} job${applicationCount === 1 ? "" : "s"} in your tracker.`, "/applications"],
    ["✍️", "Resume Builder", "Build ATS-friendly resume versions for different roles.", "/resume/builder"],
    ["📨", "Cover Letters", "Create and manage job-specific cover-letter drafts.", "/cover-letter"],
    ["🧑‍💻", "Career Assistant", "See skill gaps, match recommendations and application insights.", "/career-assistant"],
  ];

  return <main className="min-h-screen bg-slate-50"><header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5"><Link href="/" className="text-2xl font-black text-indigo-600">JobCraft</Link><div className="flex items-center gap-3"><Link href="/profile" className="rounded-xl px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100">Profile</Link><form action={logout}><button className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold">Log out</button></form></div></div></header>
  <section className="mx-auto max-w-7xl px-6 py-12"><p className="font-bold text-indigo-600">YOUR DASHBOARD</p><h1 className="mt-2 text-4xl font-black">Hi {profile?.full_name?.split(" ")[0] ?? "there"}, let’s build your job search.</h1><p className="mt-3 text-slate-600">{profile?.city ? `${profile.city} • ` : ""}{user.email}</p>
  <div className="mt-8 rounded-2xl border border-indigo-100 bg-indigo-50 p-5"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><p className="font-black text-indigo-950">Setup progress</p><p className="mt-1 text-sm text-indigo-800">Complete your profile and add a resume to get the strongest matching results.</p></div><div className="text-2xl font-black text-indigo-700">{profileReady && hasResume ? "100%" : profileReady || hasResume ? "50%" : "0%"}</div></div></div>
  <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">{cards.map(([icon,title,text,href]) => <Link key={title} href={href} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><div className="text-2xl">{icon}</div><h2 className="mt-4 text-lg font-black">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p><p className="mt-4 text-sm font-bold text-indigo-600">Open →</p></Link>)}</div>
  <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><strong>AI status:</strong> the full product flows are being built without paid AI first. Later we can connect one API layer for semantic resume parsing, smarter matching, rewriting and conversational career guidance.</div>
  </section></main>;
}
