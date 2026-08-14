-- JobCraft current bootstrap schema.
-- Reconstructed from the production Supabase schema on 2026-08-14.
-- Use migrations for future changes. Do not run this wholesale against an existing production project.

create extension if not exists pgcrypto;
create schema if not exists private;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  city text,
  headline text,
  experience_years numeric,
  skills text[] default '{}',
  target_roles text[] default '{}',
  preferred_work_modes text[] default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'My Resume',
  storage_path text,
  is_primary boolean not null default false,
  parsed_text text,
  skills text[] default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  structured_data jsonb not null default '{}'::jsonb
);

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  source text not null default 'JobCraft',
  external_id text,
  title text not null,
  company text not null,
  location text not null,
  work_mode text check (work_mode in ('On-site','Hybrid','Remote')),
  experience_min numeric,
  experience_max numeric,
  salary_min_lpa numeric,
  salary_max_lpa numeric,
  skills text[] not null default '{}',
  description text not null,
  apply_url text,
  is_active boolean not null default true,
  posted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (source, external_id)
);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  status text not null default 'Saved' check (status in ('Saved','Applied','Screening','Interview','Offer','Rejected')),
  notes text,
  applied_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, job_id)
);

create table if not exists public.cover_letters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_id uuid references public.jobs(id) on delete set null,
  title text not null,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tailored_resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source_resume_id uuid references public.resumes(id) on delete set null,
  job_id uuid not null references public.jobs(id) on delete cascade,
  title text not null,
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  issuer text not null,
  issue_date date,
  expiry_date date,
  credential_id text,
  credential_url text,
  storage_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists applications_job_id_idx on public.applications(job_id);
create index if not exists applications_user_status_idx on public.applications(user_id, status);
create index if not exists certificates_user_id_idx on public.certificates(user_id);
create index if not exists cover_letters_job_id_idx on public.cover_letters(job_id);
create index if not exists cover_letters_user_id_idx on public.cover_letters(user_id);
create index if not exists jobs_location_idx on public.jobs(location);
create index if not exists jobs_posted_at_idx on public.jobs(posted_at desc);
create index if not exists jobs_skills_gin_idx on public.jobs using gin(skills);
create index if not exists jobs_work_mode_idx on public.jobs(work_mode);
create index if not exists resumes_user_id_idx on public.resumes(user_id);
create index if not exists tailored_resumes_job_id_idx on public.tailored_resumes(job_id);
create index if not exists tailored_resumes_source_resume_id_idx on public.tailored_resumes(source_resume_id);
create index if not exists tailored_resumes_user_id_idx on public.tailored_resumes(user_id);

alter table public.profiles enable row level security;
alter table public.resumes enable row level security;
alter table public.jobs enable row level security;
alter table public.applications enable row level security;
alter table public.cover_letters enable row level security;
alter table public.tailored_resumes enable row level security;
alter table public.certificates enable row level security;

-- Re-create policies safely when bootstrapping a fresh/dev project.
drop policy if exists profiles_select_own on public.profiles;
drop policy if exists profiles_insert_own on public.profiles;
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_select_own on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy profiles_insert_own on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
create policy profiles_update_own on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

drop policy if exists resumes_select_own on public.resumes;
drop policy if exists resumes_insert_own on public.resumes;
drop policy if exists resumes_update_own on public.resumes;
drop policy if exists resumes_delete_own on public.resumes;
create policy resumes_select_own on public.resumes for select to authenticated using ((select auth.uid()) = user_id);
create policy resumes_insert_own on public.resumes for insert to authenticated with check ((select auth.uid()) = user_id);
create policy resumes_update_own on public.resumes for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy resumes_delete_own on public.resumes for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists jobs_public_read on public.jobs;
create policy jobs_public_read on public.jobs for select to anon, authenticated using (is_active = true);

