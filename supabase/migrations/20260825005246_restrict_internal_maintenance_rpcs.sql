revoke execute on function public.jobcraft_dedupe_jobs() from public, anon, authenticated;
revoke execute on function public.jobcraft_run_feed_maintenance() from public, anon, authenticated;
revoke execute on function public.jobcraft_sync_refresh_health() from public, anon, authenticated;

grant execute on function public.jobcraft_dedupe_jobs() to service_role;
grant execute on function public.jobcraft_run_feed_maintenance() to service_role;
grant execute on function public.jobcraft_sync_refresh_health() to service_role;
