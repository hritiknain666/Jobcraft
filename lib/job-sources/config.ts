export type AdzunaConfig = {
  appId: string;
  appKey: string;
};

export type ApiKeyConfig = {
  apiKey: string;
};

export type LeverSiteConfig = {
  site: string;
  company: string;
};

function readSecret(value: string | undefined) {
  const cleaned = value?.trim();
  return cleaned ? cleaned : null;
}

function readFlag(value: string | undefined) {
  return value?.trim().toLowerCase() === "true";
}

function readCsv(value: string | undefined) {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function getAdzunaConfig(env: NodeJS.ProcessEnv = process.env): AdzunaConfig | null {
  const appId = readSecret(env.ADZUNA_APP_ID);
  const appKey = readSecret(env.ADZUNA_APP_KEY);
  if (!appId || !appKey) return null;
  return { appId, appKey };
}

export function getIndianApiConfig(env: NodeJS.ProcessEnv = process.env): ApiKeyConfig | null {
  const apiKey = readSecret(env.INDIANAPI_JOBS_API_KEY);
  return apiKey ? { apiKey } : null;
}

export function getJoobleConfig(env: NodeJS.ProcessEnv = process.env): ApiKeyConfig | null {
  const apiKey = readSecret(env.JOOBLE_API_KEY);
  return apiKey ? { apiKey } : null;
}

export function getTheirStackConfig(env: NodeJS.ProcessEnv = process.env): ApiKeyConfig | null {
  const apiKey = readSecret(env.THEIRSTACK_API_KEY);
  return apiKey ? { apiKey } : null;
}

// Greenhouse GET job-board endpoints are public. Configure only board tokens we
// intentionally want JobCraft to ingest; do not try to discover/crawl boards.
export function getGreenhouseBoards(env: NodeJS.ProcessEnv = process.env) {
  return readCsv(env.GREENHOUSE_BOARD_TOKENS).slice(0, 100);
}

// Lever public postings do not expose a reliable display company name, so each
// configured entry uses `site|Company Name`.
export function getLeverSites(env: NodeJS.ProcessEnv = process.env): LeverSiteConfig[] {
  return readCsv(env.LEVER_SITES)
    .map((entry) => {
      const [site, ...companyParts] = entry.split("|");
      const company = companyParts.join("|").trim();
      return { site: site?.trim() ?? "", company };
    })
    .filter((entry) => entry.site && entry.company)
    .slice(0, 100);
}

export function isAdzunaPublicationApproved(env: NodeJS.ProcessEnv = process.env) {
  return readFlag(env.ADZUNA_PUBLISHING_READY);
}

export function isAdzunaAttributionReady(env: NodeJS.ProcessEnv = process.env) {
  return readFlag(env.ADZUNA_ATTRIBUTION_READY);
}

// Persisted publishing requires both provider/commercial approval and the exact
// provider attribution treatment to be verified in production. Preview imports
// remain available before either flag is enabled.
export function isAdzunaPublishingReady(env: NodeJS.ProcessEnv = process.env) {
  return isAdzunaPublicationApproved(env) && isAdzunaAttributionReady(env);
}

export function isFreePublicSourceEnabled(env: NodeJS.ProcessEnv = process.env) {
  return env.FREE_PUBLIC_JOB_SOURCES_ENABLED?.trim().toLowerCase() !== "false";
}

export function requireAdzunaConfig(env: NodeJS.ProcessEnv = process.env): AdzunaConfig {
  const config = getAdzunaConfig(env);
  if (!config) throw new Error("Adzuna access is disabled until ADZUNA_APP_ID and ADZUNA_APP_KEY are configured.");
  return config;
}

export function requireIndianApiConfig(env: NodeJS.ProcessEnv = process.env): ApiKeyConfig {
  const config = getIndianApiConfig(env);
  if (!config) throw new Error("IndianAPI access is disabled until INDIANAPI_JOBS_API_KEY is configured.");
  return config;
}

export function requireJoobleConfig(env: NodeJS.ProcessEnv = process.env): ApiKeyConfig {
  const config = getJoobleConfig(env);
  if (!config) throw new Error("Jooble access is disabled until JOOBLE_API_KEY is configured.");
  return config;
}

export function requireTheirStackConfig(env: NodeJS.ProcessEnv = process.env): ApiKeyConfig {
  const config = getTheirStackConfig(env);
  if (!config) throw new Error("TheirStack access is disabled until THEIRSTACK_API_KEY is configured.");
  return config;
}
