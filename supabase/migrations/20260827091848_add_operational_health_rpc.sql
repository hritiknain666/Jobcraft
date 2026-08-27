create or replace function public.get_jobcraft_operational_health()
returns table (
  unhealthy_sources text[],
  refresh_status text,
  refresh_triggered_at timestamptz,
  refresh_finished_at timestamptz,
  ai_users_at_limit bigint
)
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  with latest_refresh as (
    select status, triggered_at, finished_at
    from public.job_refresh_runs
    order by triggered_at desc
    limit 1
  )
  select
    coalesce(
      (
        select array_agg(source_key order by source_key)
        from public.job_source_health
        where enabled = true and status in ('degraded', 'error')
      ),
      '{}'::text[]
    ) as unhealthy_sources,
    case
      when not exists (select 1 from latest_refresh) then 'missing'
      when (select status from latest_refresh) = 'failed' then 'failed'
      when (select status from latest_refresh) = 'running'
        and (select triggered_at from latest_refresh) < now() - interval '15 minutes' then 'failed'
      when (select triggered_at from latest_refresh) < now() - interval '30 hours' then 'stale'
      else 'ok'
    end as refresh_status,
    (select triggered_at from latest_refresh) as refresh_triggered_at,
    (select finished_at from latest_refresh) as refresh_finished_at,
    (
      select count(*)
      from public.ai_rate_limits
      where request_count >= 10
        and updated_at >= now() - interval '15 minutes'
    ) as ai_users_at_limit;
$$;

revoke all on function public.get_jobcraft_operational_health() from public;
grant execute on function public.get_jobcraft_operational_health() to anon, authenticated, service_role;

comment on function public.get_jobcraft_operational_health() is
  'Returns non-sensitive aggregate production health metrics for the public health endpoint.';
