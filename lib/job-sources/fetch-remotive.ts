export type RemotiveJob = {
  id?: number | string;
  url?: string;
  title?: string;
  company_name?: string;
  category?: string;
  job_type?: string;
  publication_date?: string;
  candidate_required_location?: string;
  salary?: string;
  description?: string;
};

export type RemotiveResponse = {
  "job-count"?: number;
  jobs?: RemotiveJob[];
};

export async function fetchRemotive(limit = 100): Promise<RemotiveResponse> {
  const safeLimit = Math.min(Math.max(Math.trunc(limit), 1), 200);
  const url = new URL("https://remotive.com/api/remote-jobs");
  url.searchParams.set("limit", String(safeLimit));

  const response = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": "JobCraft/1.0" },
    cache: "no-store",
  });

  if (!response.ok) throw new Error(`Remotive request failed with status ${response.status}.`);
  return response.json();
}
