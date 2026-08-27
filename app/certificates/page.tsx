import Link from "next/link";
import WorkspaceShell from "@/components/workspace-shell";
import { createClient } from "@/lib/supabase/server";
import type { CertificateRecord } from "@/lib/types/jobcraft";
import { deleteCertificate, saveCertificate } from "./actions";

export default async function CertificatesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; added?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return <PublicCertificatesPreview />;

  const [{ data: certificates }, { data: profile }] = await Promise.all([
    supabase
      .from("certificates")
      .select(
        "id,name,issuer,issue_date,expiry_date,credential_id,credential_url,storage_path,created_at",
      )
      .eq("user_id", user.id)
      .order("issue_date", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false }),
    supabase
      .from("profiles")
      .select("full_name,headline,city,experience_years,skills,target_roles,preferred_work_modes")
      .eq("id", user.id)
      .maybeSingle(),
  ]);

  const certificateItems = (certificates ?? []) as CertificateRecord[];
  const proofCount = certificateItems.filter((certificate) =>
    Boolean(certificate.storage_path),
  ).length;
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
      active="certificates"
      name={profile?.full_name}
      headline={profile?.headline}
      strength={strength}
    >
      <div className="jc-content-wrap">
        <section className="jc-tool-hero">
          <div>
            <p className="jc-eyebrow">PROOF, READY WHEN NEEDED</p>
            <h1 className="jc-page-title">Certificates</h1>
            <p className="jc-page-copy">
              Keep factual credentials and optional proof organised, then reuse only what is
              relevant to each resume.
            </p>
          </div>
          <Link href="/resume/builder" className="jc-button-primary">
            Open resume builder →
          </Link>
        </section>

        {params.error ? (
          <p className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{params.error}</p>
        ) : null}
        {params.added ? (
          <p className="mt-5 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
            Certificate added.
          </p>
        ) : null}

        <section className="jc-stats-grid">
          <Stat
            label="Credentials"
            value={certificates?.length ?? 0}
            note="saved to your library"
          />
          <Stat label="Proof files" value={proofCount} note="private PDF/image proof" />
          <Stat
            label="Ready to reuse"
            value={certificates?.length ?? 0}
            note="available in resume builder"
          />
          <Stat
            label="Expired"
            value={
              certificateItems.filter(
                (item) => item.expiry_date && new Date(item.expiry_date).getTime() < Date.now(),
              ).length
            }
            note="review before using"
          />
        </section>

        <section className="jc-tool-grid">
          <aside className="jc-card jc-tool-panel self-start">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="jc-eyebrow">ADD CREDENTIAL</p>
                <h2 className="jc-section-title">Save a certificate</h2>
              </div>
              <span className="jc-ready-pill">Private</span>
            </div>
            <p className="jc-section-subtitle">
              Only add credentials you genuinely hold. Optional proof files remain private.
            </p>
            <form action={saveCertificate} className="mt-5 grid gap-4">
              <Field
                name="name"
                label="Certificate name"
                placeholder="Google Data Analytics"
                required
              />
              <Field
                name="issuer"
                label="Issuing organisation"
                placeholder="Google / Coursera"
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <Field name="issueDate" label="Issue date" type="date" />
                <Field name="expiryDate" label="Expiry" type="date" />
              </div>
              <Field name="credentialId" label="Credential ID" placeholder="Optional" />
              <Field
                name="credentialUrl"
                label="Credential URL"
                type="url"
                placeholder="https://..."
              />
              <label className="jc-form-field">
                Private proof
                <input
                  name="file"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                  className="jc-input mt-2 text-xs"
                />
                <span className="mt-2 block text-[11px] font-normal text-[#789087]">
                  PDF, JPG or PNG up to 5 MB.
                </span>
              </label>
              <button className="jc-button-primary">Add certificate →</button>
            </form>
          </aside>

          <section>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="jc-eyebrow">YOUR CREDENTIALS</p>
                <h2 className="jc-section-title">Ready for relevant resume versions</h2>
              </div>
              <span className="text-xs font-bold text-[#789087]">
                {certificates?.length ?? 0} saved
              </span>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {certificateItems.length ? (
                certificateItems.map((certificate) => (
                  <article key={certificate.id} className="jc-card p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="jc-eyebrow !text-[10px]">{certificate.issuer}</p>
                        <h3 className="jc-section-title !mt-2 !text-[22px]">{certificate.name}</h3>
                      </div>
                      {certificate.storage_path ? (
                        <span className="jc-ready-pill">Proof saved</span>
                      ) : null}
                    </div>
                    <div className="mt-5 grid gap-2 text-xs text-[#6f887f]">
                      {certificate.issue_date ? (
                        <div className="rounded-xl bg-[#efede7] px-3 py-2.5">
                          Issued {new Date(certificate.issue_date).toLocaleDateString("en-IN")}
                        </div>
                      ) : null}
                      {certificate.expiry_date ? (
                        <div className="rounded-xl bg-[#efede7] px-3 py-2.5">
                          Expires {new Date(certificate.expiry_date).toLocaleDateString("en-IN")}
                        </div>
                      ) : null}
                      {certificate.credential_id ? (
                        <div className="rounded-xl bg-[#efede7] px-3 py-2.5">
                          ID: {certificate.credential_id}
                        </div>
                      ) : null}
                    </div>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {certificate.credential_url ? (
                        <a
                          href={certificate.credential_url}
                          target="_blank"
                          rel="noreferrer"
                          className="jc-button-secondary !px-3 !py-2 text-xs"
                        >
                          View credential ↗
                        </a>
                      ) : null}
                      <form action={deleteCertificate}>
                        <input type="hidden" name="id" value={certificate.id} />
                        <button className="jc-button-secondary !border-red-200 !px-3 !py-2 text-xs !text-red-700">
                          Delete
                        </button>
                      </form>
                    </div>
                  </article>
                ))
              ) : (
                <div className="jc-card p-10 text-center md:col-span-2">
                  <h3 className="jc-section-title">No certificates yet</h3>
                  <p className="jc-section-subtitle">
                    Add professional certifications, licences or course credentials you want
                    available for relevant resume versions.
                  </p>
                </div>
              )}
            </div>
          </section>
        </section>
      </div>
    </WorkspaceShell>
  );
}

