create table if not exists public.job_refresh_runs (
  id uuid primary key default gen_random_uuid(),
  triggered_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null default 'running' check (status in ('running','success','partial','failed')),
  summary jsonb not null default '{}'::jsonb,
  error text
);

create index if not exists job_refresh_runs_triggered_at_idx
  on public.job_refresh_runs (triggered_at desc);
