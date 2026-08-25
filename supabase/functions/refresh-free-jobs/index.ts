import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

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

type SourceResult = { source: string; jobs: JobRow[]; error?: string; rateLimited?: boolean };

type LocationRestriction = string | {
  alpha2?: unknown;
  countryCode?: unknown;
  name?: unknown;
  slug?: unknown;
};

class HttpError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

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

function text(value: unknown, max = 20_000) {
  return String(value ?? "").replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ").replace(/&nbsp;|&#160;/gi, " ").replace(/&amp;/gi, "&").replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/\s+/g, " ").trim().slice(0, max);
}

function skillsFor(title: string, description: string, extras: unknown[] = []) {
  const haystack = `${title} ${description} ${extras.map((v) => String(v ?? "")).join(" ")}`;
  return [...new Set(SKILLS.filter(([, rx]) => rx.test(haystack)).map(([name]) => name))];
}

function validIso(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    const millis = value > 10_000_000_000 ? value : value * 1000;
    const d = new Date(millis);
    if (Number.isFinite(d.getTime())) return d.toISOString();
  }
  const d = new Date(String(value ?? ""));
  return Number.isFinite(d.getTime()) ? d.toISOString() : new Date().toISOString();
}

function annualInrToLpa(value: unknown) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.round((n / 100_000) * 100) / 100 : null;
}

function safeUrl(value: unknown) {
  const raw = text(value, 1500);
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    const host = url.hostname.toLowerCase();
    if (!host || host === "localhost" || host.endsWith(".local") || /^(?:127\.|10\.|0\.|169\.254\.|192\.168\.)/.test(host)) return null;
    const private172 = host.match(/^172\.(\d{1,3})\./);
    if (private172 && Number(private172[1]) >= 16 && Number(private172[1]) <= 31) return null;
    return url.toString();
  } catch { return null; }
}

function indiaRemoteEligible(value: unknown) {
  const v = text(value, 300).toLowerCase();
  if (!v) return true;
  return /\bindia\b|\bworldwide\b|\banywhere\b|\bglobal\b|\bapac\b|\basia\b|\ball locations\b/.test(v);
}

function inferMode(title: string, description: string, fallback: JobRow["work_mode"] = null) {
  const v = `${title} ${description}`;
  if (/\bhybrid\b/i.test(v)) return "Hybrid";
  const negatedRemote = /\b(?:not|no)\s+remote\b|\bremote\s+(?:not\s+available|unavailable)\b|\bno\s+wfh\b/i.test(v);
  if (!negatedRemote && /\bremote\b|\bwork\s+from\s+home\b|\bwfh\b/i.test(v)) return "Remote";
  if (/\bon[- ]?site\b|\bwork\s+from\s+office\b|\boffice[- ]based\b/i.test(v)) return "On-site";
  return fallback;
}

function experienceRange(value: unknown): [number | null, number | null] {
  const v = text(value, 250);
  const range = v.match(/(\d+(?:\.\d+)?)\s*(?:-|–|to)\s*(\d+(?:\.\d+)?)\s*(?:years?|yrs?)/i);
  if (range) return [Number(range[1]), Number(range[2])];
  const one = v.match(/(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?)/i);
  return one ? [Number(one[1]), null] : [null, null];
}

async function fetchJson(url: string, init: RequestInit = {}) {
  const response = await fetch(url, { ...init, headers: { "User-Agent": "JobCraft/1.0 job discovery for candidates", ...(init.headers ?? {}) }, signal: AbortSignal.timeout(20_000) });
  if (!response.ok) throw new HttpError(`${response.status} ${response.statusText}`, response.status);
  return await response.json();
}

function retryDelayMs(retryAfter: string | null, attempt: number) {
  if (retryAfter) {
    const seconds = Number(retryAfter);
    if (Number.isFinite(seconds) && seconds >= 0) return Math.min(seconds * 1_000, 30_000);
    const dateDelay = new Date(retryAfter).getTime() - Date.now();
    if (Number.isFinite(dateDelay) && dateDelay > 0) return Math.min(dateDelay, 30_000);
  }
  return Math.min(500 * 2 ** attempt, 4_000);
}

async function fetchIndianApiJson(apiKey: string) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await fetch("https://jobs.indianapi.in/jobs?limit=50", {
      headers: { "User-Agent": "JobCraft/1.0 job discovery for candidates", "X-Api-Key": apiKey, Accept: "application/json" },
      signal: AbortSignal.timeout(20_000),
    });
    if (response.ok) return await response.json();
    if ((response.status !== 429 && response.status < 500) || attempt === 2) {
      throw new HttpError(`${response.status} ${response.statusText}`, response.status);
    }
    await new Promise((resolve) => setTimeout(resolve, retryDelayMs(response.headers.get("Retry-After"), attempt)));
  }
  throw new HttpError("IndianAPI retries exhausted", 429);
}

