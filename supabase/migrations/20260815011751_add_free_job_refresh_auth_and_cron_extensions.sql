-- Infrastructure for JobCraft's zero-cost live-job refresh.
-- Runtime secrets are intentionally NOT committed. See docs/live-job-refresh.md.

create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;

create table if not exists public.job_refresh_auth (
  id boolean primary key default true check (id),
  secret_sha256 text not null check (length(secret_sha256) = 64),
  updated_at timestamptz not null default now()
);
