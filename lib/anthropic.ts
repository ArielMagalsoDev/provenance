// Single shared Anthropic client. Every model call in this project uses Haiku — see
// CLAUDE.md "Stack (fixed — amended)" for why (this is a cost-first portfolio demo,
// not a quality benchmark).
//
// No `import "server-only"` guard — see the note in lib/supabaseAdmin.ts. This module
// is also imported by evals/run.ts under plain Node.
//
// Lazily constructed — see the same note in lib/supabaseAdmin.ts on why (avoids
// throwing at `next build` time on a machine without .env populated).
import Anthropic from "@anthropic-ai/sdk";

export const HAIKU_MODEL = "claude-haiku-4-5-20251001";

let client: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  if (client) return client;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("Missing ANTHROPIC_API_KEY. Copy .env.example to .env.local and fill it in.");
  }

  client = new Anthropic({ apiKey });
  return client;
}

/** Strips ```json ... ``` or ``` ... ``` code fences a model sometimes wraps JSON in. */
export function stripCodeFences(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  return fenced ? fenced[1].trim() : trimmed;
}
