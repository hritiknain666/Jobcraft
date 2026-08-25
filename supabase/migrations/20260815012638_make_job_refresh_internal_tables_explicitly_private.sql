alter table public.job_refresh_auth enable row level security;
revoke all on table public.job_refresh_auth from public, anon, authenticated;
grant select on table public.job_refresh_auth to service_role;

drop policy if exists "No client access to refresh auth" on public.job_refresh_auth;
create policy "No client access to refresh auth"
on public.job_refresh_auth
for all
to anon, authenticated
using (false)
with check (false);

alter table public.job_refresh_runs enable row level security;
revoke all on table public.job_refresh_runs from public, anon, authenticated;
grant select, insert, update on table public.job_refresh_runs to service_role;

drop policy if exists "No client access to refresh run audit" on public.job_refresh_runs;
create policy "No client access to refresh run audit"
on public.job_refresh_runs
for all
to anon, authenticated
using (false)
with check (false);
