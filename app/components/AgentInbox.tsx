"use client";

import { useEffect, useState } from "react";
import type { AutomationDecision } from "@/lib/types";
import type { InboxTicketRow } from "@/lib/inbox";
import { EvidenceSteps } from "./EvidenceSteps";
import { TurnstileWidget } from "./TurnstileWidget";
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

export function AgentInbox() {
  const [tickets, setTickets] = useState<InboxTicketRow[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [resolving, setResolving] = useState<"approve" | "dismiss" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [approved, setApproved] = useState<InboxTicketRow | null>(null);
  const [token, setToken] = useState("");
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
          turnstileToken: token,
        }),
      });
      if (res.ok) setReplayResult(await res.json());
    } finally {
      setReplaying(false);
    }
  }

  return (
    <section style={{ paddingTop: "48px" }}>
      <div className="shell">
        <p className="text-caption-bold" style={{ color: "var(--steel)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>
          Agent Inbox
        </p>
        <h1 className="text-heading-lg">Escalated tickets</h1>
        <p className="text-body-md" style={{ color: "var(--steel)", marginTop: "10px", maxWidth: "640px" }}>
          Tickets the pipeline couldn&apos;t automatically resolve. Read the evidence, write or edit a response, and
          approve it — the correction is embedded into your workspace so the same question answers on its own next
          time.
        </p>

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
                <TurnstileWidget onToken={setToken} />
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

        <div className="card-feature" style={{ padding: 0, overflow: "hidden", marginTop: "24px" }}>
          <div className="ticket-grid" style={{ display: "grid", gridTemplateColumns: ".85fr 1.2fr" }}>
            <article style={{ padding: "20px", borderRight: "1px solid var(--hairline-soft)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "14px", borderBottom: "1px solid var(--hairline-soft)" }}>
                <span className="text-body-sm-bold">Queue</span>
                <span className="text-caption" style={{ color: "var(--stone)" }}>
                  {tickets ? `${tickets.length} open` : "…"}
                </span>
              </div>
              {tickets === null ? (
                <p className="text-caption" style={{ color: "var(--stone)", marginTop: "16px" }}>
                  Loading…
                </p>
              ) : tickets.length === 0 ? (
                <p className="text-caption" style={{ color: "var(--stone)", marginTop: "16px" }}>
                  Nothing escalated right now. Run scenario 02 on{" "}
                  <a href="/demo" style={{ textDecoration: "underline" }}>
                    /demo
                  </a>{" "}
                  to generate one.
                </p>
              ) : (
                <div style={{ display: "grid", gap: "8px", marginTop: "14px" }}>
                  {tickets.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => selectTicket(t)}
                      className={`radio-option${selectedId === t.id ? " selected" : ""}`}
                      style={{ textAlign: "left" }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", gap: "8px" }}>
                        <Badge variant="warning">Human review</Badge>
                        <span className="text-caption" style={{ color: "var(--stone)" }}>
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

            <article style={{ padding: "20px" }}>
              {!selected ? (
                <div style={{ padding: "60px 20px", textAlign: "center", color: "var(--stone)" }}>
                  Select a ticket from the queue to review its evidence and respond.
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

                  <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
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
        </div>

        <p className="text-caption" style={{ color: "var(--stone)", marginTop: "16px", maxWidth: "640px" }}>
          Corrections you approve here live in your own session workspace, not the shared corpus — no other visitor
          ever sees them, and they expire automatically (see the countdown on{" "}
          <a href="/demo" style={{ textDecoration: "underline" }}>
            /demo
          </a>{" "}
          once you&apos;ve taught one).
        </p>
      </div>
    </section>
  );
}
