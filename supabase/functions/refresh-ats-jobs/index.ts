import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";

type JobRow = {
  source: string;
  external_id: string;
  title: string;
  company: string;
  location: string;
  work_mode: "Remote" | "Hybrid" | "On-site" | null;
  experience_min: number | null;
  experience_max: number | null;
  salary_min_lpa: number | null;
  salary_max_lpa: number | null;
  skills: string[];
  description: string;
  apply_url: string | null;
  is_active: boolean;
  posted_at: string;
};

type FeedResult = {
  key: string;
  source: string;
  displayName: string;
  externalIdPrefix?: string;
  jobs: JobRow[];
  error?: string;
  disabled?: boolean;
  configured?: boolean;
};

const GREENHOUSE = [{ token: "phonepe", company: "PhonePe" }] as const;
const LEVER = [
  { site: "hevodata", company: "Hevo Data" },
  { site: "acceldata", company: "Acceldata" },
  { site: "levelai", company: "Level AI" },
] as const;

const SKILLS: Array<[string, RegExp]> = [
  ["SQL", /\bsql\b/i], ["Power BI", /\bpower\s*bi\b/i], ["Excel", /\b(?:microsoft\s+|ms\s+)?excel\b/i],
  ["Python", /\bpython\b/i], ["Java", /\bjava\b(?!script)/i], ["JavaScript", /\bjavascript\b|\bjs\b/i],
  ["TypeScript", /\btypescript\b/i], ["React", /\breact(?:\.js|js)?\b/i], ["Node.js", /\bnode(?:\.js|js)\b/i],
  ["AWS", /\baws\b|\bamazon web services\b/i], ["Azure", /\bazure\b/i], ["GCP", /\bgcp\b|\bgoogle cloud(?: platform)?\b/i],
  ["Tableau", /\btableau\b/i], ["Salesforce", /\bsalesforce\b/i], ["SAP", /\bsap\b/i], ["C++", /\bc\+\+\b/i],
  ["C#", /\bc#\b/i], [".NET", /(?:^|\s)\.net\b/i], ["HTML", /\bhtml5?\b/i], ["CSS", /\bcss3?\b/i],
  ["Git", /\bgit\b/i], ["Docker", /\bdocker\b/i], ["Kubernetes", /\bkubernetes\b|\bk8s\b/i],
  ["PostgreSQL", /\bpostgres(?:ql)?\b/i], ["MySQL", /\bmysql\b/i], ["MongoDB", /\bmongodb\b/i],
  ["Snowflake", /\bsnowflake\b/i], ["Databricks", /\bdatabricks\b/i], ["Airflow", /\bairflow\b/i],
  ["Spark", /\bapache\s+spark\b|\bspark\b/i], ["Looker", /\blooker\b/i], ["Figma", /\bfigma\b/i],
];

function plain(value: unknown, max = 20_000) {
  return String(value ?? "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ").replace(/&amp;/gi, "&").replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ").trim().slice(0, max);
}

function skillsFor(title: string, description: string, extras: unknown[] = []) {
  const haystack = `${title} ${description} ${extras.map((value) => String(value ?? "")).join(" ")}`;
  return [...new Set(SKILLS.filter(([, rx]) => rx.test(haystack)).map(([name]) => name))];
}

function isIndiaLocation(value: unknown) {
  const v = plain(value, 500).toLowerCase();
  return /\bindia\b|\bbengaluru\b|\bbangalore\b|\bmumbai\b|\bdelhi\b|\bnew delhi\b|\bhyderabad\b|\bpune\b|\bchennai\b|\bgurugram\b|\bgurgaon\b|\bnoida\b|\bkolkata\b|\bahmedabad\b|\bkochi\b|\bcochin\b|\bjaipur\b|\bchandigarh\b|\bcoimbatore\b|\bindore\b|\bsurat\b|\bvadodara\b|\bnashik\b|\bmysuru\b|\bmysore\b/.test(v);
}

function safeUrl(value: unknown) {
  const raw = plain(value, 1500);
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    const host = url.hostname.toLowerCase();
    if (!host || host === "localhost" || host.endsWith(".local")) return null;
    if (/^(?:127\.|10\.|0\.|169\.254\.|192\.168\.)/.test(host)) return null;
    const private172 = host.match(/^172\.(\d{1,3})\./);
    if (private172 && Number(private172[1]) >= 16 && Number(private172[1]) <= 31) return null;
    return url.toString();
  } catch {
    return null;
  }
}

