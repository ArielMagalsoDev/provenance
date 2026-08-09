import type { Metadata } from "next";
import Link from "next/link";
import { GUIDED_SCENARIOS } from "@/lib/scenarios";
import { Button } from "@/components/ui/button";
import { BusinessImpactCalculator } from "./components/BusinessImpactCalculator";
import { CountUp } from "./components/CountUp";
import { Reveal } from "./components/Reveal";
import { ArchiveTable, EditorialStat, OutcomeMark, SectionIntro } from "./components/Editorial";

export const metadata: Metadata = {
  title: "Provenance — AI support automation case study by Ariel Magalso",
  description: "Provenance is an auditable AI support workflow designed and built by Ariel Magalso, with cited answers, claim verification, human review, and a live evaluation suite.",
};

const STACK = [
  ["Interface", "Next.js 16 + React 19", "Product UI and API routes"],
  ["Retrieval", "Postgres + pgvector", "Exact search across 52 passages"],
  ["Generation", "Claude Haiku", "Structured, evidence-bound responses"],
  ["Verification", "Claim-level scoring", "Mean and minimum support gates"],
  ["Operations", "Audit log + Slack", "Human review and persisted decisions"],
  ["Safety", "Screening + spend controls", "Checks run before model spend"],
] as const;

const PROCESS = [
  ["01", "Ingest", "Approved policy becomes versioned, searchable evidence."],
  ["02", "Retrieve", "The most relevant passages return with scores and IDs."],
  ["03", "Generate", "A response is drafted from retrieved evidence only."],
  ["04", "Verify", "Every material claim is checked against its support."],
  ["05", "Route", "The system answers, requests review, or blocks safely."],
  ["06", "Log", "Evidence, thresholds, and the final decision stay auditable."],
] as const;

const OUTCOME_LABEL = {
  approved: "A cited policy answer is safe to send.",
  human_review: "Evidence is insufficient, so judgment stays human.",
  blocked: "Unsafe instructions stop before retrieval and generation.",
} as const;

const FAQ_ITEMS = [
  ["What did Ariel build personally?", "The product concept, interface, Next.js routes, retrieval layer, claim verification, audit workflow, evaluation suite, deployment, and documentation."],
  ["Is the demo connected to real customer data?", "No. It uses a fictional workspace and committed policy corpus. No customer data is used."],
  ["What parts are simulated?", "The pipeline runs live, but sending a response to a real customer is simulated. Optional Slack operator notifications can be real when configured."],
  ["What would need to change before production?", "A held-out evaluation set, threshold calibration, authenticated tenancy, durable connector permissions, and production observability would be required."],
] as const;

