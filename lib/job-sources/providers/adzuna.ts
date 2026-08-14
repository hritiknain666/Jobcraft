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

// This adapter is not connected to a live importer yet. Validate India salary units from a real API response before enabling salary persistence.
export const normalizeAdzunaIndia: JobSourceAdapter<AdzunaResponse> = (payload) =>
  (payload.results ?? []).flatMap((job) => {
    if (!job.id || !job.title || !job.company?.display_name) return [];
    return [normalizeJob({
      source: "Adzuna",
      externalId: String(job.id),
      title: job.title,
      company: job.company.display_name,
      location: job.location?.display_name ?? "India",
      salaryMinLpa: null,
      salaryMaxLpa: null,
      description: job.description ?? "",
      applyUrl: job.redirect_url ?? null,
      postedAt: job.created ?? null,
      isSample: false,
    })];
  });
