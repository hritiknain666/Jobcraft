import { isSampleJob } from "./source-kind";
import type { NormalizedJob } from "./types";

export function jobIdentity(job: Pick<NormalizedJob, "source" | "externalId">) {
  return `${job.source}::${job.externalId}`;
}

export function validateNormalizedJob(job: NormalizedJob) {
  if (!job.source.trim() || !job.externalId.trim() || !job.title.trim() || !job.company.trim()) {
    throw new Error("Normalized jobs require source, externalId, title, and company.");
  }

  if (!Number.isFinite(job.experienceMin) || job.experienceMin < 0) {
    throw new Error(`Invalid experienceMin for ${jobIdentity(job)}.`);
  }

  if (job.experienceMax !== null && (!Number.isFinite(job.experienceMax) || job.experienceMax < job.experienceMin)) {
    throw new Error(`Invalid experience range for ${jobIdentity(job)}.`);
  }

  if (job.salaryMinLpa !== null && (!Number.isFinite(job.salaryMinLpa) || job.salaryMinLpa < 0)) {
    throw new Error(`Invalid salaryMinLpa for ${jobIdentity(job)}.`);
  }

  if (job.salaryMaxLpa !== null && (!Number.isFinite(job.salaryMaxLpa) || job.salaryMaxLpa < 0)) {
    throw new Error(`Invalid salaryMaxLpa for ${jobIdentity(job)}.`);
  }

  if (job.salaryMinLpa !== null && job.salaryMaxLpa !== null && job.salaryMaxLpa < job.salaryMinLpa) {
    throw new Error(`Invalid salary range for ${jobIdentity(job)}.`);
  }

  if (Number.isNaN(Date.parse(job.postedAt))) {
    throw new Error(`Invalid postedAt for ${jobIdentity(job)}.`);
  }

  return job;
}

export function validateLiveImportBatch(jobs: NormalizedJob[]) {
  const seen = new Set<string>();

  return jobs.map((job) => {
    validateNormalizedJob(job);
    if (isSampleJob(job)) {
      throw new Error(`Sample job ${jobIdentity(job)} cannot enter the live import pipeline.`);
    }

    const identity = jobIdentity(job);
    if (seen.has(identity)) {
      throw new Error(`Duplicate job identity in import batch: ${identity}.`);
    }
    seen.add(identity);
    return job;
  });
}
