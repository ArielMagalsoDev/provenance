"use client";

import { useEffect, useState } from "react";
import type { AutomationDecision } from "@/lib/types";
import type { InboxTicketRow } from "@/lib/inbox";
import { EvidenceSteps } from "./EvidenceSteps";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const RESOLVE_ERROR_MESSAGES: Record<string, string> = {
  denylist_blocked: "That response contains phrasing that can't be taught to the assistant — rewrite it and try again.",
  workspace_full: "Your workspace has reached its 40-passage limit for this demo.",
  empty_response: "Write a response before approving.",
  already_resolved: "This ticket was already resolved.",
};

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

export function AgentInbox({ showHeader = true }: { showHeader?: boolean }) {
  const [tickets, setTickets] = useState<InboxTicketRow[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [resolving, setResolving] = useState<"approve" | "dismiss" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [approved, setApproved] = useState<InboxTicketRow | null>(null);
  const [replaying, setReplaying] = useState(false);
  const [replayResult, setReplayResult] = useState<AutomationDecision | null>(null);

  async function loadQueue() {
    const res = await fetch("/api/inbox");
    if (!res.ok) return;
    const data: { tickets: InboxTicketRow[] } = await res.json();
    setTickets(data.tickets);
  }

  useEffect(() => {
    void loadQueue();
  }, []);

  const selected = tickets?.find((t) => t.id === selectedId) ?? null;

  function selectTicket(t: InboxTicketRow) {
    setSelectedId(t.id);
    setDraft(t.proposedResponse ?? "");
    setApproved(null);
    setReplayResult(null);
    setError(null);
  }

  async function resolve(action: "approve" | "dismiss") {
    if (!selected || resolving) return;
    setResolving(action);
    setError(null);
    try {
      const res = await fetch("/api/inbox/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId: selected.id, action, editedResponse: draft }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body?.message ?? RESOLVE_ERROR_MESSAGES[body?.error] ?? "Something went wrong. Please try again.");
        return;
      }
      setTickets((prev) => (prev ? prev.filter((t) => t.id !== selected.id) : prev));
      if (action === "approve") setApproved(body.ticket);
      setSelectedId(null);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setResolving(null);
    }
  }

  async function replay() {
    if (!approved || replaying) return;
    setReplaying(true);
    setReplayResult(null);
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: "chat",
          customerName: "Same customer, asking again",
          message: approved.message,
          category: approved.category,
        }),
      });
      if (res.ok) setReplayResult(await res.json());
    } finally {
      setReplaying(false);
    }
  }

  return (
    <section className="product-workspace inbox-workspace" style={{ paddingTop: showHeader ? "48px" : 0 }}>
      <div className="shell">
        {showHeader && (
          <div className="legacy-route-heading">
            <span className="section-label"><i className="dot" aria-hidden="true" />Agent inbox</span>
            <h1 className="text-display-lg">Escalated tickets</h1>
            <p className="text-body-md">Review evidence, edit a response, and teach a correction when automation stops.</p>
          </div>
        )}

        {approved && (
          <div className="card-feature" style={{ marginTop: "24px", background: "var(--primary-soft)", borderColor: "#c7d3fb" }}>
            <Badge variant="success">Taught</Badge>
            <div className="text-heading-sm" style={{ marginTop: "10px" }}>
              Correction saved
            </div>
            <p className="text-body-sm" style={{ color: "var(--charcoal)", marginTop: "8px" }}>
              &quot;{approved.message}&quot; will now answer automatically, citing your approved response.
            </p>
            {!replayResult ? (
              <div style={{ marginTop: "16px", display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
                <span className="btn-glow-wrap">
                  <Button type="button" variant="ink" onClick={() => void replay()} disabled={replaying}>
                    {replaying ? "Asking…" : "Ask the same question again"}
                  </Button>
                </span>
              </div>
            ) : (
              <div style={{ marginTop: "16px", padding: "16px", background: "var(--canvas)", borderRadius: "var(--r-lg)", border: "1px solid var(--hairline)" }}>
                <Badge variant={replayResult.outcome === "approved" ? "success" : "warning"}>
                  {replayResult.outcome === "approved" ? "Now answered" : replayResult.outcome}
                </Badge>
                <p className="text-body-sm" style={{ color: "var(--ink)", marginTop: "10px" }}>
                  {replayResult.proposedResponse}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="inbox-console">
          <div className="inbox-console-bar">
            <div>
              <span className="inbox-console-eyebrow">Human review desk</span>
              <h2>Resolve what automation cannot.</h2>
            </div>
            <div className="inbox-console-status">
              <i aria-hidden="true" />
              <span>{tickets === null ? "Syncing queue" : `${tickets.length} ticket${tickets.length === 1 ? "" : "s"} open`}</span>
            </div>
          </div>

          <div className="ticket-grid inbox-ticket-grid">
            <article className="inbox-queue">
              <div className="inbox-panel-heading">
                <div>
                  <span className="inbox-panel-number">01</span>
                  <span className="text-body-sm-bold">Review queue</span>
                </div>
                <span className="text-caption inbox-panel-meta">Newest first</span>
              </div>
              {tickets === null ? (
                <div className="inbox-loading" aria-label="Loading review tickets" aria-live="polite">
                  {[0, 1, 2].map((item) => (
                    <div className="inbox-skeleton-row" key={item}>
                      <span />
                      <span />
                      <span />
                    </div>
                  ))}
                </div>
              ) : tickets.length === 0 ? (
                <div className="inbox-queue-empty">
                  <span className="inbox-empty-check" aria-hidden="true">✓</span>
                  <strong>Queue is clear</strong>
                  <p>Run the unsupported-question scenario to create a review ticket.</p>
                  <a href="/demo#live-workflow">Generate a ticket <span aria-hidden="true">→</span></a>
                </div>
              ) : (
                <div style={{ display: "grid", gap: "8px", marginTop: "14px" }}>
                  {tickets.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => selectTicket(t)}
                      className={`radio-option inbox-queue-row${selectedId === t.id ? " selected" : ""}`}
                      style={{ textAlign: "left" }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "flex-start" }}>
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                          <Badge variant="warning">Human review</Badge>
                          {t.postedToSlack && <Badge variant="success">Also in Slack</Badge>}
                        </div>
                        <span className="text-caption" style={{ color: "var(--stone)", flexShrink: 0 }}>
                          {formatTime(t.createdAt)}
                        </span>
                      </div>
                      <div className="text-body-sm-bold" style={{ marginTop: "8px" }}>
                        {t.message.length > 70 ? t.message.slice(0, 70) + "…" : t.message}
                      </div>
                      <p className="text-caption" style={{ color: "var(--steel)", marginTop: "4px" }}>
                        {t.customerName} · {t.category}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </article>

            <article className="inbox-detail">
              {!selected ? (
                <div className="inbox-detail-empty">
                  <div className="inbox-flow-graphic" aria-hidden="true">
                    <span><i>01</i><b>Ticket</b></span>
                    <em>→</em>
                    <span><i>02</i><b>Evidence</b></span>
                    <em>→</em>
                    <span className="is-accent"><i>03</i><b>Decision</b></span>
                  </div>
                  <span className="inbox-detail-kicker">Inspect before acting</span>
                  <h3>Select a ticket to review its evidence.</h3>
                  <p>Every escalation keeps the source, reason, and final human decision visible in one place.</p>
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "14px", borderBottom: "1px solid var(--hairline-soft)" }}>
                    <span className="text-body-sm-bold">Ticket detail</span>
                    <span className="text-caption" style={{ color: "var(--stone)" }}>
                      #{selected.id.slice(0, 8)}
                    </span>
                  </div>

                  <p className="text-subtitle-lg" style={{ marginTop: "14px" }}>
                    {selected.message}
                  </p>
                  <p className="text-body-sm" style={{ color: "var(--steel)", marginTop: "6px" }}>
                    {selected.reason}
                  </p>

                  {selected.askResponse && <EvidenceSteps askResponse={selected.askResponse} badge="warning" />}

                  <div className="text-caption" style={{ color: "var(--steel)", textTransform: "uppercase", letterSpacing: "0.06em", margin: "20px 0 8px" }}>
                    Response to teach
                  </div>
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Write the correct answer for this question…"
                    rows={5}
                    maxLength={2000}
                    className="input"
                    style={{ width: "100%", height: "auto", padding: "12px", resize: "vertical" }}
                  />

                  {error && (
                    <div style={{ marginTop: "12px" }}>
                      <Badge variant="critical">{error}</Badge>
                    </div>
                  )}

                  <div className="inbox-decision-rail">
                    <span className="btn-glow-wrap" style={{ flex: 1 }}>
                      <Button
                        type="button"
                        variant="ink"
                        className="w-full"
                        disabled={resolving !== null}
                        onClick={() => void resolve("approve")}
                      >
                        {resolving === "approve" ? "Teaching…" : "Approve & teach"}
                      </Button>
                    </span>
                    <Button type="button" variant="ink-outline" disabled={resolving !== null} onClick={() => void resolve("dismiss")}>
                      {resolving === "dismiss" ? "Dismissing…" : "Dismiss"}
                    </Button>
                  </div>
                </>
              )}
            </article>
          </div>
          <div className="inbox-session-note">
            <span className="inbox-lock" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="M7 10V7a5 5 0 0 1 10 0v3M6 10h12v10H6z" /></svg>
            </span>
            <div>
              <strong>Private, session-scoped corrections</strong>
              <p>Approved answers stay in your workspace, never enter the shared corpus, and expire automatically.</p>
            </div>
            <a href="/demo">View session <span aria-hidden="true">→</span></a>
          </div>
        </div>
      </div>
    </section>
  );
}
