"use client";

import { useState } from "react";
import type { AskResponse, RetrievedPassage } from "@/lib/types";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-4 py-2 font-mono text-sm">
      <div className="text-zinc-500 dark:text-zinc-400">{label}</div>
      <div className="text-zinc-900 dark:text-zinc-100">{children}</div>
    </div>
  );
}

function PassageDetail({ passage }: { passage: RetrievedPassage }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-zinc-200 dark:border-zinc-800 rounded">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-4 px-4 py-2 text-left font-mono text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900"
      >
        <span className="truncate">
          <span className="text-zinc-900 dark:text-zinc-100">{passage.id}</span>
          {passage.heading ? <span className="text-zinc-500 dark:text-zinc-400"> — {passage.heading}</span> : null}
        </span>
        <span className="shrink-0 text-zinc-500 dark:text-zinc-400">
          {passage.similarity.toFixed(2)} {open ? "▲" : "▼"}
        </span>
      </button>
      {open && (
        <div className="px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300 border-t border-zinc-200 dark:border-zinc-800 whitespace-pre-wrap">
          {passage.content}
        </div>
      )}
    </div>
  );
}

const reasonLabel: Record<string, string> = {
  ok: "passed",
  injection: "blocked — injection attempt detected",
  off_topic: "blocked — off-topic",
  rate_limited: "blocked — rate limit exceeded",
  budget_exhausted: "blocked — daily spend cap reached",
  bot_check_failed: "blocked — bot check failed",
};

export function PipelinePanel({ response }: { response: AskResponse }) {
  return (
    <div className="border border-zinc-200 dark:border-zinc-800 rounded p-6 space-y-1">
      <Row label="Screening">
        {reasonLabel[response.screening.reason] ?? response.screening.reason} · {response.screening.latencyMs}ms
      </Row>

      <Row label="Retrieval">
        {response.retrieval.passages.length > 0 ? (
          <>
            {response.retrieval.passages.length} passage{response.retrieval.passages.length === 1 ? "" : "s"} ·{" "}
            {response.retrieval.passages.map((p) => p.similarity.toFixed(2)).join(" / ")} · {response.retrieval.latencyMs}ms
          </>
        ) : (
          "skipped"
        )}
      </Row>

      <Row label="Generation">
        {response.generation ? (
          <>
            done · {response.generation.tokensOut} tokens · {response.generation.latencyMs}ms
          </>
        ) : (
          "skipped"
        )}
      </Row>

      <Row label="Groundedness">
        {response.grounding ? (
          <>
            {response.grounding.score.toFixed(2)} (min claim {response.grounding.minClaimScore.toFixed(2)}) vs threshold{" "}
            {response.grounding.threshold.toFixed(2)} →{" "}
            {response.grounding.passed ? "above threshold, kept" : "below threshold, discarded"}
          </>
        ) : (
          "skipped"
        )}
      </Row>

      <Row label="Result">
        <span
          className={
            response.outcome === "answered"
              ? "text-emerald-700 dark:text-emerald-400"
              : response.outcome === "refused"
                ? "text-amber-700 dark:text-amber-400"
                : "text-red-700 dark:text-red-400"
          }
        >
          {response.outcome}
          {response.cached ? " (cached)" : ""}
        </span>
      </Row>

      {response.retrieval.passages.length > 0 && (
        <div className="pt-4 mt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
          <div className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Retrieved passages
          </div>
          {response.retrieval.passages.map((p) => (
            <PassageDetail key={p.id} passage={p} />
          ))}
        </div>
      )}

      {response.grounding && response.grounding.claims.length > 0 && (
        <div className="pt-4 mt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
          <div className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Claims checked</div>
          <ul className="space-y-1 font-mono text-sm">
            {response.grounding.claims.map((c, i) => (
              <li key={i} className={c.supported ? "text-zinc-700 dark:text-zinc-300" : "text-red-700 dark:text-red-400"}>
                [{c.score.toFixed(2)}] {c.text}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
