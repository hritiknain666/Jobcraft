import { requireAdzunaConfig } from "./config";

export type AdzunaSearchInput = {
  what?: string;
  where?: string;
  page?: number;
  resultsPerPage?: number;
};

export async function fetchAdzunaIndia(input: AdzunaSearchInput = {}) {
  const { appId, appKey } = requireAdzunaConfig();
  const page = Math.min(Math.max(Math.trunc(input.page ?? 1), 1), 50);
  const resultsPerPage = Math.min(Math.max(Math.trunc(input.resultsPerPage ?? 20), 1), 50);

  const url = new URL(`https://api.adzuna.com/v1/api/jobs/in/search/${page}`);
  url.searchParams.set("app_id", appId);
  url.searchParams.set("app_key", appKey);
  url.searchParams.set("results_per_page", String(resultsPerPage));
  url.searchParams.set("content-type", "application/json");
  if (input.what?.trim()) url.searchParams.set("what", input.what.trim().slice(0, 120));
  if (input.where?.trim()) url.searchParams.set("where", input.where.trim().slice(0, 120));

  const response = await fetch(url, { headers: { Accept: "application/json" }, cache: "no-store" });
  if (!response.ok) throw new Error(`Adzuna request failed with status ${response.status}.`);
  return response.json();
}
