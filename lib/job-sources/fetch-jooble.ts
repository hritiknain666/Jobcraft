import { requireJoobleConfig } from "./config";

export type JoobleJob = {
  id?: string | number;
  title?: string;
  location?: string;
  snippet?: string;
  salary?: string;
  source?: string;
  type?: string;
  link?: string;
  company?: string;
  updated?: string;
};

export type JoobleResponse = {
  totalCount?: number;
  jobs?: JoobleJob[];
};

export async function fetchJoobleIndia(input: { keywords?: string; page?: number; resultsPerPage?: number } = {}): Promise<JoobleResponse> {
  const { apiKey } = requireJoobleConfig();
  const page = Math.min(Math.max(Math.trunc(input.page ?? 1), 1), 50);
  const resultsPerPage = Math.min(Math.max(Math.trunc(input.resultsPerPage ?? 20), 1), 50);

  const response = await fetch(`https://jooble.org/api/${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({
      keywords: input.keywords?.trim().slice(0, 120) ?? "",
      location: "India",
      page: String(page),
      ResultOnPage: String(resultsPerPage),
      companysearch: "false",
    }),
    cache: "no-store",
  });

  if (!response.ok) throw new Error(`Jooble request failed with status ${response.status}.`);
  return response.json();
}
