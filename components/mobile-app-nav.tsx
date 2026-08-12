"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type MobileAppNavProps = { authenticated: boolean };

const primaryItems = [
  { key: "home", label: "Home", href: "/dashboard", icon: "⌂" },
  { key: "jobs", label: "Jobs", href: "/jobs", icon: "⌕" },
  { key: "applications", label: "Applications", href: "/applications", icon: "▣" },
  { key: "resume", label: "Resume", href: "/resume", icon: "▤" },
] as const;

const morePaths = ["/profile", "/certificates", "/career-assistant", "/cover-letter"];

export default function MobileAppNav({ authenticated }: MobileAppNavProps) {
  const pathname = usePathname();
  if (!authenticated) return null;

  const activeKey = pathname.startsWith("/dashboard")
    ? "home"
    : pathname.startsWith("/jobs")
      ? "jobs"
      : pathname.startsWith("/applications")
        ? "applications"
        : pathname.startsWith("/resume")
          ? "resume"
          : morePaths.some((path) => pathname.startsWith(path))
            ? "more"
            : undefined;

  return <>
    <div className="h-24 md:hidden" aria-hidden="true" />
    <nav aria-label="Mobile app navigation" className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 px-2 pb-[max(.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-12px_35px_rgba(15,23,42,.08)] backdrop-blur-xl md:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-5 items-end">
        {primaryItems.map(item => {
          const active = activeKey === item.key;
          return <Link key={item.key} href={item.href} className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[11px] font-bold transition ${active ? "bg-violet-50 text-violet-700" : "text-slate-500 active:bg-slate-100"}`}><span className="text-xl leading-none" aria-hidden="true">{item.icon}</span><span>{item.label}</span></Link>;
        })}
        <details className="group relative"><summary className={`flex min-h-14 cursor-pointer list-none flex-col items-center justify-center gap-1 rounded-xl px-1 text-[11px] font-bold [&::-webkit-details-marker]:hidden ${activeKey === "more" ? "bg-violet-50 text-violet-700" : "text-slate-500 active:bg-slate-100"}`}><span className="text-xl leading-none" aria-hidden="true">•••</span><span>More</span></summary><div className="absolute bottom-16 right-1 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_20px_60px_rgba(15,23,42,.18)]">{[["Profile","/profile"],["Certificates","/certificates"],["Career Assistant","/career-assistant"],["Cover Letters","/cover-letter"]].map(([label,href])=><Link key={href} href={href} className="block rounded-xl px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">{label}</Link>)}</div></details>
      </div>
    </nav>
  </>;
}
