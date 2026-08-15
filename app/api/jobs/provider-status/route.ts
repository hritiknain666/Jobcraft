import { NextResponse } from "next/server";
import {
  getAdzunaConfig,
  getGreenhouseBoards,
  getIndianApiConfig,
  getJoobleConfig,
  getLeverSites,
  getTheirStackConfig,
  isAdzunaAttributionReady,
  isAdzunaPublicationApproved,
  isAdzunaPublishingReady,
  isFreePublicSourceEnabled,
} from "@/lib/job-sources/config";

export const dynamic = "force-dynamic";

export async function GET() {
  const importSecretReady = Boolean(process.env.JOB_IMPORT_SECRET?.trim());
  const databaseWriteReady = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
  const serverReady = importSecretReady && databaseWriteReady;
  const freeSourcesEnabled = isFreePublicSourceEnabled();

  const adzunaConfigured = Boolean(getAdzunaConfig());
  const publicationApproved = isAdzunaPublicationApproved();
  const attributionReady = isAdzunaAttributionReady();
  const adzunaPublishingReady = isAdzunaPublishingReady();
  const greenhouseBoards = getGreenhouseBoards();
  const leverSites = getLeverSites();

  return NextResponse.json({
    server: { importSecretReady, databaseWriteReady },
    adzuna: {
      tier: "free-quota",
      configured: adzunaConfigured,
      publicationApproved,
      attributionReady,
      publishingReady: adzunaPublishingReady,
      previewEnabled: Boolean(adzunaConfigured && importSecretReady),
      importsEnabled: Boolean(adzunaConfigured && adzunaPublishingReady && serverReady),
    },
    arbeitnow: {
      tier: "free-public",
      configured: true,
      attributionRequired: true,
      importsEnabled: Boolean(freeSourcesEnabled && serverReady),
    },
    remotive: {
      tier: "free-public",
      configured: true,
      attributionRequired: true,
      importsEnabled: Boolean(freeSourcesEnabled && serverReady),
    },
    indianapi: {
      tier: "free-key",
      configured: Boolean(getIndianApiConfig()),
      importsEnabled: Boolean(getIndianApiConfig() && freeSourcesEnabled && serverReady),
    },
    jooble: {
      tier: "free-key",
      configured: Boolean(getJoobleConfig()),
      importsEnabled: Boolean(getJoobleConfig() && freeSourcesEnabled && serverReady),
    },
    theirstack: {
      tier: "free-credits",
      configured: Boolean(getTheirStackConfig()),
      importsEnabled: Boolean(getTheirStackConfig() && freeSourcesEnabled && serverReady),
    },
    greenhouse: {
      tier: "free-public-ats",
      configuredBoards: greenhouseBoards.length,
      importsEnabled: Boolean(greenhouseBoards.length && freeSourcesEnabled && serverReady),
    },
    lever: {
      tier: "free-public-ats",
      configuredSites: leverSites.length,
      importsEnabled: Boolean(leverSites.length && freeSourcesEnabled && serverReady),
    },
  }, { headers: { "Cache-Control": "no-store" } });
}
