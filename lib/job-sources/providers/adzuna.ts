import { normalizeJob } from "../normalize";
import type { JobSourceAdapter } from "../adapters";

type AdzunaResponse = {
  results?: Array<{
    id?: string | number;
    title?: string;
    description?: string;
    created?: string;
    redirect_url?: string;
    salary_min?: number;
    salary_max?: number;
    company?: { display_name?: string };
    location?: { display_name?: string };
  }>;
};

export const normalizeAdzunaIndia: JobSourceAdapter<AdzunaResponse> = (payload) =>
  (payload.results ?? []).flatMap((job) => {
    if (!job.id || !job.title || !job.company?.display_name) return [];
    return [normalizeJob({
      source: "Adzuna",
      externalId: String(job.id),
      title: job.title,
      company: job.company.display_name,
      location: job.location?.display_name ?? "India",
      salaryMinLpa: typeof job.salary_min === "number" ? job.salary_min / 100000 : null,
      salaryMaxLpa: typeof job.salary_max === "number" ? job.salary_max / 100000 : null,
      description: job.description ?? "",
      applyUrl: job.redirect_url ?? null,
      postedAt: job.created ?? null,
      isSample: false,
    })];
  });
