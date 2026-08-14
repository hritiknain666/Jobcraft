import Link from "next/link";
import { redirect } from "next/navigation";
import WorkspaceShell from "@/components/workspace-shell";
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

  const [{ data: certificates }, { data: profile }] = await Promise.all([
    supabase.from("certificates").select("id,name,issuer,issue_date,expiry_date,credential_id,credential_url").eq("user_id", user.id).order("issue_date", { ascending: false, nullsFirst: false }),
    supabase.from("profiles").select("full_name,headline,city,experience_years,skills,target_roles,preferred_work_modes").eq("id", user.id).maybeSingle(),
  ]);

  const d = resume?.structured_data ?? {};
  const selectedCertificateIds: string[] = d.certificate_ids ?? [];
  const selectedCertificates = (certificates ?? []).filter((certificate) => selectedCertificateIds.includes(certificate.id));
  const completed = [d.full_name, d.email, d.headline, d.summary, (d.skills ?? []).length, d.education, d.experience].filter(Boolean).length;
  const resumeStrength = Math.round((completed / 7) * 100);
  const profileStrength = profile ? Math.round(([profile.full_name, profile.headline, profile.city, profile.experience_years !== null && profile.experience_years !== undefined, (profile.skills?.length ?? 0) > 0, (profile.target_roles?.length ?? 0) > 0, (profile.preferred_work_modes?.length ?? 0) > 0].filter(Boolean).length / 7) * 100) : 0;

  return (
    <WorkspaceShell active="resume" name={profile?.full_name} headline={profile?.headline} strength={profileStrength}>
      <div className="jc-content-wrap">
        <section className="jc-tool-hero">
          <div><p className="jc-eyebrow">ATS RESUME BUILDER</p><h1 className="jc-page-title">Build a clean resume</h1><p className="jc-page-copy">Keep the structure simple, factual and easy for recruiters and applicant tracking systems to scan.</p></div>
          <div className="jc-card min-w-[240px] p-4"><div className="flex items-center justify-between gap-5"><div><p className="jc-eyebrow !text-[9px]">RESUME STRENGTH</p><p className="mt-1 text-xs font-bold text-[#789087]">Complete the core sections</p></div><span className="jc-serif text-3xl text-[#278363]">{resumeStrength}%</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-[#e4dfd6]"><div className="h-full rounded-full bg-[#f49a48]" style={{ width: `${resumeStrength}%` }} /></div></div>
        </section>

        {params.saved ? <p className="mt-5 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">Resume saved successfully.</p> : null}
        {params.error ? <p className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{params.error}</p> : null}

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.05fr_.95fr]">
          <form action={saveResumeDraft} className="jc-card p-6 sm:p-8">
            <input type="hidden" name="id" value={resume?.id ?? ""} />
            <SectionTitle step="01" title="Basics" text="Start with the information recruiters expect at the top." />
            <Field label="Resume name" name="name" defaultValue={resume?.name ?? "JobCraft Resume"} hint="Internal label only, e.g. Data Analyst Resume" />
            <div className="mt-5 grid gap-4 sm:grid-cols-2"><Field label="Full name" name="full_name" defaultValue={d.full_name ?? ""} /><Field label="Email" name="email" defaultValue={d.email ?? user.email ?? ""} /><Field label="Phone" name="phone" defaultValue={d.phone ?? ""} /><Field label="City" name="city" defaultValue={d.city ?? ""} /></div>
            <div className="mt-5"><Field label="Professional headline" name="headline" defaultValue={d.headline ?? ""} placeholder="Data Analyst | SQL | Power BI" hint="Keep this specific and truthful." /></div>

            <div className="mt-7 border-t border-[#e6e1d8] pt-6"><SectionTitle step="02" title="Professional story" text="Show what you can do without adding anything you cannot defend in an interview." /></div>
            <Area label="Professional summary" name="summary" defaultValue={d.summary ?? ""} placeholder="2–4 concise lines about your background, strengths and target work." hint="Avoid generic claims unless supported by evidence." />
            <div className="mt-5"><Field label="Skills" name="skills" defaultValue={(d.skills ?? []).join(", ")} placeholder="SQL, Power BI, Excel, Python" hint="Comma separated. Prioritise skills relevant to your target jobs." /></div>

            <div className="mt-7 border-t border-[#e6e1d8] pt-6"><SectionTitle step="03" title="Evidence" text="Education, experience, projects and credentials should prove the skills above." /></div>
            <Area label="Experience" name="experience" defaultValue={d.experience ?? ""} placeholder="Role, company, dates, responsibilities and measurable achievements" hint="Use action + task + result where possible. Never invent metrics." />
            <div className="mt-5"><Area label="Projects" name="projects" defaultValue={d.projects ?? ""} placeholder="Project name, tools used, what you built or analysed, and outcome" /></div>
            <div className="mt-5"><Area label="Education" name="education" defaultValue={d.education ?? ""} placeholder="Degree, institution, location, dates" /></div>

            <div className="mt-7 rounded-[20px] bg-[#efede7] p-5"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div><p className="jc-eyebrow">CERTIFICATE LIBRARY</p><h3 className="jc-section-title !text-[22px]">Choose relevant credentials</h3><p className="jc-section-subtitle">The proof file stays private; only credential details appear in the resume.</p></div><Link href="/certificates" className="jc-text-link">Manage certificates →</Link></div>
              <div className="mt-4 grid gap-3">{certificates?.length ? certificates.map((certificate: any) => <label key={certificate.id} className="flex cursor-pointer items-start gap-3 rounded-[14px] border border-[#ddd7cb] bg-[#fbfaf6] p-4"><input type="checkbox" name="certificate_ids" value={certificate.id} defaultChecked={selectedCertificateIds.includes(certificate.id)} className="mt-1 accent-[#278363]" /><span><b className="block text-sm">{certificate.name}</b><span className="mt-1 block text-xs text-[#789087]">{certificate.issuer}{certificate.issue_date ? ` · ${new Date(certificate.issue_date).getFullYear()}` : ""}</span></span></label>) : <div className="rounded-[14px] border border-dashed border-[#d4cec2] bg-[#fbfaf6] p-4 text-xs text-[#789087]">No saved certificates yet. <Link href="/certificates" className="jc-text-link">Add your first certificate.</Link></div>}</div>
            </div>

            <div className="mt-5"><Area label="Other certifications or licences" name="certifications" defaultValue={d.certifications ?? ""} placeholder="Use this only for credentials not saved in your certificate library." /></div>
            <div className="sticky bottom-3 mt-7 rounded-[18px] border border-[#ddd7cb] bg-[#fbfaf6]/95 p-3 shadow-xl backdrop-blur"><button className="jc-button-primary w-full">Save resume →</button></div>
          </form>

          <aside className="xl:sticky xl:top-24 xl:self-start">
            <section className="jc-card p-6 sm:p-8"><div className="flex items-center justify-between gap-3"><div><p className="jc-eyebrow">ATS PREVIEW</p><p className="mt-1 text-xs text-[#789087]">Preview updates after you save.</p></div><span className="jc-ready-pill">Simple layout</span></div>
              <div className="mt-7 border border-[#ddd7cb] bg-white p-7 shadow-sm"><h2 className="jc-serif text-3xl text-[#173f33]">{d.full_name || "Your Name"}</h2><p className="mt-1 font-semibold text-[#5f786f]">{d.headline || "Professional headline"}</p><p className="mt-2 text-xs text-[#789087]">{[d.email, d.phone, d.city].filter(Boolean).join(" • ") || "email • phone • city"}</p><Preview title="Summary" text={d.summary} /><Preview title="Skills" text={(d.skills ?? []).join(" • ")} /><Preview title="Experience" text={d.experience} /><Preview title="Projects" text={d.projects} /><Preview title="Education" text={d.education} />{selectedCertificates.length ? <div className="mt-6 border-t border-[#e4ded4] pt-4"><h3 className="text-[10px] font-black uppercase tracking-[.12em]">Certifications</h3><div className="mt-3 space-y-3">{selectedCertificates.map((certificate: any) => <div key={certificate.id}><p className="text-sm font-black">{certificate.name}</p><p className="mt-1 text-[11px] text-[#789087]">{certificate.issuer}{certificate.issue_date ? ` · ${new Date(certificate.issue_date).getFullYear()}` : ""}{certificate.credential_id ? ` · ID ${certificate.credential_id}` : ""}</p>{certificate.credential_url ? <p className="mt-1 break-all text-[11px] text-[#278363]">{certificate.credential_url}</p> : null}</div>)}</div>{d.certifications ? <p className="mt-3 whitespace-pre-wrap text-xs leading-6 text-[#5f786f]">{d.certifications}</p> : null}</div> : <Preview title="Certifications" text={d.certifications} />}</div>
            </section>
            <section className="jc-dark-card mt-5 p-6"><p className="jc-eyebrow !text-[#f49a48]">JOBCRAFT RESUME RULES</p><ul className="mt-4 space-y-2 text-xs leading-6 text-[#a4b9b1]"><li>• Keep information factual.</li><li>• Prefer measurable outcomes when you genuinely have them.</li><li>• Use standard section names and simple formatting.</li><li>• Certificate proof stays private.</li></ul></section>
          </aside>
        </div>
      </div>
    </WorkspaceShell>
  );
}

