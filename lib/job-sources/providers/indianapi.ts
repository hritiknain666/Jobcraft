import type { IndianApiJob, IndianApiResponse } from "../fetch-indianapi";
import { extractJobMetadata } from "../extract-metadata";
import { normalizeJob } from "../normalize";
import { toPlainText } from "../plain-text";

function rows(payload: IndianApiResponse): IndianApiJob[] {
  if (Array.isArray(payload)) return payload;
  return payload.jobs ?? payload.data ?? [];
}

function parseExperience(value: string | null | undefined) {
  const text = (value ?? "").trim();
  if (!text) return { min: null, max: null };
  if (/\bfresher\b|\bentry[- ]level\b|\bno experience\b/i.test(text)) return { min: 0, max: null };
  const values = [...text.matchAll(/\d+(?:\.\d+)?/g)].map((match) => Number(match[0])).filter(Number.isFinite);
  if (!values.length) return { min: null, max: null };
  return { min: values[0], max: values.length > 1 ? values[1] : null };
}

export function normalizeIndianApiJobs(payload: IndianApiResponse) {
  return rows(payload).flatMap((job) => {
    if (job.id === null || job.id === undefined || !job.title || !job.company) return [];

    const description = toPlainText([
      job.job_description,
      job.role_and_responsibility,
      job.education_and_skills,
    ].filter(Boolean).join("\n\n"));
    const extracted = extractJobMetadata(job.title, description);
    const experience = parseExperience(job.experience);

    return [normalizeJob({
      source: "IndianAPI",
      externalId: String(job.id),
      title: job.title,
      company: job.company,
      location: job.location ?? "India",
      workMode: extracted.workMode,
      experienceMin: experience.min,
      experienceMax: experience.max,
      skills: extracted.skills,
      description,
      applyUrl: job.apply_link ?? null,
      postedAt: job.posted_date ?? null,
      isSample: false,
    })];
  });
}