async function remotive(): Promise<SourceResult> {
  try {
    const payload = await fetchJson("https://remotive.com/api/remote-jobs?limit=100");
    const jobs: JobRow[] = [];
    for (const raw of Array.isArray(payload?.jobs) ? payload.jobs : []) {
      if (!indiaRemoteEligible(raw?.candidate_required_location)) continue;
      const title = text(raw?.title, 300), company = text(raw?.company_name, 300), description = text(raw?.description), applyUrl = safeUrl(raw?.url);
      if (!raw?.id || !title || !company || description.length < 40 || !applyUrl) continue;
      jobs.push({ source: "Remotive", external_id: String(raw.id), title, company, location: text(raw?.candidate_required_location, 300) || "Worldwide", work_mode: "Remote", experience_min: null, experience_max: null, salary_min_lpa: null, salary_max_lpa: null, skills: skillsFor(title, description), description, apply_url: applyUrl, is_active: true, posted_at: validIso(raw?.publication_date) });
    }
    return { source: "Remotive", jobs };
  } catch (e) { return { source: "Remotive", jobs: [], error: e instanceof Error ? e.message : "Unknown error" }; }
}

async function jobicy(): Promise<SourceResult> {
  try {
    const payload = await fetchJson("https://jobicy.com/api/v2/remote-jobs?count=100");
    const jobs: JobRow[] = [];
    for (const raw of Array.isArray(payload?.jobs) ? payload.jobs : []) {
      if (!indiaRemoteEligible(raw?.jobGeo)) continue;
      const title = text(raw?.jobTitle, 300), company = text(raw?.companyName, 300), description = text(raw?.jobDescription), applyUrl = safeUrl(raw?.url);
      if (!raw?.id || !title || !company || description.length < 40 || !applyUrl) continue;
      const yearly = String(raw?.salaryPeriod ?? "").toLowerCase().includes("year");
      const inr = String(raw?.salaryCurrency ?? "").toUpperCase() === "INR";
      jobs.push({ source: "Jobicy", external_id: String(raw.id), title, company, location: text(raw?.jobGeo, 300) || "Worldwide", work_mode: "Remote", experience_min: null, experience_max: null, salary_min_lpa: yearly && inr ? annualInrToLpa(raw?.salaryMin) : null, salary_max_lpa: yearly && inr ? annualInrToLpa(raw?.salaryMax) : null, skills: skillsFor(title, description, Array.isArray(raw?.jobIndustry) ? raw.jobIndustry : []), description, apply_url: applyUrl, is_active: true, posted_at: validIso(raw?.pubDate) });
    }
    return { source: "Jobicy", jobs };
  } catch (e) { return { source: "Jobicy", jobs: [], error: e instanceof Error ? e.message : "Unknown error" }; }
}

function restrictionText(restriction: LocationRestriction) {
  if (typeof restriction === "string") return restriction;
  return String(restriction?.alpha2 ?? restriction?.countryCode ?? restriction?.name ?? restriction?.slug ?? "");
}

async function himalayas(): Promise<SourceResult> {
  try {
    const payload = await fetchJson("https://himalayas.app/jobs/api/search?country=IN&sort=recent&page=1");
    const rows = Array.isArray(payload?.jobs) ? payload.jobs : Array.isArray(payload?.data) ? payload.data : [];
    const jobs: JobRow[] = [];
    for (const raw of rows) {
      const restrictions = Array.isArray(raw?.locationRestrictions) ? raw.locationRestrictions : [];
      const eligible = restrictions.length === 0 || restrictions.some((r: LocationRestriction) => /^(in|india)$/i.test(restrictionText(r).trim()) || /\bindia\b/i.test(restrictionText(r)));
      if (!eligible) continue;
      const title = text(raw?.title, 300), company = text(raw?.companyName, 300), description = text(raw?.description), applyUrl = safeUrl(raw?.applicationLink);
      if (!raw?.guid || !title || !company || description.length < 40 || !applyUrl) continue;
      const expiryRaw = raw?.expiryDate;
      const expiry = typeof expiryRaw === "number" ? expiryRaw : new Date(String(expiryRaw ?? "")).getTime();
      const expiryMillis = expiry > 0 && expiry < 10_000_000_000 ? expiry * 1000 : expiry;
      if (Number.isFinite(expiryMillis) && expiryMillis > 0 && expiryMillis < Date.now()) continue;
      const location = restrictions.length ? restrictions.map(restrictionText).map((v) => text(v, 100)).filter(Boolean).join(", ") : "Worldwide";
      const inr = String(raw?.currency ?? "").toUpperCase() === "INR";
      jobs.push({ source: "Himalayas", external_id: String(raw.guid), title, company, location, work_mode: "Remote", experience_min: null, experience_max: null, salary_min_lpa: inr ? annualInrToLpa(raw?.minSalary) : null, salary_max_lpa: inr ? annualInrToLpa(raw?.maxSalary) : null, skills: skillsFor(title, description, [...(Array.isArray(raw?.categories) ? raw.categories : []), ...(Array.isArray(raw?.parentCategories) ? raw.parentCategories : [])]), description, apply_url: applyUrl, is_active: true, posted_at: validIso(raw?.pubDate) });
    }
    return { source: "Himalayas", jobs };
  } catch (e) { return { source: "Himalayas", jobs: [], error: e instanceof Error ? e.message : "Unknown error" }; }
}

