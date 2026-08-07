// Server component: reads /corpus/*.md directly off disk (bundled with the deploy) so
// a reviewer can verify a refusal was correct by reading the real source docs — not
// just trusting the model.
import { readFileSync, readdirSync } from "node:fs";
import { join, basename } from "node:path";
import type { Metadata } from "next";
import { renderMarkdownLite } from "../components/markdownLite";

export const metadata: Metadata = {
  title: "Corpus — Provenance",
  description: "The full fictional policy corpus behind the Provenance demo.",
};

export default function CorpusPage() {
  const corpusDir = join(process.cwd(), "corpus");
  const files = readdirSync(corpusDir)
    .filter((f) => f.endsWith(".md"))
    .sort((a, b) => (a === "COVERAGE.md" ? -1 : b === "COVERAGE.md" ? 1 : a.localeCompare(b)));

  return (
    <main>
      <header className="shell" style={{ paddingTop: "56px", paddingBottom: "32px" }}>
        <span className="section-label">
          <i className="dot" aria-hidden="true" />
          Source material
        </span>
        <h1 className="text-display-lg" style={{ marginTop: "16px" }}>Corpus</h1>
        <p className="text-subtitle-md" style={{ maxWidth: "680px", color: "var(--charcoal)", marginTop: "16px" }}>
          The complete, unedited source material for Meridian Nine, the fictional coworking space this demo
          answers questions about. Every response is generated only from these documents — read them to check
          whether a refusal was actually correct.
        </p>
      </header>

      <section style={{ paddingTop: 0 }}>
        <div className="shell" style={{ maxWidth: "760px", display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: "48px" }}>
          {files.map((file) => {
            const content = readFileSync(join(corpusDir, file), "utf-8");
            return (
              <section key={file} id={basename(file, ".md")}>
                <div className="text-caption" style={{ letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--stone)", marginBottom: "10px" }}>
                  {file}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: "12px" }}>{renderMarkdownLite(content)}</div>
              </section>
            );
          })}
        </div>
      </section>
    </main>
  );
}
