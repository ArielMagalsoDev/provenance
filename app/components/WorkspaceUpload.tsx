"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { WorkspaceStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const ACCEPTED = ".md,.txt,.pdf";

function countdownParts(expiresAt: string): { label: string; critical: boolean; expired: boolean } {
  const msLeft = new Date(expiresAt).getTime() - Date.now();
  if (msLeft <= 0) return { label: "Expired", critical: true, expired: true };
  const totalSeconds = Math.floor(msLeft / 1000);
  const mm = Math.floor(totalSeconds / 60);
  const ss = totalSeconds % 60;
  return { label: `${mm}:${String(ss).padStart(2, "0")}`, critical: msLeft < 2 * 60_000, expired: false };
}

// Takes the Turnstile token as a prop rather than mounting its own
// TurnstileWidget — Next.js's <Script> component dedupes by src, so a second
// independent widget instance on the same page (this one, alongside
// TicketWorkflow's) caused the *first* widget's callback to silently never
// resolve, leaving ticket submission's own token permanently empty and every
// ticket coming back "blocked" (bot_check_failed) regardless of what was
// actually asked. One shared token per page, not one per feature.
export function WorkspaceUpload({
  token,
  onStatusChange,
}: {
  token: string;
  onStatusChange: (status: { active: boolean; includeShared: boolean } | null) => void;
}) {
  const [status, setStatus] = useState<WorkspaceStatus | null>(null);
  const [includeShared, setIncludeShared] = useState(true);
  const [stage, setStage] = useState<"idle" | "extracting" | "indexing" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingFileRef = useRef<File | null>(null);

  const loadStatus = useCallback(async () => {
    const res = await fetch("/api/workspace/status");
    if (!res.ok) return;
    const data: WorkspaceStatus = await res.json();
    setStatus(data.passageCount > 0 ? data : null);
  }, []);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  useEffect(() => {
    onStatusChange(status ? { active: true, includeShared } : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, includeShared]);

  // Tick every second only while there's an active countdown to show.
  useEffect(() => {
    if (!status?.expiresAt) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [status?.expiresAt]);

  useEffect(() => {
    if (status?.expiresAt && new Date(status.expiresAt).getTime() <= now) {
      setStatus(null);
    }
  }, [now, status?.expiresAt]);

  // If a file was chosen before the shared token resolved, run it as soon as
  // it does — instead of the widget-specific retry this used to do locally.
  useEffect(() => {
    if (token && pendingFileRef.current) {
      const file = pendingFileRef.current;
      pendingFileRef.current = null;
      void upload(file);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function upload(file: File) {
    if (!token) {
      pendingFileRef.current = file;
      setErrorMsg("Verifying you're not a bot — try again in a second.");
      return;
    }
    setStage("extracting");
    setErrorMsg(null);
    const form = new FormData();
    form.append("file", file);
    form.append("turnstileToken", token);
    try {
      setStage("indexing");
      const res = await fetch("/api/workspace/upload", { method: "POST", body: form });
      const body = await res.json();
      if (!res.ok) {
        setErrorMsg(body?.message ?? "Upload failed.");
        setStage("error");
        return;
      }
      setStage("idle");
      await loadStatus();
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStage("error");
    }
  }

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    void upload(file);
  }

  async function remove() {
    await fetch("/api/workspace/clear", { method: "POST" });
    setStatus(null);
  }

  if (status) {
    const countdown = status.expiresAt ? countdownParts(status.expiresAt) : null;
    return (
      <div className="card-icon-feature" style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
            <Badge variant="success">Your document is active</Badge>
            {status.sources.map((s) => (
              <span key={s.sourceFile} className="text-caption-bold" style={{ color: "var(--ink)" }}>
                {s.sourceFile} ({s.passageCount})
              </span>
            ))}
          </div>
          {countdown && (
            <span
              className="badge"
              style={countdown.critical ? { background: "var(--pink-soft, #fde7ec)", color: "var(--accent-pink-deep, #d92a54)" } : { background: "var(--primary-soft)", color: "var(--primary-deep)" }}
            >
              Expires in {countdown.label}
            </span>
          )}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "center", marginTop: "14px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--steel)" }}>
            <input type="checkbox" checked={!includeShared} onChange={(e) => setIncludeShared(!e.target.checked)} />
            My docs only (skip the shared corpus)
          </label>
          <Button type="button" variant="ink-outline" className="btn-sm" onClick={() => void remove()}>
            Remove my document
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="card-icon-feature"
      style={{ marginBottom: "20px", textAlign: "center", cursor: "pointer" }}
      onClick={() => fileInputRef.current?.click()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        handleFiles(e.dataTransfer.files);
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED}
        style={{ display: "none" }}
        onChange={(e) => handleFiles(e.target.files)}
      />
      {stage === "extracting" || stage === "indexing" ? (
        <p className="text-body-sm-bold">{stage === "extracting" ? "Extracting text…" : "Chunking and indexing…"}</p>
      ) : (
        <>
          <p className="text-body-sm-bold">Use your own knowledge</p>
          <p className="text-caption" style={{ color: "var(--steel)", marginTop: "4px" }}>
            Drop a .md, .txt, or .pdf file (max 2 MB) — it&apos;s indexed only for you, and removed automatically
            after 30 minutes.
          </p>
        </>
      )}
      {errorMsg && (
        <div style={{ marginTop: "10px" }}>
          <Badge variant="critical">{errorMsg}</Badge>
        </div>
      )}
    </div>
  );
}
