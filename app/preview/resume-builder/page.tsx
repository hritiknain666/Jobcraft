import Link from "next/link";
import WorkspaceShell from "@/components/workspace-shell";

export default function ResumeBuilderPreviewPage() {
  return (
    <WorkspaceShell
      active="resume-builder"
      authenticated={false}
      name="Your profile"
      headline="Candidate"
      strength={0}
    >
      <div className="jc-content-wrap">
        <section className="jc-tool-hero">
          <div>
            <p className="jc-eyebrow">ATS RESUME BUILDER</p>
            <h1 className="jc-page-title">Build a clean resume</h1>
            <p className="jc-page-copy">
              Explore the full JobCraft resume workflow first. Sign in only when you are ready to
              save your own resume.
            </p>
          </div>
          <Link
            href="/dashboard?auth=signup&next=%2Fresume%2Fbuilder"
            scroll={false}
            className="jc-button-primary"
          >
            Start my resume →
          </Link>
        </section>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.05fr_.95fr]">
          <section className="jc-card p-6 sm:p-8">
            <PreviewSection
              step="01"
              title="Basics"
              text="Add the information recruiters expect at the top."
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <PreviewField label="Full name" value="Your Name" />
              <PreviewField label="Email" value="you@example.com" />
              <PreviewField label="Phone" value="+91 98••• •••••" />
              <PreviewField label="City" value="Bengaluru" />
            </div>
            <div className="mt-4">
              <PreviewField label="Professional headline" value="Data Analyst | SQL | Power BI" />
            </div>

            <div className="mt-7 border-t border-[#e6e1d8] pt-6">
              <PreviewSection
                step="02"
                title="Professional story"
                text="Use concise, factual evidence instead of generic claims."
              />
            </div>
            <PreviewArea
              label="Professional summary"
              value="Analytical professional with hands-on experience using SQL, Power BI and Excel to clean data, build dashboards and communicate useful insights."
            />
            <div className="mt-4">
              <PreviewField label="Skills" value="SQL, Power BI, Excel, Python" />
            </div>

            <div className="mt-7 border-t border-[#e6e1d8] pt-6">
              <PreviewSection
                step="03"
                title="Evidence"
                text="Experience, projects, education and credentials support the skills above."
              />
            </div>
            <PreviewArea
              label="Experience"
              value="Role · Company · Dates\nResponsibilities and measurable outcomes you can genuinely defend."
            />
            <div className="mt-4">
              <PreviewArea
                label="Projects"
                value="Project name · tools used · what you built or analysed · outcome"
              />
            </div>
            <div className="mt-4">
              <PreviewArea label="Education" value="Degree · institution · location · dates" />
            </div>

            <div className="mt-7 rounded-[20px] bg-[#efede7] p-5">
              <p className="jc-eyebrow">CERTIFICATE LIBRARY</p>
              <h3 className="jc-section-title !text-[22px]">Attach relevant credentials</h3>
              <p className="jc-section-subtitle">
                Credential proof remains private. Only the details you choose appear in a resume.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[14px] border border-[#ddd7cb] bg-[#fbfaf6] p-4 text-sm font-bold">
                  ✓ Google Data Analytics
                </div>
                <div className="rounded-[14px] border border-[#ddd7cb] bg-[#fbfaf6] p-4 text-sm font-bold">
                  ✓ Microsoft Power BI
                </div>
              </div>
            </div>

            <Link
              href="/dashboard?auth=signup&next=%2Fresume%2Fbuilder"
              scroll={false}
              className="jc-button-primary mt-7 w-full justify-center"
            >
              Sign in to save this resume →
            </Link>
          </section>

          <aside className="xl:sticky xl:top-24 xl:self-start">
            <section className="jc-card p-6 sm:p-8">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="jc-eyebrow">ATS PREVIEW</p>
                  <p className="mt-1 text-xs text-[#789087]">
                    A simple recruiter-friendly structure.
                  </p>
                </div>
                <span className="jc-ready-pill">Preview</span>
              </div>
              <div className="mt-7 border border-[#ddd7cb] bg-white p-7 shadow-sm">
                <h2 className="jc-serif text-3xl text-[#173f33]">Your Name</h2>
                <p className="mt-1 font-semibold text-[#5f786f]">Data Analyst | SQL | Power BI</p>
                <p className="mt-2 text-xs text-[#789087]">
                  you@example.com • +91 98••• ••••• • Bengaluru
                </p>
                <ResumeBlock
                  title="Summary"
                  text="Concise professional summary grounded in your real background."
                />
                <ResumeBlock title="Skills" text="SQL • Power BI • Excel • Python" />
                <ResumeBlock
                  title="Experience"
                  text="Clear roles, responsibilities and genuine outcomes."
                />
                <ResumeBlock
                  title="Projects"
                  text="Relevant projects that prove the skills above."
                />
                <ResumeBlock title="Education" text="Degree, institution and dates." />
              </div>
            </section>
            <section className="jc-dark-card mt-5 p-6">
              <p className="jc-eyebrow !text-[#f49a48]">JOBCRAFT RULES</p>
              <ul className="mt-4 space-y-2 text-xs leading-6 text-[#a4b9b1]">
                <li>• Keep information factual.</li>
                <li>• Use simple ATS-friendly sections.</li>
                <li>• Never invent metrics or achievements.</li>
                <li>• Sign in only when you want to save your version.</li>
              </ul>
            </section>
          </aside>
        </div>
      </div>
    </WorkspaceShell>
  );
}

function PreviewSection({ step, title, text }: { step: string; title: string; text: string }) {
  return (
    <div className="mb-5 flex gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#173f33] text-xs font-black text-white">
        {step}
      </span>
      <div>
        <h2 className="jc-section-title !m-0 !text-[24px]">{title}</h2>
        <p className="mt-1 text-xs leading-6 text-[#789087]">{text}</p>
      </div>
    </div>
  );
}

function PreviewField({ label, value }: { label: string; value: string }) {
  return (
    <div className="jc-form-field">
      {label}
      <div className="jc-input mt-2 select-none text-[#789087]">{value}</div>
    </div>
  );
}

function PreviewArea({ label, value }: { label: string; value: string }) {
  return (
    <div className="jc-form-field">
      {label}
      <div className="jc-input mt-2 min-h-[105px] whitespace-pre-wrap text-[#789087]">{value}</div>
    </div>
  );
}

function ResumeBlock({ title, text }: { title: string; text: string }) {
  return (
    <div className="mt-6 border-t border-[#e4ded4] pt-4">
      <h3 className="text-[10px] font-black uppercase tracking-[.12em]">{title}</h3>
      <p className="mt-2 text-xs leading-6 text-[#5f786f]">{text}</p>
    </div>
  );
}
