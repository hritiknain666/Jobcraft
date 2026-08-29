update public.jobs
set is_active = false
where source = 'Greenhouse'
  and external_id like 'phonepe:%'
  and is_active = true;

update public.job_source_health
set configured = false,
    enabled = false,
    status = 'disabled',
    active_jobs = 0,
    fetched_count = 0,
    upserted_count = 0,
    consecutive_failures = 0,
    last_error = null,
    updated_at = now()
where source_key = 'Greenhouse:phonepe';

create or replace function public.jobcraft_sync_refresh_health()
returns void
language plpgsql
security definer
set search_path to 'pg_catalog', 'public'
as $function$
declare
  run_row record;
  item record;
  has_error boolean;
  is_disabled boolean;
  is_rate_limited boolean;
  source_name text;
  display_name_value text;
  external_prefix text;
  active_count integer;
  configured_value boolean;
  enabled_value boolean;
begin
  select triggered_at, finished_at, summary
  into run_row
  from public.job_refresh_runs
  where summary is not null
  order by triggered_at desc
  limit 1;

  if run_row is null then return; end if;

  for item in select key, value from pg_catalog.jsonb_each(run_row.summary) loop
    if item.key = 'configuration' or pg_catalog.jsonb_typeof(item.value) <> 'object' then continue; end if;
    if item.key = 'Greenhouse:phonepe' then continue; end if;

    source_name := coalesce(nullif(item.value->>'source', ''), item.key);
    display_name_value := coalesce(nullif(item.value->>'display_name', ''), item.key);
    external_prefix := nullif(item.value->>'external_id_prefix', '');
    configured_value := coalesce((item.value->>'configured')::boolean, true);
    enabled_value := coalesce((item.value->>'enabled')::boolean, true);
    is_disabled := coalesce((item.value->>'disabled')::boolean, false) or not enabled_value;
    is_rate_limited := coalesce((item.value->>'rate_limited')::boolean, false);
    has_error := item.value ? 'error' and nullif(item.value->>'error', '') is not null;

    if external_prefix is not null then
      select count(*) into active_count
      from public.jobs
      where source = source_name
        and external_id like external_prefix || '%'
        and is_active = true
        and duplicate_of is null;
    else
      select count(*) into active_count
      from public.jobs
      where source = source_name
        and is_active = true
        and duplicate_of is null;
    end if;

    insert into public.job_source_health(
      source_key, provider, display_name, configured, enabled, status,
      last_run_at, last_success_at, fetched_count, upserted_count,
      active_jobs, consecutive_failures, last_error, updated_at
    )
    values(
      item.key, source_name, display_name_value, configured_value, enabled_value,
      case when is_disabled then 'disabled' when has_error then 'error' when is_rate_limited then 'unknown' else 'healthy' end,
      run_row.triggered_at,
      case when not is_disabled and not has_error and not is_rate_limited then coalesce(run_row.finished_at, run_row.triggered_at) else null end,
      coalesce((item.value->>'fetched')::integer, 0),
      coalesce((item.value->>'upserted')::integer, 0),
      active_count,
      case when has_error then 1 else 0 end,
      item.value->>'error',
      now()
    )
    on conflict(source_key) do update set
      provider = excluded.provider,
      display_name = excluded.display_name,
      configured = excluded.configured,
      enabled = excluded.enabled,
      status = case when is_rate_limited then public.job_source_health.status else excluded.status end,
      last_run_at = excluded.last_run_at,
      last_success_at = case
        when is_rate_limited then public.job_source_health.last_success_at
        when excluded.status = 'healthy' then excluded.last_success_at
        else public.job_source_health.last_success_at
      end,
      fetched_count = case when is_rate_limited then public.job_source_health.fetched_count else excluded.fetched_count end,
      upserted_count = case when is_rate_limited then public.job_source_health.upserted_count else excluded.upserted_count end,
      active_jobs = excluded.active_jobs,
      consecutive_failures = case
        when is_rate_limited then public.job_source_health.consecutive_failures
        when excluded.status = 'healthy' then 0
        when excluded.status = 'error' then public.job_source_health.consecutive_failures + 1
        else public.job_source_health.consecutive_failures
      end,
      last_error = case when is_rate_limited then public.job_source_health.last_error else excluded.last_error end,
      updated_at = now();
  end loop;
end;
$function$;
