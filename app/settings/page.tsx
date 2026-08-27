import Link from "next/link";
import WorkspaceShell from "@/components/workspace-shell";
import { logout } from "@/app/auth/actions";
import { deleteAccount } from "@/app/settings/actions";
import { createClient } from "@/lib/supabase/server";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <WorkspaceShell
        active="settings"
        authenticated={false}
        name="Your profile"
        headline="Candidate"
        strength={0}
      >
        <div className="jc-content-wrap">
          <section className="jc-tool-hero">
            <div>
              <p className="jc-eyebrow">ACCOUNT & PRIVACY</p>
              <h1 className="jc-page-title">Settings</h1>
              <p className="jc-page-copy">
                Sign in to manage your JobCraft account settings and workspace preferences.
              </p>
            </div>
            <Link href="/dashboard?auth=login" scroll={false} className="jc-button-primary">
              Log in →
            </Link>
          </section>
        </div>
      </WorkspaceShell>
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name,headline,city,experience_years,skills,target_roles,preferred_work_modes")
    .eq("id", user.id)
    .maybeSingle();

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
      active="settings"
      name={profile?.full_name}
      headline={profile?.headline}
      strength={strength}
    >
      <div className="jc-content-wrap">
        <section className="jc-tool-hero">
          <div>
            <p className="jc-eyebrow">ACCOUNT & PRIVACY</p>
            <h1 className="jc-page-title">Settings</h1>
            <p className="jc-page-copy">
              Manage your account, data controls and important JobCraft policies from one clear
              place.
            </p>
          </div>
        </section>

        <section className="mt-6 grid gap-5 lg:grid-cols-2">
          <article className="jc-card p-6">
            <p className="jc-eyebrow">ACCOUNT</p>
            <h2 className="jc-section-title">Your JobCraft account</h2>
            <p className="mt-3 text-sm leading-6 text-[#789087]">
              Signed in as <b className="text-[#173f33]">{user.email}</b>.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/profile" className="jc-button-secondary">
                Edit profile
              </Link>
              <form action={logout}>
                <button className="jc-button-secondary">Log out</button>
              </form>
            </div>
          </article>

          <article className="jc-card p-6">
            <p className="jc-eyebrow">DATA & POLICIES</p>
            <h2 className="jc-section-title">Your data and policies</h2>
            <p className="mt-3 text-sm leading-6 text-[#789087]">
              Download a machine-readable copy of your JobCraft account data or review the policies
              that govern the service.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a href="/api/account/export" className="jc-button-secondary">
                Download my data
              </a>
              <Link href="/privacy" className="jc-button-secondary">
                Privacy policy
              </Link>
              <Link href="/terms" className="jc-button-secondary">
                Terms
              </Link>
            </div>
          </article>
        </section>

        <section className="mt-6 rounded-[22px] border border-[#e6b8ae] bg-[#fff8f6] p-6 sm:p-8">
          <p className="text-xs font-black uppercase tracking-[.16em] text-[#b74b3d]">
            Danger zone
          </p>
          <h2 className="jc-section-title !mt-3">Delete your JobCraft account</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[#7b675f]">
            This permanently removes your JobCraft profile, resumes, applications, cover letters,
            tailored resumes, certificates and private uploaded files. This action cannot be undone.
          </p>
          <form
            action={deleteAccount}
            className="mt-5 flex max-w-2xl flex-col gap-3 sm:flex-row sm:items-center"
          >
            <label className="sr-only" htmlFor="delete-confirmation">
              Type DELETE to confirm
            </label>
            <input
              id="delete-confirmation"
              name="confirmation"
              required
              placeholder="Type DELETE to confirm"
              className="jc-input sm:max-w-xs"
              autoComplete="off"
            />
            <button className="inline-flex min-h-12 items-center justify-center rounded-[15px] border border-[#c96252] bg-[#b94c3c] px-5 font-extrabold text-white transition hover:bg-[#a23f31]">
              Delete account permanently
            </button>
          </form>
        </section>
      </div>
    </WorkspaceShell>
  );
}
