// Wraps Supabase's built-in gte-small embedding model (384 dims, free, runs in the
// Edge Runtime) behind a small HTTP API so both scripts/ingest.ts (local Node) and
// lib/embed.ts (Next.js server-side) can call it without an OpenAI key.
//
// One text per invocation, deliberately. An earlier version accepted a batch and
// looped model.run() inside one invocation; that hit WORKER_RESOURCE_LIMIT (crashed,
// HTTP 546) once cumulative content across the loop got large enough — looked
// count-based at first (10 short texts OK, 8 longer ones crashed) but was really
// memory pressure accumulating across repeated model.run() calls in one Deno isolate.
// One call per invocation sidesteps the accumulation entirely; lib/embed.ts fans out
// with client-side concurrency control instead of server-side looping.
//
// Auth: verify_jwt is on. Callers pass the project anon or service_role key as a
// Bearer token. This function is never called from the browser directly.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const model = new Supabase.ai.Session("gte-small");

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return json({ error: "method_not_allowed" }, 405);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  const text = (body as { text?: unknown })?.text;
  if (typeof text !== "string" || text.length === 0) {
    return json({ error: "text must be a non-empty string" }, 400);
  }

  try {
    const output = await model.run(text, { mean_pool: true, normalize: true });
    return json({ embedding: Array.from(output as Iterable<number>) });
  } catch (err) {
    return json({ error: `embedding_failed: ${String(err)}` }, 500);
  }
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
