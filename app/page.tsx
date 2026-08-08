import type { Metadata } from "next";
import { Fragment } from "react";
import Link from "next/link";
import { GUIDED_SCENARIOS } from "@/lib/scenarios";
import { BusinessImpactCalculator } from "./components/BusinessImpactCalculator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Provenance | AI Automation Case Study by Ariel Magalso",
  description: "An auditable AI support automation case study designed and built by Ariel Magalso, with cited answers, claim verification, human review, and a live evaluation suite.",
};

const PROMISES = [
  { title: "Cited answers", note: "Every material claim maps to an approved policy passage." },
  { title: "Human judgment", note: "Unsupported requests are routed to a person, not guessed at." },
  { title: "Safety gates", note: "Unsafe instructions are blocked before generation, not after." },
  { title: "Audit history", note: "Every automated decision leaves a real, persisted record." },
];

const WORKFLOW = [
  { n: "01", title: "Approved policies", note: "Operations controls the source material." },
  { n: "02", title: "Index updated", note: "Changed documents become searchable." },
  { n: "03", title: "Ticket arrives", note: "Email, chat, or helpdesk request." },
  { n: "04", title: "Evidence retrieved", note: "Relevant passages come back ranked." },
  { n: "05", title: "Claims verified", note: "Every statement must be supported." },
  { n: "06", title: "Reply or route", note: "Send safely, post to Slack, or involve staff." },
  { n: "07", title: "Decision logged", note: "Evidence and outcome stay auditable." },
];

const PROJECT_SUMMARY = [
  { title: "My role", note: "I designed the product, defined the system architecture, built the interface and backend workflow, created the evaluation suite, and deployed the live application." },
  { title: "The challenge", note: "Support automation becomes risky when generated answers cannot be traced to approved policy or unsupported questions are answered confidently." },
  { title: "The solution", note: "Provenance retrieves approved evidence, generates a cited response, verifies its claims, and chooses whether to answer, escalate, or block." },
  { title: "The result", note: "A working prototype with 52 indexed passages, 45 development evaluation cases, three responsible outcomes, audit logging, and live Slack handoff." },
];

const STACK = [
  { area: "Product interface", tech: "Next.js 16, React 19, TypeScript, Tailwind CSS" },
  { area: "Data and retrieval", tech: "Supabase Postgres, pgvector, gte-small embeddings" },
  { area: "AI workflow", tech: "Claude Haiku, retrieval, claim decomposition, entailment checks" },
  { area: "Operations", tech: "Slack approvals, persisted audit events, human-review inbox" },
  { area: "Safety and cost", tech: "Cloudflare Turnstile, rate limits, response cache, spend cap" },
  { area: "Delivery", tech: "45-case evaluation harness, Vercel deployment" },
];

const ENGINEERING_DECISIONS = [
  { title: "Screen before spending", answer: "Rate limiting, cache lookup, spend controls, and prompt-injection screening happen before retrieval and generation. Unsafe or over-limit requests do not consume the full model pipeline." },
  { title: "Derive citations from verified support", answer: "The interface does not trust the generator's self-reported citation list. Citations are derived from the supporting passage IDs produced by claim-level verification." },
  { title: "Escalate uncertainty instead of guessing", answer: "The system requires both a mean groundedness threshold and a minimum score for every material claim. Insufficient evidence routes the ticket to a person or refuses it rather than sending a plausible answer." },
  { title: "Treat a clean scorecard honestly", answer: "The 45 cases are a development set used while improving the system. They caught real fabrication failures, but passing them is not held-out proof; the next step is an unseen test set and threshold calibration against it." },
];

const TEASER_ICON_PROPS = { width: 32, height: 32, viewBox: "0 0 24 24", fill: "none", "aria-hidden": true } as const;

