"use client";

import { useState } from "react";
import { GUIDED_SCENARIOS, type GuidedScenario } from "@/lib/scenarios";
import type { AutomationDecision, AuditEvent, SupportTicket } from "@/lib/types";
import { EvidenceSteps } from "./EvidenceSteps";
import { DecisionPanel } from "./DecisionPanel";
import { SlackNotificationCard } from "./SlackNotificationCard";
import { TurnstileWidget } from "./TurnstileWidget";
import { WorkspaceUpload } from "./WorkspaceUpload";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Draft = {
  channel: SupportTicket["channel"];
  customerName: string;
  customerContext: string;
  category: string;
  message: string;
};

const CHANNEL_LABEL: Record<SupportTicket["channel"], string> = { email: "Email", chat: "Chat", helpdesk: "Helpdesk" };

const RISK_FROM_OUTCOME: Record<AutomationDecision["outcome"], string> = {
  approved: "Normal",
  human_review: "Sensitive",
  blocked: "High",
};

const BADGE_FROM_OUTCOME: Record<AutomationDecision["outcome"], "success" | "warning" | "critical"> = {
  approved: "success",
  human_review: "warning",
  blocked: "critical",
};

const STATUS_LABEL: Record<AutomationDecision["outcome"], string> = {
  approved: "Eligible for automatic reply",
  human_review: "Human review required",
  blocked: "Unsafe instruction blocked",
};

const EMPTY_DRAFT: Draft = { channel: "chat", customerName: "", customerContext: "", category: "General inquiry", message: "" };

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return parts.length === 1 ? parts[0].slice(0, 2).toUpperCase() : (parts[0][0] + parts[1][0]).toUpperCase();
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  } catch {
    return iso;
  }
}

const AUDIT_LABEL: Record<AuditEvent["stage"], string> = {
  intake: "Request received",
  screening: "Request screened",
  retrieval: "Policies retrieved",
  generation: "Draft generated",
  verification: "Claims verified",
  routing: "Decision recorded",
  action: "Action taken",
  notification: "Operator notified",
};

const metaRow: React.CSSProperties = { display: "flex", justifyContent: "space-between", padding: "10px 0", borderTop: "1px solid var(--hairline-soft)" };

