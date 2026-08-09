import { readFileSync, readdirSync } from "node:fs";
import { basename, join } from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import { EditorialHeader, RouteIndex } from "../components/Editorial";
import { Reveal } from "../components/Reveal";
import { renderMarkdownLite } from "../components/markdownLite";

export const metadata: Metadata = {
  title: "Policy corpus",
  description: "The complete fictional policy source material behind every Provenance answer and refusal.",
};

function describeDocument(content: string, fallback: string) {
  const title = content.match(/^#\s+(.+)$/m)?.[1] ?? fallback;
  const sections = (content.match(/^##?\s+/gm) ?? []).length;
  return { title, sections };
}

export default function CorpusPage() {
  const corpusDir = join(process.cwd(), "corpus");
  const documents = readdirSync(corpusDir)
    .filter((file) => file.endsWith(".md"))
    .sort((a, b) => (a === "COVERAGE.md" ? -1 : b === "COVERAGE.md" ? 1 : a.localeCompare(b)))
    .map((file) => {
      const content = readFileSync(join(corpusDir, file), "utf-8");
      return { file, id: basename(file, ".md"), content, ...describeDocument(content, basename(file, ".md")) };
    });

  return (
    <main>
      <EditorialHeader
        index="04 / Source archive"
        eyebrow="Policy corpus"
        title="the source material behind every answer."
        intro={<p>Read the complete fictional policy set used by the demo. Every cited answer—and every refusal—can be checked against these committed files.</p>}
        metadata={[
          { label: "Documents", value: `${documents.length} committed Markdown files` },
          { label: "Passages", value: "52 indexed chunks" },
          { label: "Workspace", value: "Fictional; no customer data" },
          { label: "Rendering", value: "Server-side from repository files" },
        ]}
        actions={<><Link className="text-link" href="/demo">Try a policy question →</Link><a className="text-link" href="https://github.com/ArielMagalsoDev/provenance/tree/main/corpus" target="_blank" rel="noopener noreferrer">View source files ↗</a></>}
      />

      <section className="editorial-section corpus-section">
        <div className="shell route-layout corpus-layout">
          <RouteIndex title="Documents" items={documents.map((document, index) => ({ href: `#${document.id}`, index: String(index + 1).padStart(2, "0"), label: document.file }))} />
          <div className="corpus-publication">
            <div className="corpus-archive-head"><span>File</span><span>Topic</span><span>Sections</span></div>
            {documents.map((document, index) => (
              <Reveal key={document.file}>
                <article className="corpus-document" id={document.id}>
                  <header>
                    <div><span>{String(index + 1).padStart(2, "0")}</span><code>{document.file}</code></div>
                    <h2>{document.title}</h2>
                    <p>{document.sections} indexed sections</p>
                  </header>
                  <div className="markdown-content corpus-markdown">{renderMarkdownLite(document.content)}</div>
                  <Link className="text-link" href="/demo">Try this policy in the demo →</Link>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
