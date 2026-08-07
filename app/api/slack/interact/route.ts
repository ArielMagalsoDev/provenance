// Slack's interactivity callback — a human clicking Approve/Reject on a
// human_review ticket resolves it for real, the same effect as acting in
// /inbox. See docs/PLAN-slack-integration.md.
//
// The raw body must be read BEFORE any parsing: verifySlackSignature needs
// the exact bytes Slack signed, and re-serializing a parsed body would not
// byte-for-byte match. Slack retries slow/failed deliveries — resolveTicket's
// existing "status !== open -> already_resolved" guard makes a retry-
// triggered double-call a safe no-op, not a double-resolve, so there's no
// need for extra idempotency handling here.
import { NextResponse } from "next/server";
import { verifySlackSignature } from "@/lib/slack";
import { resolveTicket } from "@/lib/inbox";

export const maxDuration = 60; // same reasoning as /api/ask — resolveTicket embeds + writes + may call back to Slack

type SlackInteractionPayload = {
  type?: string;
  actions?: { action_id?: string; value?: string }[];
  user?: { username?: string; name?: string };
};

export async function POST(req: Request) {
  const rawBody = await req.text();
  const timestamp = req.headers.get("x-slack-request-timestamp") ?? "";
  const signature = req.headers.get("x-slack-signature") ?? "";

  if (!verifySlackSignature(rawBody, timestamp, signature)) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  }

  // Slack posts application/x-www-form-urlencoded with the real payload as
  // one JSON-encoded "payload" field, not a JSON body.
  const params = new URLSearchParams(rawBody);
  const payloadRaw = params.get("payload");
  if (!payloadRaw) return NextResponse.json({}, { status: 200 }); // signature was valid, nothing to act on

  let payload: SlackInteractionPayload;
  try {
    payload = JSON.parse(payloadRaw);
  } catch {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const action = payload.actions?.[0];
  const resolveAction =
    action?.action_id === "approve_ticket" ? "approve" : action?.action_id === "reject_ticket" ? "dismiss" : null;
  // Anything else (Slack's own Request URL verification ping, an unrecognized
  // action, a malformed payload) — ack with 200 and do nothing. Only a bad
  // signature is treated as an actual error.
  if (payload.type !== "block_actions" || !resolveAction || !action?.value) {
    return NextResponse.json({}, { status: 200 });
  }

  const ticketId = action.value;
  const slackUser = payload.user?.username ?? payload.user?.name;

  try {
    const result = await resolveTicket(ticketId, resolveAction, undefined, null, "slack", slackUser);
    if (!result.ok) {
      // Not a client error to Slack — the button click itself was valid and
      // signed; the ticket was just already handled or gone. Logged for our
      // own visibility, not surfaced back to Slack as a failure.
      console.error(`[/api/slack/interact] resolveTicket returned "${result.error}" for ticket ${ticketId}`);
    }
  } catch (err) {
    console.error("[/api/slack/interact] unexpected error:", err);
  }

  return NextResponse.json({}, { status: 200 });
}
