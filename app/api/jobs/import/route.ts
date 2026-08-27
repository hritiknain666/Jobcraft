import { NextResponse } from "next/server";
import { loadProviderBatch, type ProviderImportInput } from "@/lib/job-sources/provider-runner";
import { syncLiveJobSnapshot } from "@/lib/job-sources/sync-snapshot";
import { upsertLiveJobs } from "@/lib/job-sources/upsert";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function isAuthorized(request: Request) {
  const expected = process.env.JOB_IMPORT_SECRET?.trim();
  if (!expected) return false;
  const authorization = request.headers.get("authorization") ?? "";
  return authorization === `Bearer ${expected}`;
}

export async function POST(request: Request) {
  if (!process.env.JOB_IMPORT_SECRET?.trim()) {
    return NextResponse.json({ error: "Job imports are not configured." }, { status: 503 });
  }
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: ProviderImportInput = {};
  try {
    body = await request.json();
  } catch {
    // Empty JSON body is acceptable and defaults to Adzuna preview/import behavior.
  }

  try {
    const batch = await loadProviderBatch(body);

    if (body.preview === true) {
      return NextResponse.json({
        provider: batch.provider,
        preview: true,
        providerReportedCount: batch.providerReportedCount,
        normalized: batch.jobs.length,
        canPersist: batch.canPersist,
        persistenceReason: batch.canPersist ? null : (batch.persistenceReason ?? null),
        jobs: batch.jobs.slice(0, 5).map((job) => ({
          externalId: job.externalId,
          title: job.title,
          company: job.company,
          location: job.location,
          workMode: job.workMode,
          experienceMin: job.experienceMin,
          experienceMax: job.experienceMax,
          salaryMinLpa: job.salaryMinLpa,
          salaryMaxLpa: job.salaryMaxLpa,
          skills: job.skills.slice(0, 12),
          postedAt: job.postedAt,
          applyUrl: job.applyUrl,
        })),
        rawProviderSamples: batch.rawProviderSamples ?? [],
      });
    }

    if (!batch.canPersist) {
      return NextResponse.json(
        {
          error: batch.persistenceReason ?? `${batch.provider} publishing is not enabled.`,
        },
        { status: 409 },
      );
    }

    const admin = createAdminClient();
    if (batch.snapshot) {
      const synced = await syncLiveJobSnapshot(admin, batch.snapshot.source, batch.jobs, {
        externalIdPrefix: batch.snapshot.externalIdPrefix,
      });
      return NextResponse.json({
        provider: batch.provider,
        normalized: batch.jobs.length,
        upserted: synced.upserted,
        deactivated: synced.deactivated,
      });
    }

    const imported = await upsertLiveJobs(admin, batch.jobs);
    return NextResponse.json({
      provider: batch.provider,
      normalized: batch.jobs.length,
      upserted: imported.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Job import failed.";
    const badRequest = /unsupported|require|invalid/i.test(message);
    const notConfigured = /disabled until|not configured/i.test(message);
    return NextResponse.json(
      { error: message },
      { status: badRequest ? 400 : notConfigured ? 409 : 500 },
    );
  }
}
