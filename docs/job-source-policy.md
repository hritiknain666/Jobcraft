# JobCraft job-source operating policy

This document is an engineering/compliance checklist for the non-AI MVP. It is not legal advice and does not replace provider terms.

## MVP source set

JobCraft's normal MVP source strategy is intentionally limited to six reliable sources:

1. IndianAPI — India-focused aggregator; API key required and already configured in production.
2. Himalayas — public remote-jobs feed with India eligibility filtering.
3. Jobicy — public remote-jobs feed with India/worldwide eligibility filtering.
4. Remotive — public remote-jobs API with provider attribution and backlink.
5. Remote OK — public remote-jobs feed with conservative India/worldwide filtering.
6. TheirStack — broad aggregator; API key required. While JobCraft is on the free plan, the scheduled query is capped at five jobs per daily refresh and uses `discovered_at_gte` so credits are not deliberately spent re-fetching old records.

Other adapters may remain in the repository as tested backups, but they are not part of the normal MVP source set unless deliberately re-enabled after a coverage/compliance review. In particular, Jooble is not required for the MVP and Arbeitnow is not counted as a core India source while it produces no useful India inventory.

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

## Core no-key sources

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

## Core keyed sources

### IndianAPI

Production secret: `INDIANAPI_JOBS_API_KEY` in Supabase Edge Function secrets.

JobCraft keeps the provider identity, provider application URL and evidence-only normalization. Salary is not converted unless the source semantics are explicit enough to do so safely.

### TheirStack

Production secret: `THEIRSTACK_API_KEY` in Supabase Edge Function secrets.

Free-plan operating guardrails:
- India-only query.
- Maximum five returned jobs per scheduled refresh.
- Daily refresh only.
- Use `discovered_at_gte` to focus on newly discovered records.
- Do not add extra scheduled TheirStack calls while using the free credit allowance.

## Standby connectors

- Jooble remains available in code but is not required for the six-source MVP.
- Arbeitnow remains available for future review but is not treated as a core India source while it yields no useful India results.
- Greenhouse and Lever adapters remain available for curated employer feeds where we explicitly choose public employer boards.
- Adzuna remains locked until provider/commercial approval and required attribution are both verified. Do not bypass `ADZUNA_PUBLISHING_READY` or `ADZUNA_ATTRIBUTION_READY`.

## Refresh architecture

The production refresh runs through the Supabase Edge Function `refresh-free-jobs` and Supabase Cron. It writes through the server-side Supabase secret, records each run in `job_refresh_runs`, deduplicates on `source, external_id`, and deactivates listings older than the freshness window.

The legacy/manual GitHub refresh workflow is a fallback for the Next.js importer; Supabase scheduled refresh is the current production path.
