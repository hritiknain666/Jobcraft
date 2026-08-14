import test from "node:test";
import assert from "node:assert/strict";
import { calculateJobMatch, getJobMatchLabel } from "../lib/job-match";

test("sparse provider data is marked as limited evidence", () => {
  const match = calculateJobMatch({
    jobSkills: [],
    userSkills: ["SQL", "Power BI"],
    jobMinExperience: null,
    userExperience: 3,
    jobLocation: "Delhi, India",
    userCity: "Delhi",
    jobWorkMode: null,
    preferredWorkModes: ["Remote"],
    targetRoles: ["Data Analyst"],
    jobTitle: "Data Analyst",
  });

  assert.equal(match.score, 100);
  assert.equal(match.confidence, "limited");
  assert.equal(match.evidenceCoverage, 0.15);
  assert.equal(getJobMatchLabel(match.score, match.confidence), "Limited evidence");
});

test("complete matching signals can produce a high-confidence strong fit", () => {
  const match = calculateJobMatch({
    jobSkills: ["SQL", "Power BI"],
    userSkills: ["SQL", "PowerBI"],
    jobMinExperience: 2,
    userExperience: 3,
    jobLocation: "Bengaluru, India",
    userCity: "Melbourne",
    jobWorkMode: "Remote",
    preferredWorkModes: ["Remote"],
    targetRoles: ["Data Analyst"],
    jobTitle: "Senior Data Analyst",
  });

  assert.equal(match.score, 100);
  assert.equal(match.confidence, "high");
  assert.equal(match.evidenceCoverage, 1);
  assert.equal(match.missingSkills.length, 0);
  assert.equal(getJobMatchLabel(match.score, match.confidence), "Strong fit");
});

test("known missing skills reduce a score rather than being treated as unknown", () => {
  const match = calculateJobMatch({
    jobSkills: ["SQL", "Python"],
    userSkills: ["SQL"],
    jobMinExperience: 1,
    userExperience: 1,
  });

  assert.equal(match.matchedSkills.length, 1);
  assert.equal(match.missingSkills.length, 1);
  assert.equal(match.confidence, "high");
  assert.ok(match.score < 75);
});
