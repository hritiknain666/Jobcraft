import type { RemotiveResponse } from "../fetch-remotive";
import { extractJobMetadata } from "../extract-metadata";
import { isIndiaEligibleRemoteLocation } from "../india-eligibility";
import { normalizeJob } from "../normalize";
import { toPlainText } from "../plain-text";

export function normalizeRemotiveIndia(payload: RemotiveResponse) {
  return (payload.jobs ?? []).flatMap((job) => {
    if (job.id === null || job.id === undefined || !job.title || !job.company_name) return [];
    const candidateLocation = (job.candidate_required_location ?? "").trim();
    if (!isIndiaEligibleRemoteLocation(candidateLocation)) return [];

    const description = toPlainText(job.description);
    const extracted = extractJobMetadata(job.title, description);
    const skills = [job.category, ...extracted.skills].filter((value): value is string => Boolean(value?.trim()));

    return [normalizeJob({
      source: "Remotive",
      externalId: String(job.id),
      title: job.title,
      company: job.company_name,
      location: candidateLocation || "Remote · Worldwide",
      workMode: "Remote",
      skills: [...new Set(skills)].slice(0, 40),
      description,
      applyUrl: job.url ?? null,
      postedAt: job.publication_date ?? null,
      isSample: false,
    })];
  });
}
