-- Reconstructed from the production Supabase schema for source-control parity.
-- Production already contains this migration; do not re-apply it there manually.

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

alter table public.certificates enable row level security;

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

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'certificates',
  'certificates',
  false,
  5242880,
  array['application/pdf', 'image/jpeg', 'image/png']::text[]
)
on conflict (id) do update set
  name = excluded.name,
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Users can view own certificate files" on storage.objects;
drop policy if exists "Users can upload own certificate files" on storage.objects;
drop policy if exists "Users can update own certificate files" on storage.objects;
drop policy if exists "Users can delete own certificate files" on storage.objects;

create policy "Users can view own certificate files" on storage.objects
for select to authenticated
using (
  bucket_id = 'certificates'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "Users can upload own certificate files" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'certificates'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "Users can update own certificate files" on storage.objects
for update to authenticated
using (
  bucket_id = 'certificates'
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'certificates'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "Users can delete own certificate files" on storage.objects
for delete to authenticated
using (
  bucket_id = 'certificates'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
