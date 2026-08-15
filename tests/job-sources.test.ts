import test from "node:test";
import assert from "node:assert/strict";
import {
  getAdzunaConfig,
  getGreenhouseBoards,
  getIndianApiConfig,
  getJoobleConfig,
  getLeverSites,
  getTheirStackConfig,
  isAdzunaAttributionReady,
  isAdzunaPublicationApproved,
  isAdzunaPublishingReady,
  isFreePublicSourceEnabled,
} from "../lib/job-sources/config";
import { extractJobMetadata } from "../lib/job-sources/extract-metadata";
import { normalizeJob } from "../lib/job-sources/normalize";
import { normalizeArbeitnowIndia } from "../lib/job-sources/providers/arbeitnow";
import { normalizeGreenhouseIndia } from "../lib/job-sources/providers/greenhouse";
import { normalizeIndianApiJobs } from "../lib/job-sources/providers/indianapi";
import { normalizeJoobleIndia } from "../lib/job-sources/providers/jooble";
import { normalizeLeverIndia } from "../lib/job-sources/providers/lever";
import { normalizeRemotiveIndia } from "../lib/job-sources/providers/remotive";
import { normalizeTheirStackIndia } from "../lib/job-sources/providers/theirstack";
import { validateLiveImportBatch, validateNormalizedJob } from "../lib/job-sources/validate";

function env(values: Record<string, string | undefined>): NodeJS.ProcessEnv {
  return { NODE_ENV: "test", ...values } as NodeJS.ProcessEnv;
}

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
  assert.equal(getAdzunaConfig(env({ ADZUNA_APP_ID: "id" })), null);
  assert.equal(getAdzunaConfig(env({ ADZUNA_APP_KEY: "key" })), null);
  assert.deepEqual(
    getAdzunaConfig(env({ ADZUNA_APP_ID: " id ", ADZUNA_APP_KEY: " key " })),
    { appId: "id", appKey: "key" }
  );
});

test("Adzuna persisted publishing requires approval and attribution readiness", () => {
  const approvedOnly = env({ ADZUNA_PUBLISHING_READY: "true" });
  assert.equal(isAdzunaPublicationApproved(approvedOnly), true);
  assert.equal(isAdzunaAttributionReady(approvedOnly), false);
  assert.equal(isAdzunaPublishingReady(approvedOnly), false);

  const attributionOnly = env({ ADZUNA_ATTRIBUTION_READY: "TRUE" });
  assert.equal(isAdzunaPublicationApproved(attributionOnly), false);
  assert.equal(isAdzunaAttributionReady(attributionOnly), true);
  assert.equal(isAdzunaPublishingReady(attributionOnly), false);

  const ready = env({ ADZUNA_PUBLISHING_READY: " true ", ADZUNA_ATTRIBUTION_READY: "true" });
  assert.equal(isAdzunaPublishingReady(ready), true);
});

