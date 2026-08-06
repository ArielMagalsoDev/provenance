// Meridian Assist ticket endpoint. Same safety-critical ordering as /api/ask (via
// lib/pipeline.ts), wrapped as an AutomationDecision with a persisted audit trail.
import { NextResponse } from "next/server";
import { runTicket } from "@/lib/tickets";
import { getClientIp, hashIp } from "@/lib/limit";
import type { SupportTicket } from "@/lib/types";

export const maxDuration = 60; // same reasoning as /api/ask

const VALID_CHANNELS: SupportTicket["channel"][] = ["email", "chat", "helpdesk"];

export async function POST(req: Request) {
  let body: {
    channel?: unknown;
    customerName?: unknown;
    customerContext?: unknown;
    message?: unknown;
    category?: unknown;
    turnstileToken?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json_body" }, { status: 400 });
  }

  const message = typeof body.message === "string" ? body.message.trim() : "";
  const channel = VALID_CHANNELS.includes(body.channel as SupportTicket["channel"])
    ? (body.channel as SupportTicket["channel"])
    : "chat";
  const customerName = typeof body.customerName === "string" && body.customerName.trim() ? body.customerName.trim() : "Anonymous visitor";
  const customerContext = typeof body.customerContext === "string" ? body.customerContext : undefined;
  const category = typeof body.category === "string" && body.category.trim() ? body.category.trim() : "General inquiry";
  const turnstileToken = typeof body.turnstileToken === "string" ? body.turnstileToken : "";

  if (!message) {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }
  if (message.length > 1000) {
    return NextResponse.json({ error: "message too long (max 1000 characters)" }, { status: 400 });
  }

  const ip = getClientIp(req.headers);

  try {
    const decision = await runTicket(
      { channel, customerName, customerContext, message, category },
      hashIp(ip),
      turnstileToken,
      ip
    );
    return NextResponse.json(decision);
  } catch (err) {
    console.error("[/api/tickets] unexpected error:", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
