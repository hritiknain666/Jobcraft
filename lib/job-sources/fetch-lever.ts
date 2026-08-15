export type LeverJob = {
  id?: string;
  text?: string;
  categories?: {
    location?: string;
    allLocations?: string[];
    commitment?: string;
    team?: string;
    department?: string;
  };
  country?: string | null;
  descriptionPlain?: string;
  openingPlain?: string;
  additionalPlain?: string;
  hostedUrl?: string;
  applyUrl?: string;
  workplaceType?: "unspecified" | "on-site" | "remote" | "hybrid" | string;
  salaryRange?: { currency?: string; interval?: string; min?: number; max?: number };
};

export type LeverSitePayload = {
  site: string;
  company: string;
  jobs: LeverJob[];
};

export async function fetchLeverSite(siteInput: string, companyInput: string): Promise<LeverSitePayload> {
  const site = siteInput.trim().slice(0, 120);
  const company = companyInput.trim().slice(0, 180);
  if (!site || !/^[a-z0-9_-]+$/i.test(site) || !company) throw new Error("Invalid Lever site configuration.");

  const jobs: LeverJob[] = [];
  const pageSize = 100;
  for (let page = 0; page < 10; page += 1) {
    const url = new URL(`https://api.lever.co/v0/postings/${encodeURIComponent(site)}`);
    url.searchParams.set("mode", "json");
    url.searchParams.set("skip", String(page * pageSize));
    url.searchParams.set("limit", String(pageSize));

    const response = await fetch(url, {
      headers: { Accept: "application/json", "User-Agent": "JobCraft/1.0" },
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`Lever request failed with status ${response.status}.`);
    const batch = await response.json() as LeverJob[];
    jobs.push(...batch);
    if (batch.length < pageSize) break;
  }

  return { site, company, jobs };
}
