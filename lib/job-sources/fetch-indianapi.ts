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

const MAX_ATTEMPTS = 3;

export function retryDelayMs(retryAfter: string | null, attempt: number, now = Date.now()) {
  if (retryAfter) {
    const seconds = Number(retryAfter);
    if (Number.isFinite(seconds) && seconds >= 0) return Math.min(seconds * 1_000, 30_000);
    const dateDelay = new Date(retryAfter).getTime() - now;
    if (Number.isFinite(dateDelay) && dateDelay > 0) return Math.min(dateDelay, 30_000);
  }
  return Math.min(500 * 2 ** attempt, 4_000);
}

const wait = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

export async function fetchIndianApiJobs(limit = 25): Promise<IndianApiResponse> {
  const { apiKey } = requireIndianApiConfig();
  const safeLimit = Math.min(Math.max(Math.trunc(limit), 1), 100);
  const url = new URL("https://jobs.indianapi.in/jobs");
  url.searchParams.set("limit", String(safeLimit));

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const response = await fetch(url, {
      headers: { Accept: "application/json", "X-Api-Key": apiKey },
      cache: "no-store",
    });

    if (response.ok) return response.json();
    const retryable = response.status === 429 || response.status >= 500;
    if (!retryable || attempt === MAX_ATTEMPTS - 1) {
      throw new Error(`IndianAPI request failed with status ${response.status}.`);
    }
    await wait(retryDelayMs(response.headers.get("Retry-After"), attempt));
  }

  throw new Error("IndianAPI request failed.");
}
