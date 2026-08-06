// Single shared server-side Supabase client, using the service_role key. Every table
// and RPC function in this project has RLS enabled with no anon/authenticated grants
// (see supabase/migrations) — the service role is the only way in, and this module is
// the only place that key is read. Never import this from a "use client" component.
//
// No `import "server-only"` guard here: this module is also imported by
// scripts/ingest.ts and evals/run.ts, which run under plain Node via tsx, not inside
// Next.js's bundler. server-only's guard resolves via a "react-server" export
// condition that only Next.js's own compiler sets — under plain Node it throws
// unconditionally, which would break both scripts. The actual boundary this file
// depends on — never importing it from a "use client" component — is enforced by
// hand: the UI only ever calls /api/ask and /api/corpus.
//
// Lazily constructed rather than built at module scope: `next build` imports route
// handler modules to collect their metadata, which would otherwise throw on any
// machine (CI, a fresh clone) that hasn't populated .env yet.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (client) return client;

  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Copy .env.example to .env.local and fill them in."
    );
  }

  client = createClient(url, serviceRoleKey, { auth: { persistSession: false } });
  return client;
}
