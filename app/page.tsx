import type { Metadata } from "next";
import Link from "next/link";
import { GUIDED_SCENARIOS } from "@/lib/scenarios";
import { BusinessImpactCalculator } from "./components/BusinessImpactCalculator";
import { Reveal } from "./components/Reveal";
import { CountUp } from "./components/CountUp";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Provenance | AI Automation Case Study by Ariel Magalso",
  description: "An auditable AI support workflow designed and built by Ariel Magalso, with cited answers, claim verification, human review, and a live evaluation suite.",
};

const WORKFLOW = [
  ["01", "Approved policies", "Operations controls the source material."],
  ["02", "Index updated", "Changed documents become searchable."],
  ["03", "Ticket arrives", "Email, chat, or helpdesk request."],
  ["04", "Evidence retrieved", "Relevant passages come back ranked."],
  ["05", "Claims verified", "Every statement must be supported."],
  ["06", "Reply or route", "Send safely, post to Slack, or involve staff."],
  ["07", "Decision logged", "Evidence and outcome stay auditable."],
] as const;

const STACK = [
  ["Interface", "Next.js 16, React 19, TypeScript, Tailwind CSS"],
  ["Retrieval", "Supabase Postgres, pgvector, gte-small embeddings"],
  ["Generation", "Claude Haiku with structured cited responses"],
  ["Verification", "Claim decomposition, entailment scoring, lexical checks"],
  ["Operations", "Persisted audit events, inbox, Slack approval workflow"],
  ["Safety", "Turnstile, rate limits, cache, spend cap, injection screening"],
] as const;

const DECISIONS = [
  ["Screen before spending", "Rate limiting, cache lookup, spend controls, and prompt-injection screening happen before retrieval and generation. Unsafe or over-limit requests do not consume the full model pipeline."],
  ["Derive citations from verified support", "The interface does not trust the generator's self-reported citation list. Citations are derived from the supporting passage IDs produced by claim-level verification."],
  ["Require both mean and minimum groundedness", "A response is only approved when the average claim score clears a threshold and the weakest individual claim clears its own floor. One conflated claim cannot hide among several good ones."],
  ["Choose exact search at this corpus size", "The corpus is small enough for exact vector comparison, which keeps retrieval transparent and makes every ranked passage easy to inspect during development."],
  ["Expire visitor workspaces", "Uploaded knowledge stays isolated to an anonymous browser workspace and expires after 30 minutes, keeping a portfolio demo useful without pretending it is a multi-tenant production system."],
] as const;

const OUTCOME_LABEL: Record<string, string> = {
  approved: "Answer with citations",
  human_review: "Route to human review",
  blocked: "Block before generation",
};

function SectionHeader({ label, heading, subtitle }: { label: string; heading: string; subtitle: string }) {
  return (
    <Reveal>
      <div className="section-heading">
        <span className="section-label"><i className="dot" aria-hidden="true" />{label}</span>
        <h2 className="text-heading-lg" style={{ marginTop: "18px" }}>{heading}</h2>
        <p className="text-body-md" style={{ color: "var(--steel)", marginTop: "14px" }}>{subtitle}</p>
      </div>
    </Reveal>
  );
}

function FlowArrow() {
  return <span className="flow-arrow-h" aria-hidden="true">→</span>;
}

