import Link from "next/link";
import type { calculateJobsListMatch } from "@/lib/jobs-list-match";

type JobsListMatch = ReturnType<typeof calculateJobsListMatch>;

export function JobMatchAside({ jobId, match }: { jobId: string; match: JobsListMatch }) {
  const tone = match?.confidence === "limited"
    ? "text-slate-500"
    : match && match.score >= 75
      ? "text-emerald-600"
      : match && match.score >= 55
        ? "text-amber-600"
        : "text-slate-700";

  return (
    <aside className="border-t border-slate-100 bg-slate-50/70 p-5 lg:border-l lg:border-t-0">
      {match ? (
        <>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] font-black tracking-[.14em] text-slate-400">YOUR MATCH</p>
              <p className="mt-1 font-black">{match.label}</p>
            </div>
            <span className={`text-3xl font-black ${tone}`}>{match.score}%</span>
          </div>
          <div className="mt-3 h-2 rounded-full bg-slate-200"><div className="h-2 rounded-full bg-emerald-500" style={{ width: `${match.score}%` }} /></div>
          <p className="mt-2 text-[11px] font-black uppercase tracking-[.08em] text-slate-400">{Math.round(match.evidenceCoverage * 100)}% evidence coverage</p>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            {match.confidence === "limited"
              ? "Provider data is limited, so treat this score as an early signal."
              : match.missing.length
                ? `${match.missing.length} listed skill gap${match.missing.length === 1 ? "" : "s"}.`
                : "Known match signals are covered well."}
          </p>
        </>
      ) : (
        <>
          <p className="text-[10px] font-black tracking-[.14em] text-violet-600">UNLOCK YOUR FIT</p>
          <p className="mt-2 font-black">See matched + missing skills</p>
          <p className="mt-2 text-xs leading-5 text-slate-500">Add your profile skills to make each role easier to judge.</p>
        </>
      )}
      <Link href={`/jobs/${jobId}`} className="mt-5 block rounded-xl bg-[#0b1020] px-4 py-3 text-center text-sm font-black text-white transition group-hover:bg-violet-600">View role →</Link>
    </aside>
  );
}
