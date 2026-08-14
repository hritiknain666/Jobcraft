"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type MobileAppNavProps = { authenticated: boolean };

const primaryItems = [
  { key: "home", label: "Workspace", href: "/dashboard", icon: "⌂" },
  { key: "jobs", label: "Roles", href: "/jobs", icon: "⌕" },
  { key: "applications", label: "Plan", href: "/applications", icon: "▣" },
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
    <nav aria-label="Mobile app navigation" className="fixed inset-x-0 bottom-0 z-[70] border-t border-[#d8d2c7] bg-[#fbfaf6]/95 px-2 pb-[max(.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-12px_35px_rgba(35,49,43,.09)] backdrop-blur-xl md:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-5 items-end">
        {primaryItems.map((item) => {
          const active = activeKey === item.key;
          return <Link key={item.key} href={item.href} className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-extrabold transition ${active ? "bg-[#e8eee9] text-[#19483a]" : "text-[#718981] active:bg-[#efede7]"}`}><span className={`text-xl leading-none ${active ? "text-[#f49a48]" : ""}`} aria-hidden="true">{item.icon}</span><span>{item.label}</span></Link>;
        })}
        <details className="group relative"><summary className={`flex min-h-14 cursor-pointer list-none flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-extrabold [&::-webkit-details-marker]:hidden ${activeKey === "more" ? "bg-[#e8eee9] text-[#19483a]" : "text-[#718981] active:bg-[#efede7]"}`}><span className={`text-xl leading-none ${activeKey === "more" ? "text-[#f49a48]" : ""}`} aria-hidden="true">•••</span><span>More</span></summary><div className="absolute bottom-16 right-1 w-56 overflow-hidden rounded-[18px] border border-[#d8d2c7] bg-[#fbfaf6] p-2 shadow-[0_20px_60px_rgba(35,49,43,.18)]">{[["My profile","/profile"],["Certificates","/certificates"],["Career assistant","/career-assistant"],["Cover letters","/cover-letter"]].map(([label,href])=><Link key={href} href={href} className="block rounded-xl px-4 py-3 text-sm font-bold text-[#365c50] hover:bg-[#efede7]">{label}</Link>)}</div></details>
      </div>
    </nav>
  </>;
}
