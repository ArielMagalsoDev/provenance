create extension if not exists vector;

create table passages (
  id           text primary key,        -- e.g. "refunds-03"
  source_file  text not null,           -- e.g. "refunds.md"
  heading      text,
  content      text not null,
  token_count  int not null,
  embedding    vector(384) not null,    -- gte-small (Supabase built-in), not OpenAI's 1536-dim
  created_at   timestamptz default now()
);

-- No ivfflat index deliberately. At 60-100 rows an ivfflat index (lists=100) is built
-- on effectively no data and hurts recall rather than helping it. Exact scan is both
-- correct and fast at this corpus size. Revisit if the corpus grows past ~5k rows.

alter table passages enable row level security;
-- No policies: only the service_role key (used server-side only) can read/write.
-- Public reads go through /api/corpus, which uses the service role server-side.
