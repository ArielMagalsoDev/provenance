// Thin HTTP wrapper over lib/pipeline.ts. The actual rate-limit -> cache
// -> spend-cap -> screen -> retrieve -> generate -> ground ordering lives there, shared
// with /api/tickets (the Provenance ticket-shaped endpoint).
import { NextResponse } from "next/server";
import { runAskPipeline } from "@/lib/pipeline";
import { getClientIp, hashIp } from "@/lib/limit";

export const maxDuration = 60; // pipeline is 3-4 sequential model calls; see CLAUDE.md

export async function POST(req: Request) {
  let body: { question?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json_body" }, { status: 400 });
  }

  const question = typeof body.question === "string" ? body.question.trim() : "";

  if (!question) {
    return NextResponse.json({ error: "question is required" }, { status: 400 });
  }
  if (question.length > 1000) {
    return NextResponse.json({ error: "question too long (max 1000 characters)" }, { status: 400 });
  }

  const ip = getClientIp(req.headers);

  try {
    const response = await runAskPipeline(question, hashIp(ip));
    return NextResponse.json(response);
  } catch (err) {
    // Never let a provider or DB error surface as a raw stack trace.
    console.error("[/api/ask] unexpected error:", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
