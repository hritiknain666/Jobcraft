import test from "node:test";
import assert from "node:assert/strict";
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