function iso(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    const millis = value > 10_000_000_000 ? value : value * 1000;
    const date = new Date(millis);
    if (Number.isFinite(date.getTime()) && date.getUTCFullYear() >= 2000) return date.toISOString();
  }
  if (typeof value === "string" && /^\d{10,13}$/.test(value.trim())) {
    const n = Number(value);
    if (Number.isFinite(n)) return iso(n);
  }
  const date = new Date(String(value ?? ""));
  return Number.isFinite(date.getTime()) && date.getUTCFullYear() >= 2000 ? date.toISOString() : new Date().toISOString();
}

function inferMode(title: string, description: string, explicit?: unknown): JobRow["work_mode"] {
  const direct = String(explicit ?? "").trim().toLowerCase();
  if (direct === "remote") return "Remote";
  if (direct === "hybrid") return "Hybrid";
  if (direct === "on-site" || direct === "onsite") return "On-site";
  const value = `${title} ${description}`;
  if (/\bhybrid\b/i.test(value)) return "Hybrid";
  if (/\bremote\b|\bwork\s+from\s+home\b|\bwfh\b/i.test(value) && !/\b(?:not|no)\s+remote\b/i.test(value)) return "Remote";
  if (/\bon[- ]?site\b|\bwork\s+from\s+office\b|\boffice[- ]based\b/i.test(value)) return "On-site";
  return null;
}

function experience(value: string): [number | null, number | null] {
  const range = value.match(/(\d+(?:\.\d+)?)\s*(?:-|–|to)\s*(\d+(?:\.\d+)?)\s*(?:years?|yrs?)/i);
  if (range) return [Number(range[1]), Number(range[2])];
  const one = value.match(/(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?)/i);
  return one ? [Number(one[1]), null] : [null, null];
}

function annualInrToLpa(value: unknown, currency: unknown, interval: unknown) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0 || String(currency ?? "").toUpperCase() !== "INR" || !/year|annual/i.test(String(interval ?? ""))) return null;
  return Math.round((n / 100_000) * 100) / 100;
}

