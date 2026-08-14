import Link from "next/link";
import WorkspaceShell from "@/components/workspace-shell";

export default function ResumeTailorPreviewPage() {
  return (
    <WorkspaceShell active="resume-tailor" authenticated={false} name="Your profile" headline="Candidate" strength={0}>
      <div className="jc-content-wrap">
        <section className="jc-dashboard-head">
          <div>
            <p className="jc-eyebrow">ROLE-SPECIFIC EVIDENCE</p>
            <h1 className="jc-page-title">Resume tailoring</h1>
            <p className="jc-page-copy max-w-2xl">See how JobCraft adapts emphasis for a real role without changing your facts. Sign in only when you want to create and save your own tailored version.</p>
          </div>
          <Link href="/jobs" className="jc-button-primary">Browse roles <span>→</span></Link>
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-[.72fr_1.28fr]">
          <aside className="jc-dark-card p-7">
            <p className="jc-eyebrow !text-[#f49a48]">HOW IT WORKS</p>
            <h2 className="jc-section-title !mt-3 !text-white">Tailor without inventing.</h2>
            <div className="mt-6 space-y-5 text-sm leading-6 text-[#b6c7c0]">
              <p><b className="text-white">1. Choose a job</b><br/>Start from a role you genuinely want to consider.</p>
              <p><b className="text-white">2. Choose your source resume</b><br/>Your real resume stays the source of truth.</p>
              <p><b className="text-white">3. Reorder the emphasis</b><br/>Relevant skills, projects and experience move forward without adding fake claims.</p>
            </div>
            <Link href="/resume" className="mt-7 inline-block text-sm font-extrabold text-[#f49a48] no-underline">Explore Resume Studio ↗</Link>
          </aside>

          <section className="jc-card p-7">
            <div className="jc-section-head">
              <div>
                <p className="jc-eyebrow">EXAMPLE TAILORING PLAN</p>
                <h2 className="jc-section-title">Data Analyst · sample role</h2>
                <p className="jc-section-subtitle">A preview of the kind of factual guidance JobCraft creates.</p>
              </div>
              <span className="jc-ready-pill">Preview</span>
            </div>

            <div className="mt-6 grid gap-4">
              <PlanCard title="Bring forward" text="SQL, Power BI and Excel projects that directly support the role requirements." />
              <PlanCard title="Strengthen evidence" text="Move measurable project outcomes closer to the skills they prove. Keep only results you can verify." />
              <PlanCard title="Reduce emphasis" text="De-prioritise unrelated experience when it does not help explain your fit for this role." />
              <PlanCard title="Never change" text="Employer names, dates, qualifications, project facts and achievements remain exactly factual." />
            </div>

            <div className="mt-7 rounded-[20px] bg-[#efede7] p-5 sm:flex sm:items-center sm:justify-between sm:gap-5">
              <div><p className="jc-eyebrow">READY TO USE IT?</p><p className="mt-1 text-sm font-bold text-[#385b50]">Create a private tailored plan from your own resume.</p></div>
              <Link href="/dashboard?auth=signup&next=%2Fresume%2Ftailor" scroll={false} className="jc-button-primary mt-4 sm:mt-0">Sign in to tailor →</Link>
            </div>
          </section>
        </section>
      </div>
    </WorkspaceShell>
  );
}

function PlanCard({ title, text }: { title: string; text: string }) {
  return <article className="jc-tool-list-item"><div className="flex gap-4"><span className="jc-company-dot">✓</span><div><h3 className="m-0 text-sm font-extrabold text-[#173f33]">{title}</h3><p className="mt-2 text-xs leading-6 text-[#789087]">{text}</p></div></div></article>;
}