function SectionTitle({ step, title, text }: { step: string; title: string; text: string }) {
  return <div className="mb-5 flex gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#173f33] text-xs font-black text-white">{step}</span><div><h2 className="jc-section-title !m-0 !text-[24px]">{title}</h2><p className="mt-1 text-xs leading-6 text-[#789087]">{text}</p></div></div>;
}

function Field({ label, name, defaultValue, placeholder = "", hint }: { label: string; name: string; defaultValue: string; placeholder?: string; hint?: string }) {
  return <label className="jc-form-field">{label}<input name={name} defaultValue={defaultValue} placeholder={placeholder} className="jc-input" />{hint ? <span className="mt-2 block text-[11px] font-normal leading-5 text-[#789087]">{hint}</span> : null}</label>;
}

function Area({ label, name, defaultValue, placeholder = "", hint }: { label: string; name: string; defaultValue: string; placeholder?: string; hint?: string }) {
  return <label className="jc-form-field">{label}<textarea name={name} defaultValue={defaultValue} placeholder={placeholder} rows={5} className="jc-input min-h-[130px] resize-y" />{hint ? <span className="mt-2 block text-[11px] font-normal leading-5 text-[#789087]">{hint}</span> : null}</label>;
}

function Preview({ title, text }: { title: string; text?: string }) {
  return <div className="mt-6 border-t border-[#e4ded4] pt-4"><h3 className="text-[10px] font-black uppercase tracking-[.12em]">{title}</h3><p className="mt-2 whitespace-pre-wrap text-xs leading-6 text-[#5f786f]">{text || `Add ${title.toLowerCase()} in the form.`}</p></div>;
}
