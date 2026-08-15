-- Infrastructure for JobCraft's zero-cost live-job refresh.
-- Runtime secrets are intentionally NOT committed. See docs/live-job-refresh.md.

create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;

create table if not exists public.job_refresh_auth (
  id boolean primary key default true check (id),
  secret_sha256 text not null check (length(secret_sha256) = 64),
  updated_at timestamptz not null default now()
);

alter table public.job_refresh_auth enable row level security;
revoke all on table public.job_refresh_auth from anon, authenticated;
grant select on table public.job_refresh_auth to service_role;

drop policy if exists "No client access to refresh auth" on public.job_refresh_auth;
create policy "No client access to refresh auth"
on public.job_refresh_auth
for all
to anon, authenticated
using (false)
with check (false);

create table if not exists public.job_refresh_runs (
  id uuid primary key default gen_random_uuid(),
  triggered_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null default 'running' check (status in ('running','success','partial','failed')),
  summary jsonb not null default '{}'::jsonb,
  error text
);

alter table public.job_refresh_runs enable row level security;
revoke all on table public.job_refresh_runs from anon, authenticated;
grant select, insert, update on table public.job_refresh_runs to service_role;

drop policy if exists "No client access to refresh run audit" on public.job_refresh_runs;
create policy "No client access to refresh run audit"
on public.job_refresh_runs
for all
to anon, authenticated
using (false)
with check (false);

create index if not exists job_refresh_runs_triggered_at_idx
  on public.job_refresh_runs (triggered_at desc);
