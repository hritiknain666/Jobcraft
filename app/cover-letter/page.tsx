import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function CoverLetterPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: letters } = await supabase.from("cover_letters").select("id,title,body,created_at").eq("user_id", user.id).order("created_at", { ascending: false });
  const selected = params.id ? letters?.find((letter) => letter.id === params.id) : letters?.[0];

  return <main className="min-h-screen bg-slate-50 px-6 py-10"><div className="mx-auto max-w-6xl">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="font-bold text-indigo-600">COVER LETTERS</p><h1 className="mt-2 text-4xl font-black">Your application letters</h1><p className="mt-2 text-slate-600">Current drafts use a truthful rules-based template. AI rewriting can be added later.</p></div><Link href="/jobs" className="rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white">Choose a job</Link></div>
    <div className="mt-8 grid gap-6 lg:grid-cols-[320px_1fr]"><aside className="space-y-3">{letters?.length ? letters.map((letter) => <Link key={letter.id} href={`/cover-letter?id=${letter.id}`} className={`block rounded-2xl border p-4 ${selected?.id === letter.id ? "border-indigo-300 bg-indigo-50" : "border-slate-200 bg-white"}`}><div className="font-black">{letter.title}</div><div className="mt-1 text-xs text-slate-500">{new Date(letter.created_at).toLocaleDateString()}</div></Link>) : <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">No letters yet. Open a job and generate one.</div>}</aside>
    <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">{selected ? <><h2 className="text-2xl font-black">{selected.title}</h2><div className="mt-6 whitespace-pre-wrap rounded-2xl bg-slate-50 p-6 leading-8 text-slate-700">{selected.body}</div><p className="mt-5 text-sm text-slate-500">AI will later improve tone and specificity while keeping facts grounded in the user profile and resume.</p></> : <div className="py-16 text-center"><h2 className="text-xl font-black">Create your first cover letter</h2><p className="mt-2 text-slate-600">Select a job from Job Search.</p></div>}</section></div>
  </div></main>;
}
