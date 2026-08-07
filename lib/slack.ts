// Real downstream connector — the first one. Until now "send/escalate" was
// explicitly simulated (see recordSimulatedAction in lib/tickets.ts). This
// posts a real Slack message per ticket outcome, and human_review tickets get
// clickable Approve/Reject buttons that resolve the ticket for real via
// /api/slack/interact — the same effect as an operator acting in /inbox.
// See docs/PLAN-slack-integration.md for the full design.
//
// No `import "server-only"` guard — see the note in lib/supabaseAdmin.ts.
//
// Fire-and-forget by design: Slack is a notification, not a gate. A missing
// env var, an outage, or a malformed response must never affect the pipeline
// or the ticket's stored outcome — every exported posting/update function
// swallows its own errors and returns null/void rather than throwing.
import { createHmac, timingSafeEqual } from "node:crypto";
import type { AutomationDecision } from "./types";

const SLACK_API = "https://slack.com/api";
const SIGNATURE_WINDOW_SECONDS = 60 * 5; // reject replays older than 5 minutes, per Slack's own guidance
// The ticket response awaits the post call so the pipeline panel can show the
// notification immediately (non-negotiable #1) — this hard ceiling exists so
// a hung Slack API can never stall the ticket response indefinitely.
const SLACK_CALL_TIMEOUT_MS = 5000;

function env() {
  return {
    botToken: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    channelId: process.env.SLACK_CHANNEL_ID,
  };
}

export function isSlackConfigured(): boolean {
  const { botToken, signingSecret, channelId } = env();
  return Boolean(botToken && signingSecret && channelId);
}

// Slack mrkdwn only needs these three escaped (per Slack's formatting docs) —
// ticket message/answer text is visitor- or operator-supplied, never trust it verbatim.
function escapeMrkdwn(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max - 1) + "…" : text;
}

type SlackBlock = Record<string, unknown>;

function section(text: string): SlackBlock {
  return { type: "section", text: { type: "mrkdwn", text: truncate(text, 3000) } };
}

function context(text: string): SlackBlock {
  return { type: "context", elements: [{ type: "mrkdwn", text: truncate(text, 3000) }] };
}

function outcomeHeader(outcome: TicketSlackSummary["outcome"]): string {
  if (outcome === "approved") return ":white_check_mark: *Approved*";
  if (outcome === "human_review") return ":large_yellow_circle: *Needs review*";
  return ":no_entry: *Blocked*";
}

/** Minimal shape both call sites can build: postTicketNotification has a
 *  fresh AutomationDecision, updateTicketMessage (called from resolveTicket
 *  or the interact route) only has a DB ticket row — same fields, different
 *  casing/source. Keeping this separate from AutomationDecision means the
 *  update path never needs to reconstruct a fake AskResponse just to satisfy
 *  a type it doesn't otherwise need. */
export type TicketSlackSummary = {
  ticketId: string;
  category: string;
  customerName: string;
  channel: string;
  message: string;
  outcome: "approved" | "human_review" | "blocked";
  reason: string;
  proposedResponse: string | null;
  citationIds: string[];
  groundedness: number | null;
};

export function summaryFromDecision(decision: AutomationDecision): TicketSlackSummary {
  return {
    ticketId: decision.ticketId,
    category: decision.ticket.category,
    customerName: decision.ticket.customerName,
    channel: decision.ticket.channel,
    message: decision.ticket.message,
    outcome: decision.outcome,
    reason: decision.reason,
    proposedResponse: decision.proposedResponse,
    citationIds: decision.citations.map((c) => c.documentId),
    groundedness: decision.groundedness,
  };
}

/** The info portion only — no interactive elements. Shared by the initial
 *  post (human_review appends actions on top) and the post-resolution update
 *  (appends a resolved status line instead), so a ticket's context never
 *  disappears from the channel once it's acted on. */
function buildInfoBlocks(t: TicketSlackSummary): SlackBlock[] {
  const blocks: SlackBlock[] = [
    section(`${outcomeHeader(t.outcome)} — ${escapeMrkdwn(t.category)}`),
    section(`*From:* ${escapeMrkdwn(t.customerName)} (${t.channel})\n*Question:* ${escapeMrkdwn(truncate(t.message, 500))}`),
  ];

  if (t.outcome === "approved") {
    blocks.push(section(`*Answer sent:*\n${escapeMrkdwn(truncate(t.proposedResponse ?? "", 1500))}`));
    const citationLabels = t.citationIds.join(", ") || "none";
    blocks.push(
      context(
        `Citations: ${citationLabels} • Groundedness: ${t.groundedness !== null ? t.groundedness.toFixed(2) : "n/a"} • ` +
          `Reply itself is simulated for this demo — this notification is real.`
      )
    );
    return blocks;
  }

  if (t.outcome === "blocked") {
    blocks.push(context(escapeMrkdwn(t.reason)));
    return blocks;
  }

  // human_review
  blocks.push(section(`*Why it wasn't automatic:*\n${escapeMrkdwn(truncate(t.reason, 800))}`));
  if (t.proposedResponse) {
    blocks.push(section(`*Draft (unverified — do not send as-is):*\n${escapeMrkdwn(truncate(t.proposedResponse, 1000))}`));
  }
  return blocks;
}

