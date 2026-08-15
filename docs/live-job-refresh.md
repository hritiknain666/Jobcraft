# JobCraft live-job refresh

JobCraft's non-AI MVP refreshes approved/public job feeds from Supabase Edge Functions and stores normalized jobs in `public.jobs`.

## Production design

Two authenticated Edge Functions share the same Supabase Cron/Vault infrastructure:

- `refresh-free-jobs` — six general sources, daily at `02:17 UTC`.
- `refresh-ats-jobs` — curated Greenhouse/Lever employer snapshots plus gated Adzuna, daily at `02:25 UTC`.
- `jobcraft-feed-maintenance-daily` — quality, dedupe and source-health maintenance at `02:35 UTC`.

Authentication uses a long random cron token stored in Supabase Vault; only its SHA-256 digest is stored in `public.job_refresh_auth`. Every refresh is audited in `public.job_refresh_runs`. Client roles cannot read the refresh auth/audit internals.

## General source refresh

`refresh-free-jobs` is intentionally limited to:

- Remotive
- Jobicy
- Himalayas
- Remote OK
- IndianAPI when `INDIANAPI_JOBS_API_KEY` exists
- TheirStack when `THEIRSTACK_API_KEY` exists

Jooble and Arbeitnow are not part of the normal production schedule.

TheirStack remains capped at five returned India jobs per daily call while JobCraft is using the limited free credit allowance. The query uses a recent discovery window to avoid deliberately re-requesting old inventory.

## Direct employer refresh

`refresh-ats-jobs` currently polls:

- Greenhouse: PhonePe
- Lever: Hevo Data
- Lever: Acceldata
- Lever: Level AI

These are full public employer snapshots. Each external ID is namespaced by board/site. If a posting disappears from a successful snapshot, prior JobCraft rows for that employer feed are deactivated.

Adzuna lives in the same function but remains disabled until all four requirements are present:

- `ADZUNA_APP_ID`
- `ADZUNA_APP_KEY`
- `ADZUNA_PUBLISHING_READY=true`
- `ADZUNA_ATTRIBUTION_READY=true`

Do not enable the readiness flags merely because credentials exist. Provider/commercial approval and the required attribution treatment must be confirmed first.

## Quality layer

Before a third-party job can remain active it must have:

- a meaningful description
- a valid public HTTP(S) application URL
- a provider/external ID pair

The database trigger derives:

- canonical title/company
- normalized India location
- canonical application/job fingerprint
- weighted full-text `search_document`

Greenhouse posting IDs and Lever site/posting IDs are recognized across alternate/embedded URLs. This lets direct employer records replace proven aggregator copies without broad fuzzy deduplication.

Aggregated listings age out from provider posting dates. Greenhouse/Lever freshness is driven by successful full snapshots instead of an arbitrary age cutoff.

## Health monitoring

`public.job_source_health` records per-source/per-employer operational state:

- health status
- last run / last success
- fetched and upserted counts
- active job count
- consecutive failures
- internal last error

The public API route `/api/jobs/provider-status` exposes only sanitized fields through `public.get_job_source_health()`; it never exposes API keys, Vault values or service credentials.

## Provisioning a new environment

Never commit runtime tokens or API keys.

1. Generate a long random cron token.
2. Store `SHA-256(token)` in the singleton row of `public.job_refresh_auth`.
3. Store the raw token in Supabase Vault as `jobcraft_job_refresh_secret`.
4. Store the project URL in Vault as `jobcraft_project_url`.
5. Deploy both Edge Functions with `verify_jwt = false`; both validate the private `x-jobcraft-cron-secret` header themselves.
6. Apply the migrations that schedule the daily jobs.
7. Add provider API keys through Supabase Edge Function Secrets only.

## Verification

Recent refresh runs:

```sql
select triggered_at, finished_at, status, summary, error
from public.job_refresh_runs
order by triggered_at desc
limit 10;
```

Active, unique public inventory:

```sql
select source, count(*) as active_unique
from public.jobs
where is_active = true
  and duplicate_of is null
  and source <> 'JobCraft'
group by source
order by source;
```

Source health:

```sql
select source_key, display_name, status, last_success_at, active_jobs
from public.job_source_health
where enabled = true
order by display_name;
```

A successful provider call can legitimately return zero India-eligible jobs. Transport/provider failures are different: they are captured in refresh summaries and source health.
