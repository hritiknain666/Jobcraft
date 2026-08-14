import type { JobSourceInput, NormalizedJob } from "./types";

function cleanText(value: string | null | undefined, fallback = "") {
  return (value ?? fallback).trim();
}

function cleanNumber(value: number | null | undefined) {
  return value === null || value === undefined || Number.isNaN(value) ? null : value;
}

export function normalizeJob(input: JobSourceInput): NormalizedJob {
  const source = cleanText(input.source);
  const externalId = cleanText(input.externalId);
  const title = cleanText(input.title);
  const company = cleanText(input.company);

  if (!source || !externalId || !title || !company) {
    throw new Error("Normalized jobs require source, externalId, title, and company.");
  }

  return {
    source,
    externalId,
    title,
    company,
    location: cleanText(input.location, "India"),
    workMode: cleanText(input.workMode, "On-site"),
    experienceMin: cleanNumber(input.experienceMin) ?? 0,
    experienceMax: cleanNumber(input.experienceMax),
    salaryMinLpa: cleanNumber(input.salaryMinLpa),
    salaryMaxLpa: cleanNumber(input.salaryMaxLpa),
    skills: [...new Set((input.skills ?? []).map((skill) => skill.trim()).filter(Boolean))],
    description: cleanText(input.description),
    applyUrl: cleanText(input.applyUrl) || null,
    postedAt: cleanText(input.postedAt) || new Date().toISOString(),
    isActive: input.isActive ?? true,
    isSample: input.isSample ?? false,
  };
}

export function toJobsTableRow(job: NormalizedJob) {
  return {
    source: job.source,
    external_id: job.externalId,
    title: job.title,
    company: job.company,
    location: job.location,
    work_mode: job.workMode,
    experience_min: job.experienceMin,
    experience_max: job.experienceMax,
    salary_min_lpa: job.salaryMinLpa,
    salary_max_lpa: job.salaryMaxLpa,
    skills: job.skills,
    description: job.description,
    apply_url: job.applyUrl,
    is_active: job.isActive,
    posted_at: job.postedAt,
  };
}
