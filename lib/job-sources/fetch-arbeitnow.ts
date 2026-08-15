export type ArbeitnowJob = {
  slug?: string;
  company_name?: string;
  title?: string;
  description?: string;
  remote?: boolean;
  url?: string;
  tags?: string[];
  job_types?: string[];
  location?: string;
  created_at?: number;
};

export type ArbeitnowResponse = {
  data?: ArbeitnowJob[];
  links?: { next?: string | null };
  meta?: { current_page?: number; last_page?: number };
};

export async function fetchArbeitnow(page = 1): Promise<ArbeitnowResponse> {
  const safePage = Math.min(Math.max(Math.trunc(page), 1), 25);
  const url = new URL("https://www.arbeitnow.com/api/job-board-api");
  url.searchParams.set("page", String(safePage));

  const response = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": "JobCraft/1.0" },
    cache: "no-store",
  });

  if (!response.ok) throw new Error(`Arbeitnow request failed with status ${response.status}.`);
  return response.json();
}
