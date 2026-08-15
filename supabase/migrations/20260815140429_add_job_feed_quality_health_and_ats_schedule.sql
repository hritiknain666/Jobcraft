create extension if not exists pg_trgm with schema extensions;

create or replace function public.jobcraft_canonical_text(value text)
returns text language sql immutable parallel safe as $$
  select trim(regexp_replace(lower(coalesce(value, '')), '[^a-z0-9]+', ' ', 'g'));
$$;

create or replace function public.jobcraft_canonical_company(value text)
returns text language sql immutable parallel safe as $$
  select trim(regexp_replace(public.jobcraft_canonical_text(value), '\\s+(private limited|pvt ltd|pvt limited|limited|ltd|incorporated|inc|llc|corp|corporation)$', '', 'g'));
$$;

create or replace function public.jobcraft_normalize_location(value text)
returns text language plpgsql immutable parallel safe as $$
declare v text := public.jobcraft_canonical_text(value);
begin
  if v = '' then return 'India'; end if;
  if v ~ '\\m(bengaluru|bangalore)\\M' then return 'Bengaluru'; end if;
  if v ~ '\\m(gurugram|gurgaon)\\M' then return 'Gurugram'; end if;
  if v ~ '\\m(mumbai|bombay)\\M' then return 'Mumbai'; end if;
  if v ~ '\\m(noida)\\M' then return 'Noida'; end if;
  if v ~ '\\m(new delhi|delhi ncr|delhi)\\M' then return 'Delhi NCR'; end if;
  if v ~ '\\m(hyderabad)\\M' then return 'Hyderabad'; end if;
  if v ~ '\\m(pune)\\M' then return 'Pune'; end if;
  if v ~ '\\m(chennai)\\M' then return 'Chennai'; end if;
  if v ~ '\\m(kolkata|calcutta)\\M' then return 'Kolkata'; end if;
  if v ~ '\\m(ahmedabad)\\M' then return 'Ahmedabad'; end if;
  if v ~ '\\m(kochi|cochin)\\M' then return 'Kochi'; end if;
  if v ~ '\\m(jaipur)\\M' then return 'Jaipur'; end if;
  if v ~ '\\m(chandigarh)\\M' then return 'Chandigarh'; end if;
  if v ~ '\\m(coimbatore)\\M' then return 'Coimbatore'; end if;
  if v ~ '\\m(indore)\\M' then return 'Indore'; end if;
  if v ~ '\\m(surat)\\M' then return 'Surat'; end if;
  if v ~ '\\m(vadodara)\\M' then return 'Vadodara'; end if;
  if v ~ '\\m(nashik)\\M' then return 'Nashik'; end if;
  if v ~ '\\m(mysuru|mysore)\\M' then return 'Mysuru'; end if;
  if v ~ '\\m(remote|work from home|wfh)\\M' then return 'Remote'; end if;
  if v ~ '\\m(india)\\M' then return 'India'; end if;
  return left(trim(coalesce(value, 'India')), 180);
end;
$$;

create or replace function public.jobcraft_canonical_apply_url(value text)
returns text language sql immutable parallel safe as $$
  select case when value is null or btrim(value) = '' then null when lower(btrim(value)) !~ '^https?://' then null else regexp_replace(regexp_replace(lower(btrim(value)), '^http://', 'https://'), '[?#].*$', '') end;
$$;

alter table public.jobs add column if not exists first_seen_at timestamptz not null default now();
alter table public.jobs add column if not exists last_seen_at timestamptz not null default now();
alter table public.jobs add column if not exists canonical_title text;
alter table public.jobs add column if not exists canonical_company text;
alter table public.jobs add column if not exists location_normalized text;
alter table public.jobs add column if not exists apply_url_canonical text;
alter table public.jobs add column if not exists duplicate_of uuid;
alter table public.jobs add column if not exists apply_url_status text not null default 'unchecked';
alter table public.jobs add column if not exists apply_url_checked_at timestamptz;
alter table public.jobs add column if not exists search_document tsvector;
alter table public.jobs drop constraint if exists jobs_apply_url_status_check;
alter table public.jobs add constraint jobs_apply_url_status_check check (apply_url_status in ('unchecked','ok','unknown','dead'));

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'jobs_duplicate_of_fkey' and conrelid = 'public.jobs'::regclass) then
    alter table public.jobs add constraint jobs_duplicate_of_fkey foreign key (duplicate_of) references public.jobs(id) on delete set null;
  end if;