export default function Home() {
  return (
    <main>
      <section id="overview" className="recruiter-hero-section">
        <div className="shell recruiter-hero-grid">
          <Reveal className="recruiter-hero-copy">
            <span className="section-label"><i className="dot" aria-hidden="true" />AI automation case study · Designed and built by Ariel Magalso</span>
            <h1 className="text-hero" style={{ marginTop: "22px" }}>Reliable support automation that knows when not to answer.</h1>
            <p className="text-subtitle-md" style={{ color: "var(--steel)", marginTop: "20px", maxWidth: "620px" }}>
              Provenance retrieves approved policy, verifies generated claims, and routes each ticket to an answer, human review, or refusal — with the evidence visible at every step.
            </p>
            <div className="creator-meta recruiter-role-meta" aria-label="Ariel's ownership">
              <span>Product design</span><span>Full-stack development</span><span>AI workflow architecture</span><span>Evaluation + deployment</span>
            </div>
            <div className="recruiter-hero-actions">
              <span className="btn-glow-wrap"><Button asChild variant="ink"><Link href="/demo">View live demo</Link></Button></span>
              <Button asChild variant="ink-outline"><a href="https://github.com/ArielMagalsoDev/provenance" target="_blank" rel="noopener noreferrer">View source code ↗</a></Button>
            </div>
            <a className="portfolio-link" href="https://arielmagalso.com" target="_blank" rel="noopener noreferrer">Visit Ariel&apos;s portfolio ↗</a>
          </Reveal>

          <Reveal delay={0.12} className="recruiter-hero-preview">
            <Link href="/demo" aria-label="Open the live Provenance demo" className="product-preview">
              <div className="product-preview-bar"><span className="text-caption">PROVENANCE / SUPPORT OPERATIONS</span><Badge variant="success">Approved with citations</Badge></div>
              <div className="product-preview-grid">
                <div><span className="text-caption" style={{ color: "var(--stone)" }}>Incoming ticket</span><h2 className="text-subtitle-lg" style={{ marginTop: "12px" }}>What does a Dedicated Desk membership cost?</h2><p className="text-body-sm" style={{ color: "var(--steel)", marginTop: "8px" }}>Does it include after-hours access?</p></div>
                <div><span className="text-caption" style={{ color: "var(--stone)" }}>Proposed response</span><p className="text-body-sm" style={{ color: "var(--charcoal)", marginTop: "12px" }}>A Dedicated Desk membership costs $429 per month and includes 24/7 building access via keycard, which provides after-hours access.</p><span className="citation-chip">pricing-03</span></div>
              </div>
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="proof-strip" aria-label="Project proof">
        <div className="shell grid-4">
          {[{ value: 45, suffix: "/45", label: "development-set cases passing" }, { value: 52, label: "indexed policy passages" }, { value: 3, label: "responsible outcomes" }, { value: 1, label: "live human-review workflow" }].map((item) => (
            <Reveal key={item.label}><div className="proof-stat"><span className="proof-stat-value"><CountUp value={item.value} suffix={item.suffix} /></span><span>{item.label}</span></div></Reveal>
          ))}
        </div>
      </section>

      <section id="case-study">
        <div className="shell">
          <SectionHeader label="Project snapshot" heading="The problem, the system, and what I owned." subtitle="A recruiter should be able to see the scope of the work before diving into the implementation details." />
          <div className="snapshot-grid">
            <Reveal><div className="snapshot-card"><span className="section-label"><i className="dot" aria-hidden="true" />The problem</span><h3 className="text-heading-sm" style={{ marginTop: "18px" }}>Support automation becomes a liability when it confidently invents policy.</h3><p className="text-body-md" style={{ color: "var(--steel)", marginTop: "12px" }}>Pricing, refunds, access rules, and liability terms need an answer that can be traced back to an approved source — or a clear handoff when evidence is missing.</p><div className="snapshot-divider" /><span className="section-label"><i className="dot" aria-hidden="true" />The solution</span><p className="text-body-md" style={{ color: "var(--steel)", marginTop: "12px" }}>Provenance retrieves evidence, verifies every material claim, and chooses whether to answer, escalate, or block.</p></div></Reveal>
            <Reveal delay={0.1}><div className="snapshot-card"><span className="section-label"><i className="dot" aria-hidden="true" />What I owned</span><ul className="ownership-list"><li>Product concept and interaction design</li><li>Next.js interface and API routes</li><li>Supabase/Postgres retrieval and audit layer</li><li>Claim-level verification and decision routing</li><li>Workspace upload and human-review workflow</li><li>Evaluation suite, deployment, and documentation</li></ul><p className="stack-note" style={{ textAlign: "left", marginTop: "20px" }}>Next.js · Supabase · pgvector · Claude · Slack · Vercel</p></div></Reveal>
          </div>
        </div>
      </section>

      <section id="demo" className="demo-section">
        <div className="shell"><SectionHeader label="60-second proof demo" heading="One inbox. Three responsible outcomes." subtitle="Run the same pipeline through a routine answer, an unsupported question, and a prompt-injection attempt." /><div className="grid-3">{GUIDED_SCENARIOS.map((scenario, index) => <Reveal key={scenario.id} delay={index * 0.08}><Link href="/demo" className="scenario-card"><div className="scenario-card-top"><span className="case-study-index">0{index + 1}</span><span className={`outcome-pill outcome-${scenario.expectedOutcome}`}>{OUTCOME_LABEL[scenario.expectedOutcome]}</span></div><h3 className="text-subtitle-lg">{scenario.label}</h3><p className="text-body-sm" style={{ color: "var(--steel)", marginTop: "8px" }}>{scenario.question.replace("Meridian Nine", "the workspace")}</p><span className="scenario-link">Run scenario →</span></Link></Reveal>)}</div><p className="center-link"><Link href="/demo" className="inline-link">Run all three scenarios →</Link></p></div>
      </section>

      <section id="engineering" style={{ background: "var(--surface-soft)" }}>
        <div className="shell"><SectionHeader label="Engineering story" heading="How the system earns permission to act." subtitle="The safe portion of support work is automated; uncertainty stays visible and accountable." /><Reveal delay={0.1}><div className="workflow-panel"><div className="flow-row">{WORKFLOW.slice(0, 4).map((step, index) => <span key={step[0]} className="flow-step"><b>{step[0]}</b><strong>{step[1]}</strong><small>{step[2]}</small>{index < 3 && <FlowArrow />}</span>)}</div><div className="workflow-connector" /><div className="flow-row">{WORKFLOW.slice(4).map((step, index) => <span key={step[0]} className="flow-step"><b>{step[0]}</b><strong>{step[1]}</strong><small>{step[2]}</small>{index < 2 && <FlowArrow />}</span>)}</div></div></Reveal><Reveal delay={0.15}><div className="stack-grid recruiter-stack-grid">{STACK.map(([layer, tech]) => <article className="stack-row" key={layer}><span className="text-caption-bold" style={{ color: "var(--primary-deep)" }}>{layer}</span><p className="text-body-sm" style={{ color: "var(--charcoal)" }}>{tech}</p></article>)}</div></Reveal><div className="engineering-actions"><Link href="/architecture" className="inline-link">Read the architecture walkthrough →</Link><Link href="/corpus" className="inline-link">Inspect the policy corpus →</Link></div></div>
      </section>

      <section id="evidence"><div className="shell"><SectionHeader label="Reliability evidence" heading="Tested against the ways support automation fails." subtitle="These are committed development-set results, not customer performance claims." /><Reveal delay={0.1}><div className="grid-4"><div className="stat-tile stat-tile-blue"><span className="stat-value"><CountUp value={45} suffix="/45" /></span><span className="stat-label">Development-set cases passing</span></div><div className="stat-tile stat-tile-dark"><span className="stat-value"><CountUp value={0} suffix="%" /></span><span className="stat-label">False refusal rate</span></div><div className="stat-tile stat-tile-pink"><span className="stat-value"><CountUp value={0} suffix="%" /></span><span className="stat-label">Fabrication rate</span></div><div className="stat-tile stat-tile-white"><span className="stat-value"><CountUp value={3} /></span><span className="stat-label" style={{ color: "var(--steel)" }}>Answerable, unanswerable, adversarial</span></div></div><div className="grid-split" style={{ marginTop: "16px" }}><div className="card-feature"><table className="specs-table"><thead><tr><th>Test group</th><th>Cases</th><th>Accuracy</th><th>Fabrication</th></tr></thead><tbody>{[["Answerable", "22"], ["Unanswerable", "14"], ["Adversarial", "9"], ["Overall", "45"]].map(([name, cases]) => <tr key={name}><td>{name}</td><td>{cases}</td><td>100.0%</td><td>0.0%</td></tr>)}</tbody></table><p className="text-caption" style={{ color: "var(--steel)", marginTop: "18px" }}>Live scorecard from <Link href="/evals" style={{ textDecoration: "underline" }}>the committed eval suite</Link>.</p></div><div className="card-feature"><Badge variant="warning">Known limitation</Badge><h3 className="text-heading-sm" style={{ marginTop: "14px" }}>A clean development-set result is not held-out proof.</h3><p className="text-body-sm" style={{ color: "var(--charcoal)", marginTop: "10px" }}>The suite caught real fabrication bugs during development. The next validation step is an unseen test set and threshold calibration against it.</p><ul className="learning-list"><li>Build a held-out evaluation set.</li><li>Calibrate routing thresholds on unseen cases.</li><li>Treat auto-send as demo-grade until then.</li></ul></div></div></Reveal></div></section>

      <section id="decisions" style={{ background: "var(--surface-soft)" }}><div className="shell decision-layout"><Reveal><div className="decision-intro"><span className="section-label"><i className="dot" aria-hidden="true" />Engineering decisions</span><h2 className="text-heading-lg" style={{ marginTop: "18px" }}>The implementation is designed around failure modes.</h2><p className="text-body-md" style={{ color: "var(--steel)", marginTop: "14px" }}>These are the tradeoffs I would discuss in an interview because they determine when the system is allowed to act.</p><Link href="/architecture" className="inline-link">Read the full architecture →</Link></div></Reveal><Reveal delay={0.1}><div>{DECISIONS.map(([title, answer], index) => <details className="accordion-item" key={title} open={index === 0}><summary><span className="text-body-md-bold">{title}</span><span className="chevron" aria-hidden="true">⌄</span></summary><p className="answer">{answer}</p></details>)}<div className="bug-card"><Badge variant="warning">Bug caught by evals</Badge><p className="text-body-sm" style={{ marginTop: "10px" }}>The verifier initially allowed a liability passage to support an insurance-coverage claim. The evaluation suite exposed the concept conflation, leading to stricter generation and entailment instructions.</p></div></div></Reveal></div></section>

      <section><div className="shell"><Reveal className="learning-panel"><div><span className="section-label"><i className="dot" aria-hidden="true" />What I learned</span><h2 className="text-heading-lg" style={{ marginTop: "18px" }}>Producing an answer is easy. Earning permission to act is harder.</h2></div><div><ul className="learning-list" style={{ marginTop: 0 }}><li>Retrieval quality does not guarantee grounded output.</li><li>Refusal and escalation are successful outcomes when evidence is insufficient.</li><li>Evaluation cases should model business risk and near-misses, not only typical questions.</li></ul><p className="text-body-sm learning-next"><strong>Next:</strong> build a held-out evaluation set and calibrate routing thresholds using unseen cases.</p></div></Reveal></div></section>

      <section style={{ paddingTop: 0 }}><div className="shell"><SectionHeader label="Optional business-model exploration" heading="Measure time saved without hiding the tradeoffs." subtitle="This calculator is illustrative product thinking, not measured customer performance." /><Reveal delay={0.1}><BusinessImpactCalculator /></Reveal></div></section>

      <section id="contact"><div className="shell recruiter-cta"><div><span className="section-label recruiter-label"><i className="dot" aria-hidden="true" />The builder behind Provenance</span><h2 className="text-heading-lg" style={{ color: "#fff", marginTop: "18px" }}>Looking for someone who can take AI automation from prototype to accountable workflow?</h2><p className="text-body-md" style={{ color: "rgba(255,255,255,0.7)", marginTop: "12px", maxWidth: "650px" }}>I&apos;m Ariel Magalso, a web developer and AI automation specialist building systems that connect models, business data, and human operations.</p></div><div className="recruiter-actions"><Button asChild variant="secondary"><a href="https://arielmagalso.com" target="_blank" rel="noopener noreferrer">View Ariel&apos;s portfolio ↗</a></Button><Button asChild variant="ink-outline" className="recruiter-outline"><a href="mailto:hello@arielmagalso.com">Contact Ariel</a></Button><Button asChild variant="ink-outline" className="recruiter-outline"><a href="https://www.linkedin.com/in/magalsoariel" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a></Button><Button asChild variant="ink-outline" className="recruiter-outline"><a href="https://github.com/ArielMagalsoDev/provenance" target="_blank" rel="noopener noreferrer">Source code ↗</a></Button><Link href="/demo" className="recruiter-demo-link">Replay the demo →</Link></div></div></section>
    </main>
  );
}
