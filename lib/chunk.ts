// Section/paragraph chunker, extracted from scripts/ingest.ts so the ingest
// script and the workspace-upload API route (app/api/workspace/upload) share
// one implementation instead of two copies that inevitably drift. Pure
// functions, no fs — callers pass already-read text in.
//
// Token counts are approximated as chars/4 rather than pulling in a tokenizer
// dependency (e.g. tiktoken) — see scripts/ingest.ts's original note; still
// close enough for chunk sizing at this scale.

export const MAX_CHUNK_TOKENS = 400; // target ceiling; see chunkUnits for why there's no floor
const OVERLAP_RATIO = 0.15;

export function approxTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

type Section = { heading: string | null; paragraphs: string[] };
type Unit = { heading: string | null; text: string };
export type Chunk = { content: string; heading: string | null };

/** Splits a markdown file's body into sections by "## " headings. */
export function splitIntoSections(markdown: string): Section[] {
  const lines = markdown.split("\n");
  const sections: Section[] = [];
  let current: Section | null = null;
  let buffer: string[] = [];

  const flushParagraph = () => {
    const text = buffer.join("\n").trim();
    if (text && current) current.paragraphs.push(text);
    buffer = [];
  };

  for (const line of lines) {
    if (line.startsWith("## ")) {
      flushParagraph();
      if (current) sections.push(current);
      current = { heading: line.slice(3).trim(), paragraphs: [] };
    } else if (line.startsWith("# ")) {
      // Document title — not a passage heading, and not part of any section's content.
      flushParagraph();
    } else if (line.trim() === "") {
      flushParagraph();
    } else {
      buffer.push(line);
    }
  }
  flushParagraph();
  if (current) sections.push(current);

  // Unlike the corpus (which always opens with a heading before any body
  // text — see corpus/COVERAGE.md), an uploaded document may start writing
  // before its first "## " heading, or have no headings at all. Without this
  // fallback that leading text is silently dropped (buffer flushed into a
  // `current` that's still null). Give it a null-heading section instead.
  if (buffer.length > 0 || sections.length === 0) {
    const leading = buffer.join("\n").trim();
    if (leading) sections.unshift({ heading: null, paragraphs: [leading] });
  }

  return sections;
}

/** Splits an oversized paragraph on sentence boundaries so no unit exceeds MAX_CHUNK_TOKENS. */
export function splitLongParagraph(paragraph: string): string[] {
  const sentences = paragraph.match(/[^.!?]+[.!?]+(\s+|$)/g) ?? [paragraph];
  const parts: string[] = [];
  let current = "";
  for (const sentence of sentences) {
    if (current && approxTokens(current + sentence) > MAX_CHUNK_TOKENS) {
      parts.push(current.trim());
      current = sentence;
    } else {
      current += sentence;
    }
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

/** Flattens a file's sections into paragraph-level units, tagged with their heading. */
export function flattenUnits(sections: Section[]): Unit[] {
  return sections.flatMap((s) =>
    s.paragraphs
      .flatMap((p) => (approxTokens(p) > MAX_CHUNK_TOKENS ? splitLongParagraph(p) : [p]))
      .map((text) => ({ heading: s.heading, text }))
  );
}

/**
 * Groups ONE heading section's units into chunks of up to MAX_CHUNK_TOKENS
 * with overlap. Headings are a hard boundary — never merged with a
 * neighboring section. See scripts/ingest.ts's original note on why chunks
 * often land under a "200-400 token" target at small corpus scale: precision
 * per passage wins over hitting a size target.
 */
export function chunkUnits(units: Unit[]): Chunk[] {
  const chunks: Chunk[] = [];
  let current: Unit[] = [];
  let currentTokens = 0;
  const sectionHeading = units[0]?.heading ?? null;

  const closeChunk = () => {
    if (current.length === 0) return;
    chunks.push({ content: current.map((u) => u.text).join("\n\n"), heading: sectionHeading });
  };

  for (const unit of units) {
    const unitTokens = approxTokens(unit.text);
    if (current.length > 0 && currentTokens + unitTokens > MAX_CHUNK_TOKENS) {
      closeChunk();
      // ~15% overlap: carry the tail of the closed chunk's text into the next one.
      const prevText = current.map((u) => u.text).join("\n\n");
      const overlapChars = Math.floor(prevText.length * OVERLAP_RATIO);
      const tail = prevText.slice(-overlapChars).trim();
      current = tail ? [{ heading: sectionHeading, text: tail }, unit] : [unit];
      currentTokens = approxTokens(current.map((u) => u.text).join("\n\n"));
    } else {
      current.push(unit);
      currentTokens += unitTokens;
    }
  }
  closeChunk();

  return chunks;
}

/** End-to-end: markdown/plain text in, ready-to-embed chunks out. Groups by
 *  section so heading boundaries stay a hard chunk boundary (see chunkUnits). */
export function chunkDocument(text: string): Chunk[] {
  const sections = splitIntoSections(text);
  const chunks: Chunk[] = [];
  for (const section of sections) {
    const units = flattenUnits([section]);
    chunks.push(...chunkUnits(units));
  }
  return chunks;
}
