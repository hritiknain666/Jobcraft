-- JobCraft MVP database schema
-- Run this in the Supabase SQL Editor after creating the project.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  city text,
  target_role text,
  experience_years numeric(4,1),
  skills text[] default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'My Resume',
  storage_path text,
  parsed_text text,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company text not null,
  role text not null,
  job_url text,
  location text,
  salary_text text,
  status text not null default 'saved' check (status in ('saved','applied','screening','interview','offer','rejected')),
  applied_at date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.resumes enable row level security;
alter table public.applications enable row level security;

create policy "Users can view own profile" on public.profiles
for select to authenticated using ((select auth.uid()) = id);
create policy "Users can update own profile" on public.profiles
for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "Users can view own resumes" on public.resumes
for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can add own resumes" on public.resumes
for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can update own resumes" on public.resumes
for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users can delete own resumes" on public.resumes
for delete to authenticated using ((select auth.uid()) = user_id);

create policy "Users can view own applications" on public.applications
for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can add own applications" on public.applications
for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can update own applications" on public.applications
for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users can delete own applications" on public.applications
for delete to authenticated using ((select auth.uid()) = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', false)
on conflict (id) do nothing;

create policy "Users can upload own resume files" on storage.objects
for insert to authenticated
with check (bucket_id = 'resumes' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Users can read own resume files" on storage.objects
for select to authenticated
using (bucket_id = 'resumes' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Users can update own resume files" on storage.objects
for update to authenticated
using (bucket_id = 'resumes' and (storage.foldername(name))[1] = (select auth.uid())::text)
with check (bucket_id = 'resumes' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Users can delete own resume files" on storage.objects
for delete to authenticated
using (bucket_id = 'resumes' and (storage.foldername(name))[1] = (select auth.uid())::text);
