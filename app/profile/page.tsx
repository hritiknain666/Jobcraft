import Link from "next/link";
import WorkspaceShell from "@/components/workspace-shell";
import { createClient } from "@/lib/supabase/server";
import { saveProfile } from "./actions";

type SetupStep = {
  label: string;
  done: boolean;
  href: string;
};

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
  const setupSteps: SetupStep[] = [
    { label: "Full name", done: Boolean(profile?.full_name?.trim()), href: "#basic-details" },
    { label: "City", done: Boolean(profile?.city?.trim()), href: "#basic-details" },
    { label: "Professional headline", done: Boolean(profile?.headline?.trim()), href: "#career-direction" },
    { label: "Experience", done: profile?.experience_years !== null && profile?.experience_years !== undefined, href: "#basic-details" },
    { label: "Skills", done: skills.length > 0, href: "#career-direction" },
    { label: "Target roles", done: targetRoles.length > 0, href: "#career-direction" },
    { label: "Work preference", done: modes.length > 0, href: "#work-preference" },
    { label: "Resume", done: hasResume, href: "/resume" },
  ];
  const completed = setupSteps.filter((step) => step.done).length;
  const strength = Math.round((completed / setupSteps.length) * 100);
  const displayName = profile?.full_name?.trim() || user.user_metadata?.full_name || "Your profile";
  const initials = initialsFor(displayName);
  const primaryResume = resumes?.find((resume: any) => resume.is_primary) ?? resumes?.[0] ?? null;

  return (
    <WorkspaceShell active="profile" name={displayName} headline={profile?.headline} strength={strength}>
      <div className="jc-content-wrap">
        <section className="jc-discover-head">
          <div>
            <p className="jc-eyebrow">ONE PROFILE · BETTER MATCHES</p>
            <h1 className="jc-page-title">My profile</h1>
            <p className="jc-page-copy">Keep your career facts, direction and preferences in one place. JobCraft uses this profile to improve matching across the product.</p>
          </div>
          <a href="#edit-profile" className="jc-button-secondary">✎ Edit profile</a>
        </section>

        <section className="jc-card mb-6 p-6 sm:p-7" aria-label="Profile setup progress">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="jc-eyebrow">PROFILE SETUP</p>
              <h2 className="jc-section-title">{strength === 100 ? "Your career signal is ready." : `Complete ${setupSteps.length - completed} more step${setupSteps.length - completed === 1 ? "" : "s"}.`}</h2>
              <p className="jc-section-subtitle">Complete the facts that matter most for job matching. You can update them anytime.</p>
            </div>
            <div className="min-w-[190px]">
              <div className="flex items-center justify-between text-xs font-black text-[#385b50]"><span>{completed}/{setupSteps.length} complete</span><span>{strength}%</span></div>
              <div className="jc-signal-track mt-2"><span style={{ width: `${strength}%` }} /></div>
            </div>
          </div>
          <div className="mt-6 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {setupSteps.map((step) => (
              <Link key={step.label} href={step.href} className={`rounded-[14px] border px-4 py-3 text-sm font-bold no-underline ${step.done ? "border-[#cfe0d6] bg-[#e9f4ed] text-[#285844]" : "border-[#e3d5c2] bg-[#fbf0df] text-[#76573b]"}`}>
                {step.done ? "✓" : "○"} {step.label}
              </Link>
            ))}
          </div>
          {strength < 100 ? <p className="mt-4 text-xs leading-6 text-[#789087]">Start with target roles, skills and city if you want useful matches quickly. A resume strengthens your application workflow but does not change facts you enter here.</p> : <Link href="/jobs" className="jc-button-primary mt-5 inline-flex">See matched roles →</Link>}
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
              <div className="jc-section-head"><div><p className="jc-eyebrow">YOUR TOOLKIT</p><h2 className="jc-section-title">Skills &amp; strengths</h2></div><span className="text-2xl text-[#f49a48]">✣</span></div>
              <div className="jc-skills-wrap">{skills.length ? skills.slice(0, 12).map((skill: string) => <span key={skill} className="jc-skill-pill">{skill}</span>) : <span className="text-sm text-[#789087]">Add the skills you can genuinely demonstrate.</span>}</div>
              <a href="#career-direction" className="mt-5 inline-flex text-sm font-extrabold text-[#278363] no-underline">＋ Add or refine skills</a>
            </article>

            <article className="jc-card jc-resume-ready-card">
              <p className="jc-eyebrow">APPLICATION FOUNDATION</p>
              <h2 className="jc-section-title">Resume readiness</h2>
              {primaryResume ? <Link href="/resume" className="jc-resume-file text-inherit no-underline"><span className="jc-file-icon">▤</span><span className="jc-resume-file-copy"><b>{primaryResume.name}</b><span>{primaryResume.is_primary ? "Primary version" : "Latest version"} · ready in your private workspace</span></span><span className="jc-ready-pill">Ready</span></Link> : <Link href="/resume" className="jc-resume-file text-inherit no-underline"><span className="jc-file-icon">＋</span><span className="jc-resume-file-copy"><b>Add your first resume</b><span>Build an ATS-friendly version or upload PDF/DOCX.</span></span><span className="jc-ready-pill">Start</span></Link>}
              <div className="mt-5 flex flex-wrap gap-2">{targetRoles.slice(0, 4).map((role: string) => <span key={role} className="jc-chip">Target · {role}</span>)}<Link href="/certificates" className="jc-chip no-underline">{certificateCount ?? 0} certificate{certificateCount === 1 ? "" : "s"}</Link></div>
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
            <div id="basic-details" className="jc-form-span border-b border-[#e4ded4] pb-2"><p className="jc-eyebrow">1 · BASICS</p><h3 className="mt-2 text-lg font-black text-[#173f33]">Who you are</h3></div>
            <Field label="Full name" name="fullName" required defaultValue={profile?.full_name ?? user.user_metadata?.full_name ?? ""} />
            <Field label="Phone" name="phone" type="tel" defaultValue={profile?.phone ?? ""} />
            <Field label="City" name="city" placeholder="e.g. Bengaluru" defaultValue={profile?.city ?? ""} />
            <Field label="Experience (years)" name="experienceYears" type="number" min="0" max="50" step="0.5" defaultValue={profile?.experience_years ?? ""} />

            <div id="career-direction" className="jc-form-span mt-3 border-b border-[#e4ded4] pb-2"><p className="jc-eyebrow">2 · CAREER DIRECTION</p><h3 className="mt-2 text-lg font-black text-[#173f33]">What you can do and where you are headed</h3></div>
            <div className="jc-form-span"><Field label="Professional headline" name="headline" placeholder="e.g. Data Analyst | SQL | Power BI" defaultValue={profile?.headline ?? ""} /></div>
            <div className="jc-form-span"><Field label="Skills" name="skills" placeholder="SQL, Power BI, Excel, Python" defaultValue={skills.join(", ")} /><p className="mt-2 text-xs text-[#789087]">Comma separated. Add only skills you can demonstrate.</p></div>
            <div className="jc-form-span"><Field label="Target roles" name="targetRoles" placeholder="Data Analyst, Business Analyst" defaultValue={targetRoles.join(", ")} /><p className="mt-2 text-xs text-[#789087]">Keep this focused to 1–3 role families you would actually apply for.</p></div>

            <fieldset id="work-preference" className="jc-form-span mt-3">
              <legend className="jc-eyebrow">3 · WORK PREFERENCE</legend>
              <p className="mt-2 text-lg font-black text-[#173f33]">How you want to work</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">{["On-site", "Hybrid", "Remote"].map((mode) => <label key={mode} className="flex cursor-pointer items-center gap-3 rounded-[14px] border border-[#ddd7cb] bg-[#efede7] px-4 py-3.5 text-sm font-semibold"><input type="checkbox" name="workMode" value={mode} defaultChecked={modes.includes(mode)} className="h-4 w-4 accent-[#278363]" />{mode}</label>)}</div>
            </fieldset>
            <div className="jc-form-span flex flex-col gap-3 border-t border-[#e4ded4] pt-5 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs text-[#789087]">These details power JobCraft&apos;s current matching and filters. AI features will use the same saved facts rather than creating a second profile.</p><button className="jc-button-primary">Save profile →</button></div>
          </form>
        </section>
      </div>
    </WorkspaceShell>
  );
}

