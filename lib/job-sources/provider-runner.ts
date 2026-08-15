import { getGreenhouseBoards, getLeverSites, isAdzunaPublishingReady, isFreePublicSourceEnabled } from "./config";
import { fetchAdzunaIndia } from "./fetch-adzuna";
import { fetchArbeitnow } from "./fetch-arbeitnow";
import { fetchGreenhouseBoard } from "./fetch-greenhouse";
import { fetchIndianApiJobs } from "./fetch-indianapi";
import { fetchJoobleIndia } from "./fetch-jooble";
import { fetchLeverSite } from "./fetch-lever";
import { fetchRemotive } from "./fetch-remotive";
import { fetchTheirStackIndia } from "./fetch-theirstack";
import { normalizeAdzunaIndia } from "./providers/adzuna";
import { normalizeArbeitnowIndia } from "./providers/arbeitnow";
import { normalizeGreenhouseIndia } from "./providers/greenhouse";
import { normalizeIndianApiJobs } from "./providers/indianapi";
import { normalizeJoobleIndia } from "./providers/jooble";
import { normalizeLeverIndia } from "./providers/lever";
import { normalizeRemotiveIndia } from "./providers/remotive";
import { normalizeTheirStackIndia } from "./providers/theirstack";
import type { NormalizedJob } from "./types";

export type ProviderImportInput = {
  provider?: string;
  what?: string;
  where?: string;
  page?: number;
  resultsPerPage?: number;
  preview?: boolean;
  board?: string;
  site?: string;
  company?: string;
};

export type ProviderBatch = {
  provider: string;
  jobs: NormalizedJob[];
  providerReportedCount: number | null;
  canPersist: boolean;
  persistenceReason?: string;
  snapshot?: { source: string; externalIdPrefix: string };
  rawProviderSamples?: unknown[];
};

export async function loadProviderBatch(input: ProviderImportInput): Promise<ProviderBatch> {
  const provider = (input.provider ?? "adzuna").trim().toLowerCase();
  const page = Math.max(Math.trunc(input.page ?? 1), 1);
  const resultsPerPage = Math.max(Math.trunc(input.resultsPerPage ?? 20), 1);

  if (provider === "adzuna") {
    const payload = await fetchAdzunaIndia({ what: input.what, where: input.where, page, resultsPerPage });
    return {
      provider: "Adzuna",
      jobs: normalizeAdzunaIndia(payload),
      providerReportedCount: payload.count ?? null,
      canPersist: isAdzunaPublishingReady(),
      persistenceReason: "Adzuna requires provider/commercial approval and verified production attribution.",
      rawProviderSamples: (payload.results ?? []).slice(0, 5).map((job) => ({
        externalId: job.id ?? null,
        salaryMin: job.salary_min ?? null,
        salaryMax: job.salary_max ?? null,
        location: job.location?.display_name ?? null,
        locationArea: job.location?.area ?? [],
      })),
    };
  }

  if (provider === "arbeitnow") {
    const payload = await fetchArbeitnow(page);
    return {
      provider: "Arbeitnow",
      jobs: normalizeArbeitnowIndia(payload),
      providerReportedCount: payload.data?.length ?? null,
      canPersist: isFreePublicSourceEnabled(),
      persistenceReason: "Free public job sources are disabled by configuration.",
    };
  }

  if (provider === "remotive") {
    const payload = await fetchRemotive(resultsPerPage);
    return {
      provider: "Remotive",
      jobs: normalizeRemotiveIndia(payload),
      providerReportedCount: payload["job-count"] ?? null,
      canPersist: isFreePublicSourceEnabled(),
      persistenceReason: "Free public job sources are disabled by configuration.",
    };
  }

  if (provider === "indianapi") {
    const payload = await fetchIndianApiJobs(resultsPerPage);
    const jobs = normalizeIndianApiJobs(payload);
    return {
      provider: "IndianAPI",
      jobs,
      providerReportedCount: Array.isArray(payload) ? payload.length : payload.jobs?.length ?? payload.data?.length ?? null,
      canPersist: isFreePublicSourceEnabled(),
      persistenceReason: "Free public job sources are disabled by configuration.",
    };
  }

  if (provider === "jooble") {
    const payload = await fetchJoobleIndia({ keywords: input.what, page, resultsPerPage });
    return {
      provider: "Jooble",
      jobs: normalizeJoobleIndia(payload),
      providerReportedCount: payload.totalCount ?? null,
      canPersist: isFreePublicSourceEnabled(),
      persistenceReason: "Free public job sources are disabled by configuration.",
    };
  }

  if (provider === "theirstack") {
    const payload = await fetchTheirStackIndia({ page: page - 1, limit: Math.min(resultsPerPage, 25) });
    return {
      provider: "TheirStack",
      jobs: normalizeTheirStackIndia(payload),
      providerReportedCount: payload.metadata?.total_results ?? null,
      canPersist: isFreePublicSourceEnabled(),
      persistenceReason: "Free public job sources are disabled by configuration.",
    };
  }

  if (provider === "greenhouse") {
    const board = input.board?.trim();
    if (!board) throw new Error("Greenhouse imports require a board token.");
    const payload = await fetchGreenhouseBoard(board);
    const configured = getGreenhouseBoards().includes(payload.boardToken);
    return {
      provider: "Greenhouse",
      jobs: normalizeGreenhouseIndia(payload),
      providerReportedCount: payload.jobs.length,
      canPersist: configured && isFreePublicSourceEnabled(),
      persistenceReason: configured ? "Free public job sources are disabled by configuration." : "Greenhouse board is not in GREENHOUSE_BOARD_TOKENS.",
      snapshot: { source: "Greenhouse", externalIdPrefix: `${payload.boardToken}:` },
    };
  }

  if (provider === "lever") {
    const site = input.site?.trim();
    const company = input.company?.trim();
    if (!site || !company) throw new Error("Lever imports require both site and company.");
    const payload = await fetchLeverSite(site, company);
    const configured = getLeverSites().some((entry) => entry.site === payload.site && entry.company === payload.company);
    return {
      provider: "Lever",
      jobs: normalizeLeverIndia(payload),
      providerReportedCount: payload.jobs.length,
      canPersist: configured && isFreePublicSourceEnabled(),
      persistenceReason: configured ? "Free public job sources are disabled by configuration." : "Lever site is not in LEVER_SITES.",
      snapshot: { source: "Lever", externalIdPrefix: `${payload.site}:` },
    };
  }

  throw new Error("Unsupported job provider.");
}
