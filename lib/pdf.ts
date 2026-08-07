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
  const pdf = await getDocumentProxy(bytes);
  const { text, totalPages } = await extractText(pdf, { mergePages: true });
  return { text, pageCount: totalPages };
}
