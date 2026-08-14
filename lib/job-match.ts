import { compareSkills } from "./skill-match";

export type MatchInput = {
  jobSkills: string[];
  userSkills: string[];
  jobMinExperience?: number | null;
  userExperience?: number | null;
  jobLocation?: string | null;
  userCity?: string | null;
  jobWorkMode?: string | null;
  preferredWorkModes?: string[];
  targetRoles?: string[];
  jobTitle?: string | null;
};

export type MatchConfidence = "high" | "medium" | "limited";

const normalize = (value: string) => value.trim().toLowerCase();

export function getJobMatchLabel(score: number, confidence: MatchConfidence = "high") {
  if (confidence === "limited") return "Limited evidence";
  if (score >= 75) return "Strong fit";
  if (score >= 55) return "Potential fit";
  return "Review first";
}

export function getMatchConfidenceLabel(confidence: MatchConfidence) {
  if (confidence === "high") return "High confidence";
  if (confidence === "medium") return "Medium confidence";
  return "Limited evidence";
}

export function calculateJobMatch(input: MatchInput) {
  const { matched: matchedSkills, missing: missingSkills } = compareSkills(
    input.jobSkills,
    input.userSkills,
  );

  let assessedWeight = 0;
  let earnedWeight = 0;

  if (input.jobSkills.length > 0) {
    assessedWeight += 60;
    earnedWeight += (matchedSkills.length / input.jobSkills.length) * 60;
  }

  const userExp = Number(input.userExperience ?? 0);
  const hasExperienceRequirement = input.jobMinExperience !== null && input.jobMinExperience !== undefined && Number.isFinite(Number(input.jobMinExperience));
  const requiredExp = hasExperienceRequirement ? Number(input.jobMinExperience) : null;
  if (requiredExp !== null && requiredExp >= 0) {
    assessedWeight += 15;
    earnedWeight += requiredExp === 0 ? 15 : Math.min(userExp / requiredExp, 1) * 15;
  }

  const preferredModes = (input.preferredWorkModes ?? []).map(normalize).filter(Boolean);
  const jobMode = input.jobWorkMode?.trim() ? normalize(input.jobWorkMode) : null;
  const hasModeSignal = preferredModes.length > 0 && Boolean(jobMode);
  const modeMatches = Boolean(jobMode && preferredModes.includes(jobMode));
  if (hasModeSignal) {
    assessedWeight += 10;
    earnedWeight += modeMatches ? 10 : 0;
  }

  const userCity = input.userCity?.trim() ? normalize(input.userCity) : null;
  const jobLocation = input.jobLocation?.trim() ? normalize(input.jobLocation) : null;
  const hasLocationSignal = Boolean(userCity && jobLocation);
  const locationMatches = Boolean(
    hasLocationSignal &&
    (jobLocation!.includes(userCity!) || jobMode === "remote")
  );
  if (hasLocationSignal) {
    assessedWeight += 5;
    earnedWeight += locationMatches ? 5 : 0;
  }

  const targetRoles = (input.targetRoles ?? []).map(normalize).filter(Boolean);
  const title = normalize(input.jobTitle ?? "");
  const hasRoleSignal = Boolean(title) && targetRoles.length > 0;
  const roleMatches = hasRoleSignal && targetRoles.some((role) => title.includes(role) || role.includes(title));
  if (hasRoleSignal) {
    assessedWeight += 10;
    earnedWeight += roleMatches ? 10 : 0;
  }

  const evidenceCoverage = assessedWeight / 100;
  const confidence: MatchConfidence = evidenceCoverage >= 0.75 ? "high" : evidenceCoverage >= 0.5 ? "medium" : "limited";
  const score = assessedWeight > 0
    ? Math.max(0, Math.min(100, Math.round((earnedWeight / assessedWeight) * 100)))
    : 0;

  const strengths: string[] = [];
  if (input.jobSkills.length > 0 && matchedSkills.length) strengths.push(`You match ${matchedSkills.length} of ${input.jobSkills.length} listed skills.`);
  if (requiredExp !== null && userExp >= requiredExp) strengths.push("Your experience meets the listed minimum.");
  if (hasModeSignal && modeMatches) strengths.push("The work mode fits your preferences.");
  if (hasRoleSignal && roleMatches) strengths.push("The role aligns with your target jobs.");

  const improvements: string[] = [];
  if (missingSkills.length) improvements.push(`Strengthen or demonstrate: ${missingSkills.slice(0, 4).join(", ")}.`);
  if (requiredExp !== null && userExp < requiredExp) improvements.push(`The role asks for about ${requiredExp} years of experience; highlight relevant projects and measurable results.`);
  if (hasModeSignal && !modeMatches) improvements.push("The listed work mode does not match your saved preferences.");
  if (hasLocationSignal && !locationMatches) improvements.push("Check whether the location works for you or whether relocation is possible.");

  return {
    score,
    confidence,
    evidenceCoverage,
    assessedWeight,
    matchedSkills,
    missingSkills,
    strengths,
    improvements,
  };
}