end $$;

create or replace function public.jobcraft_prepare_job_record()
returns trigger language plpgsql as $$
begin
  new.canonical_title := public.jobcraft_canonical_text(new.title);
  new.canonical_company := public.jobcraft_canonical_company(new.company);
  new.location_normalized := public.jobcraft_normalize_location(new.location);
  new.apply_url_canonical := public.jobcraft_canonical_apply_url(new.apply_url);
  if new.apply_url is not null and new.apply_url_canonical is null then
    new.apply_url := null; new.apply_url_status := 'dead'; new.apply_url_checked_at := now();
  elsif new.apply_url is not null and tg_op = 'INSERT' then
    new.apply_url_status := coalesce(nullif(new.apply_url_status, ''), 'unchecked');
  end if;
  if tg_op = 'INSERT' then new.first_seen_at := coalesce(new.first_seen_at, now()); end if;
  new.last_seen_at := now();
  new.search_document := setweight(to_tsvector('simple', coalesce(new.title, '')), 'A') || setweight(to_tsvector('simple', coalesce(new.company, '')), 'A') || setweight(to_tsvector('simple', coalesce(new.location, '')), 'B') || setweight(to_tsvector('simple', coalesce(array_to_string(new.skills, ' '), '')), 'B') || setweight(to_tsvector('simple', coalesce(new.description, '')), 'C');
  return new;
end;
$$;

drop trigger if exists jobs_prepare_quality_fields on public.jobs;
create trigger jobs_prepare_quality_fields before insert or update on public.jobs for each row execute function public.jobcraft_prepare_job_record();
update public.jobs set title = title;

create index if not exists jobs_last_seen_at_idx on public.jobs (last_seen_at desc);
create index if not exists jobs_location_normalized_idx on public.jobs (location_normalized);
create index if not exists jobs_duplicate_of_idx on public.jobs (duplicate_of);
create index if not exists jobs_apply_url_canonical_idx on public.jobs (apply_url_canonical) where apply_url_canonical is not null;
create index if not exists jobs_search_document_gin_idx on public.jobs using gin (search_document);
create index if not exists jobs_title_trgm_idx on public.jobs using gin (lower(title) extensions.gin_trgm_ops);
create index if not exists jobs_company_trgm_idx on public.jobs using gin (lower(company) extensions.gin_trgm_ops);
create index if not exists jobs_location_trgm_idx on public.jobs using gin (lower(location_normalized) extensions.gin_trgm_ops);

create table if not exists public.job_source_health (
  source_key text primary key, provider text not null, display_name text not null, configured boolean not null default true,
  enabled boolean not null default true, status text not null default 'unknown' check (status in ('healthy','degraded','error','disabled','unknown')),
  last_run_at timestamptz, last_success_at timestamptz, fetched_count integer not null default 0, upserted_count integer not null default 0,
  active_jobs integer not null default 0, consecutive_failures integer not null default 0, last_error text, updated_at timestamptz not null default now()
);
alter table public.job_source_health enable row level security;
revoke all on public.job_source_health from anon, authenticated;
grant all on public.job_source_health to service_role;

create or replace function public.jobcraft_sync_refresh_health()
returns void language plpgsql security definer set search_path = public as $$
declare run_row record; item record; has_error boolean; active_count integer;
begin
  select triggered_at, finished_at, summary into run_row from public.job_refresh_runs where summary is not null order by triggered_at desc limit 1;
  if run_row is null then return; end if;
  for item in select key, value from jsonb_each(run_row.summary) loop
    if item.key = 'configuration' or jsonb_typeof(item.value) <> 'object' then continue; end if;
    has_error := item.value ? 'error';
    select count(*) into active_count from public.jobs where source = item.key and is_active = true and duplicate_of is null;
    insert into public.job_source_health(source_key,provider,display_name,configured,enabled,status,last_run_at,last_success_at,fetched_count,upserted_count,active_jobs,consecutive_failures,last_error,updated_at)
    values(item.key,item.key,item.key,true,true,case when has_error then 'error' else 'healthy' end,run_row.triggered_at,case when has_error then null else coalesce(run_row.finished_at,run_row.triggered_at) end,coalesce((item.value->>'fetched')::integer,0),coalesce((item.value->>'upserted')::integer,0),active_count,case when has_error then 1 else 0 end,item.value->>'error',now())
    on conflict(source_key) do update set status=excluded.status,last_run_at=excluded.last_run_at,last_success_at=case when excluded.status='healthy' then excluded.last_success_at else public.job_source_health.last_success_at end,fetched_count=excluded.fetched_count,upserted_count=excluded.upserted_count,active_jobs=excluded.active_jobs,consecutive_failures=case when excluded.status='healthy' then 0 else public.job_source_health.consecutive_failures+1 end,last_error=excluded.last_error,updated_at=now();
  end loop;
