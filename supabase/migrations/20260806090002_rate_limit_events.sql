-- Postgres-backed replacement for the spec's Upstash Redis rate limiter.
create table rate_limit_events (
  id         bigint generated always as identity primary key,
  rl_key     text not null,             -- hashed IP
  created_at timestamptz not null default now()
);

create index on rate_limit_events (rl_key, created_at);

alter table rate_limit_events enable row level security;

-- Atomic check-and-record. Serializes concurrent callers with the same key via an
-- advisory transaction lock so the count-then-insert can't race under concurrency.
create or replace function check_rate_limit(p_key text, p_limit int, p_window_minutes int default 60)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  perform pg_advisory_xact_lock(hashtext('rl:' || p_key));

  delete from rate_limit_events
    where rl_key = p_key
      and created_at < now() - (p_window_minutes || ' minutes')::interval;

  select count(*) into v_count
    from rate_limit_events
    where rl_key = p_key
      and created_at > now() - (p_window_minutes || ' minutes')::interval;

  if v_count >= p_limit then
    return false;
  end if;

  insert into rate_limit_events (rl_key) values (p_key);
  return true;
end;
$$;