function buildActionsBlock(ticketId: string, hasDraft: boolean): SlackBlock {
  const elements: SlackBlock[] = [];
  if (hasDraft) {
    elements.push({
      type: "button",
      text: { type: "plain_text", text: "Approve" },
      style: "primary",
      action_id: "approve_ticket",
      value: ticketId,
    });
  }
  elements.push({
    type: "button",
    text: { type: "plain_text", text: "Reject" },
    style: "danger",
    action_id: "reject_ticket",
    value: ticketId,
  });
  return { type: "actions", elements };
}

async function callSlackApi(method: string, botToken: string, body: unknown): Promise<{ ok: boolean; [k: string]: unknown }> {
  const res = await fetch(`${SLACK_API}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8", Authorization: `Bearer ${botToken}` },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(SLACK_CALL_TIMEOUT_MS),
  });
  return (await res.json()) as { ok: boolean; [k: string]: unknown };
}

export type SlackPostResult = { channel: string; ts: string };

/** Posts a ticket's outcome to the configured channel. Returns null (never
 *  throws) if Slack isn't configured, or if the post fails for any reason —
 *  callers treat this as "no notification happened," not an error. */
export async function postTicketNotification(decision: AutomationDecision): Promise<SlackPostResult | null> {
  const { botToken, channelId } = env();
  if (!isSlackConfigured() || !botToken || !channelId) return null;

  const summary = summaryFromDecision(decision);
  const blocks = buildInfoBlocks(summary);
  if (summary.outcome === "human_review") {
    blocks.push(buildActionsBlock(summary.ticketId, Boolean(summary.proposedResponse)));
  }

  try {
    const data = await callSlackApi("chat.postMessage", botToken, {
      channel: channelId,
      text: `${summary.outcome} — ${summary.category}`, // fallback for notifications/screen readers
      blocks,
    });
    if (!data.ok || typeof data.ts !== "string" || typeof data.channel !== "string") {
      console.error("[lib/slack] postTicketNotification failed:", data.error ?? "unknown error");
      return null;
    }
    return { channel: data.channel, ts: data.ts };
  } catch (err) {
    console.error("[lib/slack] postTicketNotification threw:", err);
    return null;
  }
}

export type SlackResolution = { action: "approved" | "dismissed"; by: "inbox" | "slack"; slackUser?: string };

/** Updates a previously-posted message in place after resolution — from
 *  either side (Slack button or the /inbox UI) — replacing the interactive
 *  buttons with a resolved status line while keeping the original
 *  question/answer/reason context visible, so the channel stays a truthful,
 *  non-duplicated audit trail instead of losing context on resolve. */
export async function updateTicketMessage(
  channel: string,
  ts: string,
  ticket: TicketSlackSummary,
  resolution: SlackResolution
): Promise<void> {
  const { botToken } = env();
  if (!isSlackConfigured() || !botToken) return;

  const verb = resolution.action === "approved" ? "Approved" : "Rejected";
  const via = resolution.by === "slack" ? `by ${resolution.slackUser ?? "someone"} in Slack` : "via the Agent Inbox";
  const blocks = [...buildInfoBlocks(ticket), context(`:white_check_mark: ${verb} ${via}.`)];

  try {
    const data = await callSlackApi("chat.update", botToken, { channel, ts, text: `${verb} ${via}`, blocks });
    if (!data.ok) console.error("[lib/slack] updateTicketMessage failed:", data.error ?? "unknown error");
  } catch (err) {
    console.error("[lib/slack] updateTicketMessage threw:", err);
  }
}

/** Slack's signature scheme: HMAC-SHA256 of "v0:{timestamp}:{rawBody}" using
 *  the signing secret, compared against the x-slack-signature header. Must
 *  run against the RAW request body — parsing first and re-serializing would
 *  not byte-for-byte match what Slack signed. Timestamp window guards against
 *  replaying a captured request. */
export function verifySlackSignature(rawBody: string, timestamp: string, signature: string): boolean {
  const { signingSecret } = env();
  if (!signingSecret || !timestamp || !signature) return false;

  const timestampNum = Number(timestamp);
  if (!Number.isFinite(timestampNum)) return false;
  if (Math.abs(Date.now() / 1000 - timestampNum) > SIGNATURE_WINDOW_SECONDS) return false;

  const base = `v0:${timestamp}:${rawBody}`;
  const expected = `v0=${createHmac("sha256", signingSecret).update(base).digest("hex")}`;

  const expectedBuf = Buffer.from(expected, "utf8");
  const actualBuf = Buffer.from(signature, "utf8");
  if (expectedBuf.length !== actualBuf.length) return false; // timingSafeEqual requires equal lengths
  return timingSafeEqual(expectedBuf, actualBuf);
}
