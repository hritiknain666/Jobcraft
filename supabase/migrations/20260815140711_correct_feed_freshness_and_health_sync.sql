create or replace function public.jobcraft_sync_refresh_health()
returns void language plpgsql security definer set search_path = public as $$
declare
  run_row record; item record; has_error boolean; is_disabled boolean; source_name text; display_name_value text;
  external_prefix text; active_count integer; configured_value boolean; enabled_value boolean;
begin
  select triggered_at,finished_at,summary into run_row from public.job_refresh_runs where summary is not null order by triggered_at desc limit 1;
  if run_row is null then return; end if;
  for item in select key,value from jsonb_each(run_row.summary) loop
    if item.key='configuration' or jsonb_typeof(item.value)<>'object' then continue; end if;
    source_name := coalesce(nullif(item.value->>'source',''),item.key);
    display_name_value := coalesce(nullif(item.value->>'display_name',''),item.key);
    external_prefix := nullif(item.value->>'external_id_prefix','');
    configured_value := coalesce((item.value->>'configured')::boolean,true);
    enabled_value := coalesce((item.value->>'enabled')::boolean,true);
    is_disabled := coalesce((item.value->>'disabled')::boolean,false) or not enabled_value;
    has_error := item.value ? 'error' and nullif(item.value->>'error','') is not null;
    if external_prefix is not null then
      select count(*) into active_count from public.jobs where source=source_name and external_id like external_prefix || '%' and is_active=true and duplicate_of is null;
    else
      select count(*) into active_count from public.jobs where source=source_name and is_active=true and duplicate_of is null;
    end if;
    insert into public.job_source_health(source_key,provider,display_name,configured,enabled,status,last_run_at,last_success_at,fetched_count,upserted_count,active_jobs,consecutive_failures,last_error,updated_at)
    values(item.key,source_name,display_name_value,configured_value,enabled_value,case when is_disabled then 'disabled' when has_error then 'error' else 'healthy' end,run_row.triggered_at,case when not is_disabled and not has_error then coalesce(run_row.finished_at,run_row.triggered_at) else null end,coalesce((item.value->>'fetched')::integer,0),coalesce((item.value->>'upserted')::integer,0),active_count,case when has_error then 1 else 0 end,item.value->>'error',now())
    on conflict(source_key) do update set provider=excluded.provider,display_name=excluded.display_name,configured=excluded.configured,enabled=excluded.enabled,status=excluded.status,last_run_at=excluded.last_run_at,last_success_at=case when excluded.status='healthy' then excluded.last_success_at else public.job_source_health.last_success_at end,fetched_count=excluded.fetched_count,upserted_count=excluded.upserted_count,active_jobs=excluded.active_jobs,consecutive_failures=case when excluded.status='healthy' then 0 when excluded.status='error' then public.job_source_health.consecutive_failures+1 else public.job_source_health.consecutive_failures end,last_error=excluded.last_error,updated_at=now();
  end loop;
end;
$$;

create or replace function public.jobcraft_run_feed_maintenance()
returns jsonb language plpgsql security definer set search_path = public as $$
declare stale_count integer:=0; dead_count integer:=0; deduped integer:=0;
begin
  update public.jobs set is_active=false
  where is_active=true and source in ('Remotive','Jobicy','Himalayas','Remote OK','IndianAPI','TheirStack','Adzuna','Arbeitnow','Jooble') and posted_at < now()-interval '45 days';
  get diagnostics stale_count=row_count;
  update public.jobs set is_active=false where is_active=true and apply_url_status='dead';
  get diagnostics dead_count=row_count;
  deduped := public.jobcraft_dedupe_jobs();
  perform public.jobcraft_sync_refresh_health();
  update public.job_source_health h set active_jobs=counts.cnt,updated_at=now()
  from (select source,count(*)::integer cnt from public.jobs where is_active=true and duplicate_of is null group by source) counts
  where h.source_key=counts.source;
  update public.job_source_health set status='degraded',updated_at=now()
  where enabled=true and last_success_at is not null and last_success_at < now()-interval '2 days' and status='healthy';
  return jsonb_build_object('stale_deactivated',stale_count,'dead_links_deactivated',dead_count,'duplicates_deactivated',deduped);
end;
$$;

create or replace function public.get_job_source_health()
returns table(source_key text,display_name text,status text,last_success_at timestamptz,active_jobs integer)
language sql stable security definer set search_path=public as $$
  select h.source_key,h.display_name,h.status,h.last_success_at,h.active_jobs
  from public.job_source_health h where h.enabled=true order by h.display_name;
$$;
revoke all on function public.get_job_source_health() from public;
grant execute on function public.get_job_source_health() to anon,authenticated,service_role;
select public.jobcraft_run_feed_maintenance();
