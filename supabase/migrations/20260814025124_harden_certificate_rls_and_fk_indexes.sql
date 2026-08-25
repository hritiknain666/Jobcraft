-- Applied to the production Supabase project during the final engineering audit.
-- Tighten certificate ownership policies to authenticated users and avoid per-row auth.uid() re-evaluation.

drop policy if exists "Users can view own certificates" on public.certificates;
drop policy if exists "Users can insert own certificates" on public.certificates;
drop policy if exists "Users can update own certificates" on public.certificates;
drop policy if exists "Users can delete own certificates" on public.certificates;

create policy "Users can view own certificates" on public.certificates
for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can insert own certificates" on public.certificates
for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update own certificates" on public.certificates
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete own certificates" on public.certificates
for delete to authenticated
using ((select auth.uid()) = user_id);

create index if not exists applications_job_id_idx on public.applications(job_id);
create index if not exists certificates_user_id_idx on public.certificates(user_id);
create index if not exists cover_letters_job_id_idx on public.cover_letters(job_id);
create index if not exists cover_letters_user_id_idx on public.cover_letters(user_id);
create index if not exists resumes_user_id_idx on public.resumes(user_id);
create index if not exists tailored_resumes_job_id_idx on public.tailored_resumes(job_id);
create index if not exists tailored_resumes_source_resume_id_idx on public.tailored_resumes(source_resume_id);
create index if not exists tailored_resumes_user_id_idx on public.tailored_resumes(user_id);
