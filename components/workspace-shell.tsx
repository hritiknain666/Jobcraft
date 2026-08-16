import Link from "next/link";
import { logout } from "@/app/auth/actions";

type ActiveKey = "workspace" | "jobs" | "applications" | "profile" | "resume" | "resume-builder" | "resume-tailor" | "certificates" | "cover-letter" | "career-assistant";

type WorkspaceShellProps = {
  active: ActiveKey;
  name?: string | null;
  headline?: string | null;
  strength?: number;
  authenticated?: boolean;
  children: React.ReactNode;
};

const primaryNav = [
  ["workspace", "Workspace", "/dashboard", "grid"],
  ["jobs", "Discover roles", "/jobs", "compass"],
  ["applications", "Applications", "/applications", "briefcase"],
  ["profile", "My profile", "/profile", "user"],
] as const;

const toolNav = [
  ["resume", "Resume studio", "/resume", "document"],
  ["resume-builder", "Resume builder", "/resume/builder", "pencil"],
  ["resume-tailor", "Resume tailoring", "/resume/tailor", "wand"],
  ["certificates", "Certificates", "/certificates", "award"],
  ["cover-letter", "Cover letters", "/cover-letter", "mail"],
] as const;

export default function WorkspaceShell({ active, name, headline, strength = 0, authenticated = true, children }: WorkspaceShellProps) {
  const displayName = name?.trim() || "Your profile";
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "JC";
  const safeStrength = Math.max(0, Math.min(100, Math.round(strength)));

  return (
    <div className="jc-app-shell">
      <aside className="jc-sidebar">
        <Link href="/dashboard" className="jc-brand" aria-label="JobCraft workspace">
          <span className="jc-brand-mark" aria-hidden="true"><NavIcon name="spark" /></span>
          <span className="jc-brand-name">JobCraft</span>
        </Link>

        <div className="jc-nav-section">
          <p className="jc-nav-label">YOUR COMMAND CENTER</p>
          <nav className="jc-nav-list" aria-label="Workspace navigation">
            {primaryNav.map(([key, label, href, icon]) => (
              <NavLink key={key} active={active === key} href={href} label={label} icon={icon} />
            ))}
          </nav>
        </div>

        <div className="jc-nav-section jc-tools-section">
          <p className="jc-nav-label">CAREER TOOLS</p>
          <nav className="jc-nav-list" aria-label="Career tools">
            {toolNav.map(([key, label, href, icon]) => (
              <NavLink key={key} active={active === key} href={href} label={label} icon={icon} compact />
            ))}
          </nav>
        </div>

        <div className="jc-sidebar-bottom">
          <div className="jc-signal-card" aria-label={`Profile strength ${safeStrength}%`}>
            <div className="jc-signal-head"><span>PROFILE SIGNAL</span><b>{safeStrength}%</b></div>
            <div className="jc-signal-track"><span style={{ width: `${safeStrength}%` }} /></div>
            <p>{safeStrength >= 85 ? "Your signal is strong" : "Complete My profile to improve matches"}</p>
          </div>

          <div className="jc-user-row">
            <span className="jc-avatar" aria-hidden="true">{initials}</span>
            <span className="jc-user-copy">
              <b>{authenticated ? displayName : "Log in or join"}</b>
              <span>{headline?.trim() || (authenticated ? "JobCraft candidate" : "Activate your career workspace")}</span>
            </span>
            {authenticated ? (
              <form action={logout}>
                <button className="jc-logout-button" aria-label="Log out" title="Log out"><NavIcon name="sliders" /></button>
              </form>
            ) : (
              <Link href="/dashboard?auth=login" scroll={false} className="jc-logout-button" aria-label="Log in" title="Log in"><NavIcon name="sliders" /></Link>
            )}
          </div>
        </div>
      </aside>

      <div className="jc-main-column">
        <header className="jc-topbar">
          <div className="jc-intention"><span /> Search with intention.</div>
          <div className="jc-top-actions">
            <Link href="/career-assistant" className="jc-button-primary !px-3 !py-2 text-[11px]" aria-label="Open AI Assistant preview">
              ✣ AI Assistant <span className="ml-1 rounded-full bg-white/20 px-2 py-0.5 text-[8px] uppercase tracking-[.08em]">Preview</span>
            </Link>
            {!authenticated ? <Link href="/dashboard?auth=login" scroll={false} className="jc-text-link">Log in</Link> : null}
            <Link href="/applications" className="jc-bell" aria-label="Applications"><NavIcon name="bell" /><span /></Link>
          </div>
        </header>
        <main className="jc-workspace-content">{children}</main>
      </div>
    </div>
  );
}

function NavLink({ active, href, label, icon, compact = false }: { active: boolean; href: string; label: string; icon: string; compact?: boolean }) {
  return (
    <Link href={href} className={`jc-nav-item ${active ? "is-active" : ""} ${compact ? "is-compact" : ""}`}>
      <span className="jc-nav-icon"><NavIcon name={icon} /></span>
      <span>{label}</span>
      {active ? <b aria-hidden="true">›</b> : null}
    </Link>
  );
}

function NavIcon({ name }: { name: string }) {
  const common = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.9, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (name === "grid") return <svg {...common}><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/></svg>;
  if (name === "compass") return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="m15.4 8.6-2 4.8-4.8 2 2-4.8 4.8-2Z"/></svg>;
  if (name === "briefcase") return <svg {...common}><rect x="3" y="7" width="18" height="12" rx="2"/><path d="M8 7V5.7C8 4.8 8.8 4 9.7 4h4.6c.9 0 1.7.8 1.7 1.7V7M3 11.5c5.7 2.2 12.3 2.2 18 0"/></svg>;
  if (name === "user") return <svg {...common}><circle cx="12" cy="8" r="4"/><path d="M4.5 20c.8-4 3.3-6 7.5-6s6.7 2 7.5 6"/><circle cx="12" cy="12" r="9"/></svg>;
  if (name === "document") return <svg {...common}><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v5h5M9 13h6M9 17h6"/></svg>;
  if (name === "pencil") return <svg {...common}><path d="m4 20 4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Z"/><path d="m13.5 8.5 3 3"/></svg>;
  if (name === "wand") return <svg {...common}><path d="m4 20 11-11M13 4l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3ZM18 14l.7 2.1L21 17l-2.3.8L18 20l-.8-2.2L15 17l2.2-.9L18 14Z"/></svg>;
  if (name === "award") return <svg {...common}><circle cx="12" cy="9" r="5"/><path d="m9 13-2 8 5-3 5 3-2-8"/></svg>;
  if (name === "mail") return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></svg>;
  if (name === "bell") return <svg {...common}><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></svg>;
  if (name === "sliders") return <svg {...common}><path d="M4 7h10M18 7h2M4 17h2M10 17h10M14 5v4M8 15v4"/></svg>;
  return <svg {...common}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8"/><circle cx="12" cy="12" r="3"/></svg>;
}
