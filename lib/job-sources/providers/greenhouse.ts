import type { GreenhouseBoardPayload } from "../fetch-greenhouse";
import { extractJobMetadata } from "../extract-metadata";
import { isIndiaLocation } from "../india-eligibility";
import { normalizeJob } from "../normalize";
import { toPlainText } from "../plain-text";

export function normalizeGreenhouseIndia(payload: GreenhouseBoardPayload) {
  return payload.jobs.flatMap((job) => {
    if (job.id === null || job.id === undefined || !job.title) return [];
    const location = job.location?.name?.trim() ?? "";
    if (!isIndiaLocation(location)) return [];

    const description = toPlainText(job.content);
    const extracted = extractJobMetadata(job.title, `${location}\n${description}`);

    return [
      normalizeJob({
        source: "Greenhouse",
        externalId: `${payload.boardToken}:${job.id}`,
        title: job.title,
        company: payload.boardName,
        location: location || "India",
        workMode: extracted.workMode,
        skills: extracted.skills,
        description,
        applyUrl: job.absolute_url ?? null,
        postedAt: job.updated_at ?? null,
        isSample: false,
      }),
    ];
  });
}
