import type { LeverSitePayload } from "../fetch-lever";
import { extractJobMetadata } from "../extract-metadata";
import { isIndiaLocation } from "../india-eligibility";
import { normalizeJob } from "../normalize";
import { toPlainText } from "../plain-text";

function workMode(value: string | null | undefined) {
  const normalized = value?.trim().toLowerCase();
  if (normalized === "remote") return "Remote";
  if (normalized === "hybrid") return "Hybrid";
  if (normalized === "on-site") return "On-site";
  return null;
}

function annualInrToLpa(
  value: number | null | undefined,
  currency: string | null | undefined,
  interval: string | null | undefined,
) {
  if (value === null || value === undefined || !Number.isFinite(value)) return null;
  const annual = /year|annual/i.test(interval ?? "");
  return currency?.toUpperCase() === "INR" && annual ? Number((value / 100_000).toFixed(2)) : null;
}

export function normalizeLeverIndia(payload: LeverSitePayload) {
  return payload.jobs.flatMap((job) => {
    if (!job.id || !job.text) return [];
    const locations = job.categories?.allLocations?.length
      ? job.categories.allLocations
      : [job.categories?.location ?? ""];
    const isIndia = job.country?.toUpperCase() === "IN" || locations.some(isIndiaLocation);
    if (!isIndia) return [];

    const location = locations.filter(Boolean).join(" · ") || "India";
    const description = toPlainText(
      [job.openingPlain, job.descriptionPlain, job.additionalPlain].filter(Boolean).join("\n\n"),
    );
    const extracted = extractJobMetadata(job.text, `${location}\n${description}`);
    const range = job.salaryRange;

    return [
      normalizeJob({
        source: "Lever",
        externalId: `${payload.site}:${job.id}`,
        title: job.text,
        company: payload.company,
        location,
        workMode: workMode(job.workplaceType) ?? extracted.workMode,
        salaryMinLpa: annualInrToLpa(range?.min, range?.currency, range?.interval),
        salaryMaxLpa: annualInrToLpa(range?.max, range?.currency, range?.interval),
        skills: extracted.skills,
        description,
        applyUrl: job.applyUrl ?? job.hostedUrl ?? null,
        postedAt: null,
        isSample: false,
      }),
    ];
  });
}
