# JobCraft job-source operating policy

This document is an engineering/compliance checklist for the non-AI MVP. It is not legal advice and does not replace provider terms.

## MVP source set

JobCraft's source architecture is intentionally limited to nine provider families:

1. IndianAPI — India-focused aggregator; keyed and enabled in production.
2. Himalayas — public remote-jobs feed with India eligibility filtering.
3. Jobicy — public remote-jobs feed with India/worldwide eligibility filtering.
4. Remotive — public remote-jobs API with provider attribution and backlink.
5. Remote OK — public remote-jobs feed with conservative India/worldwide filtering.
6. TheirStack — broad aggregator; keyed and deliberately low-volume while using free credits.
7. Greenhouse — curated public employer job-board snapshots. Production currently includes PhonePe.
8. Lever — curated public employer posting snapshots. Production currently includes Hevo Data, Acceldata and Level AI.
9. Adzuna — connector is production-ready but publishing remains disabled until credentials, provider/commercial approval and required attribution are all confirmed.

Jooble and Arbeitnow remain non-core backup code only. They are not part of the normal scheduled MVP source set.

## Production principles

- Only import from an official API/feed or a provider whose terms permit JobCraft's use case.
- Preserve provider identity and the original/provider application URL.
- Never present third-party listings as JobCraft's own vacancies.
- Keep job browsing public. Do not require signup merely to view a third-party listing.
- Do not auto-apply. Candidates continue on the provider/employer application flow.
- Normalize only evidence present in source data or explicit listing text. Unknown fields remain null.
- Require a valid public HTTP(S) application URL and a meaningful description before a listing can remain active.
- Normalize common India location aliases for filtering while retaining the original source location.
- Deduplicate on `source + external_id` for persistence and use canonical application/job fingerprints across providers for display deduplication.
- Prefer direct Greenhouse/Lever employer listings over aggregator copies when the same vacancy can be proven to be the same job.
- Keep prototype/sample JobCraft records outside the active public vacancy feed.
- Review provider terms again before adding ads, charging for listing access, materially increasing refresh volume, syndicating listings elsewhere or changing the application flow.

## Core no-key sources

### Remotive

Official API: https://remotive.com/remote-jobs/api

Operational requirements:
- Mention Remotive as the source.
- Link back to the Remotive URL supplied by the API.
- Do not require signup/email capture to reveal a Remotive listing.
- Do not redistribute Remotive jobs to other job aggregators.

JobCraft implementation: public browsing, visible per-listing attribution, original provider link and daily refresh.

### Jobicy

Official API/fair-use page: https://jobicy.com/jobs-rss-feed

Operational requirements:
- Keep Jobicy as the original source.
- Preserve the canonical Jobicy job URL.
- Do not present Jobicy listings as JobCraft's own postings.
- Avoid excessive requests.

JobCraft implementation: visible source attribution, canonical provider URL and daily refresh.

### Himalayas

Official API: https://himalayas.app/api

Operational requirements:
- Mention Himalayas as the original source.
- Link back to Himalayas.
- Do not submit Himalayas jobs to third-party aggregators.
- Daily polling is sufficient.

### Remote OK

Official site exposes a Remote Jobs API/JSON feed: https://remoteok.com/

JobCraft implementation is deliberately conservative: visible source attribution, provider/application URL, India/worldwide eligibility filtering and one refresh per day.

## Core keyed sources

### IndianAPI

Production secret: `INDIANAPI_JOBS_API_KEY` in Supabase Edge Function secrets.

JobCraft keeps provider identity, provider application URL and evidence-only normalization. Listings below the feed quality threshold are not kept active.

### TheirStack

Production secret: `THEIRSTACK_API_KEY` in Supabase Edge Function secrets.

Free-plan guardrails:
- India-only query.
- Maximum five returned jobs per scheduled refresh.
- Daily refresh only.
- Use `discovered_at_gte` to focus on newly discovered records.
- Do not add extra scheduled TheirStack calls while JobCraft is using the limited free allowance.

## Direct employer ATS sources

### Greenhouse

`refresh-ats-jobs` reads published jobs from curated public Greenhouse Job Board APIs. Production starts with PhonePe. The importer retains only India-relevant jobs and treats each board as a full snapshot: if a previously imported posting disappears from that board, JobCraft deactivates it.

External IDs are namespaced as `boardToken:jobId` so multiple employers can coexist safely.

### Lever

`refresh-ats-jobs` reads published jobs from curated public Lever Postings APIs. Production starts with Hevo Data, Acceldata and Level AI. Each site is treated as a full snapshot and removed postings are deactivated.

External IDs are namespaced as `site:postingId`.

## Adzuna

Environment/secrets prepared:
- `ADZUNA_APP_ID`
- `ADZUNA_APP_KEY`
- `ADZUNA_PUBLISHING_READY`
- `ADZUNA_ATTRIBUTION_READY`

The Edge Function refuses to publish Adzuna jobs unless both credentials exist and both readiness flags are `true`. This is deliberate. Do not bypass those flags merely because credentials have been created.

When enabled, visible Adzuna attribution must remain in the UI.

## Quality and freshness layer

The `jobs` table stores derived quality fields used by the public feed:
- canonical title/company
- normalized location
- canonical application/job fingerprint
- duplicate pointer
- application URL status
- weighted full-text search document
- first/last internal observation timestamps

Aggregated listings are aged out by provider posting date. Greenhouse and Lever are full snapshots, so employer removal is the freshness authority for those feeds. Public queries return only active, non-duplicate, non-sample rows.

Canonical Greenhouse job IDs and Lever site/posting IDs are recognized even when another provider points at an embedded or alternate application URL. This allows a richer direct-employer record to win over an aggregator copy without relying on unsafe fuzzy matching.

## Source health monitoring

`job_source_health` stores sanitized operational state including:
- last run and last success
- fetched/upserted counts
- current active job count
- consecutive failures
- last error internally

`GET /api/jobs/provider-status` exposes only the sanitized health RPC rather than secrets or credential values. A daily maintenance job also marks a source degraded when successful refresh evidence becomes stale.

## Refresh schedule

Supabase is the production scheduler:
- `refresh-free-jobs`: daily at 02:17 UTC for the six general sources.
- `refresh-ats-jobs`: daily at 02:25 UTC for Greenhouse/Lever and gated Adzuna.
- feed maintenance/dedupe: daily at 02:35 UTC.

The legacy/manual GitHub importer remains a fallback/testing path; it is not the primary production scheduler.
