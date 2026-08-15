import { NextResponse } from "next/server";
import {
  getAdzunaConfig,
  getGreenhouseBoards,
  getIndianApiConfig,
  getJoobleConfig,
  getLeverSites,
  getTheirStackConfig,
  isAdzunaPublishingReady,
  isFreePublicSourceEnabled,
} from "@/lib/job-sources/config";
import { loadProviderBatch, type ProviderImportInput } from "@/lib/job-sources/provider-runner";
import { syncLiveJobSnapshot } from "@/lib/job-sources/sync-snapshot";
import { upsertLiveJobs } from "@/lib/job-sources/upsert";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type RefreshResult = {
  provider: string;
  status: "refreshed" | "skipped" | "failed";
  normalized?: number;
  upserted?: number;
  deactivated?: number;
  reason?: string;
};

function isAuthorized(request: Request) {
  const expected = process.env.JOB_IMPORT_SECRET?.trim();
  if (!expected) return false;
  return request.headers.get("authorization") === `Bearer ${expected}`;
}

async function persist(input: ProviderImportInput): Promise<RefreshResult> {
  try {
    const batch = await loadProviderBatch(input);
    if (!batch.canPersist) {
      return { provider: batch.provider, status: "skipped", reason: batch.persistenceReason ?? "Provider is not enabled." };
    }

    const admin = createAdminClient();
    if (batch.snapshot) {
      const result = await syncLiveJobSnapshot(admin, batch.snapshot.source, batch.jobs, {
        externalIdPrefix: batch.snapshot.externalIdPrefix,
      });
      return {
        provider: batch.provider,
        status: "refreshed",
        normalized: batch.jobs.length,
        upserted: result.upserted,
        deactivated: result.deactivated,
      };
    }

    const rows = await upsertLiveJobs(admin, batch.jobs);
    return {
      provider: batch.provider,
      status: "refreshed",
      normalized: batch.jobs.length,
      upserted: rows.length,
    };
  } catch (error) {
    return {
      provider: String(input.provider ?? "unknown"),
      status: "failed",
      reason: error instanceof Error ? error.message : "Provider refresh failed.",
    };
  }
}

export async function POST(request: Request) {
  if (!process.env.JOB_IMPORT_SECRET?.trim() || !process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    return NextResponse.json({ error: "Job refresh is not configured on the server." }, { status: 503 });
  }
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!isFreePublicSourceEnabled()) {
    return NextResponse.json({ error: "Free public job sources are disabled." }, { status: 409 });
  }

  const inputs: ProviderImportInput[] = [
    { provider: "arbeitnow", page: 1 },
    { provider: "arbeitnow", page: 2 },
    { provider: "remotive", resultsPerPage: 100 },
  ];

  if (getIndianApiConfig()) inputs.push({ provider: "indianapi", resultsPerPage: 50 });
  if (getJoobleConfig()) {
    inputs.push({ provider: "jooble", page: 1, resultsPerPage: 25 });
    inputs.push({ provider: "jooble", page: 2, resultsPerPage: 25 });
  }
  // Keep the free-credit source deliberately small: 5 returned jobs = at most
  // 5 job-search credits per refresh on the current free plan.
  if (getTheirStackConfig()) inputs.push({ provider: "theirstack", page: 1, resultsPerPage: 5 });
  if (getAdzunaConfig() && isAdzunaPublishingReady()) {
    inputs.push({ provider: "adzuna", where: "India", page: 1, resultsPerPage: 20 });
  }

  for (const board of getGreenhouseBoards()) {
    inputs.push({ provider: "greenhouse", board });
  }
  for (const entry of getLeverSites()) {
    inputs.push({ provider: "lever", site: entry.site, company: entry.company });
  }

  // Run sequentially to stay gentle on free/public APIs and make rate-limit
  // behavior predictable. One provider failure does not block the rest.
  const results: RefreshResult[] = [];
  for (const input of inputs) results.push(await persist(input));

  const summary = results.reduce(
    (acc, result) => {
      acc[result.status] += 1;
      acc.normalized += result.normalized ?? 0;
      acc.upserted += result.upserted ?? 0;
      acc.deactivated += result.deactivated ?? 0;
      return acc;
    },
    { refreshed: 0, skipped: 0, failed: 0, normalized: 0, upserted: 0, deactivated: 0 }
  );

  return NextResponse.json({ summary, results }, { status: summary.failed > 0 && summary.refreshed === 0 ? 502 : 200 });
}