async function remoteOk(): Promise<SourceResult> {
  try {
    const payload = await fetchJson("https://remoteok.com/api");
    const rows = Array.isArray(payload) ? payload.slice(1) : [];
    const jobs: JobRow[] = [];
    for (const raw of rows) {
      const location = text(raw?.location, 300);
      const tags = Array.isArray(raw?.tags) ? raw.tags.map((v: unknown) => text(v, 100)) : [];
      const remoteEligible = indiaRemoteEligible(location) || tags.some((tag: string) => indiaRemoteEligible(tag));
      if (!remoteEligible || (!location && !tags.some((tag: string) => /worldwide|anywhere|global|india|apac|asia/i.test(tag)))) continue;
      const title = text(raw?.position, 300), company = text(raw?.company, 300), description = text(raw?.description), applyUrl = safeUrl(raw?.url || raw?.apply_url);
      if (!raw?.id || title.length < 3 || company.length < 2 || description.length < 80 || /^jobs?$/i.test(title) || !applyUrl) continue;
      jobs.push({ source: "Remote OK", external_id: String(raw.id), title, company, location: location || "Worldwide", work_mode: "Remote", experience_min: null, experience_max: null, salary_min_lpa: null, salary_max_lpa: null, skills: skillsFor(title, description, tags), description, apply_url: applyUrl, is_active: true, posted_at: validIso(raw?.date || raw?.epoch) });
    }
    return { source: "Remote OK", jobs };
  } catch (e) { return { source: "Remote OK", jobs: [], error: e instanceof Error ? e.message : "Unknown error" }; }
}

async function indianApi(apiKey: string): Promise<SourceResult> {
  try {
    const payload = await fetchIndianApiJson(apiKey);
    const rows = Array.isArray(payload) ? payload : Array.isArray(payload?.jobs) ? payload.jobs : Array.isArray(payload?.data) ? payload.data : [];
    const jobs: JobRow[] = [];
    for (const raw of rows) {
      const title = text(raw?.title ?? raw?.job_title, 300), company = text(raw?.company ?? raw?.company_name, 300), description = text(raw?.job_description ?? raw?.description);
      const id = raw?.id ?? raw?.job_id ?? raw?.external_id;
      const applyUrl = safeUrl(raw?.apply_link ?? raw?.apply_url ?? raw?.url);
      if (id === null || id === undefined || !title || !company || description.length < 40 || !applyUrl) continue;
      const [experienceMin, experienceMax] = experienceRange(raw?.experience ?? raw?.experience_required);
      const sourceSkills = Array.isArray(raw?.skills) ? raw.skills : typeof raw?.skills === "string" ? raw.skills.split(/[,|]/) : [];
      jobs.push({ source: "IndianAPI", external_id: String(id), title, company, location: text(raw?.location, 300) || "India", work_mode: inferMode(title, description), experience_min: experienceMin, experience_max: experienceMax, salary_min_lpa: null, salary_max_lpa: null, skills: skillsFor(title, description, sourceSkills), description, apply_url: applyUrl, is_active: true, posted_at: validIso(raw?.posted_date ?? raw?.posted_at ?? raw?.date_posted) });
    }
    return { source: "IndianAPI", jobs };
  } catch (e) {
    if (e instanceof HttpError && e.status === 429) return { source: "IndianAPI", jobs: [], rateLimited: true };
    return { source: "IndianAPI", jobs: [], error: e instanceof Error ? e.message : "Unknown error" };
  }
}

