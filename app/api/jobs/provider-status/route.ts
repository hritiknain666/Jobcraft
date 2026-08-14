import { NextResponse } from "next/server";
import {
  getAdzunaConfig,
  isAdzunaAttributionReady,
  isAdzunaPublicationApproved,
  isAdzunaPublishingReady,
} from "@/lib/job-sources/config";

export const dynamic = "force-dynamic";

export async function GET() {
  const configured = Boolean(getAdzunaConfig());
  const publicationApproved = isAdzunaPublicationApproved();
  const attributionReady = isAdzunaAttributionReady();
  const publishingReady = isAdzunaPublishingReady();

  return NextResponse.json({
    adzuna: {
      configured,
      publicationApproved,
      attributionReady,
      publishingReady,
      previewEnabled: Boolean(configured && process.env.JOB_IMPORT_SECRET?.trim()),
      importsEnabled: Boolean(
        configured &&
        publishingReady &&
        process.env.JOB_IMPORT_SECRET?.trim() &&
        process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
      ),
    },
  }, { headers: { "Cache-Control": "no-store" } });
}
