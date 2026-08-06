// Rate limiting, response cache, and the global spend cap — all Postgres-backed (see
// CLAUDE.md "Stack (fixed — amended)" for why this replaced Upstash Redis), plus
// Turnstile verification. Every model call's max_tokens is capped in generate.ts /
// ground.ts / screen.ts, not here.
//
// No `import "server-only"` guard — see the note in lib/supabaseAdmin.ts.
import { createHash } from "node:crypto";
import { getSupabaseAdmin } from "./supabaseAdmin";
import type { AskResponse } from "./types";

const RATE_LIMIT_PER_HOUR = Number(process.env.RATE_LIMIT_PER_HOUR ?? 10);
const DAILY_SPEND_CAP_USD = Number(process.env.DAILY_SPEND_CAP_USD ?? 5);
const CACHE_TTL_HOURS = 24;

// Flat per-query cost estimates, not metered exact token usage — a documented
// simplification (see README limitations). Split into two charges so a request that
// gets blocked at screening only ever books the screening call's real cost.
export const ESTIMATED_COST_SCREEN_USD = 0.0005;
export const ESTIMATED_COST_PIPELINE_USD = 0.004;

export function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex");
}

export function getClientIp(headers: Headers): string {
  // Vercel sets x-forwarded-for; fall back to a constant so local dev doesn't crash.
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headers.get("x-real-ip") ?? "unknown";
}

export function normalizeQuestion(question: string): string {
  return question.trim().toLowerCase().replace(/\s+/g, " ");
}

export function hashQuestion(question: string): string {
  return createHash("sha256").update(normalizeQuestion(question)).digest("hex");
}

/** Atomic, race-safe: serializes concurrent callers with the same IP via an advisory lock. */
export async function checkRateLimit(ipHash: string): Promise<boolean> {
  const { data, error } = await getSupabaseAdmin().rpc("check_rate_limit", {
    p_key: ipHash,
    p_limit: RATE_LIMIT_PER_HOUR,
    p_window_minutes: 60,
  });
  if (error) throw new Error(`checkRateLimit failed: ${error.message}`);
  return Boolean(data);
}

export async function getCachedResponse(questionHash: string): Promise<AskResponse | null> {
  const { data, error } = await getSupabaseAdmin().rpc("get_cached_response", {
    p_hash: questionHash,
    p_ttl_hours: CACHE_TTL_HOURS,
  });
  if (error) throw new Error(`getCachedResponse failed: ${error.message}`);
  return (data as AskResponse | null) ?? null;
}

export async function setCachedResponse(questionHash: string, response: AskResponse): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from("response_cache")
    .upsert({ question_hash: questionHash, response, created_at: new Date().toISOString() }, { onConflict: "question_hash" });
  if (error) throw new Error(`setCachedResponse failed: ${error.message}`);
}

/** Atomic charge (or refund, with a negative amount). Returns the day's new total. */
export async function adjustSpend(amountUsd: number): Promise<number> {
  const { data, error } = await getSupabaseAdmin().rpc("increment_spend", { p_amount: amountUsd });
  if (error) throw new Error(`adjustSpend failed: ${error.message}`);
  return Number(data);
}

export async function getTodaySpend(): Promise<number> {
  const { data, error } = await getSupabaseAdmin().rpc("get_today_spend");
  if (error) throw new Error(`getTodaySpend failed: ${error.message}`);
  return Number(data ?? 0);
}

export function isSpendCapHit(totalAfterCharge: number): boolean {
  return totalAfterCharge > DAILY_SPEND_CAP_USD;
}

export async function verifyTurnstile(token: string, remoteIp: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    throw new Error("Missing TURNSTILE_SECRET_KEY. Copy .env.example to .env.local and fill it in.");
  }
  if (!token) return false;

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token, remoteip: remoteIp }),
    });
    const data = (await res.json()) as { success: boolean };
    return Boolean(data.success);
  } catch {
    // Fail closed: a Turnstile outage blocks requests rather than silently admitting bots.
    return false;
  }
}
