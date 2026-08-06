-- Security advisor caught: SECURITY DEFINER functions default to callable by anon/
-- authenticated via PostgREST RPC (e.g. POST /rest/v1/rpc/increment_spend with the
-- public anon key), which would let anyone forge spend/rate-limit state directly,
-- bypassing the Next.js server entirely. These functions are only ever meant to be
-- called from server-side code using the service_role key, which bypasses grants
-- regardless — so revoking from anon/authenticated is free and closes the hole.
revoke execute on function check_rate_limit(text, int, int) from anon, authenticated;
revoke execute on function get_cached_response(text, int) from anon, authenticated;
revoke execute on function increment_spend(numeric) from anon, authenticated;
revoke execute on function get_today_spend() from anon, authenticated;
