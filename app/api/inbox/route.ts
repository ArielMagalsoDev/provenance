// Agent Inbox queue. Read-only, no rate limit/Turnstile needed — listing
// tickets touches no model, no spend, and the workspace scoping (see
// lib/workspace.ts) already limits what any one caller can see.
import { NextResponse } from "next/server";
import { listOpenTickets } from "@/lib/inbox";
import { getWorkspaceId } from "@/lib/workspace";

export async function GET(req: Request) {
  try {
    const tickets = await listOpenTickets(getWorkspaceId(req));
    return NextResponse.json({ tickets });
  } catch (err) {
    console.error("[/api/inbox] unexpected error:", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
