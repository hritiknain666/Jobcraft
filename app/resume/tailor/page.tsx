import Link from "next/link";
import { redirect } from "next/navigation";
import WorkspaceShell from "@/components/workspace-shell";
import { createClient } from "@/lib/supabase/server";

export default async function ResumeTailoringPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/dashboard?auth=login&next=%2Fresume%2Ftailor");

  const [{ data: profile }, { data: tailored }] = await Promise.all([
    supabase.from("profiles").select("full_name,headline").eq("id", user.id).maybeSingle(),
    supabase.from("tailored_resumes").select("id,title,created_at,job_id,source_resume_id").eq("user_id", user.id).order("created_at", { ascending: false }),
  ]);

  const displayName = profile?.full_name?.trim() || user.user_metadata?.full_name || "Your profile";

  return (
    <WorkspaceShell active="resume-tailor" name={displayName} headline={profile?.headline} authenticated>
      <div className="jc-content-wrap">
        <section className="jc-dashboard-head">
          <div>
            <p className="jc-eyebrow">ROLE-SPECIFIC EVIDENCE</p>
            <h1 className="jc-page-title">Resume tailoring</h1>
            <p className="jc-page-copy max-w-2xl">Create a role-specific plan from your real resume and profile. JobCraft changes emphasis, not facts.</p>
          </div>
          <Link href="/jobs" className="jc-button-primary">Choose a role <span>→</span></Link>
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-[.72fr_1.28fr]">
          <aside className="jc-dark-card p-7">
            <p className="jc-eyebrow !text-[#f49a48]">HOW IT WORKS</p>
            <h2 className="jc-section-title !mt-3 !text-white">Tailor without inventing.</h2>
            <div className="mt-6 space-y-5 text-sm leading-6 text-[#b6c7c0]">
              <p><b className="text-white">1. Choose a job</b><br/>Start from a role you are genuinely considering.</p>
              <p><b className="text-white">2. Choose your source resume</b><br/>JobCraft keeps your existing evidence as the source of truth.</p>
              <p><b className="text-white">3. Reorder the emphasis</b><br/>Bring relevant skills, projects and experience forward without adding fake claims.</p>
            </div>
            <Link href="/resume" className="mt-7 inline-block text-sm font-extrabold text-[#f49a48] no-underline">Open Resume Studio ↗</Link>
          </aside>

          <section className="jc-card p-7">
            <div className="jc-section-head">
              <div>
                <p className="jc-eyebrow">YOUR ROLE VERSIONS</p>
                <h2 className="jc-section-title">Saved tailoring plans</h2>
                <p className="jc-section-subtitle">Open any plan to review what JobCraft recommends emphasising for that role.</p>
              </div>
              <span className="jc-chip">{tailored?.length ?? 0} saved</span>
            </div>

            <div className="jc-role-list">
              {tailored?.length ? tailored.map((item) => (
                <Link key={item.id} href={`/resume/tailor/${item.id}`} className="jc-role-row">
                  <span className="jc-company-dot">RT</span>
                  <span className="jc-role-copy">
                    <b>{item.title}</b>
                    <span>Created {new Date(item.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
                  </span>
                  <span className="jc-role-meta"><span className="jc-match-pill">Factual plan</span></span>
                  <span aria-hidden="true">›</span>
                </Link>
              )) : (
                <div className="py-12 text-center">
                  <h3 className="jc-serif text-2xl font-bold text-[#173f33]">No tailored versions yet.</h3>
                  <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#789087]">Open a job, choose one of your resumes and create a role-specific version. Your original facts stay unchanged.</p>
                  <Link href="/jobs" className="jc-button-primary mt-6">Find a role to tailor →</Link>
                </div>
              )}
            </div>
          </section>
        </section>
      </div>
    </WorkspaceShell>
  );
}
