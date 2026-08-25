drop policy if exists jobs_public_read on public.jobs;
create policy jobs_public_read
on public.jobs
for select
to anon, authenticated
using (
  is_active = true
  and duplicate_of is null
  and apply_url_status <> 'dead'
);

do $$
begin
  if exists (select 1 from cron.job where jobname = 'jobcraft-link-check-daily') then
    perform cron.unschedule('jobcraft-link-check-daily');
  end if;
end $$;

select cron.schedule(
  'jobcraft-link-check-daily',
  '45 2 * * *',
  $$
    select net.http_post(
      url := (select decrypted_secret from vault.decrypted_secrets where name = 'jobcraft_project_url') || '/functions/v1/check-job-links',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-jobcraft-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'jobcraft_job_refresh_secret')
      ),
      body := jsonb_build_object('trigger', 'supabase-cron', 'requested_at', now()),
      timeout_milliseconds := 120000
    );
  $$
);
