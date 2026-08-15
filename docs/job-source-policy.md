# JobCraft job-source operating policy

This document is an engineering/compliance checklist for the non-AI MVP. It is not legal advice and does not replace provider terms.

## Production principles

- Only import from an official API/feed or a provider with explicit permission for JobCraft's use case.
- Preserve the provider identity and canonical/provider application URL.
- Never present third-party listings as JobCraft's own vacancies.
- Keep job browsing public. Do not require signup merely to view a third-party listing.
- Do not auto-apply. Send candidates to the original provider/employer application flow.
- Normalize only evidence present in the source data or explicit listing text. Unknown fields remain null.
- Deduplicate on `source + external_id` and deactivate stale listings.
- Keep prototype/sample JobCraft records outside the active public vacancy feed.
- Review provider terms again before adding ads, charging for access to listings, materially increasing refresh volume, syndicating listings elsewhere, or changing the application flow.

## No-key sources currently enabled

### Remotive

Official API: https://remotive.com/remote-jobs/api

Operational requirements:
- Mention Remotive as the source.
- Link back to the Remotive URL supplied by the API.
- Do not require signup/email capture to reveal a Remotive listing.
- Do not redistribute Remotive jobs to other job aggregators.

JobCraft implementation: public browsing, visible per-listing attribution, original provider link, daily refresh.

### Jobicy

Official API/fair-use page: https://jobicy.com/jobs-rss-feed

Operational requirements:
- Keep Jobicy as the original source.
- Preserve the canonical Jobicy job URL.
- Do not present Jobicy listings as JobCraft's own postings.
- Avoid excessive requests. Jobicy states automated checks must not run more than once per hour.

JobCraft implementation: visible source attribution, canonical Jobicy URL, daily refresh.

### Himalayas

Official API: https://himalayas.app/api

Operational requirements:
- Mention Himalayas as the original source.
- Link back to the Himalayas URL supplied by the feed.
- Do not submit Himalayas jobs to third-party aggregators.
- The feed is cached daily, so polling more than once per day provides no benefit.

JobCraft implementation: visible source attribution, Himalayas listing URL, daily refresh.

### Remote OK

Official site exposes both a Remote Jobs API and JSON feed: https://remoteok.com/

JobCraft implementation is deliberately conservative: visible source attribution, provider/application URL, India/worldwide eligibility filtering, and one refresh per day. Re-review Remote OK's then-current terms before increasing volume, monetizing provider data, or changing redistribution behavior.

### Arbeitnow

Official public job-board API: https://www.arbeitnow.com/blog/job-board-api

JobCraft currently keeps only explicitly India-located results. If a refresh contains no India-eligible jobs, nothing is persisted.

## Free-account sources prepared but dormant

These adapters remain disabled until the corresponding API key is added to the Supabase Edge Function secrets:

- `INDIANAPI_JOBS_API_KEY`
- `JOOBLE_API_KEY`
- `THEIRSTACK_API_KEY`

TheirStack must remain low-volume while JobCraft uses its limited free monthly credit allowance.

## Adzuna

The connector exists, but persisted publishing remains locked until provider/commercial approval and the required Adzuna attribution are both verified. Do not bypass `ADZUNA_PUBLISHING_READY` or `ADZUNA_ATTRIBUTION_READY`.

## ATS feeds

Greenhouse and Lever adapters are available for curated employer feeds. Only add an employer board/site after confirming that it is the employer's public careers feed and that the resulting jobs are relevant to India. Do not bulk-discover or crawl arbitrary tenant identifiers.

## Refresh architecture

The production no-key refresh runs through the Supabase Edge Function `refresh-free-jobs` and Supabase Cron. It writes through the server-side Supabase secret, records each run in `job_refresh_runs`, deduplicates on `source, external_id`, and deactivates listings older than the freshness window.

The legacy/manual GitHub refresh workflow is a fallback for the Next.js importer; the Supabase scheduled refresh is the current production path for the no-key sources.