test("free source configuration parses keys and curated ATS lists", () => {
  const values = env({
    INDIANAPI_JOBS_API_KEY: " india-key ",
    JOOBLE_API_KEY: " jooble-key ",
    THEIRSTACK_API_KEY: " stack-key ",
    GREENHOUSE_BOARD_TOKENS: "companyone, companytwo",
    LEVER_SITES: "acme|Acme India, example|Example Labs",
  });
  assert.deepEqual(getIndianApiConfig(values), { apiKey: "india-key" });
  assert.deepEqual(getJoobleConfig(values), { apiKey: "jooble-key" });
  assert.deepEqual(getTheirStackConfig(values), { apiKey: "stack-key" });
  assert.deepEqual(getGreenhouseBoards(values), ["companyone", "companytwo"]);
  assert.deepEqual(getLeverSites(values), [
    { site: "acme", company: "Acme India" },
    { site: "example", company: "Example Labs" },
  ]);
  assert.equal(isFreePublicSourceEnabled(env({})), true);
  assert.equal(isFreePublicSourceEnabled(env({ FREE_PUBLIC_JOB_SOURCES_ENABLED: "false" })), false);
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

test("Arbeitnow keeps only India-located jobs from the free feed", () => {
  const jobs = normalizeArbeitnowIndia({ data: [
    { slug: "india-1", company_name: "Acme", title: "Data Analyst", location: "Bengaluru, India", remote: false, description: "SQL and Power BI", url: "https://www.arbeitnow.com/jobs/india-1", created_at: 1_700_000_000 },
    { slug: "germany-1", company_name: "Acme", title: "Engineer", location: "Berlin", remote: true, description: "Remote Python", url: "https://www.arbeitnow.com/jobs/germany-1", created_at: 1_700_000_000 },
  ] });
  assert.equal(jobs.length, 1);
  assert.equal(jobs[0].location, "Bengaluru, India");
  assert.deepEqual(jobs[0].skills, ["SQL", "Power BI"]);
});

test("Remotive keeps remote jobs that explicitly allow India or worldwide candidates", () => {
  const jobs = normalizeRemotiveIndia({ jobs: [
    { id: 1, title: "Backend Engineer", company_name: "Remote Co", candidate_required_location: "Worldwide", description: "Python and AWS", url: "https://remotive.com/remote-jobs/1", publication_date: "2026-08-01T00:00:00Z" },
    { id: 2, title: "US Engineer", company_name: "Remote Co", candidate_required_location: "USA only", description: "Python", url: "https://remotive.com/remote-jobs/2", publication_date: "2026-08-01T00:00:00Z" },
  ] });
  assert.equal(jobs.length, 1);
  assert.equal(jobs[0].workMode, "Remote");
  assert.equal(jobs[0].applyUrl, "https://remotive.com/remote-jobs/1");
});

test("Greenhouse normalizer strips HTML and ignores non-India locations", () => {
  const jobs = normalizeGreenhouseIndia({
    boardToken: "acme",
    boardName: "Acme",
    jobs: [
      { id: 1, title: "Analyst", location: { name: "Pune, India" }, content: "<p>Use <strong>SQL</strong> daily.</p>", absolute_url: "https://boards.greenhouse.io/acme/jobs/1", updated_at: "2026-08-01T00:00:00Z" },
      { id: 2, title: "Analyst", location: { name: "London, UK" }, content: "SQL" },
    ],
  });
  assert.equal(jobs.length, 1);
  assert.equal(jobs[0].description, "Use SQL daily.");
  assert.equal(jobs[0].externalId, "acme:1");
});

test("Lever normalizer uses official workplace type and annual INR salary", () => {
  const jobs = normalizeLeverIndia({
    site: "acme",
    company: "Acme",
    jobs: [{
      id: "abc",
      text: "Software Engineer",
      country: "IN",
      categories: { location: "Hyderabad, India", allLocations: ["Hyderabad, India"] },
      descriptionPlain: "Build services with TypeScript and PostgreSQL.",
      workplaceType: "hybrid",
      salaryRange: { currency: "INR", interval: "year", min: 1_200_000, max: 1_800_000 },
      applyUrl: "https://jobs.lever.co/acme/abc/apply",
    }],
  });
  assert.equal(jobs.length, 1);
  assert.equal(jobs[0].workMode, "Hybrid");
  assert.equal(jobs[0].salaryMinLpa, 12);
  assert.equal(jobs[0].salaryMaxLpa, 18);
});

test("IndianAPI normalizer extracts explicit experience and skills", () => {
  const jobs = normalizeIndianApiJobs([{ id: 7, title: "Data Analyst", company: "Example", location: "Mumbai", experience: "2-4 years", job_description: "Use SQL and Power BI in a hybrid role.", apply_link: "https://example.com/jobs/7", posted_date: "2026-08-01T00:00:00Z" }]);
  assert.equal(jobs.length, 1);
  assert.equal(jobs[0].experienceMin, 2);
  assert.equal(jobs[0].experienceMax, 4);
  assert.equal(jobs[0].workMode, "Hybrid");
  assert.deepEqual(jobs[0].skills, ["SQL", "Power BI"]);
});

test("Jooble normalizer keeps provider links and evidence-only metadata", () => {
  const jobs = normalizeJoobleIndia({ totalCount: 1, jobs: [{ id: 99, title: "Business Analyst", company: "Example", location: "Delhi", snippet: "On-site role using Excel and SQL", link: "https://in.jooble.org/jdp/99", updated: "2026-08-01T00:00:00Z" }] });
  assert.equal(jobs.length, 1);
  assert.equal(jobs[0].workMode, "On-site");
  assert.deepEqual(jobs[0].skills, ["SQL", "Excel"]);
});

test("TheirStack converts only annual INR salary values to LPA", () => {
  const jobs = normalizeTheirStackIndia({ data: [{ id: 5, job_title: "Data Engineer", company: "Example", long_location: "Bengaluru, India", description: "Remote Python SQL role", remote: true, salary_currency: "INR", min_annual_salary: 2_000_000, max_annual_salary: 3_000_000, technology_slugs: ["snowflake"], url: "https://example.com/jobs/5", date_posted: "2026-08-01" }] });
  assert.equal(jobs.length, 1);
  assert.equal(jobs[0].salaryMinLpa, 20);
  assert.equal(jobs[0].salaryMaxLpa, 30);
  assert.equal(jobs[0].workMode, "Remote");
  assert.ok(jobs[0].skills.some((skill) => skill.toLowerCase() === "snowflake"));
});
