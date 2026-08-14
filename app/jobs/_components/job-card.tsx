import { calculateJobsListMatch, type JobsListProfile } from "@/lib/jobs-list-match";
import { JobCardMain } from "./job-card-main";
import { JobMatchAside } from "./job-match-aside";

export function JobCard({ job, profile }: { job: any; profile: JobsListProfile | null }) {
  const match = calculateJobsListMatch(job, profile);

  return (
    <article className="group overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,.05)] transition hover:-translate-y-1 hover:border-violet-200 hover:shadow-[0_24px_55px_rgba(15,23,42,.10)]">
      <div className="grid lg:grid-cols-[1fr_215px]">
        <JobCardMain job={job} match={match} />
        <JobMatchAside jobId={job.id} match={match} />
      </div>
    </article>
  );
}
