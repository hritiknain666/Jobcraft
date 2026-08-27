import { normalizeJob } from "../normalize";
import { extractJobMetadata } from "../extract-metadata";
import type { JobSourceAdapter } from "../adapters";
import type { AdzunaSearchResponse } from "../fetch-adzuna";

// Adzuna's basic search response does not provide reliable structured experience
// fields. Keep unknown values null. Work mode and common skills are structured only
// when they are explicitly present in the supplied title/description. Salary
// persistence stays disabled until India salary units are verified from a controlled
// real-provider preview.
export const normalizeAdzunaIndia: JobSourceAdapter<AdzunaSearchResponse> = (payload) =>
  (payload.results ?? []).flatMap((job) => {
    if (!job.id || !job.title || !job.company?.display_name) return [];
    const description = job.description ?? "";
    const metadata = extractJobMetadata(job.title, description);

    return [
      normalizeJob({
        source: "Adzuna",
        externalId: String(job.id),
        title: job.title,
        company: job.company.display_name,
        location: job.location?.display_name ?? "India",
        workMode: metadata.workMode,
        experienceMin: null,
        experienceMax: null,
        salaryMinLpa: null,
        salaryMaxLpa: null,
        skills: metadata.skills,
        description,
        applyUrl: job.redirect_url ?? null,
        postedAt: job.created ?? null,
        isSample: false,
      }),
    ];
  });
