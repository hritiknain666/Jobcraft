import Link from "next/link";
import WorkspaceShell from "@/components/workspace-shell";
import { createClient } from "@/lib/supabase/server";
import type { ResumeRecord } from "@/lib/types/jobcraft";
import { deleteResume, setPrimaryResume, uploadResume } from "./actions";

export default async function ResumePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; uploaded?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return <PublicResumePreview />;

  const [{ data: resumes }, { data: profile }, { count: certificateCount }] = await Promise.all([
    supabase
      .from("resumes")
      .select("id,name,is_primary,storage_path,created_at,structured_data")
      .eq("user_id", user.id)
      .order("is_primary", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase
      .from("profiles")
      .select("full_name,headline,city,experience_years,skills,target_roles,preferred_work_modes")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("certificates")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
  ]);

  const resumeItems = (resumes ?? []) as ResumeRecord[];
  const builtCount = resumeItems.filter((resume) => !resume.storage_path).length;
  const uploadedCount = resumeItems.filter((resume) => Boolean(resume.storage_path)).length;
  const primary = resumeItems.find((resume) => resume.is_primary) ?? resumeItems[0] ?? null;
  const strength = profile
    ? Math.round(
        ([
          profile.full_name,
          profile.headline,
          profile.city,
          profile.experience_years !== null && profile.experience_years !== undefined,
          (profile.skills?.length ?? 0) > 0,
          (profile.target_roles?.length ?? 0) > 0,
          (profile.preferred_work_modes?.length ?? 0) > 0,
        ].filter(Boolean).length /
          7) *
          100,
      )
    : 0;

  return (
    <WorkspaceShell
      active="resume"
      name={profile?.full_name}
      headline={profile?.headline}
      strength={strength}
    >
      <div className="jc-content-wrap">
        <section className="jc-tool-hero">
          <div>
            <p className="jc-eyebrow">READY WHEN YOU ARE</p>
            <h1 className="jc-page-title">Resume studio</h1>
            <p className="jc-page-copy">
              Build factual ATS-friendly versions, keep uploaded files private, and tailor from a
              clean source resume.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/resume/builder" className="jc-button-primary">
              Build a resume →
            </Link>
            <Link href="/certificates" className="jc-button-secondary">
              Certificates · {certificateCount ?? 0}
            </Link>
          </div>
        </section>

        {params.error ? (
          <p className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{params.error}</p>
        ) : null}
        {params.uploaded ? (
          <p className="mt-5 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
            Resume uploaded successfully.
          </p>
        ) : null}

        <section className="jc-stats-grid">
          <Stat
            label="Total resumes"
            value={resumes?.length ?? 0}
            note="versions in your workspace"
          />
          <Stat label="Built here" value={builtCount} note="structured JobCraft resumes" />
          <Stat label="Uploaded" value={uploadedCount} note="private PDF/DOCX files" />
          <Stat
            label="Primary"
            value={primary ? 1 : 0}
            note={primary ? primary.name : "choose your default"}
          />
        </section>

        <section className="jc-tool-grid">
          <aside className="space-y-5">
            <article className="jc-dark-card jc-tool-panel">
              <p className="jc-eyebrow !text-[#f49a48]">PRIMARY RESUME</p>
              {primary ? (
                <>
                  <h2 className="jc-section-title !mt-3 !text-white">{primary.name}</h2>
                  <p className="mt-2 text-sm leading-6 text-[#9eb4ab]">
                    {primary.storage_path ? "Uploaded file" : "Built in JobCraft"} · default
                    starting point for tailoring.
                  </p>
                  <Link
                    href={primary.storage_path ? "/resume" : `/resume/builder?id=${primary.id}`}
                    className="mt-5 inline-flex text-sm font-extrabold text-[#f49a48] no-underline"
                  >
                    {primary.storage_path ? "Manage version" : "Edit primary"} ↗
                  </Link>
                </>
              ) : (
                <>
                  <h2 className="jc-section-title !mt-3 !text-white">No primary yet</h2>
                  <p className="mt-2 text-sm leading-6 text-[#9eb4ab]">
                    Create or upload a resume, then choose the version JobCraft should use first.
                  </p>
                </>
              )}
            </article>

            <article className="jc-card jc-tool-panel">
              <p className="jc-eyebrow">BRING YOUR OWN</p>
              <h2 className="jc-section-title">Upload a resume</h2>
              <p className="jc-section-subtitle">
                PDF or DOCX, maximum 5 MB. Files stay in your private Supabase storage.
              </p>
              <form action={uploadResume} className="mt-5 grid gap-3">
                <input
                  name="name"
                  placeholder="Resume name e.g. Data Analyst"
                  className="jc-input"
                />
                <input
                  name="file"
                  type="file"
                  accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  required
                  className="jc-input text-xs"
                />
                <button className="jc-button-primary">Upload resume →</button>
              </form>
            </article>
          </aside>

          <section>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="jc-eyebrow">YOUR VERSIONS</p>
                <h2 className="jc-section-title">Resumes ready for your search</h2>
              </div>
              <Link href="/resume/builder" className="jc-text-link">
                Create new ↗
              </Link>
            </div>
            <div className="jc-tool-list">
              {resumeItems.length ? (
                resumeItems.map((resume) => (
                  <article key={resume.id} className="jc-tool-list-item">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 items-center gap-4">
                        <span className="jc-file-icon">▤</span>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="m-0 truncate text-base font-extrabold text-[#173f33]">
                              {resume.name}
                            </h3>
                            {resume.is_primary ? (
                              <span className="jc-ready-pill">Primary</span>
                            ) : null}
                          </div>
                          <p className="mt-1 text-xs text-[#789087]">
                            {resume.storage_path ? "Uploaded resume" : "JobCraft resume"} ·{" "}
                            {new Date(resume.created_at).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {!resume.storage_path ? (
                          <Link
                            href={`/resume/builder?id=${resume.id}`}
                            className="jc-button-secondary !px-3 !py-2 text-xs"
                          >
                            Edit
                          </Link>
                        ) : null}
                        {!resume.is_primary ? (
                          <form action={setPrimaryResume}>
                            <input type="hidden" name="id" value={resume.id} />
                            <button className="jc-button-secondary !px-3 !py-2 text-xs">
                              Set primary
                            </button>
                          </form>
                        ) : null}
                        <form action={deleteResume}>
                          <input type="hidden" name="id" value={resume.id} />
                          <button className="jc-button-secondary !border-red-200 !px-3 !py-2 text-xs !text-red-700">
                            Delete
                          </button>
                        </form>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div className="jc-card p-10 text-center">
                  <h3 className="jc-section-title">Create your first resume</h3>
                  <p className="jc-section-subtitle">
                    Build an ATS-friendly version or upload an existing file.
                  </p>
                  <Link href="/resume/builder" className="jc-button-primary mt-5">
                    Start building →
                  </Link>
                </div>
              )}
            </div>
          </section>
        </section>
      </div>
    </WorkspaceShell>
  );
}

function PublicResumePreview() {
  return (
    <WorkspaceShell
      active="resume"
      authenticated={false}
      name="Your profile"
      headline="Candidate"
      strength={0}
    >
      <div className="jc-content-wrap">
        <section className="jc-tool-hero">
          <div>
            <p className="jc-eyebrow">READY WHEN YOU ARE</p>
            <h1 className="jc-page-title">Resume studio</h1>
            <p className="jc-page-copy">
              Build ATS-friendly versions, upload existing resumes and keep certificates connected
              to your career workspace.
            </p>
          </div>
          <Link href="/resume?auth=signup" scroll={false} className="jc-button-primary">
            Start building →
          </Link>
        </section>
        <section className="jc-profile-layout">
          <article className="jc-dark-card jc-profile-identity">
            <p className="jc-eyebrow !text-[#f49a48]">ATS-READY FOUNDATION</p>
            <h2 className="jc-section-title !mt-4 !text-white">A clean source resume</h2>
            <p className="mt-3 text-sm leading-7 text-[#a4b9b1]">
              JobCraft keeps structured content factual and reusable instead of inventing experience
              or achievements.
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              {["SQL", "Power BI", "Excel", "Python"].map((skill) => (
                <span key={skill} className="rounded-full bg-white/10 px-3 py-2 text-xs text-white">
                  {skill}
                </span>
              ))}
            </div>
          </article>
          <article className="jc-card jc-toolkit-card">
            <p className="jc-eyebrow">YOUR WORKFLOW</p>
            <h2 className="jc-section-title">Build · upload · tailor</h2>
            <div className="jc-tool-list">
              {[
                "Create a structured resume",
                "Keep private uploaded versions",
                "Attach relevant certificates",
                "Tailor against a real job",
              ].map((item) => (
                <div key={item} className="jc-tool-list-item text-sm font-bold">
                  ✓ {item}
                </div>
              ))}
            </div>
          </article>
        </section>
      </div>
    </WorkspaceShell>
  );
}

function Stat({ label, value, note }: { label: string; value: number; note: string }) {
  return (
    <div className="jc-card jc-stat-card">
      <div className="jc-stat-top">
        <span>{label}</span>
        <span className="jc-stat-icon">▤</span>
      </div>
      <div className="jc-stat-value">{value}</div>
      <div className="jc-stat-note truncate">{note}</div>
    </div>
  );
}
