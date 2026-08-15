import type { JoobleResponse } from "../fetch-jooble";
import { extractJobMetadata } from "../extract-metadata";
import { normalizeJob } from "../normalize";
import { toPlainText } from "../plain-text";

export function normalizeJoobleIndia(payload: JoobleResponse) {
  return (payload.jobs ?? []).flatMap((job) => {
    if (job.id === null || job.id === undefined || !job.title || !job.company) return [];
    const description = toPlainText(job.snippet);
    const extracted = extractJobMetadata(job.title, description);

    return [normalizeJob({
      source: "Jooble",
      externalId: String(job.id),
      title: job.title,
      company: job.company,
      location: job.location ?? "India",
      workMode: extracted.workMode,
      skills: extracted.skills,
      description,
      applyUrl: job.link ?? null,
      postedAt: job.updated ?? null,
      isSample: false,
    })];
  });
}