function PublicCertificatesPreview() {
  return (
    <WorkspaceShell
      active="certificates"
      authenticated={false}
      name="Your profile"
      headline="Candidate"
      strength={0}
    >
      <div className="jc-content-wrap">
        <section className="jc-tool-hero">
          <div>
            <p className="jc-eyebrow">PROOF, READY WHEN NEEDED</p>
            <h1 className="jc-page-title">Certificates</h1>
            <p className="jc-page-copy">
              Save credentials once and keep private proof connected to the resume versions that
              actually need it.
            </p>
          </div>
          <Link href="/certificates?auth=signup" scroll={false} className="jc-button-primary">
            Build my library →
          </Link>
        </section>
        <div className="jc-profile-layout">
          <article className="jc-dark-card jc-profile-identity">
            <p className="jc-eyebrow !text-[#f49a48]">PRIVATE BY DEFAULT</p>
            <h2 className="jc-section-title !mt-4 !text-white">Your proof stays yours.</h2>
            <p className="mt-3 text-sm leading-7 text-[#a4b9b1]">
              Credential files are not public profile decorations. They are private source material
              you can use when relevant.
            </p>
          </article>
          <article className="jc-card jc-toolkit-card">
            <p className="jc-eyebrow">WHAT YOU CAN SAVE</p>
            <h2 className="jc-section-title">A clean credential library</h2>
            <div className="jc-tool-list">
              {[
                "Certificate name and issuer",
                "Issue and expiry dates",
                "Credential ID or verification URL",
                "Optional private PDF/JPG/PNG proof",
              ].map((item) => (
                <div key={item} className="jc-tool-list-item text-sm font-bold">
                  ✓ {item}
                </div>
              ))}
            </div>
          </article>
        </div>
      </div>
    </WorkspaceShell>
  );
}

function Field({
  name,
  label,
  placeholder = "",
  type = "text",
  required = false,
}: {
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="jc-form-field">
      {label}
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="jc-input"
      />
    </label>
  );
}

function Stat({ label, value, note }: { label: string; value: number; note: string }) {
  return (
    <div className="jc-card jc-stat-card">
      <div className="jc-stat-top">
        <span>{label}</span>
        <span className="jc-stat-icon">◇</span>
      </div>
      <div className="jc-stat-value">{value}</div>
      <div className="jc-stat-note">{note}</div>
    </div>
  );
}
