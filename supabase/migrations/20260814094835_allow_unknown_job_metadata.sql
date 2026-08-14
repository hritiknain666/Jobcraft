-- Allow provider fields to remain unknown instead of inventing values.
-- Applied to production Supabase on 2026-08-14.

alter table public.jobs alter column work_mode drop not null;
alter table public.jobs alter column experience_min drop not null;
alter table public.jobs alter column experience_min drop default;