async function fetchJson(url: string, init: RequestInit = {}) {
  const response = await fetch(url, {
    ...init,
    headers: { Accept: "application/json", "User-Agent": "JobCraft/1.0 job discovery for candidates", ...(init.headers ?? {}) },
    signal: AbortSignal.timeout(25_000),
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return await response.json();
}

async function greenHouseFeed(token: string, companyFallback: string): Promise<FeedResult> {
  const key = `Greenhouse:${token}`;
  try {
    const encoded = encodeURIComponent(token);
    const [board, payload] = await Promise.all([
      fetchJson(`https://boards-api.greenhouse.io/v1/boards/${encoded}`),
      fetchJson(`https://boards-api.greenhouse.io/v1/boards/${encoded}/jobs?content=true`),
    ]);
    const company = plain(board?.name, 220) || companyFallback;
    const jobs: JobRow[] = [];
    for (const raw of Array.isArray(payload?.jobs) ? payload.jobs : []) {
      const id = raw?.id;
      const title = plain(raw?.title, 350);
      const location = plain(raw?.location?.name, 400);
      const description = plain(raw?.content);
      if (id === null || id === undefined || !title || !isIndiaLocation(location) || description.length < 40) continue;
      const applyUrl = safeUrl(raw?.absolute_url);
      if (!applyUrl) continue;
      const [experienceMin, experienceMax] = experience(description);
      jobs.push({
        source: "Greenhouse", external_id: `${token}:${id}`, title, company, location: location || "India",
        work_mode: inferMode(title, description), experience_min: experienceMin, experience_max: experienceMax,
        salary_min_lpa: null, salary_max_lpa: null, skills: skillsFor(title, description), description,
        apply_url: applyUrl, is_active: true, posted_at: iso(raw?.updated_at),
      });
    }
    return { key, source: "Greenhouse", displayName: `${company} via Greenhouse`, externalIdPrefix: `${token}:`, jobs };
  } catch (error) {
    return { key, source: "Greenhouse", displayName: `${companyFallback} via Greenhouse`, externalIdPrefix: `${token}:`, jobs: [], error: error instanceof Error ? error.message : "Unknown Greenhouse error" };
  }
}

async function leverFeed(site: string, company: string): Promise<FeedResult> {
  const key = `Lever:${site}`;
  try {
    const rows: any[] = [];
    const pageSize = 100;
    for (let page = 0; page < 10; page += 1) {
      const url = new URL(`https://api.lever.co/v0/postings/${encodeURIComponent(site)}`);
      url.searchParams.set("mode", "json");
      url.searchParams.set("skip", String(page * pageSize));
      url.searchParams.set("limit", String(pageSize));
      const batch = await fetchJson(url.toString());
      if (!Array.isArray(batch)) throw new Error("Unexpected Lever response");
      rows.push(...batch);
      if (batch.length < pageSize) break;
    }

    const jobs: JobRow[] = [];
    for (const raw of rows) {
      const id = raw?.id;
      const title = plain(raw?.text, 350);
      const allLocations = Array.isArray(raw?.categories?.allLocations) ? raw.categories.allLocations.map((v: unknown) => plain(v, 250)).filter(Boolean) : [];
      const primary = plain(raw?.categories?.location, 300);
      const locations = allLocations.length ? allLocations : (primary ? [primary] : []);
      const locationText = locations.join(" · ");
      const india = String(raw?.country ?? "").toUpperCase() === "IN" || locations.some((v: string) => isIndiaLocation(v));
      const description = plain([raw?.openingPlain, raw?.descriptionPlain, raw?.additionalPlain].filter(Boolean).join("\n\n"));
      if (!id || !title || !india || description.length < 40) continue;
      const applyUrl = safeUrl(raw?.applyUrl ?? raw?.hostedUrl);
      if (!applyUrl) continue;
      const [experienceMin, experienceMax] = experience(description);
      const extras = [raw?.categories?.team, raw?.categories?.department, raw?.categories?.commitment];
      jobs.push({
        source: "Lever", external_id: `${site}:${id}`, title, company, location: locationText || "India",
        work_mode: inferMode(title, description, raw?.workplaceType), experience_min: experienceMin, experience_max: experienceMax,
        salary_min_lpa: annualInrToLpa(raw?.salaryRange?.min, raw?.salaryRange?.currency, raw?.salaryRange?.interval),
        salary_max_lpa: annualInrToLpa(raw?.salaryRange?.max, raw?.salaryRange?.currency, raw?.salaryRange?.interval),
        skills: skillsFor(title, description, extras), description, apply_url: applyUrl, is_active: true,
        posted_at: iso(raw?.createdAt ?? raw?.updatedAt),
      });
    }
    return { key, source: "Lever", displayName: `${company} via Lever`, externalIdPrefix: `${site}:`, jobs };
  } catch (error) {
    return { key, source: "Lever", displayName: `${company} via Lever`, externalIdPrefix: `${site}:`, jobs: [], error: error instanceof Error ? error.message : "Unknown Lever error" };
  }
}

async function adzunaFeed(): Promise<FeedResult> {
  const appId = Deno.env.get("ADZUNA_APP_ID")?.trim();
  const appKey = Deno.env.get("ADZUNA_APP_KEY")?.trim();
  const publishingReady = Deno.env.get("ADZUNA_PUBLISHING_READY")?.trim().toLowerCase() === "true";
  const attributionReady = Deno.env.get("ADZUNA_ATTRIBUTION_READY")?.trim().toLowerCase() === "true";
  const configured = Boolean(appId && appKey);
  if (!configured || !publishingReady || !attributionReady) {
    return { key: "Adzuna", source: "Adzuna", displayName: "Adzuna", jobs: [], disabled: true, configured };
  }
  try {
    const url = new URL("https://api.adzuna.com/v1/api/jobs/in/search/1");
    url.searchParams.set("app_id", appId!);
    url.searchParams.set("app_key", appKey!);
    url.searchParams.set("results_per_page", "20");
    url.searchParams.set("content-type", "application/json");
    const payload = await fetchJson(url.toString());
    const jobs: JobRow[] = [];
    for (const raw of Array.isArray(payload?.results) ? payload.results : []) {
      const id = raw?.id;
      const title = plain(raw?.title, 350);
      const company = plain(raw?.company?.display_name, 300);
      const description = plain(raw?.description);
      const location = plain(raw?.location?.display_name, 400) || "India";
      if (id === null || id === undefined || !title || !company || description.length < 40) continue;
      const applyUrl = safeUrl(raw?.redirect_url);
      if (!applyUrl) continue;
      const [experienceMin, experienceMax] = experience(description);
      jobs.push({
        source: "Adzuna", external_id: String(id), title, company, location,
        work_mode: inferMode(title, description), experience_min: experienceMin, experience_max: experienceMax,
        salary_min_lpa: null, salary_max_lpa: null, skills: skillsFor(title, description), description,
        apply_url: applyUrl, is_active: true, posted_at: iso(raw?.created),
      });
    }
    return { key: "Adzuna", source: "Adzuna", displayName: "Adzuna", jobs, configured: true };
  } catch (error) {
    return { key: "Adzuna", source: "Adzuna", displayName: "Adzuna", jobs: [], configured: true, error: error instanceof Error ? error.message : "Unknown Adzuna error" };
  }
}

async function snapshotUpsert(supabase: SupabaseClient, feed: FeedResult) {
  let upserted = 0;
  if (feed.jobs.length) {
    const { data, error } = await supabase.from("jobs").upsert(feed.jobs, { onConflict: "source,external_id" }).select("id");
    if (error) throw error;
    upserted = data?.length ?? 0;
  }

  if (feed.externalIdPrefix) {
    const { data: existing, error } = await supabase.from("jobs")
      .select("external_id")
      .eq("source", feed.source)
      .like("external_id", `${feed.externalIdPrefix}%`);
    if (error) throw error;
    const current = new Set(feed.jobs.map((job) => job.external_id));
    const stale = (existing ?? []).map((row) => String(row.external_id ?? "")).filter((id) => id && !current.has(id));
    for (let i = 0; i < stale.length; i += 100) {
      const { error: updateError } = await supabase.from("jobs").update({ is_active: false }).eq("source", feed.source).in("external_id", stale.slice(i, i + 100));
      if (updateError) throw updateError;
    }
  }
  return upserted;
}

async function sha256(value: string) {
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)));
  return [...digest].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
function constantEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405 });
  const url = Deno.env.get("SUPABASE_URL");
  const secretMap = Deno.env.get("SUPABASE_SECRET_KEYS");
  const legacy = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  let adminKey = legacy;
  if (secretMap) { try { adminKey = JSON.parse(secretMap)?.default ?? legacy; } catch { adminKey = legacy; } }
  if (!url || !adminKey) return Response.json({ error: "Server configuration unavailable" }, { status: 500 });

  const supabase = createClient(url, adminKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const supplied = req.headers.get("x-jobcraft-cron-secret") ?? "";
  const { data: authRow, error: authError } = await supabase.from("job_refresh_auth").select("secret_sha256").eq("id", true).single();
  if (authError || !authRow || !supplied || !constantEqual(await sha256(supplied), String(authRow.secret_sha256))) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: run, error: runError } = await supabase.from("job_refresh_runs").insert({ status: "running" }).select("id").single();
  if (runError || !run?.id) return Response.json({ error: "Could not create refresh audit record" }, { status: 500 });

  try {
    const feeds = await Promise.all([
      ...GREENHOUSE.map((entry) => greenHouseFeed(entry.token, entry.company)),
      ...LEVER.map((entry) => leverFeed(entry.site, entry.company)),
      adzunaFeed(),
    ]);
    const summary: Record<string, unknown> = {};
    let attempted = 0, failed = 0, imported = 0;

    for (const feed of feeds) {
      if (feed.disabled) {
        summary[feed.key] = { source: feed.source, display_name: feed.displayName, configured: feed.configured ?? false, enabled: false, disabled: true, fetched: 0, upserted: 0, ...(feed.externalIdPrefix ? { external_id_prefix: feed.externalIdPrefix } : {}) };
        continue;
      }
      attempted += 1;
      if (feed.error) {
        failed += 1;
        summary[feed.key] = { source: feed.source, display_name: feed.displayName, configured: feed.configured ?? true, enabled: true, fetched: 0, upserted: 0, error: feed.error, ...(feed.externalIdPrefix ? { external_id_prefix: feed.externalIdPrefix } : {}) };
        continue;
      }
      try {
        const upserted = await snapshotUpsert(supabase, feed);
        imported += upserted;
        summary[feed.key] = { source: feed.source, display_name: feed.displayName, configured: feed.configured ?? true, enabled: true, fetched: feed.jobs.length, upserted, ...(feed.externalIdPrefix ? { external_id_prefix: feed.externalIdPrefix } : {}) };
      } catch (error) {
        failed += 1;
        summary[feed.key] = { source: feed.source, display_name: feed.displayName, configured: feed.configured ?? true, enabled: true, fetched: feed.jobs.length, upserted: 0, error: error instanceof Error ? error.message : "Database update failed", ...(feed.externalIdPrefix ? { external_id_prefix: feed.externalIdPrefix } : {}) };
      }
    }

    const status = failed === 0 ? "success" : failed < Math.max(attempted, 1) ? "partial" : "failed";
    await supabase.from("job_refresh_runs").update({ status, finished_at: new Date().toISOString(), summary }).eq("id", run.id);
    await supabase.rpc("jobcraft_run_feed_maintenance");
    return Response.json({ ok: status !== "failed", status, imported, sources: summary });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown ATS refresh error";
    await supabase.from("job_refresh_runs").update({ status: "failed", finished_at: new Date().toISOString(), error: message }).eq("id", run.id);
    return Response.json({ error: message }, { status: 500 });
  }
});
