import { normalizeJob } from "../normalize";
import type { JobSourceAdapter } from "../adapters";
import type { AdzunaSearchResponse } from "../fetch-adzuna";

// Adzuna's basic search response does not provide reliable structured work-mode,
// experience, or skill fields. Keep those values unknown rather than inventing them.
// Salary persistence also stays disabled until India salary units are verified from
// an approved real-provider preview.
export const normalizeAdzunaIndia: JobSourceAdapter<AdzunaSearchResponse> = (payload) =>
  (payload.results ?? []).flatMap((job) => {
    if (!job.id || !job.title || !job.company?.display_name) return [];
    return [normalizeJob({
      source: "Adzuna",
      externalId: String(job.id),
      title: job.title,
      company: job.company.display_name,
      location: job.location?.display_name ?? "India",
      workMode: null,
      experienceMin: null,
      experienceMax: null,
      salaryMinLpa: null,
      salaryMaxLpa: null,
      skills: [],
      description: job.description ?? "",
      applyUrl: job.redirect_url ?? null,
      postedAt: job.created ?? null,
      isSample: false,
    })];
  });