const ARCHITECTURE_TEASER = [
  {
    title: "Grounded retrieval",
    note: "Policy documents are chunked, indexed, ranked, and shown beside every proposed response.",
    icon: (
      <svg {...TEASER_ICON_PROPS}>
        <rect x="5" y="3.5" width="11" height="15" rx="1.5" stroke="var(--accent-pink)" strokeWidth="1.5" />
        <path d="M7.8 8h5.4M7.8 11h5.4M7.8 14h3" stroke="var(--accent-pink)" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="17.8" cy="17" r="3" stroke="var(--accent-pink)" strokeWidth="1.5" />
        <path d="m20 19.2 1.7 1.7" stroke="var(--accent-pink)" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Claim verification",
    note: "Generated statements are checked against retrieved passages before an outcome is chosen.",
    icon: (
      <svg {...TEASER_ICON_PROPS}>
        <path d="M12 3 18.5 5.5v5.1c0 4.5-2.7 7.7-6.5 9.2-3.8-1.5-6.5-4.7-6.5-9.2V5.5L12 3Z" stroke="var(--accent-pink)" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="m8.7 11.6 2.2 2.2 4.4-4.6" stroke="var(--accent-pink)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Decision routing",
    note: "Evidence sufficiency determines reply, escalate, or block — before generation, not after.",
    icon: (
      <svg {...TEASER_ICON_PROPS}>
        <circle cx="5.5" cy="12" r="2.2" stroke="var(--accent-pink)" strokeWidth="1.5" />
        <circle cx="18.5" cy="5.5" r="2.2" stroke="var(--accent-pink)" strokeWidth="1.5" />
        <circle cx="18.5" cy="18.5" r="2.2" stroke="var(--accent-pink)" strokeWidth="1.5" />
        <path d="M7.6 11 16.4 6.4M7.6 13l8.8 4.6" stroke="var(--accent-pink)" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Evaluation harness",
    note: "Answerable, unanswerable, and adversarial cases track accuracy, fabrication, and latency.",
    icon: (
      <svg {...TEASER_ICON_PROPS}>
        <path d="M4 20.5v-9M9.7 20.5V6.5M15.3 20.5v-6.5M21 20.5V3.5" stroke="var(--accent-pink)" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Live operations handoff",
    note: "Every decision posts to a real Slack channel; escalations carry live Approve/Reject buttons an operator can act on.",
    icon: (
      <svg {...TEASER_ICON_PROPS}>
        <rect x="3.5" y="8.5" width="7" height="7" rx="1.5" stroke="var(--accent-pink)" strokeWidth="1.5" />
        <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" stroke="var(--accent-pink)" strokeWidth="1.5" />
        <path d="M10.5 12h6.5a2.5 2.5 0 0 0 2.5-2.5V9" stroke="var(--accent-pink)" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

function FlowArrow() {
  return (
    <div className="flow-arrow-h">
      <svg width="18" height="12" viewBox="0 0 18 12" fill="none" aria-hidden="true">
        <path d="M0 6h14M9 1l5 5-5 5" stroke="var(--hairline)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function SectionHeader({ label, heading, subtitle }: { label: string; heading: string; subtitle: string }) {
  return (
    <div style={{ textAlign: "center", maxWidth: "620px", margin: "0 auto 40px" }}>
      <span className="section-label">
        <i className="dot" aria-hidden="true" />
        {label}
      </span>
      <h2 className="text-heading-lg" style={{ marginTop: "18px" }}>
        {heading}
      </h2>
      <p className="text-body-md" style={{ color: "var(--steel)", marginTop: "14px" }}>
        {subtitle}
      </p>
    </div>
  );
}

export default function Home() {
  return (
    <main>
      {/* Hero */}
      <header className="shell" style={{ paddingTop: "72px", paddingBottom: "8px", textAlign: "center" }}>
        <span className="section-label" style={{ margin: "0 auto" }}>
          <i className="dot" aria-hidden="true" />
          Auditable support automation for flexible workspaces
        </span>
        <h1 className="text-hero" style={{ maxWidth: "780px", margin: "22px auto 0" }}>
          Resolve routine support questions without inventing company policy.
        </h1>
        <p className="text-subtitle-md" style={{ maxWidth: "560px", color: "var(--steel)", margin: "20px auto 0" }}>
          Provenance reads approved documents, drafts a cited answer, and knows when to involve your operations
          team — visibly, with the reasoning shown at every step.
        </p>
        <div className="creator-note">
          <p className="text-body-sm-bold">
            Designed and built by{" "}
            <a href="https://arielmagalso.com" target="_blank" rel="noopener noreferrer">Ariel Magalso ↗</a>
          </p>
          <p className="text-body-sm" style={{ color: "var(--steel)", marginTop: "4px" }}>
            Independent AI automation case study — from document ingestion and retrieval to claim verification,
            human review, Slack handoff, and evaluation.
          </p>
          <div className="creator-meta" aria-label="Project details">
            <span><strong>Role</strong> Product design + full-stack development</span>
            <span><strong>Type</strong> Independent portfolio project</span>
            <span><strong>Status</strong> Live prototype</span>
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", marginTop: "32px", justifyContent: "center" }}>
          <span className="btn-glow-wrap">
            <Button asChild variant="ink">
              <Link href="/demo">Open the guided demo</Link>
            </Button>
          </span>
          <Button asChild variant="ink-outline">
            <Link href="/evals">See reliability evidence</Link>
          </Button>
        </div>
        <p className="text-caption" style={{ color: "var(--stone)", marginTop: "16px" }}>
          No signup. No login. Live pipeline, not scripted.
        </p>
      </header>

      {/* App-frame preview */}
      <section style={{ paddingTop: 0, paddingBottom: "40px" }}>
        <div className="shell">
          <Link
            href="/demo"
            aria-label="Open the guided demo"
            style={{
              display: "block",
              background: "var(--surface-soft)",
              border: "1px solid var(--hairline)",
              borderRadius: "var(--r-xxxl)",
              padding: "clamp(16px, 3vw, 32px)",
              boxShadow: "0 24px 60px rgba(24,24,24,0.08)",
            }}
          >
            <div
              style={{
                background: "var(--canvas)",
                borderRadius: "var(--r-xl)",
                border: "1px solid var(--hairline)",
                overflow: "hidden",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "14px 22px", borderBottom: "1px solid var(--hairline)" }}>
                <span className="text-caption" style={{ color: "var(--steel)" }}>
                  MERIDIAN NINE / SUPPORT OPERATIONS
                </span>
                <Badge variant="success" style={{ marginLeft: "auto" }}>
                  Approved with citations
                </Badge>
              </div>
              <div className="grid-2" style={{ gap: 0 }}>
                <div style={{ padding: "24px", borderRight: "1px solid var(--hairline-soft)" }}>
                  <span className="text-caption" style={{ color: "var(--stone)" }}>Incoming ticket</span>
                  <div className="text-subtitle-lg" style={{ marginTop: "10px" }}>
                    What does a Dedicated Desk membership cost?
                  </div>
                  <p className="text-body-sm" style={{ color: "var(--steel)", marginTop: "8px" }}>
                    Does it include after-hours access?
                  </p>
                </div>
                <div style={{ padding: "24px" }}>
                  <span className="text-caption" style={{ color: "var(--stone)" }}>Proposed response</span>
                  <p className="text-body-sm" style={{ color: "var(--charcoal)", marginTop: "10px" }}>
                    A Dedicated Desk membership costs $429 per month and includes 24/7 building access via keycard,
                    which provides after-hours access.{" "}
                    <span className="text-caption" style={{ color: "var(--primary-deep)", background: "var(--primary-soft)", padding: "2px 8px", borderRadius: "var(--r-sm)" }}>
                      pricing-03
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Stat strip, replaces "trusted by" logos — nothing here is a customer claim */}
      <section style={{ paddingTop: 0, paddingBottom: "24px" }}>
        <div className="shell" style={{ display: "flex", justifyContent: "center", gap: "48px", flexWrap: "wrap", textAlign: "center" }}>
          {[
            { v: "52", l: "indexed passages" },
            { v: "45", l: "development eval cases" },
            { v: "3", l: "responsible outcomes" },
          ].map((s) => (
            <div key={s.l}>
              <div className="text-heading-md">{s.v}</div>
              <div className="text-caption" style={{ color: "var(--stone)" }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="case-study" className="case-study-section">
        <div className="shell">
          <SectionHeader
            label="The case study"
            heading="What I built — and why it matters."
            subtitle="I built Provenance to demonstrate how an AI support workflow can automate routine questions without hiding evidence, uncertainty, or human oversight."
          />
          <div className="grid-4">
            {PROJECT_SUMMARY.map((item, index) => (
              <article className="case-study-card" key={item.title}>
                <span className="case-study-index">0{index + 1}</span>
                <h3 className="text-subtitle-lg">{item.title}</h3>
                <p className="text-body-sm" style={{ color: "var(--steel)", marginTop: "8px" }}>{item.note}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 60-second demo */}
      <section>
        <div className="shell">
          <SectionHeader
            label="The 60-second demo"
            heading="One inbox. Three responsible outcomes."
            subtitle="Open the guided inbox to see how the same workflow can answer, escalate, or block based on the evidence available — live, not scripted."
          />
          <div className="grid-3">
            {GUIDED_SCENARIOS.map((s, i) => (
              <Link key={s.id} href="/demo" className="radio-option" style={{ display: "block" }}>
                <div className="text-body-sm-bold">
                  {String(i + 1).padStart(2, "0")} &nbsp; {s.label}
                </div>
                <p className="text-body-sm" style={{ color: "var(--steel)", marginTop: "6px" }}>
                  {s.question}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ background: "var(--surface-soft)" }}>
        <div className="shell">
          <SectionHeader
            label="How it works"
            heading="From policy update to accountable action."
            subtitle="The system automates the safe portion of support work and preserves human review where business judgment is required."
          />
          <div className="flow-row">
            {WORKFLOW.slice(0, 4).map((w, i) => (
              <Fragment key={w.n}>
                {i > 0 && <FlowArrow />}
                <div className="flow-card">
                  <span className="flow-num">{i + 1}</span>
                  <div className="flow-title">{w.title}</div>
                  <p className="flow-note">{w.note}</p>
                </div>
              </Fragment>
            ))}
          </div>
          <div className="flow-connector">
            <div className="v-right" />
            <div className="h-line" />
            <div className="v-left" />
            <svg className="arrowhead" width="12" height="8" viewBox="0 0 12 8" fill="none" aria-hidden="true">
              <path d="M1 1l5 5 5-5" stroke="var(--hairline)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="flow-row">
            {WORKFLOW.slice(4).map((w, i) => {
              const isLast = i === WORKFLOW.slice(4).length - 1;
              return (
                <Fragment key={w.n}>
                  {i > 0 && <FlowArrow />}
                  <div className="flow-card" style={isLast ? { background: "var(--primary-soft)", borderColor: "#c7d3fb" } : undefined}>
                    <span className="flow-num" style={isLast ? { background: "var(--primary)" } : undefined}>
                      {i + 5}
                    </span>
                    <div className="flow-title">{w.title}</div>
                    <p className="flow-note">{w.note}</p>
                  </div>
                </Fragment>
              );
            })}
          </div>
        </div>
      </section>

      {/* Promises */}
      <section>
        <div className="shell grid-4">
          {PROMISES.map((p) => (
            <div className="card-icon-feature" key={p.title}>
              <div className="text-subtitle-lg">{p.title}</div>
              <p className="text-body-sm" style={{ color: "var(--steel)", marginTop: "8px" }}>
                {p.note}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ paddingTop: 0 }}>
        <div className="shell">
          <SectionHeader
            label="Built with"
            heading="The system behind the interface."
            subtitle="Each technology has a defined job across product delivery, retrieval, verification, operational handoff, and quality control."
          />
          <div className="stack-grid">
            {STACK.map((item) => (
              <article className="stack-row" key={item.area}>
                <span className="text-caption-bold" style={{ color: "var(--primary-deep)" }}>{item.area}</span>
                <p className="text-body-sm" style={{ color: "var(--charcoal)" }}>{item.tech}</p>
              </article>
            ))}
          </div>
          <p className="text-caption stack-note">
            Uploaded knowledge is isolated to an anonymous browser workspace and expires after 30 minutes. Service-role credentials remain server-only.
          </p>
        </div>
      </section>

      {/* Business impact calculator */}
      <section style={{ paddingTop: 0 }}>
        <div className="shell">
          <SectionHeader
            label="Illustrative business case"
            heading="Measure time saved without hiding the tradeoffs."
            subtitle="Adjust the assumptions for your own operation. These are not measured customer results — this demonstrates the calculation."
          />
          <BusinessImpactCalculator />
        </div>
      </section>

      {/* Reliability evidence — bento stat grid */}
      <section>
        <div className="shell">
          <SectionHeader
            label="Reliability evidence"
            heading="A scorecard, published as-is."
            subtitle="45 development-set cases test routine answers, unsupported questions, adversarial prompts, and workspace knowledge against the same pipeline the demo runs."
          />
          <div className="grid-4">
            <div className="stat-tile stat-tile-blue">
              <span className="stat-value">45/45</span>
              <span className="stat-label">Development-set cases passing</span>
            </div>
            <div className="stat-tile stat-tile-dark">
              <span className="stat-value">0%</span>
              <span className="stat-label">False refusal rate</span>
            </div>
            <div className="stat-tile stat-tile-pink">
              <span className="stat-value">0%</span>
              <span className="stat-label">Fabrication rate</span>
            </div>
            <div className="stat-tile stat-tile-white">
              <span className="stat-value">3</span>
              <span className="stat-label" style={{ color: "var(--steel)" }}>Test buckets: answerable, unanswerable, adversarial</span>
            </div>
          </div>
          <div className="grid-split" style={{ marginTop: "16px" }}>
            <div className="card-feature">
              <table className="specs-table">
                <thead>
                  <tr>
                    <th>Test group</th>
                    <th>Cases</th>
                    <th>Accuracy</th>
                    <th>Fabrication</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Answerable</td>
                    <td>22</td>
                    <td>100.0%</td>
                    <td>0.0%</td>
                  </tr>
                  <tr>
                    <td>Unanswerable</td>
                    <td>14</td>
                    <td>100.0%</td>
                    <td>0.0%</td>
                  </tr>
                  <tr>
                    <td>Adversarial</td>
                    <td>9</td>
                    <td>100.0%</td>
                    <td>0.0%</td>
                  </tr>
                  <tr>
                    <td>Overall</td>
                    <td>45</td>
                    <td>100.0%</td>
                    <td>0.0%</td>
                  </tr>
                </tbody>
              </table>
              <p className="text-caption" style={{ color: "var(--steel)", marginTop: "18px" }}>
                Live scorecard from <Link href="/evals" style={{ textDecoration: "underline" }}>the committed eval suite</Link> — shown
                transparently, not reframed as production performance.
              </p>
            </div>
            <div className="card-feature" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <Badge variant="warning">Known limitation</Badge>
                <h3 className="text-heading-sm" style={{ marginTop: "14px" }}>
                  A clean scorecard is a dev-set number, not held-out proof.
                </h3>
                <p className="text-body-sm" style={{ color: "var(--charcoal)", marginTop: "10px" }}>
                  This 45-case set was iterated against directly — two real fabrication bugs were found and fixed
                  during development. A perfect score on the set used to find and fix those bugs isn&apos;t evidence
                  the fix generalizes.
                </p>
              </div>
              <ul style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid var(--hairline)", listStyle: "none", padding: "16px 0 0", display: "grid", gap: "6px" }}>
                <li className="text-caption" style={{ color: "var(--charcoal)" }}>Next: build a held-out eval set never tuned against</li>
                <li className="text-caption" style={{ color: "var(--charcoal)" }}>Next: calibrate thresholds on that set, not this one</li>
                <li className="text-caption" style={{ color: "var(--charcoal)" }}>Until then: treat auto-send as demo-grade, not production-grade</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="decisions" style={{ background: "var(--surface-soft)" }}>
        <div className="shell decision-layout">
          <div className="decision-intro">
            <span className="section-label"><i className="dot" aria-hidden="true" />Engineering decisions</span>
            <h2 className="text-heading-lg" style={{ marginTop: "18px" }}>The hard part is deciding when the system should act.</h2>
            <p className="text-body-md" style={{ color: "var(--steel)", marginTop: "14px" }}>
              The implementation is designed around evidence, failure modes, and accountable handoff — not just answer generation.
            </p>
            <Link href="/architecture" className="text-body-sm-bold inline-link">Read the architecture walkthrough →</Link>
          </div>
          <div>
            {ENGINEERING_DECISIONS.map((item, index) => (
              <details className="accordion-item" key={item.title} open={index === 0}>
                <summary>
                  <span className="text-body-md-bold">{item.title}</span>
                  <span className="chevron" aria-hidden="true">⌄</span>
                </summary>
                <p className="answer">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* What was built — dark mega-card */}
      <section>
        <div className="shell">
          <div className="card-promo">
            <div style={{ textAlign: "center", maxWidth: "580px", margin: "0 auto 36px" }}>
              <span className="section-label" style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.75)" }}>
                <i className="dot" aria-hidden="true" style={{ background: "var(--accent-pink)" }} />
                What was built
              </span>
              <h2 className="text-heading-lg" style={{ marginTop: "18px", color: "#fff" }}>
                More than a chat box over documents.
              </h2>
              <p className="text-body-md" style={{ color: "rgba(255,255,255,0.65)", marginTop: "14px" }}>
                A portfolio case study covering the full decision path: controlled knowledge, retrieval, generation,
                verification, routing, live handoff, and measurement.
              </p>
            </div>
            <div className="grid-4">
              {ARCHITECTURE_TEASER.map((a, i) => (
                <div
                  key={a.title}
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "var(--r-lg)",
                    padding: "22px",
                    // The 5th card (Slack) spans the full row — it's the newest,
                    // most differentiating capability, not just another tile in
                    // a fixed 4-column grid it would otherwise wrap awkwardly into.
                    ...(i === 4 ? { gridColumn: "1 / -1" } : {}),
                  }}
                >
                  <div style={{ marginBottom: "18px" }}>{a.icon}</div>
                  <span className="text-caption" style={{ color: "rgba(255,255,255,0.4)" }}>
                    SYSTEM / 0{i + 1}
                  </span>
                  <div className="text-heading-sm" style={{ fontSize: "18px", marginTop: "10px", color: "#fff" }}>
                    {a.title}
                  </div>
                  <p className="text-body-sm" style={{ color: "rgba(255,255,255,0.6)", marginTop: "8px" }}>
                    {a.note}
                  </p>
                </div>
              ))}
            </div>
            <p style={{ marginTop: "28px", textAlign: "center" }}>
              <Link href="/architecture" className="text-body-sm-bold" style={{ textDecoration: "underline", color: "#fff" }}>
                Read the full architecture walkthrough →
              </Link>
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="shell learning-panel">
          <div>
            <span className="section-label"><i className="dot" aria-hidden="true" />What I learned</span>
            <h2 className="text-heading-lg" style={{ marginTop: "18px" }}>
              Producing an answer is easy. Earning permission to act is harder.
            </h2>
          </div>
          <div>
            <p className="text-body-md" style={{ color: "var(--charcoal)" }}>
              Building Provenance changed how I think about AI automation: retrieval quality does not guarantee a grounded answer, and a refusal or escalation can be the most responsible successful outcome.
            </p>
            <ul className="learning-list">
              <li>Test business risk and near-misses, not only typical questions.</li>
              <li>Verify individual claims instead of trusting an overall confident response.</li>
              <li>Publish limitations so operators understand where human judgment remains essential.</li>
            </ul>
            <p className="text-body-sm learning-next">
              <strong>Next:</strong> build a held-out evaluation set and calibrate routing thresholds using cases the system has never been tuned against.
            </p>
          </div>
        </div>
      </section>

      <section id="contact">
        <div className="shell recruiter-cta">
          <div>
            <span className="section-label recruiter-label"><i className="dot" aria-hidden="true" />The builder behind Provenance</span>
            <h2 className="text-heading-lg" style={{ color: "#fff", marginTop: "18px" }}>Interested in the person behind the product?</h2>
            <p className="text-body-md" style={{ color: "rgba(255,255,255,0.7)", marginTop: "12px", maxWidth: "650px" }}>
              I&apos;m Ariel Magalso, a web developer and AI automation specialist building reliable workflows that connect AI models, business data, and human operations.
            </p>
          </div>
          <div className="recruiter-actions">
            <Button asChild variant="secondary">
              <a href="https://arielmagalso.com" target="_blank" rel="noopener noreferrer">View Ariel&apos;s portfolio ↗</a>
            </Button>
            <Button asChild variant="ink-outline" className="recruiter-outline">
              <a href="https://github.com/ArielMagalsoDev/provenance" target="_blank" rel="noopener noreferrer">Source code ↗</a>
            </Button>
            <Button asChild variant="ink-outline" className="recruiter-outline">
              <a href="https://www.linkedin.com/in/magalsoariel" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>
            </Button>
            <Button asChild variant="ink-outline" className="recruiter-outline">
              <a href="mailto:hello@arielmagalso.com">Contact Ariel</a>
            </Button>
            <Link href="/demo" className="text-body-sm-bold recruiter-demo-link">Replay the demo →</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
