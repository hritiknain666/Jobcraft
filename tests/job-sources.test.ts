import test from "node:test";
import assert from "node:assert/strict";
import {
  getAdzunaConfig,
  isAdzunaAttributionReady,
  isAdzunaPublicationApproved,
  isAdzunaPublishingReady,
} from "../lib/job-sources/config";
import { extractJobMetadata } from "../lib/job-sources/extract-metadata";
import { normalizeJob } from "../lib/job-sources/normalize";
import { validateLiveImportBatch, validateNormalizedJob } from "../lib/job-sources/validate";

test("unknown provider metadata stays null", () => {
  const job = normalizeJob({
    source: "Provider",
    externalId: "abc-1",
    title: "Data Analyst",
    company: "Example Ltd",
    location: "India",
  });

  assert.equal(job.workMode, null);
  assert.equal(job.experienceMin, null);
  assert.equal(job.experienceMax, null);
  assert.deepEqual(job.skills, []);
  assert.doesNotThrow(() => validateNormalizedJob(job));
});

test("invalid negative experience is rejected when it is supplied", () => {
  const job = normalizeJob({
    source: "Provider",
    externalId: "abc-2",
    title: "Analyst",
    company: "Example Ltd",
    experienceMin: -1,
  });

  assert.throws(() => validateNormalizedJob(job), /Invalid experienceMin/);
});

test("sample roles cannot enter the live import pipeline", () => {
  const sample = normalizeJob({
    source: "JobCraft",
    externalId: "sample-1",
    title: "Sample Role",
    company: "JobCraft Demo",
    isSample: true,
  });

  assert.throws(() => validateLiveImportBatch([sample]), /Sample job/);
});

test("duplicate provider identities are rejected within one import batch", () => {
  const first = normalizeJob({ source: "Provider", externalId: "same", title: "Role A", company: "Example" });
  const second = normalizeJob({ source: "Provider", externalId: "same", title: "Role B", company: "Example" });

  assert.throws(() => validateLiveImportBatch([first, second]), /Duplicate job identity/);
});

test("Adzuna configuration requires both credentials", () => {
  assert.equal(getAdzunaConfig({ ADZUNA_APP_ID: "id" } as NodeJS.ProcessEnv), null);
  assert.equal(getAdzunaConfig({ ADZUNA_APP_KEY: "key" } as NodeJS.ProcessEnv), null);
  assert.deepEqual(
    getAdzunaConfig({ ADZUNA_APP_ID: " id ", ADZUNA_APP_KEY: " key " } as NodeJS.ProcessEnv),
    { appId: "id", appKey: "key" }
  );
});

test("Adzuna persisted publishing requires approval and attribution readiness", () => {
  const approvedOnly = { ADZUNA_PUBLISHING_READY: "true" } as NodeJS.ProcessEnv;
  assert.equal(isAdzunaPublicationApproved(approvedOnly), true);
  assert.equal(isAdzunaAttributionReady(approvedOnly), false);
  assert.equal(isAdzunaPublishingReady(approvedOnly), false);

  const attributionOnly = { ADZUNA_ATTRIBUTION_READY: "TRUE" } as NodeJS.ProcessEnv;
  assert.equal(isAdzunaPublicationApproved(attributionOnly), false);
  assert.equal(isAdzunaAttributionReady(attributionOnly), true);
  assert.equal(isAdzunaPublishingReady(attributionOnly), false);

  const ready = {
    ADZUNA_PUBLISHING_READY: " true ",
    ADZUNA_ATTRIBUTION_READY: "true",
  } as NodeJS.ProcessEnv;
  assert.equal(isAdzunaPublishingReady(ready), true);
});

test("provider metadata extraction only promotes explicit skills and work mode", () => {
  const metadata = extractJobMetadata(
    "Senior Data Analyst",
    "Hybrid role using SQL, Power BI, Microsoft Excel and Python. Experience with Tableau is useful."
  );

  assert.equal(metadata.workMode, "Hybrid");
  assert.deepEqual(metadata.skills, ["SQL", "Power BI", "Excel", "Python", "Tableau"]);
});

test("negated remote language does not become a remote job", () => {
  const metadata = extractJobMetadata("Software Engineer", "This is not remote. Work from office in Pune using Java and AWS.");
  assert.equal(metadata.workMode, "On-site");
  assert.deepEqual(metadata.skills, ["Java", "AWS"]);
});
