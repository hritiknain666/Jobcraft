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

const normalize = (value: string) => value.trim().toLowerCase();

export function getJobMatchLabel(score: number) {
  if (score >= 75) return "Strong fit";
  if (score >= 55) return "Potential fit";
  return "Review first";
}

export function calculateJobMatch(input: MatchInput) {
  const userSkills = new Set(input.userSkills.map(normalize));
  const matchedSkills = input.jobSkills.filter((skill) => userSkills.has(normalize(skill)));
  const missingSkills = input.jobSkills.filter((skill) => !userSkills.has(normalize(skill)));
  const skillScore = input.jobSkills.length ? (matchedSkills.length / input.jobSkills.length) * 60 : 30;
  const userExp = Number(input.userExperience ?? 0);
  const requiredExp = Number(input.jobMinExperience ?? 0);
  const experienceScore = requiredExp === 0 ? 15 : Math.min(userExp / requiredExp, 1) * 15;
  const preferredModes = (input.preferredWorkModes ?? []).map(normalize);
  const modeScore = !preferredModes.length || !input.jobWorkMode || preferredModes.includes(normalize(input.jobWorkMode)) ? 10 : 3;
  const locationScore = !input.userCity || !input.jobLocation || normalize(input.jobLocation).includes(normalize(input.userCity)) || normalize(input.jobWorkMode ?? "") === "remote" ? 5 : 1;
  const targetRoles = (input.targetRoles ?? []).map(normalize);
  const title = normalize(input.jobTitle ?? "");
  const roleScore = !targetRoles.length || targetRoles.some((role) => title.includes(role) || role.includes(title)) ? 10 : 3;
  const score = Math.max(0, Math.min(100, Math.round(skillScore + experienceScore + modeScore + locationScore + roleScore)));

  const strengths: string[] = [];
  if (matchedSkills.length) strengths.push(`You match ${matchedSkills.length} of ${input.jobSkills.length} listed skills.`);
  if (userExp >= requiredExp) strengths.push("Your experience meets the listed minimum.");
  if (modeScore === 10) strengths.push("The work mode fits your preferences.");
  if (roleScore === 10) strengths.push("The role aligns with your target jobs.");

  const improvements: string[] = [];
  if (missingSkills.length) improvements.push(`Strengthen or demonstrate: ${missingSkills.slice(0, 4).join(", ")}.`);
  if (userExp < requiredExp) improvements.push(`The role asks for about ${requiredExp} years of experience; highlight relevant projects and measurable results.`);
  if (locationScore < 5) improvements.push("Check whether the location works for you or whether relocation is possible.");

  return { score, matchedSkills, missingSkills, strengths, improvements };
}
