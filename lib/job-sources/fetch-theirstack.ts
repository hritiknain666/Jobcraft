import { requireTheirStackConfig } from "./config";

export type TheirStackJob = {
  id?: number | string;
  job_title?: string;
  company?: string;
  location?: string;
  long_location?: string;
  description?: string;
  date_posted?: string;
  remote?: boolean;
  hybrid?: boolean;
  technology_slugs?: string[];
  keyword_slugs?: string[];
  url?: string;
  source_url?: string;
  salary_currency?: string;
  min_annual_salary?: number;
  max_annual_salary?: number;
};

export type TheirStackResponse = {
  data?: TheirStackJob[];
  metadata?: { total_results?: number };
};

export async function fetchTheirStackIndia(input: { page?: number; limit?: number } = {}): Promise<TheirStackResponse> {
  const { apiKey } = requireTheirStackConfig();
  const page = Math.min(Math.max(Math.trunc(input.page ?? 0), 0), 4);
  const limit = Math.min(Math.max(Math.trunc(input.limit ?? 10), 1), 25);

  const response = await fetch("https://api.theirstack.com/v1/jobs/search", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      job_country_code_or: ["IN"],
      posted_at_max_age_days: 30,
      is_closed: false,
      limit,
      page,
    }),
    cache: "no-store",
  });

  if (!response.ok) throw new Error(`TheirStack request failed with status ${response.status}.`);
  return response.json();
}
