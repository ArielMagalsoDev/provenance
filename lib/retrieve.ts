// Cosine similarity top-k retrieval against the passages table via the match_passages
// Postgres function (exact scan — see the "no ivfflat" note in supabase/migrations).
import { getSupabaseAdmin } from "./supabaseAdmin";
import { embedQuery } from "./embed";
import { WORKSPACE_TTL_MINUTES } from "./workspace";
import type { PassageOrigin, RetrievedPassage } from "./types";

const RETRIEVAL_K = Number(process.env.RETRIEVAL_K ?? 4);

type MatchPassagesRow = {
  id: string;
  source_file: string;
  heading: string | null;
  content: string;
  similarity: number;
  origin: PassageOrigin;
};

export type WorkspaceScope = {
  id: string;
  includeShared?: boolean; // false = "my docs only" toggle
};

export async function retrieve(
  question: string,
  k: number = RETRIEVAL_K,
  workspace?: WorkspaceScope
): Promise<{ passages: RetrievedPassage[]; k: number; latencyMs: number }> {
  const start = Date.now();

  const queryEmbedding = await embedQuery(question);

  const { data, error } = await getSupabaseAdmin().rpc("match_passages", {
    query_embedding: queryEmbedding,
    match_count: k,
    p_workspace: workspace?.id ?? null,
    p_include_shared: workspace?.includeShared ?? true,
    p_ttl_minutes: WORKSPACE_TTL_MINUTES,
  });

  if (error) {
    throw new Error(`retrieve: match_passages failed: ${error.message}`);
  }

  // The client isn't generated against a typed schema, so `data` comes back untyped
  // from the library; match_passages' return columns are fixed by the migration.
  const rows = (data ?? []) as MatchPassagesRow[];

  const passages: RetrievedPassage[] = rows.map((row) => ({
    id: row.id,
    sourceFile: row.source_file,
    heading: row.heading,
    content: row.content,
    similarity: row.similarity,
    origin: row.origin,
  }));

  return { passages, k, latencyMs: Date.now() - start };
}
