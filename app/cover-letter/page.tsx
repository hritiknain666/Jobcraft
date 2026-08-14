import Link from "next/link";
import WorkspaceShell from "@/components/workspace-shell";
import { createClient } from "@/lib/supabase/server";

export default async function CoverLetterPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return <PublicCoverLetterPreview />;

  const [{ data: letters }, { data: profile }] = await Promise.all([
    supabase.from("cover_letters").select("id,title,body,created_at,updated_at").eq("user_id", user.id).order("updated_at", { ascending: false }),
    supabase.from("profiles").select("full_name,headline,city,experience_years,skills,target_roles,preferred_work_modes").eq("id", user.id).maybeSingle(),
  ]);
  const selected = params.id ? letters?.find((letter) => letter.id === params.id) : letters?.[0];
  const strength = profile ? Math.round(([profile.full_name, profile.headline, profile.city, profile.experience_years !== null && profile.experience_years !== undefined, (profile.skills?.length ?? 0) > 0, (profile.target_roles?.length ?? 0) > 0, (profile.preferred_work_modes?.length ?? 0) > 0].filter(Boolean).length / 7) * 100) : 0;

  return (
    <WorkspaceShell active="cover-letter" name={profile?.full_name} headline={profile?.headline} strength={strength}>
      <div className="jc-content-wrap">
        <section className="jc-tool-hero">
          <div><p className="jc-eyebrow">WORDS WITH EVIDENCE</p><h1 className="jc-page-title">Cover letters</h1><p className="jc-page-copy">Keep each application specific to the role and grounded in skills or experience you actually supplied.</p></div>
          <Link href="/jobs" className="jc-button-primary">Choose a job →</Link>
        </section>

        <section className="jc-tool-grid">
          <aside className="space-y-5">
            <article className="jc-card jc-tool-panel">
              <div className="flex items-center justify-between gap-3"><div><p className="jc-eyebrow">YOUR DRAFTS</p><h2 className="jc-section-title">Saved letters</h2></div><span className="jc-ready-pill">{letters?.length ?? 0}</span></div>
              <div className="jc-tool-list">
                {letters?.length ? letters.map((letter) => <Link key={letter.id} href={`/cover-letter?id=${letter.id}`} className={`jc-tool-list-item text-inherit no-underline ${selected?.id === letter.id ? "!border-[#9bb7ab] !bg-[#f0eee7]" : ""}`}><b className="block text-sm">{letter.title}</b><span className="mt-2 block text-[11px] text-[#789087]">Updated {new Date(letter.updated_at ?? letter.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span></Link>) : <div className="jc-tool-list-item text-sm leading-6 text-[#789087]">No letters yet. Open a job and create one from its application tools.</div>}
              </div>
            </article>

            <article className="jc-dark-card jc-tool-panel">
              <p className="jc-eyebrow !text-[#f49a48]">JOBCRAFT RULE</p>
              <h2 className="jc-section-title !text-white">Never invent the story.</h2>
              <ul className="mt-5 grid gap-3 text-sm leading-6 text-[#aac0b7]"><li>• name the target role clearly</li><li>• connect only real skills and experience</li><li>• keep achievements factual</li><li>• stay concise and role-specific</li></ul>
            </article>
          </aside>

          <section className="jc-card jc-tool-panel min-h-[520px]">
            {selected ? <>
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#e5dfd5] pb-5"><div><p className="jc-eyebrow">SELECTED DRAFT</p><h2 className="jc-section-title">{selected.title}</h2></div><span className="jc-ready-pill">Grounded draft</span></div>
              <div className="mt-6 whitespace-pre-wrap rounded-[18px] bg-[#efede7] p-6 text-sm leading-8 text-[#49685e]">{selected.body}</div>
              <div className="mt-6 flex flex-wrap gap-3"><Link href="/jobs" className="jc-button-primary">Create for another job →</Link><Link href="/applications" className="jc-button-secondary">Open application plan</Link></div>
              <p className="mt-5 text-[11px] leading-5 text-[#789087]">Current drafts are rules-based. Future AI rewriting may improve tone and specificity, but JobCraft should never add qualifications, projects, achievements or experience that are not supported by your profile or resume.</p>
            </> : <div className="flex min-h-[420px] flex-col items-center justify-center text-center"><span className="jc-file-icon">✉</span><h2 className="jc-section-title mt-5">Create your first cover letter</h2><p className="jc-section-subtitle max-w-md">Choose a job and use its application tools to create a role-specific draft.</p><Link href="/jobs" className="jc-button-primary mt-6">Browse jobs →</Link></div>}
          </section>
        </section>
      </div>
    </WorkspaceShell>
  );
}

function PublicCoverLetterPreview() {
  return <WorkspaceShell active="cover-letter" authenticated={false} name="Your profile" headline="Candidate" strength={0}><div className="jc-content-wrap"><section className="jc-tool-hero"><div><p className="jc-eyebrow">WORDS WITH EVIDENCE</p><h1 className="jc-page-title">Cover letters</h1><p className="jc-page-copy">Create role-specific letters without inventing your story.</p></div><Link href="/cover-letter?auth=signup" scroll={false} className="jc-button-primary">Create your workspace →</Link></section><section className="jc-profile-layout"><article className="jc-dark-card jc-profile-identity"><p className="jc-eyebrow !text-[#f49a48]">GROUNDED BY DESIGN</p><h2 className="jc-section-title !mt-4 !text-white">Your story, not a fabricated one.</h2><p className="mt-3 text-sm leading-7 text-[#a4b9b1]">JobCraft connects the target role with the real career information you supplied.</p></article><article className="jc-card jc-toolkit-card"><div className="flex items-center justify-between"><div><p className="jc-eyebrow">DRAFT PREVIEW</p><h2 className="jc-section-title">Data Analyst application</h2></div><span className="jc-ready-pill">Grounded</span></div><div className="mt-5 rounded-[18px] bg-[#efede7] p-5 text-sm leading-7 text-[#5f786f]">Dear Hiring Manager,<br/><br/>I am applying for the Data Analyst role. My experience with SQL, Power BI and Excel aligns with the core requirements listed for the position...</div></article></section></div></WorkspaceShell>;
}
