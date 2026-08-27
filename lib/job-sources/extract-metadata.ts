export type ExtractedJobMetadata = {
  workMode: "On-site" | "Hybrid" | "Remote" | null;
  skills: string[];
};

const SKILL_PATTERNS: Array<[string, RegExp]> = [
  ["SQL", /\bsql\b/i],
  ["Power BI", /\bpower\s*bi\b/i],
  ["Excel", /\b(?:microsoft\s+|ms\s+)?excel\b/i],
  ["Python", /\bpython\b/i],
  ["Java", /\bjava\b(?!script)/i],
  ["JavaScript", /\bjavascript\b|\bjs\b/i],
  ["TypeScript", /\btypescript\b/i],
  ["React", /\breact(?:\.js|js)?\b/i],
  ["Node.js", /\bnode(?:\.js|js)\b/i],
  ["AWS", /\baws\b|\bamazon web services\b/i],
  ["Azure", /\bazure\b/i],
  ["GCP", /\bgcp\b|\bgoogle cloud(?: platform)?\b/i],
  ["Tableau", /\btableau\b/i],
  ["Salesforce", /\bsalesforce\b/i],
  ["SAP", /\bsap\b/i],
  ["C++", /\bc\+\+\b/i],
  ["C#", /\bc#\b/i],
  [".NET", /(?:^|\s)\.net\b/i],
  ["HTML", /\bhtml5?\b/i],
  ["CSS", /\bcss3?\b/i],
  ["Git", /\bgit\b/i],
  ["Docker", /\bdocker\b/i],
  ["Kubernetes", /\bkubernetes\b|\bk8s\b/i],
  ["PostgreSQL", /\bpostgres(?:ql)?\b/i],
  ["MySQL", /\bmysql\b/i],
  ["MongoDB", /\bmongodb\b/i],
  ["Snowflake", /\bsnowflake\b/i],
  ["Databricks", /\bdatabricks\b/i],
];

export function extractJobMetadata(title: string, description: string): ExtractedJobMetadata {
  const text = `${title}\n${description}`.replace(/\s+/g, " ").trim();
  const workMode = inferWorkMode(text);
  const skills = SKILL_PATTERNS.filter(([, pattern]) => pattern.test(text)).map(([skill]) => skill);

  return { workMode, skills };
}

function inferWorkMode(text: string): ExtractedJobMetadata["workMode"] {
  if (/\bhybrid\b/i.test(text)) return "Hybrid";

  const remoteMention = /\bremote\b|\bwork\s+from\s+home\b|\bwfh\b/i.test(text);
  const remoteNegated =
    /\b(?:not|no)\s+remote\b|\bremote\s+(?:not\s+available|unavailable)\b|\bno\s+wfh\b/i.test(text);
  if (remoteMention && !remoteNegated) return "Remote";

  if (/\bon[- ]?site\b|\bwork\s+from\s+office\b|\boffice[- ]based\b/i.test(text)) return "On-site";
  return null;
}
