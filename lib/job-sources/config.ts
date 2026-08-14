export type AdzunaConfig = {
  appId: string;
  appKey: string;
};

function readSecret(value: string | undefined) {
  const cleaned = value?.trim();
  return cleaned ? cleaned : null;
}

function readFlag(value: string | undefined) {
  return value?.trim().toLowerCase() === "true";
}

export function getAdzunaConfig(env: NodeJS.ProcessEnv = process.env): AdzunaConfig | null {
  const appId = readSecret(env.ADZUNA_APP_ID);
  const appKey = readSecret(env.ADZUNA_APP_KEY);

  if (!appId || !appKey) return null;
  return { appId, appKey };
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

export function requireAdzunaConfig(env: NodeJS.ProcessEnv = process.env): AdzunaConfig {
  const config = getAdzunaConfig(env);
  if (!config) {
    throw new Error("Adzuna access is disabled until ADZUNA_APP_ID and ADZUNA_APP_KEY are configured.");
  }
  return config;
}
