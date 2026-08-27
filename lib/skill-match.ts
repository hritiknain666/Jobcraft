const SKILL_ALIASES: Record<string, string> = {
  js: "javascript",
  javascript: "javascript",
  "node.js": "nodejs",
  nodejs: "nodejs",
  "react.js": "react",
  reactjs: "react",
  react: "react",
  "power bi": "powerbi",
  powerbi: "powerbi",
  "ms excel": "excel",
  "microsoft excel": "excel",
  excel: "excel",
  postgres: "postgresql",
  postgresql: "postgresql",
  "sql server": "mssql",
  mssql: "mssql",
  "business analysis": "businessanalysis",
  "business analyst": "businessanalysis",
};

export function normalizeSkill(skill: string) {
  const normalized = skill
    .trim()
    .toLowerCase()
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ");

  return SKILL_ALIASES[normalized] ?? normalized.replace(/\s+/g, "");
}

export function skillsMatch(a: string, b: string) {
  return normalizeSkill(a) === normalizeSkill(b);
}

export function compareSkills(jobSkills: string[], userSkills: string[]) {
  const matched = jobSkills.filter((jobSkill) =>
    userSkills.some((userSkill) => skillsMatch(jobSkill, userSkill)),
  );

  const missing = jobSkills.filter(
    (jobSkill) => !userSkills.some((userSkill) => skillsMatch(jobSkill, userSkill)),
  );

  return { matched, missing };
}
