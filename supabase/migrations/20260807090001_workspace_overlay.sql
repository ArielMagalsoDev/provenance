-- Session-scoped "workspace" overlay on top of the shared corpus. Two features
-- (Agent Inbox learned corrections, custom-knowledge upload) both write here
-- instead of the shared corpus, which stays read-only — see
-- docs/PLAN-hitl-and-workspaces.md for the full design.
--
-- Isolation is by workspace_id alone (a random UUID held in an httpOnly cookie,
-- minted server-side — see lib/workspace.ts), never by IP: real IPs are shared
-- across unrelated visitors constantly (office/café WiFi, mobile carrier CGNAT),
-- so keying content visibility off IP would leak one visitor's upload to
-- another. IP hash stays scoped to abuse-rate-limiting only, unrelated to this.

alter table passages add column workspace_id uuid null;
alter table passages add column origin text not null default 'corpus'
  check (origin in ('corpus', 'learned', 'uploaded'));

-- Partial index: only overlay rows are ever filtered by workspace_id, the 51
-- shared-corpus rows always take the `workspace_id is null` branch below.
create index passages_workspace_id_idx on passages (workspace_id) where workspace_id is not null;

-- Replaced (not `create or replace`, which can't change the argument list of an
-- existing function without leaving both overloads around): adds workspace
-- filtering and a TTL enforced in the query itself, not by a cleanup job, so an
-- overlay passage stops being retrievable at exactly the TTL mark regardless of
-- whether a sweep has run recently. `p_workspace = null` (the default, i.e. no
-- workspace cookie yet) naturally matches nothing on the second branch — no
-- special-casing needed, `workspace_id = null` is never true in SQL.
drop function if exists match_passages(vector, int);

create function match_passages(
  query_embedding vector(384),
  match_count int,
  p_workspace uuid default null,
  p_include_shared boolean default true,
  p_ttl_minutes int default 30
)
returns table(id text, source_file text, heading text, content text, similarity float, origin text)
language sql
stable
as $$
  select id, source_file, heading, content, 1 - (embedding <=> query_embedding) as similarity, origin
  from passages
  where
    (p_include_shared and workspace_id is null)
    or (workspace_id = p_workspace and created_at > now() - (p_ttl_minutes || ' minutes')::interval)
  order by embedding <=> query_embedding
  limit match_count;
$$;

-- Same posture as every other function in this project: server-side only, via
-- the service_role key, which bypasses grants regardless.
revoke execute on function match_passages(vector, int, uuid, boolean, int) from anon, authenticated;
