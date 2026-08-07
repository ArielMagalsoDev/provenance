-- get_cached_response originally took p_ttl_hours int — fine when the only
-- TTL was 24h, but workspace-scoped cache entries expire with the overlay
-- content (WORKSPACE_TTL_MINUTES, default 30), and 30 minutes as fractional
-- hours (0.5) fails int coercion: `invalid input syntax for type integer:
-- "0.5"` — every workspace-scoped ask 500'd. Minutes-based replacement;
-- 24h = 1440.
drop function if exists get_cached_response(text, int);

create function get_cached_response(p_hash text, p_ttl_minutes int default 1440)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select response from response_cache
  where question_hash = p_hash
    and created_at > now() - (p_ttl_minutes || ' minutes')::interval;
$$;

-- Same posture as migration 5: server-side only via service_role.
revoke execute on function get_cached_response(text, int) from anon, authenticated;
