update public.jobs
set is_active = false
where source = 'IndianAPI'
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
where source_key = 'IndianAPI';
