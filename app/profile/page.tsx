import Link from "next/link";
import WorkspaceShell from "@/components/workspace-shell";
import { createClient } from "@/lib/supabase/server";
import { saveProfile } from "./actions";

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ error?: string; message?: string }> }) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return <PublicProfilePreview />;

  const [{ data: profile }, { data: resumes }, { count: certificateCount }] = await Promise.all([
    supabase.from("profiles").select("full_name,phone,city,headline,experience_years,skills,target_roles,preferred_work_modes").eq("id", user.id).maybeSingle(),
    supabase.from("resumes").select("id,name,is_primary,storage_path,created_at").eq("user_id", user.id).order("is_primary", { ascending: false }).order("created_at", { ascending: false }).limit(3),
    supabase.from("certificates").select("id", { count: "exact", head: true }).eq("user_id", user.id),
  ]);

  const modes = profile?.preferred_work_modes ?? [];
  const skills = profile?.skills ?? [];
  const targetRoles = profile?.target_roles ?? [];
  const hasResume = (resumes?.length ?? 0) > 0;
  const completed = [profile?.full_name, profile?.city, profile?.headline, profile?.experience_years !== null && profile?.experience_years !== undefined, skills.length > 0, targetRoles.length > 0, modes.length > 0, hasResume].filter(Boolean).length;
  const strength = Math.round((completed / 8) * 100);
  const displayName = profile?.full_name?.trim() || user.user_metadata?.full_name || "Your profile";
  const initials = initialsFor(displayName);
  const primaryResume = resumes?.find((resume: any) => resume.is_primary) ?? resumes?.[0] ?? null;

  return (
    <WorkspaceShell active="profile" name={displayName} headline={profile?.headline} strength={strength}>
      <div className="jc-content-wrap">
        <section className="jc-discover-head">
          <div>
            <p className="jc-eyebrow">YOUR SIGNAL, MADE LEGIBLE</p>
            <h1 className="jc-page-title">My profile</h1>
          </div>
          <a href="#edit-profile" className="jc-button-secondary">✎ Edit profile</a>
        </section>

        <section className="jc-profile-layout">
          <article className="jc-dark-card jc-profile-identity">
            <div className="jc-profile-person">
              <span className="jc-profile-avatar">{initials}</span>
              <div>
                <h2>{displayName}</h2>
                <p>{profile?.headline || "Add a professional headline that describes your direction"}</p>
              </div>
            </div>

            <div className="jc-profile-facts">
              <div className="jc-profile-fact"><b>⌖</b><span>{profile?.city || "Add your city"}</span></div>
              <div className="jc-profile-fact"><b>@</b><span>{user.email || "Email connected to your account"}</span></div>
              <div className="jc-profile-fact"><b>◷</b><span>{profile?.experience_years !== null && profile?.experience_years !== undefined ? `${profile.experience_years} years of experience` : "Add your experience"}</span></div>
            </div>

            <div className="jc-strength-block">
              <div className="jc-strength-copy"><span>Profile strength</span><b>{strength}%</b></div>
              <div className="jc-strength-track"><span style={{ width: `${strength}%` }} /></div>
              <p>A clear profile gives your match signal more evidence to work with.</p>
            </div>
          </article>

          <div className="jc-profile-stack">
            <article className="jc-card jc-toolkit-card">
              <div className="jc-section-head">
                <div><p className="jc-eyebrow">YOUR TOOLKIT</p><h2 className="jc-section-title">Skills &amp; strengths</h2></div>
                <span className="text-2xl text-[#f49a48]">✣</span>
              </div>
              <div className="jc-skills-wrap">
                {skills.length ? skills.slice(0, 12).map((skill: string) => <span key={skill} className="jc-skill-pill">{skill}</span>) : <span className="text-sm text-[#789087]">Add the skills you can genuinely demonstrate.</span>}
              </div>
              <a href="#edit-profile" className="mt-5 inline-flex text-sm font-extrabold text-[#278363] no-underline">＋ Add or refine skills</a>
            </article>

            <article className="jc-card jc-resume-ready-card">
              <p className="jc-eyebrow">READY WHEN YOU ARE</p>
              <h2 className="jc-section-title">Resume readiness</h2>
              {primaryResume ? (
                <Link href="/resume" className="jc-resume-file text-inherit no-underline">
                  <span className="jc-file-icon">▤</span>
                  <span className="jc-resume-file-copy"><b>{primaryResume.name}</b><span>{primaryResume.is_primary ? "Primary version" : "Latest version"} · ready in your private workspace</span></span>
                  <span className="jc-ready-pill">Ready</span>
                </Link>
              ) : (
                <Link href="/resume" className="jc-resume-file text-inherit no-underline">
                  <span className="jc-file-icon">＋</span>
                  <span className="jc-resume-file-copy"><b>Add your first resume</b><span>Build an ATS-friendly version or upload PDF/DOCX.</span></span>
                  <span className="jc-ready-pill">Start</span>
                </Link>
              )}
              <div className="mt-5 flex flex-wrap gap-2">
                {targetRoles.slice(0, 4).map((role: string) => <span key={role} className="jc-chip">Target · {role}</span>)}
                <Link href="/certificates" className="jc-chip no-underline">{certificateCount ?? 0} certificate{certificateCount === 1 ? "" : "s"}</Link>
              </div>
            </article>
          </div>
        </section>

        <section id="edit-profile" className="jc-card jc-edit-card">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div><p className="jc-eyebrow">EDIT YOUR CAREER SIGNAL</p><h2 className="jc-section-title">Keep the facts current</h2><p className="jc-section-subtitle">Only include information you can genuinely stand behind.</p></div>
            <Link href="/resume" className="jc-text-link">Open resume studio ↗</Link>
          </div>
          {params.error ? <p className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">{params.error}</p> : null}
          {params.message ? <p className="mt-5 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{params.message}</p> : null}
          <form action={saveProfile} className="jc-form-grid">
            <Field label="Full name" name="fullName" required defaultValue={profile?.full_name ?? user.user_metadata?.full_name ?? ""} />
            <Field label="Phone" name="phone" type="tel" defaultValue={profile?.phone ?? ""} />
            <Field label="City" name="city" placeholder="e.g. Bengaluru" defaultValue={profile?.city ?? ""} />
            <Field label="Experience (years)" name="experienceYears" type="number" min="0" max="50" step="0.5" defaultValue={profile?.experience_years ?? ""} />
            <div className="jc-form-span"><Field label="Professional headline" name="headline" placeholder="e.g. Data Analyst | SQL | Power BI" defaultValue={profile?.headline ?? ""} /></div>
            <div className="jc-form-span"><Field label="Skills" name="skills" placeholder="SQL, Power BI, Excel, Python" defaultValue={skills.join(", ")} /><p className="mt-2 text-xs text-[#789087]">Comma separated. Add only skills you can demonstrate.</p></div>
            <div className="jc-form-span"><Field label="Target roles" name="targetRoles" placeholder="Data Analyst, Business Analyst" defaultValue={targetRoles.join(", ")} /><p className="mt-2 text-xs text-[#789087]">Keep this focused to roles you would actually apply for.</p></div>
            <fieldset className="jc-form-span">
              <legend className="text-xs font-extrabold text-[#385b50]">Preferred work mode</legend>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {["On-site", "Hybrid", "Remote"].map((mode) => <label key={mode} className="flex cursor-pointer items-center gap-3 rounded-[14px] border border-[#ddd7cb] bg-[#efede7] px-4 py-3.5 text-sm font-semibold"><input type="checkbox" name="workMode" value={mode} defaultChecked={modes.includes(mode)} className="h-4 w-4 accent-[#278363]" />{mode}</label>)}
              </div>
            </fieldset>
            <div className="jc-form-span flex flex-col gap-3 border-t border-[#e4ded4] pt-5 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs text-[#789087]">These details power JobCraft&apos;s non-AI matching and job filters.</p><button className="jc-button-primary">Save profile →</button></div>
          </form>
        </section>
      </div>
    </WorkspaceShell>
  );
}

function PublicProfilePreview() {
  return (
    <WorkspaceShell active="profile" authenticated={false} name="Your profile" headline="Candidate" strength={0}>
      <div className="jc-content-wrap">
        <section className="jc-discover-head"><div><p className="jc-eyebrow">YOUR SIGNAL, MADE LEGIBLE</p><h1 className="jc-page-title">My profile</h1></div><Link href="/profile?auth=signup" scroll={false} className="jc-button-primary">Create profile →</Link></section>
        <section className="jc-profile-layout">
          <article className="jc-dark-card jc-profile-identity"><div className="jc-profile-person"><span className="jc-profile-avatar">JC</span><div><h2>Your profile</h2><p>Build a factual career signal for better matching.</p></div></div><div className="jc-profile-facts"><div className="jc-profile-fact"><b>⌖</b><span>Your city</span></div><div className="jc-profile-fact"><b>@</b><span>Your account email</span></div></div><div className="jc-strength-block"><div className="jc-strength-copy"><span>Profile strength</span><b>0%</b></div><div className="jc-strength-track"><span style={{ width: "0%" }} /></div><p>Add real skills, roles and preferences to strengthen your signal.</p></div></article>
          <div className="jc-profile-stack"><article className="jc-card jc-toolkit-card"><p className="jc-eyebrow">YOUR TOOLKIT</p><h2 className="jc-section-title">Skills &amp; strengths</h2><div className="jc-skills-wrap">{["SQL", "Power BI", "Excel", "Python"].map((skill) => <span key={skill} className="jc-skill-pill">{skill}</span>)}</div><p className="mt-5 text-xs text-[#789087]">Examples only. Your saved profile uses only the skills you enter.</p></article><article className="jc-card jc-resume-ready-card"><p className="jc-eyebrow">READY WHEN YOU ARE</p><h2 className="jc-section-title">Resume readiness</h2><Link href="/resume" className="jc-resume-file text-inherit no-underline"><span className="jc-file-icon">▤</span><span className="jc-resume-file-copy"><b>Resume workspace</b><span>Build or upload a private resume after signup.</span></span><span className="jc-ready-pill">Explore</span></Link></article></div>
        </section>
      </div>
    </WorkspaceShell>
  );
}

function Field({ label, name, defaultValue, placeholder = "", type = "text", required = false, min, max, step }: { label: string; name: string; defaultValue: string | number; placeholder?: string; type?: string; required?: boolean; min?: string | number; max?: string | number; step?: string | number }) {
  return <label className="jc-form-field">{label}<input className="jc-input" name={name} required={required} type={type} min={min} max={max} step={step} defaultValue={defaultValue} placeholder={placeholder} /></label>;
}

function initialsFor(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "JC";
}
