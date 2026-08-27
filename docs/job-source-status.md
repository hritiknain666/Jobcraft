# JobCraft production job-source status

This document records the intended non-AI MVP source mix and operational safeguards. Provider terms must be reviewed again before material traffic, monetisation, or redistribution changes.

## Enabled production sources

### Aggregated/public feeds

- Himalayas — public remote-jobs feed; India/worldwide eligible roles only.
- Jobicy — public remote-jobs feed; India/worldwide eligible roles only.
- Remotive — public remote-jobs feed; India/worldwide eligible roles only.
- Remote OK — public feed; India/worldwide eligible roles only.
- TheirStack — API-key source, deliberately low-volume while using the free monthly allowance.

### Direct employer ATS feeds

- Greenhouse — public published-job GET endpoints. JobCraft only ingests explicitly configured employer board tokens. Current production board: PhonePe.
- Lever — public published-job GET endpoints. JobCraft only ingests explicitly configured employer sites. Current production sites: Hevo Data, Acceldata, and Level AI.

Direct ATS feeds are full snapshots. If a posting disappears from a configured employer feed, JobCraft deactivates the corresponding listing.

IndianAPI was retired on 2026-08-27. Its 50 historical records were retained for audit purposes and all active listings were deactivated.

## Adzuna

The Adzuna connector is implemented but production publishing remains disabled until all of the following are true:

- `ADZUNA_APP_ID` is configured.
- `ADZUNA_APP_KEY` is configured.
- provider/commercial publishing permission is confirmed and `ADZUNA_PUBLISHING_READY=true`.
- required Adzuna attribution treatment is implemented and verified, then `ADZUNA_ATTRIBUTION_READY=true`.

Do not bypass these gates. Adzuna's current terms allow publishing listings subject to attribution and other provider conditions, and commercial use may require additional permission/licensing.

## Feed quality safeguards

Production stores provider identity and external IDs separately and normalizes data before public use. The database maintains canonical title/company/location values, canonical application URLs, first/last-seen timestamps, duplicate relationships, application-link status, and a weighted search document.

Public job reads exclude inactive jobs, known cross-source duplicates, and jobs whose application URL is definitely dead. Aggregated jobs older than the freshness window are deactivated. Greenhouse/Lever freshness is instead controlled by snapshot disappearance because ATS timestamps may represent posting updates rather than vacancy expiry.

A scheduled link-health checker rechecks a small batch each day. Only definite HTTP 404/410 responses are considered dead. Temporary blocks, rate limits, timeouts, 403 responses, and server errors remain `unknown` rather than causing a valid vacancy to disappear.

## Source health monitoring

`public.job_source_health` is private operational state. It records configuration/enabled state, latest run/success timestamps, fetched/upserted counts, active-job counts, consecutive failures, and latest error. Feed maintenance marks enabled sources degraded when successful refreshes become stale.

Current scheduled order (UTC):

- 02:17 — free/aggregated refresh
- 02:25 — direct ATS refresh
- 02:35 — feed maintenance/deduplication
- 02:45 — application-link health check
