export type AdzunaConfig = {
  appId: string;
  appKey: string;
};

function readSecret(value: string | undefined) {
  const cleaned = value?.trim();
  return cleaned ? cleaned : null;
}

export function getAdzunaConfig(env: NodeJS.ProcessEnv = process.env): AdzunaConfig | null {
  const appId = readSecret(env.ADZUNA_APP_ID);
  const appKey = readSecret(env.ADZUNA_APP_KEY);

  if (!appId || !appKey) return null;
  return { appId, appKey };
}

export function isAdzunaPublishingReady(env: NodeJS.ProcessEnv = process.env) {
  return env.ADZUNA_PUBLISHING_READY?.trim().toLowerCase() === "true";
}

export function requireAdzunaConfig(env: NodeJS.ProcessEnv = process.env): AdzunaConfig {
  const config = getAdzunaConfig(env);
  if (!config) {
    throw new Error("Adzuna access is disabled until ADZUNA_APP_ID and ADZUNA_APP_KEY are configured.");
  }
  return config;
}
