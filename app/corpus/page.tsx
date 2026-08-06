// Server component: reads /corpus/*.md directly off disk (bundled with the deploy) so
// a reviewer can verify a refusal was correct by reading the real source docs — not
// just trusting the model. See CLAUDE.md Phase 7.
import { readFileSync, readdirSync } from "node:fs";
import { join, basename } from "node:path";
import Link from "next/link";
import type { Metadata } from "next";
import { renderMarkdownLite } from "../components/markdownLite";

export const metadata: Metadata = {
  title: "Corpus — grounded-rag",
  description: "The full source corpus behind the grounded-rag demo.",
};

export default function CorpusPage() {
  const corpusDir = join(process.cwd(), "corpus");
  const files = readdirSync(corpusDir)
    .filter((f) => f.endsWith(".md"))
    .sort((a, b) => (a === "COVERAGE.md" ? -1 : b === "COVERAGE.md" ? 1 : a.localeCompare(b)));

  return (
    <div className="max-w-2xl mx-auto px-6 py-16 space-y-12">
      <header className="space-y-2">
        <Link href="/" className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 underline underline-offset-2">
          ← Back
        </Link>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Corpus</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          The complete, unedited source material for Meridian Nine, the fictional coworking space this demo
          answers questions about. Every response above is generated only from these documents — read them to
          check whether a refusal was actually correct.
        </p>
      </header>

      {files.map((file) => {
        const content = readFileSync(join(corpusDir, file), "utf-8");
        return (
          <section key={file} id={basename(file, ".md")} className="space-y-3">
            <div className="text-xs font-mono uppercase tracking-wide text-zinc-400 dark:text-zinc-500">{file}</div>
            <div className="space-y-3">{renderMarkdownLite(content)}</div>
          </section>
        );
      })}
    </div>
  );
}