function PublicProfilePreview() {
  return <WorkspaceShell active="profile" authenticated={false} name="Your profile" headline="Candidate" strength={0}><div className="jc-content-wrap"><section className="jc-discover-head"><div><p className="jc-eyebrow">ONE PROFILE · BETTER MATCHES</p><h1 className="jc-page-title">My profile</h1><p className="jc-page-copy">One profile powers matching, applications, resumes and future AI guidance.</p></div><Link href="/profile?auth=signup" scroll={false} className="jc-button-primary">Create profile →</Link></section><section className="jc-card p-7"><p className="jc-eyebrow">PROFILE SETUP</p><h2 className="jc-section-title">Eight facts make the foundation.</h2><div className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">{["Full name", "City", "Professional headline", "Experience", "Skills", "Target roles", "Work preference", "Resume"].map((item) => <div key={item} className="rounded-[14px] border border-[#e3d5c2] bg-[#fbf0df] px-4 py-3 text-sm font-bold text-[#76573b]">○ {item}</div>)}</div></section></div></WorkspaceShell>;
}

function Field({ label, name, defaultValue, placeholder = "", type = "text", required = false, min, max, step }: { label: string; name: string; defaultValue: string | number; placeholder?: string; type?: string; required?: boolean; min?: string | number; max?: string | number; step?: string | number }) {
  return <label className="jc-form-field">{label}<input className="jc-input" name={name} required={required} type={type} min={min} max={max} step={step} defaultValue={defaultValue} placeholder={placeholder} /></label>;
}

function initialsFor(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "JC";
}
