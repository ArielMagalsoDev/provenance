-- Exact-scan cosine similarity search (see the "no ivfflat" note on the passages table).
create or replace function match_passages(query_embedding vector(384), match_count int)
returns table(id text, source_file text, heading text, content text, similarity float)
language sql
stable
as $$
  select id, source_file, heading, content, 1 - (embedding <=> query_embedding) as similarity
  from passages
  order by embedding <=> query_embedding
  limit match_count;
$$;

-- Same posture as the other functions: server-side only, via the service_role key.
revoke execute on function match_passages(vector, int) from anon, authenticated;
