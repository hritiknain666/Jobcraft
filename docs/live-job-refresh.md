# JobCraft live-job refresh

JobCraft's zero-cost MVP refreshes free/public job feeds from a Supabase Edge Function and stores normalized jobs in `public.jobs`.

## Production design

- Edge Function: `refresh-free-jobs`
- Scheduler: Supabase Cron (`pg_cron` + `pg_net`)
- Production schedule: once daily at `02:17 UTC`
- Auth: a random cron token is stored in Supabase Vault; only its SHA-256 digest is stored in `public.job_refresh_auth`
- Audit: every run is recorded in `public.job_refresh_runs`
- Write access: the Edge Function uses Supabase's server-provided service credentials. Client roles have no access to the refresh auth/audit tables.
- Deduplication: jobs are upserted on `(source, external_id)`
- Staleness: supported feed jobs older than 45 days are marked inactive

## Sources that work without an API key

The production Edge Function can ingest:

- Remotive
- Jobicy
- Himalayas
- Remote OK
- Arbeitnow

Only listings that are explicitly India-eligible or globally eligible are stored. Provider attribution is kept visible in JobCraft.

## Optional free-account sources

These providers are automatically included when their Edge Function secret exists:

- `INDIANAPI_JOBS_API_KEY`
- `JOOBLE_API_KEY`
- `THEIRSTACK_API_KEY`

TheirStack is intentionally queried conservatively to protect the small free monthly credit allowance.

Adzuna remains handled by the separate provider pipeline because persisted Adzuna publishing must stay locked until commercial/publisher approval and the required attribution treatment are verified.

Greenhouse and Lever adapters are also available in the Next.js provider pipeline. They require curated employer board/site identifiers rather than a global API key.

## Provisioning a new environment

Never commit runtime tokens or API keys.

1. Generate a long random token, for example with a secure password generator or `openssl rand -base64 48`.
2. Store `SHA-256(token)` in the singleton row of `public.job_refresh_auth`.
3. Store the raw token in Supabase Vault as `jobcraft_job_refresh_secret`.
4. Store the project URL in Vault as `jobcraft_project_url`.
5. Deploy `supabase/functions/refresh-free-jobs/index.ts` with custom auth (`verify_jwt = false`). The function validates the private cron header itself.
6. Schedule the function with Supabase Cron. The production cadence is intentionally once daily to avoid unnecessary requests to free providers.
7. Add optional provider keys through Supabase Edge Function Secrets, never through the browser bundle or repository.

Example scheduling SQL (replace nothing with literal secrets; read them from Vault):

```sql
select cron.schedule(
  'jobcraft-free-jobs-daily',
  '17 2 * * *',
  $$
    select net.http_post(
      url := (select decrypted_secret from vault.decrypted_secrets where name = 'jobcraft_project_url') || '/functions/v1/refresh-free-jobs',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-jobcraft-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'jobcraft_job_refresh_secret')
      ),
      body := jsonb_build_object('trigger', 'supabase-cron', 'requested_at', now()),
      timeout_milliseconds := 120000
    );
  $$
);
```

## Verification

Check recent runs:

```sql
select triggered_at, finished_at, status, summary, error
from public.job_refresh_runs
order by triggered_at desc
limit 10;
```

Check source inventory:

```sql
select source, count(*) as jobs, count(*) filter (where is_active) as active_jobs
from public.jobs
group by source
order by source;
```

A provider returning zero jobs is not automatically an error: the current feed may simply contain no India-eligible listings. Provider request failures are recorded in the run summary.
