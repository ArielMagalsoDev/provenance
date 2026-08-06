// Embeddings via Supabase's built-in gte-small model (384 dims), wrapped by the
// `embed` Edge Function deployed in supabase/functions/embed. No OpenAI key — see
// CLAUDE.md "Stack (fixed — amended)" for why.
//
// One text per edge-function call, fanned out here with bounded concurrency — not
// server-side batching. An earlier version sent a batch and looped model.run() inside
// one invocation; that crashed with WORKER_RESOURCE_LIMIT once cumulative content in
// the loop got large enough (looked count-based at first, but was really memory
// pressure accumulating across repeated model calls in one Deno isolate). See the note
// in supabase/functions/embed/index.ts.
import { getSupabaseAdmin } from "./supabaseAdmin";

const CONCURRENCY = 5;

export type EmbedError = { ok: false; error: string; stage: "embed" };

async function embedOne(text: string): Promise<number[]> {
  const { data, error } = await getSupabaseAdmin().functions.invoke<{ embedding: number[] }>(
    "embed",
    { body: { text } }
  );
  if (error) {
    throw new Error(`embed function error: ${error.message}`);
  }
  if (!data?.embedding) {
    throw new Error("embed function returned a malformed response");
  }
  return data.embedding;
}

/** Embeds any number of texts, fanning out with bounded concurrency. */
export async function embedTexts(texts: string[]): Promise<number[][]> {
  const results: number[][] = new Array(texts.length);
  let next = 0;

  async function worker() {
    while (next < texts.length) {
      const i = next++;
      results[i] = await embedOne(texts[i]);
    }
  }

  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, texts.length) }, worker));
  return results;
}

export async function embedQuery(text: string): Promise<number[]> {
  return embedOne(text);
}
