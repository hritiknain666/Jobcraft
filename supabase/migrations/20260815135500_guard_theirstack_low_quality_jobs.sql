create or replace function public.enforce_theirstack_job_quality()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.source = 'TheirStack' then
    if length(btrim(coalesce(new.description, ''))) < 40
       or new.apply_url is null
       or length(btrim(new.apply_url)) < 8 then
      new.is_active := false;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_enforce_theirstack_job_quality on public.jobs;
create trigger trg_enforce_theirstack_job_quality
before insert or update on public.jobs
for each row execute function public.enforce_theirstack_job_quality();

update public.jobs
set is_active = false
where source = 'TheirStack'
  and (
    length(btrim(coalesce(description, ''))) < 40
    or apply_url is null
    or length(btrim(apply_url)) < 8
  );
