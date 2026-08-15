import type { ArbeitnowResponse } from "../fetch-arbeitnow";
import { extractJobMetadata } from "../extract-metadata";
import { isIndiaEligibleRemoteLocation, isIndiaLocation } from "../india-eligibility";
import { normalizeJob } from "../normalize";
import { toPlainText } from "../plain-text";

export function normalizeArbeitnowIndia(payload: ArbeitnowResponse) {
  return (payload.data ?? []).flatMap((job) => {
    if (!job.slug || !job.title || !job.company_name) return [];

    const location = (job.location ?? "").trim();
    const indiaEligible = isIndiaLocation(location) || (job.remote === true && isIndiaEligibleRemoteLocation(location));
    if (!indiaEligible) return [];

    const description = toPlainText(job.description);
    const extracted = extractJobMetadata(job.title, description);
    const postedAt = job.created_at && Number.isFinite(job.created_at)
      ? new Date(job.created_at * 1000).toISOString()
      : null;

    return [normalizeJob({
      source: "Arbeitnow",
      externalId: job.slug,
      title: job.title,
      company: job.company_name,
      location: location || (job.remote ? "Remote · India eligible" : "India"),
      workMode: job.remote ? "Remote" : extracted.workMode,
      skills: [...new Set([...(job.tags ?? []), ...extracted.skills])].slice(0, 40),
      description,
      applyUrl: job.url ?? null,
      postedAt,
      isSample: false,
    })];
  });
}
