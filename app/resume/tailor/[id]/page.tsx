import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import WorkspaceShell from "@/components/workspace-shell";
import { createClient } from "@/lib/supabase/server";

export default async function TailoredResumePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const [{ data: tailored }, { data: profile }] = await Promise.all([
    supabase.from("tailored_resumes").select("*").eq("id", id).eq("user_id", user.id).maybeSingle(),
    supabase.from("profiles").select("full_name,headline,city,experience_years,skills,target_roles,preferred_work_modes").eq("id", user.id).maybeSingle(),
  ]);
  if (!tailored) notFound();

  const content = tailored.content as { candidate_name?: string; target_role?: string; company?: string; headline?: string; relevant_skills?: string[]; guidance?: string[] };
  const strength = profile ? Math.round(([profile.full_name, profile.headline, profile.city, profile.experience_years !== null && profile.experience_years !== undefined, (profile.skills?.length ?? 0) > 0, (profile.target_roles?.length ?? 0) > 0, (profile.preferred_work_modes?.length ?? 0) > 0].filter(Boolean).length / 7) * 100) : 0;

  return (
    <WorkspaceShell active="resume" name={profile?.full_name} headline={profile?.headline} strength={strength}>
      <div className="jc-content-wrap">
        <section className="jc-tool-hero">
          <div><p className="jc-eyebrow">ROLE-SPECIFIC, FACT-CHECKED</p><h1 className="jc-page-title">Tailored resume plan</h1><p className="jc-page-copy">Change the emphasis, not the truth. This plan only uses information already present in your JobCraft profile or source resume.</p></div>
          <div className="flex flex-wrap gap-2"><Link href="/jobs" className="jc-button-primary">Back to roles →</Link><Link href="/resume" className="jc-button-secondary">Resume studio</Link></div>
        </section>

        <section className="jc-profile-layout">
          <article className="jc-dark-card jc-profile-identity">
            <p className="jc-eyebrow !text-[#f49a48]">TARGET VERSION</p>
            <h2 className="jc-section-title !mt-4 !text-white">{tailored.title}</h2>
            <p className="mt-3 text-sm leading-7 text-[#a4b9b1]">Use this as an editing plan for your real source resume. Do not add employers, qualifications, projects or achievements that are not true.</p>
            <div className="mt-7 border-t border-white/10 pt-6"><p className="text-[10px] font-black uppercase tracking-[.14em] text-[#8fa79d]">Suggested headline</p><p className="mt-3 text-lg font-bold text-white">{content.headline || `Candidate targeting ${content.target_role || "this role"}`}</p></div>
          </article>

          <div className="jc-profile-stack">
            <article className="jc-card jc-toolkit-card">
              <p className="jc-eyebrow">SKILLS TO EMPHASIZE</p>
              <h2 className="jc-section-title">Bring proven relevance forward</h2>
              <div className="jc-skills-wrap">{content.relevant_skills?.length ? content.relevant_skills.map((skill) => <span key={skill} className="jc-skill-pill">{skill}</span>) : <span className="text-sm text-[#789087]">Complete your profile skills to improve role-specific guidance.</span>}</div>
            </article>

            <article className="jc-card jc-resume-ready-card">
              <p className="jc-eyebrow">TAILORING GUIDANCE</p>
              <h2 className="jc-section-title">What to change</h2>
              <div className="jc-tool-list">{content.guidance?.length ? content.guidance.map((item) => <div key={item} className="jc-tool-list-item text-sm leading-6 text-[#49685e]">✓ {item}</div>) : <div className="jc-tool-list-item text-sm text-[#789087]">No additional guidance is available yet.</div>}</div>
            </article>
          </div>
        </section>

        <section className="jc-card mt-6 p-6"><p className="jc-eyebrow">MVP STATUS</p><h2 className="jc-section-title">Structured tailoring now, AI later</h2><p className="jc-section-subtitle max-w-3xl">Today JobCraft generates a deterministic plan from your real data. When model-backed rewriting is integrated later, it should rewrite only supported resume content against the job description while preserving factual accuracy.</p></section>
      </div>
    </WorkspaceShell>
  );
}
