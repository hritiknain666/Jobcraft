alter function public.jobcraft_canonical_text(text) set search_path = pg_catalog, public;
alter function public.jobcraft_canonical_company(text) set search_path = pg_catalog, public;
alter function public.jobcraft_normalize_location(text) set search_path = pg_catalog, public;
alter function public.jobcraft_canonical_apply_url(text) set search_path = pg_catalog, public;
alter function public.jobcraft_prepare_job_record() set search_path = pg_catalog, public;

drop policy if exists "No client access to account deletion cleanup" on public.account_deletion_cleanup;
create policy "No client access to account deletion cleanup"
on public.account_deletion_cleanup for all to anon, authenticated
using (false) with check (false);

drop policy if exists "No client access to AI rate limits" on public.ai_rate_limits;
create policy "No client access to AI rate limits"
on public.ai_rate_limits for all to anon, authenticated
using (false) with check (false);

revoke all on table public.job_source_health from anon, authenticated;
grant select (source_key, display_name, status, last_success_at, active_jobs)
on public.job_source_health to anon, authenticated;

drop policy if exists "Public can read safe source health fields" on public.job_source_health;
create policy "Public can read safe source health fields"
on public.job_source_health for select to anon, authenticated
using (enabled = true);

alter function public.get_job_source_health() security invoker;
alter function public.get_job_source_health() set search_path = pg_catalog, public;
revoke all on function public.get_job_source_health() from public;
grant execute on function public.get_job_source_health() to anon, authenticated, service_role;
