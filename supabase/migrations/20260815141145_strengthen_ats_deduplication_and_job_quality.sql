create or replace function public.jobcraft_canonical_apply_url(value text)
returns text language plpgsql immutable parallel safe as $$
declare
  v text := lower(btrim(coalesce(value,'')));
  job_id text; lever_site text; lever_id text;
begin
  if v='' or v !~ '^https?://' then return null; end if;
  if v like '%greenhouse.io%' then
    job_id := substring(v from '[?&]token=([0-9]+)');
    if job_id is null then job_id := substring(v from '/jobs/([0-9]+)'); end if;
    if job_id is not null then return 'greenhouse:' || job_id; end if;
  end if;
  if v like '%jobs.lever.co/%' then
    lever_site := substring(v from 'jobs\.lever\.co/([^/?#]+)');
    lever_id := substring(v from 'jobs\.lever\.co/[^/?#]+/([0-9a-f-]{20,})');
    if lever_site is not null and lever_id is not null then return 'lever:' || lever_site || ':' || lever_id; end if;
  end if;
  v := regexp_replace(v,'^http://','https://');
  v := regexp_replace(v,'#.*$','');
  v := regexp_replace(v,'/$','');
  return v;
end;
$$;

create or replace function public.jobcraft_prepare_job_record()
returns trigger language plpgsql as $$
begin
  new.canonical_title := public.jobcraft_canonical_text(new.title);
  new.canonical_company := public.jobcraft_canonical_company(new.company);
  new.location_normalized := public.jobcraft_normalize_location(new.location);
  new.apply_url_canonical := public.jobcraft_canonical_apply_url(new.apply_url);
  if new.source <> 'JobCraft' and (length(btrim(coalesce(new.description,''))) < 40 or new.apply_url_canonical is null) then new.is_active := false; end if;
  if new.apply_url is not null and new.apply_url_canonical is null then
    new.apply_url := null; new.apply_url_status := 'dead'; new.apply_url_checked_at := now();
  elsif new.apply_url is not null and tg_op='INSERT' then
    new.apply_url_status := coalesce(nullif(new.apply_url_status,''),'unchecked');
  end if;
  if tg_op='INSERT' then new.first_seen_at := coalesce(new.first_seen_at,now()); end if;
  new.last_seen_at := now();
  new.search_document := setweight(to_tsvector('simple',coalesce(new.title,'')),'A') || setweight(to_tsvector('simple',coalesce(new.company,'')),'A') || setweight(to_tsvector('simple',coalesce(new.location,'')),'B') || setweight(to_tsvector('simple',coalesce(array_to_string(new.skills,' '),'')),'B') || setweight(to_tsvector('simple',coalesce(new.description,'')),'C');
  return new;
end;
$$;

create or replace function public.jobcraft_dedupe_jobs()
returns integer language plpgsql security definer set search_path=public as $$
declare affected integer:=0; step_count integer:=0;
begin
  update public.jobs j set duplicate_of=null,is_active=true
  where j.duplicate_of is not null and j.last_seen_at >= now()-interval '14 days'
    and exists(select 1 from public.jobs keeper where keeper.id=j.duplicate_of and keeper.is_active=false);

  with ranked as (
    select id,
      first_value(id) over(partition by apply_url_canonical order by case source when 'Greenhouse' then 100 when 'Lever' then 100 when 'IndianAPI' then 80 when 'TheirStack' then 70 when 'Remotive' then 60 when 'Jobicy' then 60 when 'Himalayas' then 60 when 'Remote OK' then 60 when 'Adzuna' then 50 else 40 end desc,length(description) desc,posted_at desc,id) keeper_id,
      row_number() over(partition by apply_url_canonical order by case source when 'Greenhouse' then 100 when 'Lever' then 100 when 'IndianAPI' then 80 when 'TheirStack' then 70 when 'Remotive' then 60 when 'Jobicy' then 60 when 'Himalayas' then 60 when 'Remote OK' then 60 when 'Adzuna' then 50 else 40 end desc,length(description) desc,posted_at desc,id) rn
    from public.jobs where is_active=true and duplicate_of is null and apply_url_canonical is not null
  )
  update public.jobs j set duplicate_of=ranked.keeper_id,is_active=false from ranked where j.id=ranked.id and ranked.rn>1;
  get diagnostics step_count=row_count; affected:=affected+step_count;

  with candidate as (
    select j.id,(select d.id from public.jobs d where d.id<>j.id and d.is_active=true and d.duplicate_of is null and d.source in ('Greenhouse','Lever') and d.canonical_title=j.canonical_title and d.canonical_company=j.canonical_company and d.location_normalized=j.location_normalized order by length(d.description) desc,d.posted_at desc limit 1) keeper_id
    from public.jobs j where j.is_active=true and j.duplicate_of is null and j.source not in ('Greenhouse','Lever') and j.canonical_title<>'' and j.canonical_company<>''
  )
  update public.jobs j set duplicate_of=candidate.keeper_id,is_active=false from candidate where j.id=candidate.id and candidate.keeper_id is not null;
  get diagnostics step_count=row_count; affected:=affected+step_count;
  return affected;
end;
$$;

update public.jobs set apply_url=apply_url;
select public.jobcraft_dedupe_jobs();
select public.jobcraft_run_feed_maintenance();
