import type { NormalizedJob } from "./types";

export const JOBCRAFT_SAMPLE_SOURCE = "JobCraft";

export function isSampleJob(job: Pick<NormalizedJob, "source" | "isSample">) {
  return job.isSample || job.source === JOBCRAFT_SAMPLE_SOURCE;
}

export function assertLiveImport(job: NormalizedJob) {
  if (isSampleJob(job)) {
    throw new Error("Sample jobs cannot be imported through the live job pipeline.");
  }
  return job;
}
