// Custom knowledge upload: a visitor's own .md/.txt/.pdf runs through the
// exact same chunk -> embed -> retrieve -> generate -> ground pipeline as the
// shared corpus, scoped to their workspace. See
// docs/PLAN-hitl-and-workspaces.md. Embedding is free (Supabase gte-small),
// so this never touches the daily spend cap — only Turnstile + rate limit
// gate it, same as every other write path.
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { embedTexts } from "@/lib/embed";
import { extractPdfText } from "@/lib/pdf";
import { chunkDocument, approxTokens } from "@/lib/chunk";
import { getClientIp, hashIp, checkRateLimit, verifyTurnstile } from "@/lib/limit";
import { ensureWorkspaceId, withWorkspaceCookie, workspaceExpiresAt } from "@/lib/workspace";

export const maxDuration = 60;

const MAX_FILE_BYTES = 2 * 1024 * 1024; // 2 MB
const MAX_PDF_PAGES = 40;
const MAX_EXTRACTED_CHARS = 120_000;
const MAX_PASSAGES = 40;

const UPLOAD_ERROR_MESSAGES: Record<string, string> = {
  bot_check_failed: "Bot check failed. Please try again.",
  rate_limited: "Too many requests from this session. Try again in a bit.",
  no_file: "Choose a file to upload.",
  unsupported_type: "Only .md, .txt, and .pdf files are supported.",
  too_large: "File is larger than the 2 MB demo limit.",
  no_text: "This PDF has no extractable text (likely a scanned image) — try a text-based PDF or Markdown instead.",
  too_long: "Extracted text is longer than this demo supports (~120,000 characters).",
  too_many_pages: `PDF has more than ${MAX_PDF_PAGES} pages — trim it down for this demo.`,
  too_many_passages: `Document produced more than ${MAX_PASSAGES} chunks — trim it down for this demo.`,
};

function errorResponse(error: string, status: number) {
  return NextResponse.json({ error, message: UPLOAD_ERROR_MESSAGES[error] ?? "Upload failed." }, { status });
}

export async function POST(req: Request) {
  const ip = getClientIp(req.headers);

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "invalid_form_data" }, { status: 400 });
  }

  const file = form.get("file");
  const turnstileToken = typeof form.get("turnstileToken") === "string" ? (form.get("turnstileToken") as string) : "";

  const turnstileOk = await verifyTurnstile(turnstileToken, ip);
  if (!turnstileOk) return errorResponse("bot_check_failed", 403);

  const withinLimit = await checkRateLimit(hashIp(ip));
  if (!withinLimit) return errorResponse("rate_limited", 429);

  if (!(file instanceof File)) return errorResponse("no_file", 400);
  if (file.size > MAX_FILE_BYTES) return errorResponse("too_large", 413);

  const name = file.name || "uploaded-document";
  const lower = name.toLowerCase();
  const isPdf = lower.endsWith(".pdf") || file.type === "application/pdf";
  const isText = lower.endsWith(".md") || lower.endsWith(".txt") || file.type.startsWith("text/");
  if (!isPdf && !isText) return errorResponse("unsupported_type", 400);

  let text: string;
  try {
    if (isPdf) {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const extracted = await extractPdfText(bytes);
      if (extracted.pageCount > MAX_PDF_PAGES) return errorResponse("too_many_pages", 413);
      text = extracted.text;
    } else {
      text = await file.text();
    }
  } catch (err) {
    console.error("[/api/workspace/upload] extraction failed:", err);
    return errorResponse("no_text", 422);
  }

  if (text.trim().length < 20) return errorResponse("no_text", 422);
  if (text.length > MAX_EXTRACTED_CHARS) return errorResponse("too_long", 413);

  const chunks = chunkDocument(text);
  if (chunks.length === 0) return errorResponse("no_text", 422);
  if (chunks.length > MAX_PASSAGES) return errorResponse("too_many_passages", 413);

  const { id: workspaceId, isNew } = ensureWorkspaceId(req);

  try {
    const embeddings = await embedTexts(chunks.map((c) => c.content));
    const uploadTag = randomUUID().slice(0, 8);
    const rows = chunks.map((chunk, i) => ({
      id: `up-${uploadTag}-${String(i + 1).padStart(2, "0")}`,
      source_file: name,
      heading: chunk.heading,
      content: chunk.content,
      token_count: approxTokens(chunk.content),
      embedding: embeddings[i],
      workspace_id: workspaceId,
      origin: "uploaded" as const,
    }));

    const { error } = await getSupabaseAdmin().from("passages").upsert(rows, { onConflict: "id" });
    if (error) throw new Error(`upload upsert failed: ${error.message}`);

    const res = NextResponse.json({
      fileName: name,
      passageCount: rows.length,
      headings: [...new Set(chunks.map((c) => c.heading).filter((h): h is string => Boolean(h)))].slice(0, 8),
      expiresAt: workspaceExpiresAt(),
    });
    return isNew ? withWorkspaceCookie(res, workspaceId) : res;
  } catch (err) {
    console.error("[/api/workspace/upload] unexpected error:", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