export function TicketWorkflow() {
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [activeScenario, setActiveScenario] = useState<GuidedScenario | null>(null);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [decision, setDecision] = useState<AutomationDecision | null>(null);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [workspaceScope, setWorkspaceScope] = useState<{ active: boolean; includeShared: boolean } | null>(null);

  async function submit(payload: Draft) {
    if (!payload.message.trim() || loading) return;
    setLoading(true);
    setError(null);
    setDecision(null);
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, turnstileToken: token, includeShared: workspaceScope?.includeShared ?? true }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body?.error === "internal_error" ? "Something went wrong. Please try again." : body?.error ?? "Request failed.");
        return;
      }
      const data: AutomationDecision = await res.json();
      setDecision(data);
      setAuditEvents(data.auditEvents);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function runScenario(scenario: GuidedScenario) {
    setActiveScenario(scenario);
    const payload: Draft = {
      channel: scenario.channel,
      customerName: scenario.customerName,
      customerContext: scenario.customerContext ?? "",
      category: scenario.category,
      message: scenario.question,
    };
    setDraft(payload);
    void submit(payload);
  }

  function runCustom(e: React.FormEvent) {
    e.preventDefault();
    setActiveScenario(null);
    void submit(draft);
  }

  const badge = decision ? BADGE_FROM_OUTCOME[decision.outcome] : "success";
  const ticket = decision?.ticket;

  return (
    <section style={{ paddingTop: "48px" }}>
      <div className="shell">
        <span className="section-label" style={{ marginBottom: "14px" }}>
          <i className="dot" aria-hidden="true" />
          Guided demo
        </span>
        <h1 className="text-display-lg">Support inbox</h1>
        <p className="text-body-md" style={{ color: "var(--steel)", marginTop: "10px", maxWidth: "640px" }}>
          Fictional support inbox for Meridian Nine. Choose a ticket, or write your own — the pipeline below runs
          live; only the send/escalate action is simulated.
        </p>

        <div style={{ marginTop: "28px" }}>
          <WorkspaceUpload token={token} onStatusChange={setWorkspaceScope} />
        </div>

        <div className="grid-3">
          {GUIDED_SCENARIOS.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => runScenario(s)}
              disabled={loading}
              className={`radio-option${activeScenario?.id === s.id ? " selected" : ""}`}
            >
              <div className="text-body-sm-bold">
                {String(i + 1).padStart(2, "0")} &nbsp; {s.label}
              </div>
              <p className="text-caption" style={{ color: "var(--steel)", marginTop: "6px" }}>
                {s.question}
              </p>
            </button>
          ))}
        </div>

        <form onSubmit={runCustom} style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "16px", alignItems: "center" }}>
          <Select value={draft.channel} onValueChange={(v) => setDraft((d) => ({ ...d, channel: v as SupportTicket["channel"] }))}>
            <SelectTrigger className="px-3 rounded-[var(--r-md)] text-[15px]" style={{ width: "110px", height: "44px" }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="chat">Chat</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="helpdesk">Helpdesk</SelectItem>
            </SelectContent>
          </Select>
          <input
            type="text"
            value={draft.customerName}
            onChange={(e) => setDraft((d) => ({ ...d, customerName: e.target.value }))}
            placeholder="Customer name (optional)"
            className="input"
            style={{ width: "200px" }}
          />
          <input
            type="text"
            value={draft.message}
            onChange={(e) => setDraft((d) => ({ ...d, message: e.target.value }))}
            placeholder="Or write your own ticket…"
            maxLength={1000}
            className="input"
            style={{ flex: 1, minWidth: "220px" }}
          />
          <Button type="submit" variant="ink" disabled={loading || !draft.message.trim()}>
            {loading ? "Processing…" : "Submit ticket"}
          </Button>
        </form>

        {error && (
          <div style={{ marginTop: "16px" }}>
            <Badge variant="critical">{error}</Badge>
          </div>
        )}
        {decision?.askResponse.screening.reason === "budget_exhausted" && (
          <div style={{ marginTop: "16px" }}>
            <Badge variant="warning">Daily automation budget reached — guided scenarios stay available from cache.</Badge>
          </div>
        )}

        {decision && ticket ? (
          <div className="card-feature" style={{ padding: 0, overflow: "hidden", marginTop: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px 24px", borderBottom: "1px solid var(--hairline-soft)" }}>
              <span className="text-caption" style={{ color: "var(--steel)", letterSpacing: "0.04em" }}>
                MERIDIAN NINE / SUPPORT OPERATIONS
              </span>
              <Badge variant={badge} style={{ marginLeft: "auto" }}>
                {decision.askResponse.cached ? "Cached run" : "Live run"}
              </Badge>
            </div>

            <div className="ticket-grid" style={{ display: "grid", gridTemplateColumns: ".85fr 1.05fr 1.2fr" }}>
              <article style={{ padding: "24px", borderRight: "1px solid var(--hairline-soft)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "16px", borderBottom: "1px solid var(--hairline-soft)" }}>
                  <span className="text-body-sm-bold">Incoming ticket</span>
                  <span className="text-caption" style={{ color: "var(--stone)" }}>
                    #{decision.ticketId.slice(0, 8)}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "18px 0 14px" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "var(--r-md)", background: "var(--surface-soft)", display: "grid", placeItems: "center" }} className="text-body-sm-bold">
                    {initials(ticket.customerName)}
                  </div>
                  <div>
                    <div className="text-body-sm-bold">{ticket.customerName}</div>
                    <div className="text-caption" style={{ color: "var(--steel)" }}>
                      {ticket.customerContext || ticket.category}
                    </div>
                  </div>
                </div>
                <div className="text-subtitle-lg" style={{ marginBottom: "8px" }}>
                  {ticket.message.length > 70 ? ticket.message.slice(0, 70) + "…" : ticket.message}
                </div>
                <p className="text-body-sm" style={{ color: "var(--charcoal)" }}>
                  {ticket.message}
                </p>
                <dl style={{ margin: 0 }}>
                  <div style={metaRow}>
                    <dt className="text-caption" style={{ color: "var(--steel)" }}>Channel</dt>
                    <dd className="text-body-sm-bold" style={{ margin: 0 }}>{CHANNEL_LABEL[ticket.channel]}</dd>
                  </div>
                  <div style={metaRow}>
                    <dt className="text-caption" style={{ color: "var(--steel)" }}>Category</dt>
                    <dd className="text-body-sm-bold" style={{ margin: 0 }}>{ticket.category}</dd>
                  </div>
                  <div style={metaRow}>
                    <dt className="text-caption" style={{ color: "var(--steel)" }}>Risk level</dt>
                    <dd className="text-body-sm-bold" style={{ margin: 0 }}>{RISK_FROM_OUTCOME[decision.outcome]}</dd>
                  </div>
                </dl>
              </article>

              <article style={{ padding: "24px", borderRight: "1px solid var(--hairline-soft)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "16px", borderBottom: "1px solid var(--hairline-soft)" }}>
                  <span className="text-body-sm-bold">Evidence pipeline</span>
                  <Badge variant={badge}>{STATUS_LABEL[decision.outcome]}</Badge>
                </div>
                <EvidenceSteps askResponse={decision.askResponse} badge={badge} />
              </article>

              <article style={{ padding: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "16px", borderBottom: "1px solid var(--hairline-soft)", marginBottom: "18px" }}>
                  <span className="text-body-sm-bold">Automation decision</span>
                  <span className="text-caption" style={{ color: "var(--stone)" }}>POLICY GATE</span>
                </div>
                <DecisionPanel decision={decision} onActionTaken={(event) => setAuditEvents((prev) => [...prev, event])} />
              </article>
            </div>

            <SlackNotificationCard decision={decision} />

            <div style={{ borderTop: "1px solid var(--hairline-soft)", background: "var(--surface-soft)", padding: "18px 24px" }}>
              <div className="text-body-sm-bold">Decision history</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "14px", marginTop: "12px" }}>
                {auditEvents.map((e, i) => (
                  <div key={i}>
                    <div className="text-caption" style={{ color: "var(--stone)" }}>{formatTime(e.timestamp)}</div>
                    <div className="text-caption" style={{ marginTop: "4px", color: "var(--ink)" }}>{AUDIT_LABEL[e.stage]}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="card-feature" style={{ marginTop: "24px", padding: "70px 30px", textAlign: "center", color: "var(--stone)" }}>
            {loading ? "Running the live pipeline…" : "Choose a scenario above, or write your own ticket."}
          </div>
        )}

        <div style={{ marginTop: "20px" }}>
          <TurnstileWidget onToken={setToken} />
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", maxWidth: "760px", margin: "24px auto 0", color: "var(--steel)" }} className="text-body-sm">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" style={{ flexShrink: 0, marginTop: "2px", stroke: "var(--steel)" }}>
            <path d="M10 2.2 16 4.6v4.7c0 3.9-2.4 6.8-6 8.5-3.6-1.7-6-4.6-6-8.5V4.6L10 2.2Z" strokeWidth="1.5" />
            <path d="m7 10 1.8 1.8L13 7.7" strokeWidth="1.5" />
          </svg>
          <span>
            This is a presentation-only simulation. In production, reply thresholds, permissions, retention, and
            escalation routes are configured by the workspace operator. Every decision above is real — screening,
            retrieval, generation, and verification all run live against the actual pipeline. Sending a reply to
            the customer stays simulated — no email or real ticketing system is touched — but when a Slack
            connector is configured, the operator notification above is real, including the Approve/Reject
            buttons on tickets routed to human review.
          </span>
        </div>
      </div>
    </section>
  );
}