end;
$$;

create or replace function public.jobcraft_dedupe_jobs()
returns integer language plpgsql security definer set search_path = public as $$
declare affected integer := 0; step_count integer := 0;
begin
  with ranked as (
    select id, first_value(id) over (partition by apply_url_canonical order by case source when 'Greenhouse' then 100 when 'Lever' then 100 when 'IndianAPI' then 80 when 'TheirStack' then 70 when 'Remotive' then 60 when 'Jobicy' then 60 when 'Himalayas' then 60 when 'Remote OK' then 60 when 'Adzuna' then 50 else 40 end desc,length(description) desc,posted_at desc,id) keeper_id,
    row_number() over (partition by apply_url_canonical order by case source when 'Greenhouse' then 100 when 'Lever' then 100 when 'IndianAPI' then 80 when 'TheirStack' then 70 when 'Remotive' then 60 when 'Jobicy' then 60 when 'Himalayas' then 60 when 'Remote OK' then 60 when 'Adzuna' then 50 else 40 end desc,length(description) desc,posted_at desc,id) rn
    from public.jobs where is_active=true and duplicate_of is null and apply_url_canonical is not null
  ) update public.jobs j set duplicate_of=ranked.keeper_id,is_active=false from ranked where j.id=ranked.id and ranked.rn>1;
  get diagnostics step_count = row_count; affected := affected + step_count;
  with candidate as (
    select j.id,(select d.id from public.jobs d where d.id<>j.id and d.is_active=true and d.duplicate_of is null and d.source in ('Greenhouse','Lever') and d.canonical_title=j.canonical_title and d.canonical_company=j.canonical_company and d.location_normalized=j.location_normalized order by length(d.description) desc,d.posted_at desc limit 1) keeper_id
    from public.jobs j where j.is_active=true and j.duplicate_of is null and j.source not in ('Greenhouse','Lever') and j.canonical_title<>'' and j.canonical_company<>''
  ) update public.jobs j set duplicate_of=candidate.keeper_id,is_active=false from candidate where j.id=candidate.id and candidate.keeper_id is not null;
  get diagnostics step_count = row_count; affected := affected + step_count;
  return affected;
end;
$$;

create or replace function public.jobcraft_run_feed_maintenance()
returns jsonb language plpgsql security definer set search_path = public as $$
declare stale_count integer:=0; dead_count integer:=0; deduped integer:=0;
begin
  update public.jobs set is_active=false where is_active=true and source in ('Remotive','Jobicy','Himalayas','Remote OK') and last_seen_at < now()-interval '3 days'; get diagnostics stale_count=row_count;
  update public.jobs set is_active=false where is_active=true and apply_url_status='dead'; get diagnostics dead_count=row_count;
  deduped := public.jobcraft_dedupe_jobs(); perform public.jobcraft_sync_refresh_health();
  return jsonb_build_object('stale_deactivated',stale_count,'dead_links_deactivated',dead_count,'duplicates_deactivated',deduped);
end;
$$;

select public.jobcraft_run_feed_maintenance();
select cron.unschedule(jobid) from cron.job where jobname in ('jobcraft-ats-jobs-daily','jobcraft-feed-maintenance-daily');
select cron.schedule('jobcraft-ats-jobs-daily','25 2 * * *',$$select net.http_post(url := (select decrypted_secret from vault.decrypted_secrets where name='jobcraft_project_url') || '/functions/v1/refresh-ats-jobs',headers := jsonb_build_object('Content-Type','application/json','x-jobcraft-cron-secret',(select decrypted_secret from vault.decrypted_secrets where name='jobcraft_job_refresh_secret')),body := jsonb_build_object('trigger','supabase-cron','requested_at',now()),timeout_milliseconds := 120000);$$);
select cron.schedule('jobcraft-feed-maintenance-daily','35 2 * * *',$$select public.jobcraft_run_feed_maintenance();$$);
