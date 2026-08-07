// Renders only when a real "notification" audit event exists on the decision
// — i.e. only when a message actually landed in Slack. Slack unconfigured or
// the post failed -> this event never gets appended (see lib/tickets.ts's
// notifySlack) -> this component renders nothing. No fake "would have
// posted" state, ever. See docs/PLAN-slack-ui.md.
//
// Deliberately does not import lib/slack.ts — that module reads server-only
// env vars and uses node:crypto; everything this card needs is already on
// the AutomationDecision the client holds, so a tiny local copy-mapping
// (~15 lines) is simpler and safer than trying to share server code with a
// client component.
import type { AutomationDecision } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

const OUTCOME_LINE: Record<AutomationDecision["outcome"], { icon: string; label: string }> = {
  approved: { icon: "✅", label: "Approved" },
  human_review: { icon: "🟡", label: "Needs review" },
  blocked: { icon: "⛔", label: "Blocked" },
};

function formatSlackTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

export function SlackNotificationCard({ decision }: { decision: AutomationDecision }) {
  const notification = decision.auditEvents.find((e) => e.stage === "notification");
  if (!notification) return null; // no real post happened — render nothing, never a mock of one

  const { outcome, ticket, reason, proposedResponse, citations, groundedness } = decision;
  const line = OUTCOME_LINE[outcome];
  const citationLabels = citations.map((c) => c.documentId).join(", ");

  return (
    <div style={{ padding: "18px 24px", borderTop: "1px solid var(--hairline-soft)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
        <span className="text-caption-bold" style={{ color: "var(--steel)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Posted to Slack · #provenance-ops
        </span>
        <Badge variant="success">Real, not simulated</Badge>
      </div>

      <div style={{ display: "flex", gap: "12px", padding: "14px 16px", border: "1px solid var(--hairline-soft)", borderRadius: "var(--r-lg)", background: "var(--surface-soft)" }}>
        <div className="brand-mark" aria-hidden="true" style={{ width: "36px", height: "36px", flexShrink: 0 }} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "4px" }}>
            <span className="text-body-sm-bold">Provenance</span>
            <span
              className="text-caption"
              style={{ color: "var(--steel)", background: "var(--surface-elevated, #fff)", border: "1px solid var(--hairline-soft)", borderRadius: "3px", padding: "0 4px", fontSize: "10px" }}
            >
              APP
            </span>
            <span className="text-caption" style={{ color: "var(--stone)" }}>
              {formatSlackTime(notification.timestamp)}
            </span>
          </div>

          <p className="text-body-sm" style={{ margin: "0 0 6px" }}>
            {line.icon} <strong>{line.label}</strong> — {ticket.category}
          </p>
          <p className="text-body-sm" style={{ margin: "0 0 6px", color: "var(--charcoal)" }}>
            <strong>From:</strong> {ticket.customerName} ({ticket.channel})
            <br />
            <strong>Question:</strong> {ticket.message}
          </p>

          {outcome === "approved" && (
            <>
              <p className="text-body-sm" style={{ margin: "0 0 6px", color: "var(--charcoal)" }}>
                <strong>Answer sent:</strong> {proposedResponse}
              </p>
              <p className="text-caption" style={{ margin: 0, color: "var(--stone)" }}>
                Citations: {citationLabels || "none"} · Groundedness: {groundedness !== null ? groundedness.toFixed(2) : "n/a"} · Reply itself is
                simulated for this demo — this notification is real.
              </p>
            </>
          )}

          {outcome === "blocked" && (
            <p className="text-caption" style={{ margin: 0, color: "var(--stone)" }}>
              {reason}
            </p>
          )}

          {outcome === "human_review" && (
            <>
              <p className="text-body-sm" style={{ margin: "0 0 10px", color: "var(--charcoal)" }}>
                <strong>Why it wasn't automatic:</strong> {reason}
                {proposedResponse && (
                  <>
                    <br />
                    <strong>Draft (unverified):</strong> {proposedResponse}
                  </>
                )}
              </p>
              <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                {proposedResponse && (
                  <span
                    className="text-caption-bold"
                    style={{ padding: "6px 14px", borderRadius: "999px", background: "var(--primary)", color: "#fff" }}
                  >
                    Approve
                  </span>
                )}
                <span className="text-caption-bold" style={{ padding: "6px 14px", borderRadius: "999px", background: "#f8c2d2", color: "#7a1230" }}>
                  Reject
                </span>
                <span className="text-caption" style={{ color: "var(--stone)" }}>
                  Live buttons in the actual channel — an operator can resolve this ticket from Slack, and this
                  message updates in place.
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
