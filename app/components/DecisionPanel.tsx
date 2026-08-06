"use client";

import { useState } from "react";
import type { AutomationDecision, AuditEvent } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge as BadgeComponent } from "@/components/ui/badge";

type Badge = "success" | "warning" | "critical";

const OUTCOME_COPY: Record<AutomationDecision["outcome"], { badge: Badge; label: string; heading: string }> = {
  approved: { badge: "success", label: "Approved with citations", heading: "Ready to send" },
  human_review: { badge: "warning", label: "Escalated to operations", heading: "Needs a person" },
  blocked: { badge: "critical", label: "Stopped before retrieval", heading: "Blocked" },
};

const BOX_BG: Record<Badge, string> = {
  success: "var(--primary-soft)",
  warning: "#fdf6e3",
  critical: "#fdecf0",
};
const BOX_BORDER: Record<Badge, string> = {
  success: "#c7d3fb",
  warning: "#f3dfa0",
  critical: "#f8c2d2",
};

function renderDraftWithCitations(text: string, citationIds: string[]): React.ReactNode {
  if (citationIds.length === 0) return <p style={{ margin: 0 }}>{text}</p>;
  return (
    <p style={{ margin: 0 }}>
      {text}{" "}
      {citationIds.map((id) => (
        <span
          key={id}
          className="text-caption"
          style={{ display: "inline-block", color: "var(--primary-deep)", background: "var(--primary-soft)", padding: "2px 6px", borderRadius: "var(--r-sm)", marginLeft: "4px" }}
        >
          {id}
        </span>
      ))}
    </p>
  );
}

export function DecisionPanel({
  decision,
  onActionTaken,
}: {
  decision: AutomationDecision;
  onActionTaken: (event: AuditEvent) => void;
}) {
  const [actionTaken, setActionTaken] = useState<"sent" | "escalated" | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const copy = OUTCOME_COPY[decision.outcome];

  async function takeAction(action: "sent" | "escalated") {
    if (actionLoading || actionTaken) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/tickets/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId: decision.ticketId, action }),
      });
      if (res.ok) {
        const { event } = (await res.json()) as { event: AuditEvent };
        onActionTaken(event);
        setActionTaken(action);
      }
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <>
      <div style={{ padding: "16px", borderRadius: "var(--r-lg)", background: BOX_BG[copy.badge], border: `1px solid ${BOX_BORDER[copy.badge]}` }}>
        <BadgeComponent variant={copy.badge}>{copy.label}</BadgeComponent>
        <div className="text-heading-sm" style={{ marginTop: "10px", fontSize: "20px" }}>
          {copy.heading}
        </div>
        <p className="text-body-sm" style={{ color: "var(--charcoal)", marginTop: "8px" }}>
          {decision.reason}
        </p>
      </div>

      <div className="text-caption" style={{ color: "var(--steel)", textTransform: "uppercase", letterSpacing: "0.06em", margin: "20px 0 8px" }}>
        Proposed response
      </div>
      <div style={{ padding: "16px", border: "1px solid var(--hairline-soft)", borderRadius: "var(--r-lg)", background: "var(--surface-soft)" }}>
        {decision.proposedResponse ? (
          <div className="text-body-sm" style={{ color: "var(--ink)" }}>
            {renderDraftWithCitations(decision.proposedResponse, decision.citations.map((c) => c.documentId))}
          </div>
        ) : (
          <p className="text-body-sm" style={{ color: "var(--stone)", margin: 0 }}>
            {decision.outcome === "blocked"
              ? "This request was blocked before an answer was generated. No policy documents were retrieved and no protected instructions were exposed."
              : "No response could be grounded in the retrieved passages."}
          </p>
        )}
      </div>

      <div style={{ marginTop: "16px" }}>
        {decision.outcome === "approved" && (
          <span className="btn-glow-wrap" style={{ display: "block" }}>
            <Button
              type="button"
              variant="ink"
              className="rounded-full w-full h-auto py-[14px] text-[14px] font-semibold"
              disabled={actionLoading || actionTaken !== null}
              onClick={() => takeAction("sent")}
            >
              {actionTaken === "sent" ? "Sent ✓" : actionLoading ? "Sending…" : "Send approved response"}
            </Button>
          </span>
        )}
        {decision.outcome === "human_review" && (
          <span className="btn-glow-wrap" style={{ display: "block" }}>
            <Button
              type="button"
              variant="ink"
              className="rounded-full w-full h-auto py-[14px] text-[14px] font-semibold"
              disabled={actionLoading || actionTaken !== null}
              onClick={() => takeAction("escalated")}
            >
              {actionTaken === "escalated" ? "Escalated ✓" : actionLoading ? "Escalating…" : "Escalate to operations"}
            </Button>
          </span>
        )}
        {decision.outcome === "blocked" && (
          <Button type="button" variant="ink-outline" className="w-full" disabled>
            No action available
          </Button>
        )}
      </div>
      <p className="text-caption" style={{ color: "var(--stone)", textAlign: "center", marginTop: "10px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
        {decision.outcome === "blocked" ? "Nothing was sent — the request never reached generation" : "Simulated action — no message will be sent"}
      </p>
    </>
  );
}
