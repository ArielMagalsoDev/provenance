// Records a simulated downstream action (send/escalate) as an audit event. This is
// deliberately the only thing it does — replying to the customer stays simulated even
// now that a real connector exists (see lib/slack.ts for the operator-notification
// side). It never touches the model pipeline, so it costs nothing and isn't
// rate-limited or spend-capped.
import { NextResponse } from "next/server";
import { recordSimulatedAction } from "@/lib/tickets";

export async function POST(req: Request) {
  let body: { ticketId?: unknown; action?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json_body" }, { status: 400 });
  }

  const ticketId = typeof body.ticketId === "string" ? body.ticketId : "";
  const action = body.action === "sent" || body.action === "escalated" ? body.action : null;

  if (!ticketId || !action) {
    return NextResponse.json({ error: "ticketId and a valid action are required" }, { status: 400 });
  }

  try {
    const event = await recordSimulatedAction(ticketId, action);
    return NextResponse.json({ event });
  } catch (err) {
    console.error("[/api/tickets/action] unexpected error:", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
