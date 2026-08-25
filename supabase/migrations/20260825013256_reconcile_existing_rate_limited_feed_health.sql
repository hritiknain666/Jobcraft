-- A provider rate limit is transient and must not leave the public feed marked
-- as degraded after rate-limit-aware health handling has been installed.
update public.job_source_health
set
  status = case when last_success_at is null then 'unknown' else 'healthy' end,
  last_error = null,
  consecutive_failures = 0,
  updated_at = now()
where status = 'error'
  and last_error ~* '(^|[^0-9])429([^0-9]|$)|too many requests|rate.?limit';
