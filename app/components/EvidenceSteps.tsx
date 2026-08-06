"use client";

import { useState } from "react";
import type { AskResponse } from "@/lib/types";

type Badge = "success" | "warning" | "critical";

const DOT_COLOR: Record<Badge, string> = {
  success: "var(--success)",
  warning: "var(--attention)",
  critical: "var(--critical)",
};

const STEP_NOTE = [
  "Input classified before model execution.",
  "Source access follows the screening decision.",
  "Claims checked against available evidence.",
  "Routing policy chooses the final outcome.",
];

function EvidenceCard({ title, body, source }: { title: string; body: string; source: string }) {
  return (
    <div style={{ marginTop: "10px", padding: "12px", border: "1px solid var(--hairline-soft)", borderRadius: "var(--r-md)", background: "var(--surface-soft)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", marginBottom: "6px" }}>
        <span className="text-caption" style={{ color: "var(--steel)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
          {title}
        </span>
        <span className="text-caption" style={{ color: "var(--stone)" }}>
          {source}
        </span>
      </div>
      <p className="text-body-sm" style={{ color: "var(--charcoal)", margin: 0 }}>
        {body}
      </p>
    </div>
  );
}

export function EvidenceSteps({ askResponse, badge }: { askResponse: AskResponse; badge: Badge }) {
  const [expanded, setExpanded] = useState(false);

  const steps: { title: string; evidence?: React.ReactNode }[] = [];

  steps.push({
    title: askResponse.screening.passed
      ? `Screening passed (${askResponse.screening.latencyMs}ms)`
      : `Screening blocked — ${askResponse.screening.reason.replace(/_/g, " ")}`,
  });

  if (askResponse.retrieval.passages.length > 0) {
    const top = askResponse.retrieval.passages.slice(0, expanded ? undefined : 2);
    steps.push({
      title: `${askResponse.retrieval.passages.length} policy passages retrieved`,
      evidence: (
        <>
          {top.map((p, i) => (
            <EvidenceCard
              key={p.id}
              title={`${p.sourceFile} · ${p.heading ?? p.id}`}
              body={p.content}
              source={`Source 0${i + 1} · similarity ${p.similarity.toFixed(2)}`}
            />
          ))}
          {!expanded && askResponse.retrieval.passages.length > 2 && (
            <button type="button" onClick={() => setExpanded(true)} className="btn btn-ghost btn-sm" style={{ marginTop: "10px" }}>
              Show {askResponse.retrieval.passages.length - 2} more passage{askResponse.retrieval.passages.length - 2 === 1 ? "" : "s"}
            </button>
          )}
        </>
      ),
    });
  } else {
    steps.push({ title: "Retrieval skipped" });
  }

  if (askResponse.generation) {
    const claimCount = askResponse.grounding?.claims.length ?? 0;
    steps.push({ title: claimCount > 0 ? `${claimCount} claim${claimCount === 1 ? "" : "s"} checked` : "Response generated" });
  } else {
    steps.push({ title: "Generation skipped" });
  }

  if (askResponse.grounding) {
    steps.push({
      title: askResponse.grounding.passed
        ? `Groundedness ${askResponse.grounding.score.toFixed(2)}`
        : `Groundedness ${askResponse.grounding.score.toFixed(2)} — below threshold`,
    });
  } else if (askResponse.outcome === "blocked") {
    steps.push({ title: "Event logged" });
  } else {
    steps.push({ title: "Verification skipped" });
  }

  return (
    <div style={{ display: "grid", gap: "20px", marginTop: "18px" }}>
      {steps.map((s, i) => (
        <div key={i} style={{ display: "flex", gap: "12px" }}>
          <div style={{ flexShrink: 0, width: "10px", height: "10px", borderRadius: "50%", background: DOT_COLOR[badge], marginTop: "5px" }} />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="text-body-sm-bold">{s.title}</div>
            <p className="text-caption" style={{ color: "var(--steel)", marginTop: "2px" }}>
              {STEP_NOTE[i] ?? ""}
            </p>
            {s.evidence}
          </div>
        </div>
      ))}
    </div>
  );
}
