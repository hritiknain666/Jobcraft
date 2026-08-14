import { NextResponse } from "next/server";
import { isAdzunaPublishingReady } from "@/lib/job-sources/config";
import { fetchAdzunaIndia } from "@/lib/job-sources/fetch-adzuna";
import { normalizeAdzunaIndia } from "@/lib/job-sources/providers/adzuna";
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

  let body: { provider?: string; what?: string; where?: string; page?: number; resultsPerPage?: number; preview?: boolean } = {};
  try {
    body = await request.json();
  } catch {
    // Empty JSON body is acceptable; defaults to the newest broad India results.
  }

  const provider = (body.provider ?? "adzuna").toLowerCase();
  if (provider !== "adzuna") {
    return NextResponse.json({ error: "Unsupported job provider." }, { status: 400 });
  }

  try {
    const payload = await fetchAdzunaIndia({
      what: body.what,
      where: body.where,
      page: body.page,
      resultsPerPage: body.resultsPerPage,
    });
    const jobs = normalizeAdzunaIndia(payload);

    if (body.preview === true) {
      return NextResponse.json({
        provider: "Adzuna",
        preview: true,
        normalized: jobs.length,
        jobs: jobs.slice(0, 5).map((job) => ({
          externalId: job.externalId,
          title: job.title,
          company: job.company,
          location: job.location,
          workMode: job.workMode,
          postedAt: job.postedAt,
          applyUrl: job.applyUrl,
        })),
      });
    }

    if (!isAdzunaPublishingReady()) {
      return NextResponse.json({
        error: "Adzuna publishing is not enabled. Complete provider attribution/licensing checks, then set ADZUNA_PUBLISHING_READY=true.",
      }, { status: 409 });
    }

    const imported = await upsertLiveJobs(createAdminClient(), jobs);

    return NextResponse.json({
      provider: "Adzuna",
      normalized: jobs.length,
      upserted: imported.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Job import failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
