import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { deleteResume, uploadResume } from "./actions";

export default async function ResumesPage({ searchParams }: { searchParams: Promise<{ error?: string; message?: string }> }) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: resumes } = await supabase
    .from("resumes")
    .select("id,name,storage_path,is_primary,created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between gap-4">
          <Link href="/dashboard" className="text-2xl font-black text-indigo-600">JobCraft</Link>
          <Link href="/dashboard" className="text-sm font-bold text-slate-600">← Dashboard</Link>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <p className="font-bold text-indigo-600">RESUME VAULT</p>
            <h1 className="mt-2 text-3xl font-black">Upload your resume</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">PDF or DOCX, up to 5 MB. Your resume is stored privately and only accessible to your account.</p>

            {params.error && <p className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">{params.error}</p>}
            {params.message && <p className="mt-5 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{params.message}</p>}

            <form action={uploadResume} className="mt-7 space-y-4">
              <input
                name="resume"
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                required
                className="block w-full rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm"
              />
              <button className="w-full rounded-xl bg-indigo-600 px-5 py-3.5 font-bold text-white hover:bg-indigo-700">Upload resume</button>
            </form>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-indigo-600">MY RESUMES</p>
                <h2 className="mt-2 text-2xl font-black">Saved versions</h2>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-600">{resumes?.length ?? 0}</span>
            </div>

            <div className="mt-6 space-y-3">
              {(resumes ?? []).length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">No resumes uploaded yet.</div>
              ) : (
                resumes?.map((resume) => (
                  <div key={resume.id} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4">
                    <div className="min-w-0">
                      <p className="truncate font-bold text-slate-900">{resume.name}</p>
                      <p className="mt-1 text-xs text-slate-500">Uploaded {new Date(resume.created_at).toLocaleDateString("en-IN")}</p>
                    </div>
                    <form action={deleteResume}>
                      <input type="hidden" name="id" value={resume.id} />
                      <button className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50">Delete</button>
                    </form>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
