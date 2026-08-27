import type { TheirStackResponse } from "../fetch-theirstack";
import { extractJobMetadata } from "../extract-metadata";
import { normalizeJob } from "../normalize";
import { toPlainText } from "../plain-text";

function annualInrToLpa(value: number | null | undefined, currency: string | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value)) return null;
  return currency?.toUpperCase() === "INR" ? Number((value / 100_000).toFixed(2)) : null;
}

export function normalizeTheirStackIndia(payload: TheirStackResponse) {
  return (payload.data ?? []).flatMap((job) => {
    if (job.id === null || job.id === undefined || !job.job_title || !job.company) return [];
    const description = toPlainText(job.description);
    const extracted = extractJobMetadata(job.job_title, description);
    const sourceSkills = [...(job.technology_slugs ?? []), ...(job.keyword_slugs ?? [])]
      .map((value) => value.replace(/[-_]+/g, " ").trim())
      .filter(Boolean);

    return [
      normalizeJob({
        source: "TheirStack",
        externalId: String(job.id),
        title: job.job_title,
        company: job.company,
        location: job.long_location ?? job.location ?? "India",
        workMode: job.remote ? "Remote" : job.hybrid ? "Hybrid" : extracted.workMode,
        salaryMinLpa: annualInrToLpa(job.min_annual_salary, job.salary_currency),
        salaryMaxLpa: annualInrToLpa(job.max_annual_salary, job.salary_currency),
        skills: [...new Set([...sourceSkills, ...extracted.skills])].slice(0, 40),
        description,
        applyUrl: job.url ?? job.source_url ?? null,
        postedAt: job.date_posted ?? null,
        isSample: false,
      }),
    ];
  });
}
