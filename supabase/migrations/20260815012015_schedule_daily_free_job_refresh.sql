do $$
begin
  if exists (select 1 from cron.job where jobname = 'jobcraft-free-jobs-daily') then
    perform cron.unschedule('jobcraft-free-jobs-daily');
  end if;
end $$;

select cron.schedule(
  'jobcraft-free-jobs-daily',
  '17 2 * * *',
  $$
    select net.http_post(
      url := (select decrypted_secret from vault.decrypted_secrets where name = 'jobcraft_project_url') || '/functions/v1/refresh-free-jobs',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-jobcraft-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'jobcraft_job_refresh_secret')
      ),
      body := jsonb_build_object('trigger', 'supabase-cron', 'requested_at', now()),
      timeout_milliseconds := 120000
    );
  $$
);