async function theirStack(apiKey: string): Promise<SourceResult> {
  try {
    const discoveredSince = new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString();
    const payload = await fetchJson("https://api.theirstack.com/v1/jobs/search", { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${apiKey}` }, body: JSON.stringify({ job_country_code_or: ["IN"], posted_at_max_age_days: 30, discovered_at_gte: discoveredSince, is_closed: false, limit: 5, page: 0 }) });
    const jobs: JobRow[] = [];
    for (const raw of Array.isArray(payload?.data) ? payload.data : []) {
      const title = text(raw?.job_title, 300), company = text(raw?.company, 300), description = text(raw?.description), applyUrl = safeUrl(raw?.url ?? raw?.source_url);
      if (raw?.id === null || raw?.id === undefined || !title || !company || description.length < 40 || !applyUrl) continue;
      const extras = [...(Array.isArray(raw?.technology_slugs) ? raw.technology_slugs : []), ...(Array.isArray(raw?.keyword_slugs) ? raw.keyword_slugs : [])];
      const currency = String(raw?.salary_currency ?? "").toUpperCase();
      jobs.push({ source: "TheirStack", external_id: String(raw.id), title, company, location: text(raw?.long_location ?? raw?.location, 300) || "India", work_mode: raw?.remote ? "Remote" : raw?.hybrid ? "Hybrid" : inferMode(title, description), experience_min: null, experience_max: null, salary_min_lpa: currency === "INR" ? annualInrToLpa(raw?.min_annual_salary) : null, salary_max_lpa: currency === "INR" ? annualInrToLpa(raw?.max_annual_salary) : null, skills: skillsFor(title, description, extras), description, apply_url: applyUrl, is_active: true, posted_at: validIso(raw?.date_posted) });
    }
    return { source: "TheirStack", jobs };
  } catch (e) { return { source: "TheirStack", jobs: [], error: e instanceof Error ? e.message : "Unknown error" }; }
}

async function sha256(value: string) {
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)));
  return [...digest].map((b) => b.toString(16).padStart(2, "0")).join("");
}
function constantEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
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
  if (authError || !authRow || !supplied || !constantEqual(await sha256(supplied), String(authRow.secret_sha256))) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { data: run, error: runError } = await supabase.from("job_refresh_runs").insert({ status: "running" }).select("id").single();
  if (runError || !run?.id) return Response.json({ error: "Could not create refresh audit record" }, { status: 500 });

  try {
    const indianKey = Deno.env.get("INDIANAPI_JOBS_API_KEY")?.trim();
    const theirStackKey = Deno.env.get("THEIRSTACK_API_KEY")?.trim();
    const loaders: Promise<SourceResult>[] = [remotive(), jobicy(), himalayas(), remoteOk()];
    if (indianKey) loaders.push(indianApi(indianKey));
    if (theirStackKey) loaders.push(theirStack(theirStackKey));
    const results = await Promise.all(loaders);

    const summary: Record<string, unknown> = {};
    let failed = 0, imported = 0;
    for (const result of results) {
      if (result.rateLimited) {
        summary[result.source] = { source: result.source, display_name: result.source, configured: true, enabled: true, fetched: 0, upserted: 0, rate_limited: true };
        continue;
      }
      if (result.error) {
        failed += 1;
        summary[result.source] = { source: result.source, display_name: result.source, configured: true, enabled: true, fetched: 0, upserted: 0, error: result.error };
        continue;
      }
      let upserted = 0;
      if (result.jobs.length) {
        const { data, error } = await supabase.from("jobs").upsert(result.jobs, { onConflict: "source,external_id" }).select("id");
        if (error) {
          failed += 1;
          summary[result.source] = { source: result.source, display_name: result.source, configured: true, enabled: true, fetched: result.jobs.length, upserted: 0, error: error.message };
          continue;
        }
        upserted = data?.length ?? 0;
        imported += upserted;
      }
      summary[result.source] = { source: result.source, display_name: result.source, configured: true, enabled: true, fetched: result.jobs.length, upserted };
    }

    if (!indianKey) summary.IndianAPI = { source: "IndianAPI", display_name: "IndianAPI", configured: false, enabled: false, disabled: true, fetched: 0, upserted: 0 };
    if (!theirStackKey) summary.TheirStack = { source: "TheirStack", display_name: "TheirStack", configured: false, enabled: false, disabled: true, fetched: 0, upserted: 0 };

    const status = failed === 0 ? "success" : failed < results.length ? "partial" : "failed";
    await supabase.from("job_refresh_runs").update({ status, finished_at: new Date().toISOString(), summary }).eq("id", run.id);
    await supabase.rpc("jobcraft_run_feed_maintenance");
    return Response.json({ ok: status !== "failed", status, imported, sources: summary });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown refresh error";
    await supabase.from("job_refresh_runs").update({ status: "failed", finished_at: new Date().toISOString(), error: message }).eq("id", run.id);
    return Response.json({ error: message }, { status: 500 });
  }
});
