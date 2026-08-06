// Reads /corpus/*.md, splits on ## headings then paragraphs targeting 200-400 tokens
// with ~15% overlap, embeds via lib/embed.ts, and upserts into the passages table.
//
// Token counts are approximated as chars/4 rather than pulling in a tokenizer
// dependency (e.g. tiktoken) — close enough for chunk sizing at this corpus scale, and
// keeps the "no additional dependencies without a stated reason" rule intact.
// dotenv/config's default only loads a file literally named ".env" — Next.js's own
// ".env.local" convention (where the real secrets live, per .gitignore) needs an
// explicit path.
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
import { readFileSync, readdirSync } from "node:fs";
import { join, basename } from "node:path";
import { embedTexts } from "../lib/embed";
import { getSupabaseAdmin } from "../lib/supabaseAdmin";

const CORPUS_DIR = join(__dirname, "..", "corpus");
const MAX_TOKENS = 400; // target ceiling; see chunkUnits for why there's no MIN_TOKENS floor
const OVERLAP_RATIO = 0.15;

function approxTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

type Section = { heading: string | null; paragraphs: string[] };
type Unit = { heading: string | null; text: string };

/** Splits a markdown file's body into sections by "## " headings. */
function splitIntoSections(markdown: string): Section[] {
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
  return sections;
}

/** Splits an oversized paragraph on sentence boundaries so no unit exceeds MAX_TOKENS. */
function splitLongParagraph(paragraph: string): string[] {
  const sentences = paragraph.match(/[^.!?]+[.!?]+(\s+|$)/g) ?? [paragraph];
  const parts: string[] = [];
  let current = "";
  for (const sentence of sentences) {
    if (current && approxTokens(current + sentence) > MAX_TOKENS) {
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
function flattenUnits(sections: Section[]): Unit[] {
  return sections.flatMap((s) =>
    s.paragraphs
      .flatMap((p) => (approxTokens(p) > MAX_TOKENS ? splitLongParagraph(p) : [p]))
      .map((text) => ({ heading: s.heading, text }))
  );
}

/**
 * Groups ONE heading section's units into chunks of up to MAX_TOKENS with overlap.
 * Headings are a hard boundary — never merged with a neighboring section — even though
 * that means many chunks land under the spec's 200-400 token target. Tried the alternative
 * (soft boundaries, merging short sections together) and reverted it: this corpus is
 * short enough that hitting 200-400 tokens/chunk AND the 60-100 passage-count target
 * simultaneously isn't achievable — the two targets assume a bigger corpus than this
 * project's is. Merging across headings got chunk size into range but collapsed the
 * corpus to 17 overly-broad passages, which actively hurts the thing this demo is
 * actually testing: near-miss passages need to stay topically narrow to be a fair
 * test of "high similarity, doesn't actually answer." Precision-per-passage wins.
 */
function chunkUnits(units: Unit[]): { content: string; heading: string | null }[] {
  const chunks: { content: string; heading: string | null }[] = [];
  let current: Unit[] = [];
  let currentTokens = 0;
  const sectionHeading = units[0]?.heading ?? null;

  const closeChunk = () => {
    if (current.length === 0) return;
    chunks.push({ content: current.map((u) => u.text).join("\n\n"), heading: sectionHeading });
  };

  for (const unit of units) {
    const unitTokens = approxTokens(unit.text);
    if (current.length > 0 && currentTokens + unitTokens > MAX_TOKENS) {
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

type PendingPassage = {
  id: string;
  sourceFile: string;
  heading: string | null;
  content: string;
  tokenCount: number;
};

function buildPassages(): PendingPassage[] {
  const files = readdirSync(CORPUS_DIR).filter(
    (f) => f.endsWith(".md") && f.toUpperCase() !== "COVERAGE.MD"
  );

  const passages: PendingPassage[] = [];

  for (const file of files) {
    const slug = basename(file, ".md");
    const markdown = readFileSync(join(CORPUS_DIR, file), "utf-8");
    const sections = splitIntoSections(markdown);

    let n = 0;
    for (const section of sections) {
      const units = flattenUnits([section]);
      const chunks = chunkUnits(units);
      for (const chunk of chunks) {
        n += 1;
        passages.push({
          id: `${slug}-${String(n).padStart(2, "0")}`,
          sourceFile: file,
          heading: chunk.heading,
          content: chunk.content,
          tokenCount: approxTokens(chunk.content),
        });
      }
    }
  }

  return passages;
}

async function main() {
  console.log("Reading corpus...");
  const passages = buildPassages();
  console.log(`Built ${passages.length} passages from /corpus.`);

  if (passages.length < 40) {
    console.warn(
      `Warning: only ${passages.length} passages — spec targets 60-100. Corpus may need more content.`
    );
  }

  console.log("Embedding (fanning out to the Supabase edge function, one call per passage)...");
  const embeddings = await embedTexts(passages.map((p) => p.content));

  console.log("Upserting into Supabase...");
  const rows = passages.map((p, i) => ({
    id: p.id,
    source_file: p.sourceFile,
    heading: p.heading,
    content: p.content,
    token_count: p.tokenCount,
    embedding: embeddings[i],
  }));

  // Chunked upsert to keep individual requests small.
  const UPSERT_BATCH = 50;
  for (let i = 0; i < rows.length; i += UPSERT_BATCH) {
    const batch = rows.slice(i, i + UPSERT_BATCH);
    const { error } = await getSupabaseAdmin().from("passages").upsert(batch, { onConflict: "id" });
    if (error) throw new Error(`upsert failed: ${error.message}`);
  }

  console.log(`Done. ${rows.length} passages ingested.`);
  console.log(
    `Token count range: ${Math.min(...passages.map((p) => p.tokenCount))}-${Math.max(
      ...passages.map((p) => p.tokenCount)
    )}`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
