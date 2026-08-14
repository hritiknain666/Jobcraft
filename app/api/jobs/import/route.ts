import { NextResponse } from "next/server";
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

  let body: { provider?: string; what?: string; where?: string; page?: number; resultsPerPage?: number } = {};
  try {
    body = await request.json();
  } catch {
    // Empty JSON body is acceptable; defaults import the newest broad India results.
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