export default function Home() {
  return (
    <main>
      <section id="overview" className="home-hero">
        <div className="shell">
          <Reveal>
            <div className="hero-kicker">
              <span>AI automation case study</span>
              <span>Designed + built by Ariel Magalso</span>
            </div>
            <h1>Reliable automation needs proof.</h1>
          </Reveal>

          <div className="hero-lower-grid">
            <Reveal delay={0.08} className="hero-summary">
              <p>Provenance retrieves approved policy, verifies generated claims, and knows when not to answer.</p>
              <div className="ownership-chips" aria-label="Ariel Magalso's ownership">
                <span>Product design</span><span>Full-stack</span><span>AI architecture</span><span>Evaluation</span>
              </div>
              <div className="hero-actions">
                <Button asChild variant="ink"><Link href="/demo">Run the live demo</Link></Button>
                <Button asChild variant="ink-outline"><a href="https://github.com/ArielMagalsoDev/provenance" target="_blank" rel="noopener noreferrer">View source ↗</a></Button>
              </div>
            </Reveal>

            <Reveal delay={0.16} className="hero-product-wrap">
              <Link className="hero-product-frame mockup-window hero-selected-mockup" href="/demo" aria-label="Open the Provenance guided demo">
                <div className="mockup-window-bar"><span>PROVENANCE / TICKET 042</span><b>✓ APPROVED WITH CITATIONS</b></div>
                <div className="mockup-split-body">
                  <div className="mockup-ticket"><small>Incoming ticket</small><strong>Does membership include after-hours access?</strong><span>Dedicated Desk · Pricing and access</span></div>
                  <div className="mockup-answer"><small>Verified response</small><p>A Dedicated Desk membership includes 24/7 building access via keycard.</p><div className="mockup-citation"><code>pricing-03</code><span>1 source · 0 unsupported claims</span></div></div>
                </div>
                <div className="mockup-proof-strip"><span>Policy gate · Answer with citations →</span><strong>0.96</strong><em>Mean groundedness</em></div>
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="proof-band" aria-label="Project proof">
        <div className="shell editorial-stats-grid">
          <EditorialStat value={<CountUp value={45} suffix="/45" />} label="Development-set cases passing" note="Committed evaluation result" />
          <EditorialStat value={<CountUp value={52} />} label="Indexed policy passages" note="Versioned source material" />
          <EditorialStat value={<CountUp value={3} />} label="Responsible outcomes" note="Answer, review, or block" />
          <EditorialStat value={<CountUp value={1} />} label="Human-review workflow" note="Inbox and Slack handoff" />
        </div>
      </section>

      <section id="thesis" className="editorial-section">
        <div className="shell">
          <SectionIntro index="01" eyebrow="The thesis" title="an AI answer is only useful when the business can trust why it was allowed." />
          <div className="thesis-grid">
            <Reveal><p className="editorial-quote">“Producing an answer is easy. Earning permission to act is harder.”</p></Reveal>
            <Reveal delay={0.1} className="thesis-copy">
              <p>Support automation becomes a liability when it confidently invents pricing, access, refund, or liability policy. Provenance treats uncertainty as an operational outcome, not a UI error.</p>
              <dl className="project-meta-list">
                <div><dt>Role</dt><dd>Product designer + full-stack developer</dd></div>
                <div><dt>Scope</dt><dd>Concept, interface, pipeline, evals, deployment</dd></div>
                <div><dt>Constraint</dt><dd>Portfolio demo; fictional workspace; no customer data</dd></div>
                <div><dt>Next proof</dt><dd>Held-out evaluation and threshold calibration</dd></div>
              </dl>
            </Reveal>
          </div>
        </div>
      </section>

      <section id="case-study" className="editorial-section surface-section">
        <div className="shell">
          <SectionIntro index="02" eyebrow="Featured case study" title="one inbox. three responsible outcomes." copy={<p>The same live pipeline handles a routine answer, an unsupported request, and an adversarial instruction.</p>} />
          <div className="scenario-editorial-grid">
            {GUIDED_SCENARIOS.map((scenario, index) => (
              <Reveal delay={index * 0.08} key={scenario.id}>
                <Link className="scenario-editorial-card" href="/demo">
                  <div><span>0{index + 1}</span><OutcomeMark outcome={scenario.expectedOutcome} compact /></div>
                  <h3>{scenario.label}</h3>
                  <p>{scenario.question.replace("Meridian Nine", "the workspace")}</p>
                  <small>{OUTCOME_LABEL[scenario.expectedOutcome]}</small>
                  <b>Run this scenario →</b>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="engineering" className="editorial-section">
        <div className="shell">
          <SectionIntro index="03" eyebrow="Engineering archive" title="the system earns permission in layers." copy={<p>Every important decision is inspectable—from source passage to route outcome.</p>} />
          <Reveal delay={0.08}>
            <ArchiveTable label="Provenance engineering stack" columns={["Layer", "Implementation", "Purpose"]} rows={STACK.map((row) => [...row])} />
          </Reveal>
          <div className="section-actions"><Link href="/architecture">Read the architecture →</Link><Link href="/corpus">Inspect the policy corpus →</Link></div>
        </div>
      </section>

      <section id="evidence" className="editorial-section dark-section">
        <div className="shell">
          <SectionIntro index="04" eyebrow="Published evidence" title="45 cases passed. the limitation is part of the result." />
          <div className="evidence-layout">
            <Reveal className="evidence-number">
              <div className="evidence-number-top"><span>Evaluation snapshot</span><span>DEV-SET / V1</span></div>
              <strong><CountUp value={45} suffix="/45" /></strong>
              <div className="evidence-number-context">
                <span>Development-set cases passing</span>
                <p>Every committed case reached the correct route: answer, review, or block.</p>
              </div>
              <Link href="/evals">Read the scorecard →</Link>
            </Reveal>
            <Reveal delay={0.08} className="evidence-groups">
              <div><span>22</span><p>Answerable</p><small>100% route accuracy</small></div>
              <div><span>14</span><p>Unanswerable</p><small>0% false approval</small></div>
              <div><span>9</span><p>Adversarial</p><small>0% unsafe completion</small></div>
            </Reveal>
            <Reveal delay={0.14} className="limitation-note">
              <span>Known limitation</span><h3>This is development-set evidence, not held-out production proof.</h3><p>The suite caught real concept-conflation bugs. The next validation step is an unseen set and threshold calibration against it.</p><Link href="/evals">Open the committed scorecard →</Link>
            </Reveal>
          </div>
        </div>
      </section>

      <section id="process" className="editorial-section">
        <div className="shell">
          <SectionIntro index="05" eyebrow="Operational process" title="six stages between a question and an action." />
          <div className="process-grid">
            {PROCESS.map(([index, title, copy]) => (
              <Reveal key={index} className="process-step">
                <span>{index}</span><h3>{title}</h3><p>{copy}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="recruiter-faq" className="editorial-section surface-section">
        <div className="shell faq-layout">
          <SectionIntro index="06" eyebrow="Recruiter FAQ" title="the useful questions before you open the source." />
          <div className="faq-list">
            {FAQ_ITEMS.map(([question, answer]) => (
              <details className="faq-row" key={question}>
                <summary><span>{question}</span><b aria-hidden="true">+</b></summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="editorial-section surface-section">
        <div className="shell">
          <SectionIntro index="07" eyebrow="Product thinking" title="measure possible value without disguising assumptions." copy={<p>This calculator is an illustrative model—not measured customer performance.</p>} />
          <Reveal delay={0.08}><BusinessImpactCalculator /></Reveal>
        </div>
      </section>

      <section className="learning-section">
        <div className="shell learning-editorial-grid">
          <Reveal><span className="editorial-section-kicker"><span>07</span><span>What I learned</span></span><h2>the best automation makes its boundaries legible.</h2></Reveal>
          <Reveal delay={0.1}>
            <ul>
              <li>Retrieval quality does not guarantee grounded output.</li>
              <li>Refusal and escalation are successful outcomes when evidence is insufficient.</li>
              <li>Evaluation cases should model business risk and near-misses, not only typical questions.</li>
            </ul>
            <p><strong>Next:</strong> build a held-out evaluation set and calibrate routing thresholds on unseen cases.</p>
            <div className="section-actions"><Link href="/demo">Run the demo →</Link><a href="https://arielmagalso.com" target="_blank" rel="noopener noreferrer">View Ariel&apos;s portfolio ↗</a></div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
