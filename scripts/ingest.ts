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
import { approxTokens, splitIntoSections, flattenUnits, chunkUnits } from "../lib/chunk";

const CORPUS_DIR = join(__dirname, "..", "corpus");

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
