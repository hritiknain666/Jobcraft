create table if not exists public.account_deletion_cleanup (
  user_id uuid primary key,
  storage_objects jsonb not null default '[]'::jsonb,
  status text not null default 'pending' check (status in ('pending','cleaning','failed')),
  attempts integer not null default 0,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.account_deletion_cleanup enable row level security;
revoke all on table public.account_deletion_cleanup from public, anon, authenticated;
grant select, insert, update, delete on table public.account_deletion_cleanup to service_role;

create table if not exists public.ai_rate_limits (
  user_id uuid primary key references auth.users(id) on delete cascade,
  window_started_at timestamptz not null default now(),
  request_count integer not null default 0 check (request_count >= 0),
  updated_at timestamptz not null default now()
);

alter table public.ai_rate_limits enable row level security;
revoke all on table public.ai_rate_limits from public, anon, authenticated;
grant select, insert, update, delete on table public.ai_rate_limits to service_role;

create or replace function public.consume_ai_rate_limit(
  p_user_id uuid,
  p_limit integer default 10,
  p_window_seconds integer default 600
)
returns table(allowed boolean, remaining integer, retry_after_seconds integer)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_limit integer := greatest(1, least(p_limit, 1000));
  v_window_seconds integer := greatest(1, least(p_window_seconds, 86400));
  v_started_at timestamptz;
  v_count integer;
  v_now timestamptz := clock_timestamp();
begin
  insert into public.ai_rate_limits (user_id, window_started_at, request_count, updated_at)
  values (p_user_id, v_now, 0, v_now)
  on conflict (user_id) do nothing;

  select window_started_at, request_count
  into v_started_at, v_count
  from public.ai_rate_limits
  where user_id = p_user_id
  for update;

  if v_started_at <= v_now - make_interval(secs => v_window_seconds) then
    update public.ai_rate_limits
    set window_started_at = v_now, request_count = 1, updated_at = v_now
    where user_id = p_user_id;
    return query select true, v_limit - 1, 0;
  elsif v_count >= v_limit then
    return query select false, 0,
      greatest(1, ceil(extract(epoch from (v_started_at + make_interval(secs => v_window_seconds) - v_now)))::integer);
  else
    update public.ai_rate_limits
    set request_count = request_count + 1, updated_at = v_now
    where user_id = p_user_id;
    return query select true, greatest(0, v_limit - v_count - 1), 0;
  end if;
end;
$$;

revoke execute on function public.consume_ai_rate_limit(uuid, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_ai_rate_limit(uuid, integer, integer) to service_role;
