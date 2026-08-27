create table if not exists public.jobcraft_operational_health_snapshot (
  id boolean primary key default true check (id),
  unhealthy_sources text[] not null default '{}'::text[],
  refresh_status text not null default 'missing'
    check (refresh_status in ('ok', 'stale', 'failed', 'missing')),
  refresh_triggered_at timestamptz,
  refresh_finished_at timestamptz,
  ai_users_at_limit bigint not null default 0 check (ai_users_at_limit >= 0),
  updated_at timestamptz not null default now()
);

alter table public.jobcraft_operational_health_snapshot enable row level security;
revoke all on table public.jobcraft_operational_health_snapshot from public, anon, authenticated;
grant select on table public.jobcraft_operational_health_snapshot to anon, authenticated;
grant all on table public.jobcraft_operational_health_snapshot to service_role;

drop policy if exists "Public can read operational health snapshot"
on public.jobcraft_operational_health_snapshot;
create policy "Public can read operational health snapshot"
on public.jobcraft_operational_health_snapshot
for select
to anon, authenticated
using (id = true);

create or replace function public.jobcraft_update_operational_health_snapshot()
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  latest_refresh public.job_refresh_runs%rowtype;
  current_refresh_status text;
begin
  select *
  into latest_refresh
  from public.job_refresh_runs
  order by triggered_at desc
  limit 1;

  current_refresh_status := case
    when latest_refresh.id is null then 'missing'
    when latest_refresh.status = 'failed' then 'failed'
    when latest_refresh.status = 'running'
      and latest_refresh.triggered_at < now() - interval '15 minutes' then 'failed'
    when latest_refresh.triggered_at < now() - interval '30 hours' then 'stale'
    else 'ok'
  end;

  insert into public.jobcraft_operational_health_snapshot (
    id,
    unhealthy_sources,
    refresh_status,
    refresh_triggered_at,
    refresh_finished_at,
    ai_users_at_limit,
    updated_at
  )
  values (
    true,
    coalesce(
      (
        select array_agg(source_key order by source_key)
        from public.job_source_health
        where enabled = true and status in ('degraded', 'error')
      ),
      '{}'::text[]
    ),
    current_refresh_status,
    latest_refresh.triggered_at,
    latest_refresh.finished_at,
    (
      select count(*)
      from public.ai_rate_limits
      where request_count >= 10
        and updated_at >= now() - interval '15 minutes'
    ),
    now()
  )
  on conflict (id) do update set
    unhealthy_sources = excluded.unhealthy_sources,
    refresh_status = excluded.refresh_status,
    refresh_triggered_at = excluded.refresh_triggered_at,
    refresh_finished_at = excluded.refresh_finished_at,
    ai_users_at_limit = excluded.ai_users_at_limit,
    updated_at = excluded.updated_at;
end;
$$;

create or replace function public.jobcraft_refresh_operational_health_snapshot()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  perform public.jobcraft_update_operational_health_snapshot();
  return null;
end;
$$;

revoke all on function public.jobcraft_update_operational_health_snapshot()
from public, anon, authenticated;
grant execute on function public.jobcraft_update_operational_health_snapshot() to service_role;

revoke all on function public.jobcraft_refresh_operational_health_snapshot()
from public, anon, authenticated;
grant execute on function public.jobcraft_refresh_operational_health_snapshot() to service_role;

drop trigger if exists jobcraft_refresh_health_after_source_change
on public.job_source_health;
create trigger jobcraft_refresh_health_after_source_change
after insert or update or delete on public.job_source_health
for each statement execute function public.jobcraft_refresh_operational_health_snapshot();

drop trigger if exists jobcraft_refresh_health_after_run_change
on public.job_refresh_runs;
create trigger jobcraft_refresh_health_after_run_change
after insert or update or delete on public.job_refresh_runs
for each statement execute function public.jobcraft_refresh_operational_health_snapshot();

drop trigger if exists jobcraft_refresh_health_after_ai_limit_change
on public.ai_rate_limits;
create trigger jobcraft_refresh_health_after_ai_limit_change
after insert or update or delete on public.ai_rate_limits
for each statement execute function public.jobcraft_refresh_operational_health_snapshot();

select public.jobcraft_update_operational_health_snapshot();

comment on table public.jobcraft_operational_health_snapshot is
  'Non-sensitive aggregate health values exposed to the public health endpoint.';