drop policy if exists applications_select_own on public.applications;
drop policy if exists applications_insert_own on public.applications;
drop policy if exists applications_update_own on public.applications;
drop policy if exists applications_delete_own on public.applications;
create policy applications_select_own on public.applications for select to authenticated using ((select auth.uid()) = user_id);
create policy applications_insert_own on public.applications for insert to authenticated with check ((select auth.uid()) = user_id);
create policy applications_update_own on public.applications for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy applications_delete_own on public.applications for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists cover_letters_select_own on public.cover_letters;
drop policy if exists cover_letters_insert_own on public.cover_letters;
drop policy if exists cover_letters_update_own on public.cover_letters;
drop policy if exists cover_letters_delete_own on public.cover_letters;
create policy cover_letters_select_own on public.cover_letters for select to authenticated using ((select auth.uid()) = user_id);
create policy cover_letters_insert_own on public.cover_letters for insert to authenticated with check ((select auth.uid()) = user_id);
create policy cover_letters_update_own on public.cover_letters for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy cover_letters_delete_own on public.cover_letters for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists tailored_resumes_select_own on public.tailored_resumes;
drop policy if exists tailored_resumes_insert_own on public.tailored_resumes;
drop policy if exists tailored_resumes_update_own on public.tailored_resumes;
drop policy if exists tailored_resumes_delete_own on public.tailored_resumes;
create policy tailored_resumes_select_own on public.tailored_resumes for select to authenticated using ((select auth.uid()) = user_id);
create policy tailored_resumes_insert_own on public.tailored_resumes for insert to authenticated with check ((select auth.uid()) = user_id);
create policy tailored_resumes_update_own on public.tailored_resumes for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy tailored_resumes_delete_own on public.tailored_resumes for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Users can view own certificates" on public.certificates;
drop policy if exists "Users can insert own certificates" on public.certificates;
drop policy if exists "Users can update own certificates" on public.certificates;
drop policy if exists "Users can delete own certificates" on public.certificates;
create policy "Users can view own certificates" on public.certificates for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can insert own certificates" on public.certificates for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can update own certificates" on public.certificates for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users can delete own certificates" on public.certificates for delete to authenticated using ((select auth.uid()) = user_id);

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('resumes', 'resumes', false, 5242880, array['application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document']::text[]),
  ('certificates', 'certificates', false, 5242880, array['application/pdf','image/jpeg','image/png']::text[])
on conflict (id) do update set
  name = excluded.name,
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists resume_upload_own_folder on storage.objects;
drop policy if exists resume_read_own on storage.objects;
drop policy if exists resume_update_own on storage.objects;
drop policy if exists resume_delete_own on storage.objects;
create policy resume_upload_own_folder on storage.objects for insert to authenticated with check (bucket_id = 'resumes' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy resume_read_own on storage.objects for select to authenticated using (bucket_id = 'resumes' and owner_id = (select auth.uid())::text);
create policy resume_update_own on storage.objects for update to authenticated using (bucket_id = 'resumes' and owner_id = (select auth.uid())::text) with check (bucket_id = 'resumes' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy resume_delete_own on storage.objects for delete to authenticated using (bucket_id = 'resumes' and owner_id = (select auth.uid())::text);

drop policy if exists "Users can view own certificate files" on storage.objects;
drop policy if exists "Users can upload own certificate files" on storage.objects;
drop policy if exists "Users can update own certificate files" on storage.objects;
drop policy if exists "Users can delete own certificate files" on storage.objects;
create policy "Users can view own certificate files" on storage.objects for select to authenticated using (bucket_id = 'certificates' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Users can upload own certificate files" on storage.objects for insert to authenticated with check (bucket_id = 'certificates' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Users can update own certificate files" on storage.objects for update to authenticated using (bucket_id = 'certificates' and (storage.foldername(name))[1] = (select auth.uid())::text) with check (bucket_id = 'certificates' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Users can delete own certificate files" on storage.objects for delete to authenticated using (bucket_id = 'certificates' and (storage.foldername(name))[1] = (select auth.uid())::text);
