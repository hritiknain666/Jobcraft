import { requireIndianApiConfig } from "./config";

export type IndianApiJob = {
  id?: string | number;
  title?: string;
  company?: string;
  about_company?: string;
  job_description?: string;
  job_title?: string;
  job_type?: string;
  location?: string;
  experience?: string;
  role_and_responsibility?: string;
  education_and_skills?: string;
  apply_link?: string;
  posted_date?: string;
};

export type IndianApiResponse = IndianApiJob[] | { jobs?: IndianApiJob[]; data?: IndianApiJob[] };

export async function fetchIndianApiJobs(limit = 25): Promise<IndianApiResponse> {
  const { apiKey } = requireIndianApiConfig();
  const safeLimit = Math.min(Math.max(Math.trunc(limit), 1), 100);
  const url = new URL("https://jobs.indianapi.in/jobs");
  url.searchParams.set("limit", String(safeLimit));

  const response = await fetch(url, {
    headers: { Accept: "application/json", "X-Api-Key": apiKey },
    cache: "no-store",
  });

  if (!response.ok) throw new Error(`IndianAPI request failed with status ${response.status}.`);
  return response.json();
}
