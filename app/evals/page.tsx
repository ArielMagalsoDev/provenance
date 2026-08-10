import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ButtonArrow } from "../components/ButtonArrow";
import { EditorialHeader, EditorialStat } from "../components/Editorial";
import { CountUp } from "../components/CountUp";
import { Reveal } from "../components/Reveal";
import { renderMarkdownLite } from "../components/markdownLite";

export const metadata: Metadata = {
  title: "Evaluation evidence",
  description: "The committed Provenance development-set scorecard, published exactly as it ran.",
};

export default function EvalsPage() {
  const resultsPath = join(process.cwd(), "evals", "results.md");
  const content = existsSync(resultsPath) ? readFileSync(resultsPath, "utf-8") : null;

  return (
    <main>
      <EditorialHeader
        index="03"
        eyebrow="Evidence"
        title="evidence, published as it ran."
        ghost="Evidence"
        intro={<p>This page reads the committed evaluation result directly from the repository. It is reproducible development evidence—not a performance claim written after the fact.</p>}
        metadata={[
          { label: "Cases", value: "45 development-set scenarios" },
          { label: "Groups", value: "Answerable · unanswerable · adversarial" },
          { label: "Source", value: "Committed evals/results.md" },
          { label: "Next", value: "Held-out set + threshold calibration" },
        ]}
        actions={<><Button asChild><a href="https://github.com/ArielMagalsoDev/provenance/tree/main/evals" target="_blank" rel="noopener noreferrer">View eval source<ButtonArrow /></a></Button><Button asChild variant="ink"><Link href="/demo">Run the demo</Link></Button></>}
      />

      <section className="proof-band eval-proof-band">
        <div className="shell editorial-stats-grid">
          <EditorialStat value={<CountUp value={45} suffix="/45" />} label="Cases passing" note="Current development set" />
          <EditorialStat value={<CountUp value={100} suffix="%" />} label="Route accuracy" note="Across committed cases" />
          <EditorialStat value={<CountUp value={0} suffix="%" />} label="False refusal" note="On answerable cases" />
          <EditorialStat value={<CountUp value={0} suffix="%" />} label="Fabrication" note="On committed cases" />
        </div>
      </section>

      <section className="editorial-section">
        <div className="shell eval-layout">
          <aside className="eval-context">
            <span>Read this correctly</span>
            <h2>a perfect development result is a checkpoint, not the finish line.</h2>
            <p>The suite includes regression cases that found real pipeline bugs, but it has informed development. The next honest proof is an unseen evaluation set.</p>
            <dl>
              <div><dt>Bugs found</dt><dd>Concept conflation and unsupported adjacent claims</dd></div>
              <div><dt>Known limitation</dt><dd>No held-out production distribution</dd></div>
              <div><dt>Next validation</dt><dd>Unseen cases and calibrated routing thresholds</dd></div>
            </dl>
          </aside>
          <Reveal className="markdown-publication">
            <div className="publication-bar"><span>COMMITTED RESULT</span><code>evals/results.md</code></div>
            {content ? <div className="markdown-content">{renderMarkdownLite(content)}</div> : <p>No result is committed yet. Run <code>npm run evals</code> to generate it.</p>}
          </Reveal>
        </div>
      </section>

      <section className="editorial-section surface-section">
        <div className="shell">
          <div className="page-cta">
            <div className="page-cta-label">
              <span className="kicker-square" aria-hidden="true" />
              <h2>Check a refusal against the source.</h2>
            </div>
            <Button asChild variant="ink"><Link href="/corpus">Browse the policy corpus →</Link></Button>
          </div>
        </div>
      </section>
    </main>
  );
}
