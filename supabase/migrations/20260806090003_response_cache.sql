-- Postgres-backed replacement for the spec's Upstash cache.
-- Stores the full AskResponse JSON so a cache hit can still render the pipeline panel
-- (with cached: true flipped on serve).
create table response_cache (
  question_hash text primary key,      -- sha256 of normalised question text
  response      jsonb not null,
  created_at    timestamptz not null default now()
);

alter table response_cache enable row level security;

create or replace function get_cached_response(p_hash text, p_ttl_hours int default 24)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select response from response_cache
  where question_hash = p_hash
    and created_at > now() - (p_ttl_hours || ' hours')::interval;
$$;
