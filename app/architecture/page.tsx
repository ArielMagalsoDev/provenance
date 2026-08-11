import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "../components/ButtonArrow";
import { ArchiveTable, EditorialHeader, RouteIndex } from "../components/Editorial";
import { Reveal } from "../components/Reveal";
import { STAGE_ART } from "../components/StageArt";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Architecture",
  description: "How Provenance retrieves evidence, verifies claims, and earns permission to answer or route a support ticket.",
};

const STAGES = [
  ["ingest", "01", "Policy ingestion + versioning", "Approved Markdown is split by heading, chunked, embedded, and upserted into Postgres. Each run receives a corpus version that follows every citation."],
  ["screen", "02", "Input security before spend", "A fast deny-list and a small classifier separate genuine questions from off-topic or manipulative requests before retrieval, generation, or a costly database write."],
  ["retrieve", "03", "Transparent retrieval", "The ticket is embedded and compared with every indexed passage. Ranked passages return with similarity scores and stable IDs; retrieval alone never decides that a question is answered."],
  ["generate", "04", "Evidence-bound generation", "The model drafts only from retrieved passages, leaves the answer empty when support is missing, and is explicitly warned not to conflate adjacent policy concepts."],
  ["verify", "05", "Claim-level verification", "The draft is decomposed into factual claims. Each claim receives an entailment score plus a lexical sanity check so one weak statement cannot hide inside an otherwise grounded answer."],
  ["route", "06", "Three responsible routes", "Verified drafts become cited answers. Missing or ambiguous evidence goes to human review. Unsafe instructions remain blocked before the answer pipeline begins."],
  ["operate", "07", "Ticketing + human handoff", "Customer sending is simulated, while the inbox and optional Slack notification carry evidence, reason, and approve or reject controls into the operator workflow."],
  ["evaluate", "08", "Audit + evaluation", "Every stage writes a persisted event. A committed 45-case development suite runs the same pipeline and reports route accuracy, false refusal, and fabrication by category."],
] as const;

const THRESHOLDS = [
  ["Input screening", "Unsafe or manipulative intent", "Block before generation"],
  ["Evidence sufficiency", "No direct support in retrieved passages", "Human review"],
  ["Mean groundedness", "Aggregate claim score misses threshold", "Human review"],
  ["Minimum groundedness", "Any single claim misses its floor", "Human review"],
  ["All gates pass", "Every material claim is supported", "Answer with citations"],
] as const;

export default function ArchitecturePage() {
  return (
    <main className="agero-inner-page">
      <EditorialHeader
        index="02"
        eyebrow="Engineering"
        title="how Provenance earns permission to act."
        ghost="Architecture"
        intro={<p>A support ticket moves through eight explicit stages. Each stage narrows what the system is allowed to do, and every decision remains visible after the run.</p>}
        metadata={[
          { label: "System", value: "Evidence-bound support automation" },
          { label: "Corpus", value: "Versioned Markdown + Postgres" },
          { label: "Retrieval", value: "Exact pgvector comparison" },
          { label: "Model", value: "Claude Haiku" },
          { label: "Deploy", value: "Next.js on Vercel" },
        ]}
        actions={<><Link className="text-link" href="/demo">Run the pipeline →</Link><a className="text-link" href="https://github.com/ArielMagalsoDev/provenance" target="_blank" rel="noopener noreferrer">View source<ArrowUpRight /></a></>}
      />

      <section className="editorial-section architecture-section">
        <div className="shell route-layout">
          <RouteIndex items={STAGES.map(([id, index, title]) => ({ href: `#${id}`, index, label: title }))} />
          <div className="stage-list">
            {STAGES.map(([id, index, title, body], stageIndex) => {
              const StageArt = STAGE_ART[stageIndex];
              return (
                <Reveal key={id}>
                  <article className="architecture-stage" id={id}>
                    <div className="stage-number">{index}</div>
                    <div className="stage-copy"><span>{stageIndex < 2 ? "Control" : stageIndex < 5 ? "Reasoning" : "Operation"}</span><h2>{title}</h2><p>{body}</p></div>
                    <div className={`stage-diagram stage-diagram-${stageIndex % 3}`}>
                      <StageArt />
                    </div>
                    <details><summary>Implementation note <span>+</span></summary><p>{body} This behavior is exercised by the guided demo and recorded in its audit history.</p></details>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="editorial-section surface-section decision-gates-section">
        <div className="shell">
          <div className="compact-section-heading"><span>09 / Decision gates</span><h2>thresholds turn model confidence into an operational route.</h2></div>
          <ArchiveTable label="Decision gates" columns={["Gate", "Failure condition", "Route"]} rows={THRESHOLDS.map((row) => [...row])} />
          <Reveal className="engineering-note">
            <span>Bug caught by evals</span>
            <h3>Related policy language is not the same as supporting evidence.</h3>
            <p>The verifier initially allowed a liability passage to support an insurance-coverage claim. The development suite exposed the concept conflation, leading to stricter generation and entailment instructions.</p>
          </Reveal>
          <div className="section-actions"><Link href="/demo">Demo →</Link><Link href="/evals">Evals →</Link><Link href="/corpus">Corpus →</Link><a href="https://github.com/ArielMagalsoDev/provenance" target="_blank" rel="noopener noreferrer">Source<ArrowUpRight /></a></div>
        </div>
      </section>

      <section className="editorial-section light-cta-section">
        <div className="shell">
          <div className="page-cta architecture-live-cta">
            <div className="architecture-live-copy">
              <span>Live decision preview</span>
              <h2>See it decide something live.</h2>
              <p>Submit a support question and watch the system screen, retrieve, verify, and select a responsible route.</p>
              <Button asChild variant="ink"><Link href="/demo">Run the demo <b aria-hidden="true">↗</b></Link></Button>
            </div>
            <div className="architecture-live-art" aria-label="Question routes through evidence to an answer, review, or block decision">
              <div className="architecture-live-art-head"><span>Decision trace</span><small><i /> Ready</small></div>
              <div className="architecture-live-question"><small>Incoming question</small><strong>Does the policy support this answer?</strong></div>
              <div className="architecture-live-path"><span>Screen</span><i>→</i><span>Retrieve</span><i>→</i><span>Verify</span></div>
              <div className="architecture-live-routes"><span className="is-answer"><i />Answer</span><span><i />Review</span><span><i />Block</span></div>
              <div className="architecture-live-proof"><span>0.96</span><small>Groundedness score</small><b>3 citations attached</b></div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
