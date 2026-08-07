// Thin wrapper around unpdf — serverless-friendly PDF text extraction (no
// native binaries, works on Vercel's Node runtime), used only by the
// workspace-upload route. See docs/PLAN-hitl-and-workspaces.md for why this
// is the one new dependency the upload feature needs: hand-rolling PDF text
// extraction isn't realistic, and every other library in this project's
// stack was chosen to avoid exactly that kind of scope creep.
import { getDocumentProxy, extractText } from "unpdf";

export type PdfExtractResult = { text: string; pageCount: number };

/** Scanned/image-only PDFs yield ~no extractable text — callers should treat
 *  a near-empty result as a friendly error, not silently ingest an empty
 *  document. */
export async function extractPdfText(bytes: Uint8Array): Promise<PdfExtractResult> {
  // TEMPORARY diagnostic logging — do not merge past this debug session.
  console.error("[extractPdfText] DEBUG start, bytesLength=", bytes.length);
  try {
    const pdf = await getDocumentProxy(bytes);
    console.error("[extractPdfText] DEBUG gotDocumentProxy, numPages=", (pdf as { numPages?: number }).numPages);
    const { text, totalPages } = await extractText(pdf, { mergePages: true });
    console.error("[extractPdfText] DEBUG extractText done, textLength=", text.length, "totalPages=", totalPages);
    return { text, pageCount: totalPages };
  } catch (err) {
    console.error("[extractPdfText] DEBUG threw:", err instanceof Error ? { message: err.message, stack: err.stack, name: err.name } : err);
    throw err;
  }
}
