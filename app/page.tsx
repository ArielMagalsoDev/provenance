import type { Metadata } from "next";
import Link from "next/link";
import { GUIDED_SCENARIOS } from "@/lib/scenarios";
import { CountUp } from "./components/CountUp";
import { OutcomeMark } from "./components/Editorial";
import { Reveal } from "./components/Reveal";

export const metadata: Metadata = {
  title: "Ariel Magalso — Product designer + AI engineer",
  description:
    "A recruiter-first case study of Provenance, an accountable AI support product designed and built end to end by Ariel Magalso.",
};

const CAPABILITIES = [
  "Product design",
  "Frontend engineering",
  "Full-stack AI",
  "Retrieval + verification",
  "Evaluation systems",
  "Human-in-the-loop ops",
];

const OWNERSHIP = [
  { code: "PD", title: "Product framing + interaction design", copy: "Defined the product problem, responsible outcomes, recruiter journey, and end-to-end interaction model." },
  { code: "FE", title: "Frontend system + responsive implementation", copy: "Built the interface, responsive component system, live workflow, and accessible review states." },
  { code: "AI", title: "Retrieval + claim verification", copy: "Implemented evidence retrieval, atomic claim checks, thresholds, and answer-review-block routing." },
  { code: "QA", title: "Evaluation, documentation + deployment", copy: "Created the committed evaluation suite, documented the architecture, and deployed the working product." },
] as const;

const PROOF_POINTS = [
  [45, "/45", "Development cases passing"],
  [52, "", "Indexed policy passages"],
  [100, "%", "Route accuracy"],
] as const;

const SERVICES = [
  {
    number: "01",
    title: "Retrieve with boundaries",
    copy: "Every question is matched against an approved policy corpus before the system is allowed to draft.",
    tags: ["Postgres", "pgvector", "Stable source IDs"],
  },
  {
    number: "02",
    title: "Verify every claim",
    copy: "Generated answers are decomposed into atomic claims and checked against the retrieved evidence.",
    tags: ["Entailment scoring", "Per-claim floor", "Groundedness gate"],
  },
  {
    number: "03",
    title: "Route responsibly",
    copy: "The workflow answers, escalates, or blocks. Refusal is treated as a successful product outcome.",
    tags: ["Pre-screening", "Human review", "Safe refusal"],
  },
  {
    number: "04",
    title: "Leave an audit trail",
    copy: "Every stage persists a reviewable event so operators can understand why the system made its decision.",
    tags: ["Audit events", "Operator inbox", "Slack handoff"],
  },
] as const;

const EVIDENCE = [
  ["01", "Policy corpus", "52 approved passages with stable identifiers", "/corpus"],
  ["02", "System architecture", "Eight inspectable stages from screen to route", "/architecture"],
  ["03", "Evaluation suite", "45 committed cases covering answer, review, and block", "/evals"],
  ["04", "Human handoff", "A working inbox for judgment that should stay human", "/inbox"],
] as const;

const FAQ_ITEMS = [
  ["What did Ariel build personally?", "The product concept, interface, retrieval layer, claim verification, audit workflow, evaluation suite, deployment, and documentation."],
  ["Is the demo connected to customer data?", "No. It uses a fictional workspace and a committed policy corpus. No customer data is used."],
  ["What is simulated?", "The pipeline runs live, but sending the final response to a real customer is simulated."],
  ["What would production require?", "A held-out evaluation set, threshold calibration, authenticated tenancy, durable connector permissions, and production observability."],
] as const;

function ArrowIcon() {
  return (
    <span className="ah-arrow-icon" aria-hidden="true">
      <svg viewBox="0 0 16 16">
        <path d="M4.5 11.5 11.5 4.5M6 4.5h5.5V10" />
      </svg>
    </span>
  );
}

function InlineInfographic({ variant }: { variant: "verify" | "route" | "evidence" | "handoff" }) {
  if (variant === "verify") {
    return (
      <svg viewBox="0 0 112 64" aria-hidden="true">
        <circle className="ah-info-ring" cx="56" cy="32" r="23" />
        <circle className="ah-info-accent-fill" cx="56" cy="32" r="18" />
        <path className="ah-info-shield" d="M56 19 68 24v9c0 8-5 13-12 16-7-3-12-8-12-16v-9z" />
        <path className="ah-info-check ah-info-check-light" d="m50 33 4 4 9-10" />
        <circle className="ah-info-dot" cx="26" cy="32" r="3" />
        <circle className="ah-info-dot" cx="86" cy="32" r="3" />
        <path className="ah-info-line" d="M29 32h8m38 0h8" />
      </svg>
    );
  }

  if (variant === "route") {
    return (
      <svg viewBox="0 0 112 64" aria-hidden="true">
        <circle className="ah-info-core" cx="25" cy="32" r="9" />
        <path className="ah-info-route-line" d="M34 32h17c9 0 8-16 17-16h10M51 32h27M51 32c9 0 8 16 17 16h10" />
        <path className="ah-info-route-arrow" d="m76 12 5 4-5 4M76 28l5 4-5 4M76 44l5 4-5 4" />
        <circle className="ah-info-accent-fill" cx="89" cy="16" r="6" />
        <circle className="ah-info-node" cx="89" cy="32" r="6" />
        <circle className="ah-info-node" cx="89" cy="48" r="6" />
        <path className="ah-info-check" d="m21 32 3 3 6-7" />
      </svg>
    );
  }

  if (variant === "handoff") {
    return (
      <svg viewBox="0 0 112 64" aria-hidden="true">
        <rect className="ah-info-inbox" x="12" y="13" width="46" height="38" rx="7" />
        <path className="ah-info-inbox-line" d="M20 23h28M20 31h20M20 39h13" />
        <circle className="ah-info-accent-fill" cx="51" cy="19" r="7" />
        <path className="ah-info-route-line" d="M61 32h10" />
        <path className="ah-info-route-arrow" d="m68 28 5 4-5 4" />
        <circle className="ah-info-person-head" cx="88" cy="23" r="8" />
        <path className="ah-info-person-body" d="M74 49c1-11 6-17 14-17s13 6 14 17" />
        <path className="ah-info-check" d="m84 23 3 3 6-7" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 112 64" aria-hidden="true">
      <ellipse className="ah-info-source" cx="25" cy="22" rx="12" ry="5" />
      <path className="ah-info-source" d="M13 22v17c0 3 5 5 12 5s12-2 12-5V22M13 30c0 3 5 5 12 5s12-2 12-5" />
      <path className="ah-info-route-line" d="M39 32h12" />
      <path className="ah-info-route-arrow" d="m48 28 5 4-5 4" />
      <path className="ah-info-document" d="M57 12h31l11 11v29H57z" />
      <path className="ah-info-fold" d="M88 12v11h11" />
      <path className="ah-info-document-line" d="M66 29h22M66 36h18M66 43h12" />
      <circle className="ah-info-accent-fill" cx="91" cy="44" r="9" />
      <path className="ah-info-check ah-info-check-light" d="m87 44 3 3 5-6" />
    </svg>
  );
}

function FastPathIcon({ variant }: { variant: "ask" | "verify" | "route" }) {
  if (variant === "ask") {
    return (
      <svg className="ah-fast-path-icon" viewBox="0 0 56 56" aria-hidden="true">
        <path className="ah-fast-icon-panel" d="M10 11h36v27H27l-9 7v-7h-8z" />
        <path className="ah-fast-icon-line" d="M18 20h20M18 27h13" />
        <circle className="ah-fast-icon-accent" cx="40" cy="36" r="7" />
        <path className="ah-fast-icon-check" d="m37 36 2 2 4-5" />
      </svg>
    );
  }

  if (variant === "verify") {
    return (
      <svg className="ah-fast-path-icon" viewBox="0 0 56 56" aria-hidden="true">
        <circle className="ah-fast-icon-orbit" cx="28" cy="28" r="20" />
        <path className="ah-fast-icon-shield" d="M28 13 40 18v10c0 8-5 13-12 16-7-3-12-8-12-16V18z" />
        <path className="ah-fast-icon-check" d="m22 28 4 4 9-10" />
        <circle className="ah-fast-icon-accent" cx="43" cy="15" r="5" />
      </svg>
    );
  }

  return (
    <svg className="ah-fast-path-icon" viewBox="0 0 56 56" aria-hidden="true">
      <circle className="ah-fast-icon-source" cx="12" cy="28" r="6" />
      <path className="ah-fast-icon-branch" d="M18 28h8c7 0 6-14 13-14h4M26 28h17M26 28c7 0 6 14 13 14h4" />
      <circle className="ah-fast-icon-accent" cx="46" cy="14" r="6" />
      <circle className="ah-fast-icon-node" cx="46" cy="28" r="6" />
      <circle className="ah-fast-icon-node" cx="46" cy="42" r="6" />
    </svg>
  );
}

function OwnershipIcon({ variant }: { variant: (typeof OWNERSHIP)[number]["code"] }) {
  if (variant === "PD") return (
    <svg viewBox="0 0 72 72" aria-hidden="true">
      <rect x="10" y="12" width="45" height="39" rx="6" />
      <path d="M10 23h45M21 12v39M27 31h19M27 38h13" />
      <path className="accent" d="m45 43 15 5-7 3-3 7z" />
    </svg>
  );
  if (variant === "FE") return (
    <svg viewBox="0 0 72 72" aria-hidden="true">
      <rect x="8" y="13" width="45" height="34" rx="6" />
      <rect x="47" y="29" width="17" height="29" rx="4" />
      <path d="M15 22h8M27 22h5M16 31l5 5-5 5M35 41h8" />
      <path className="accent" d="M53 35h5M53 41h5M53 47h5" />
    </svg>
  );
  if (variant === "AI") return (
    <svg viewBox="0 0 72 72" aria-hidden="true">
      <circle cx="16" cy="36" r="7" /><circle cx="55" cy="18" r="7" /><circle cx="55" cy="36" r="7" /><circle cx="55" cy="54" r="7" />
      <path d="M23 36h11c8 0 7-18 14-18M34 36h14M34 36c8 0 7 18 14 18" />
      <path className="accent" d="m12 36 3 3 6-7M52 18h6" />
    </svg>
  );
  return (
    <svg viewBox="0 0 72 72" aria-hidden="true">
      <rect x="10" y="9" width="39" height="51" rx="6" />
      <path d="M20 22h20M20 33h20M20 44h12" />
      <circle className="accent-fill" cx="51" cy="48" r="13" />
      <path className="check" d="m45 48 4 4 8-10" />
    </svg>
  );
}

function RouteInfographic({ outcome, index }: { outcome: string; index: number }) {
  const result = outcome === "approved"
    ? { label: "Answer", detail: "Citations attached", mark: "✓" }
    : outcome === "human_review"
      ? { label: "Review", detail: "Operator judgment", mark: "!" }
      : { label: "Block", detail: "Stopped safely", mark: "×" };

  return (
    <div className={`ah-route-visual ah-route-${outcome}`} aria-hidden="true">
      <div className="ah-route-dashboard-head"><span>Decision path</span><strong>0{index + 1} / 03</strong></div>
      <div className="ah-route-track">
        <div className="ah-route-node"><span className="ah-route-glyph">?</span><strong>Question</strong><small>Intent screened</small></div>
        <i className="ah-route-connector"><b /></i>
        <div className="ah-route-node"><span className="ah-route-glyph ah-route-source"><i /><i /><i /></span><strong>Evidence</strong><small>Source matched</small></div>
        <i className="ah-route-connector"><b /></i>
        <div className="ah-route-node ah-route-result"><span className="ah-route-glyph">{result.mark}</span><strong>{result.label}</strong><small>{result.detail}</small></div>
      </div>
      <div className="ah-route-dashboard-foot"><span><i /> Evidence visible</span><small>route / 0{index + 1}</small></div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="provenance-agero-home">
      <section id="overview" className="ah-hero">
        <div className="ah-shell">
          <Reveal className="ah-trust-row">
            <span className="ah-availability-dot" aria-hidden="true" />
            <span>Ariel Magalso · Manila, Philippines · Open to new roles</span>
          </Reveal>

          <Reveal delay={0.05} className="ah-hero-lockup">
            <h1>
              <span>Product designer <span className="ah-inline-visual ah-inline-evidence"><InlineInfographic variant="verify" /></span></span>
              <span className="ah-muted">+ AI engineer <span className="ah-inline-visual ah-inline-route"><InlineInfographic variant="route" /></span></span>
              <span>building proof <span className="ah-inline-visual ah-inline-score"><InlineInfographic variant="evidence" /></span></span>
            </h1>
          </Reveal>

          <Reveal delay={0.1} className="ah-hero-copy">
            <p>I design and build accountable AI products from product framing to production workflow. Provenance is the working proof.</p>
            <div className="ah-hero-actions">
              <a className="ah-pill ah-pill-dark" href="mailto:ariel.r.magalso@gmail.com">Contact Ariel <ArrowIcon /></a>
              <Link className="ah-pill ah-pill-light" href="#work">View the case study <ArrowIcon /></Link>
            </div>
            <div className="ah-hero-meta"><a href="https://arielmagalso.com" target="_blank" rel="noopener noreferrer">Portfolio</a><a href="https://github.com/ArielMagalsoDev/provenance" target="_blank" rel="noopener noreferrer">GitHub</a><a href="https://www.linkedin.com/in/magalsoariel" target="_blank" rel="noopener noreferrer">LinkedIn</a></div>
          </Reveal>
        </div>
      </section>

      <section className="ah-marquee" aria-label="Capabilities">
        <div className="ah-marquee-track">
          {[...CAPABILITIES, ...CAPABILITIES].map((item, index) => <span key={`${item}-${index}`}>{item}<i /></span>)}
        </div>
      </section>

      <section id="ownership" className="ah-manifesto">
        <div className="ah-shell">
          <p className="ah-parenthetical">( What I owned )</p>
          <Reveal>
            <p className="ah-statement">I took Provenance from product framing to a deployed, inspectable AI workflow.</p>
          </Reveal>
          <div className="ah-capability-list">
            {OWNERSHIP.map((item, index) => (
              <div className="ah-capability-item" key={item.code}>
                <div className="ah-capability-top"><span>0{index + 1}</span><i className="ah-capability-icon"><OwnershipIcon variant={item.code} /></i></div>
                <strong>{item.title}</strong>
                <p>{item.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="work" className="ah-proof-section">
        <div className="ah-shell">
          <div className="ah-section-heading">
            <div><p className="ah-parenthetical">( Committed evidence )</p><h2>Proof, not promises</h2></div>
            <p>Every number below is reproducible from the repository and every outcome can be inspected in the live workflow.</p>
          </div>

          <div className="ah-proof-grid">
            <div className="ah-stat-stack">
              {PROOF_POINTS.map(([value, suffix, label]) => (
                <Reveal className="ah-stat" key={label}>
                  <strong><CountUp value={value} suffix={suffix} /></strong>
                  <span>{label}</span>
                </Reveal>
              ))}
            </div>
            <Reveal delay={0.08} className="ah-quote-card">
              <span className="ah-quote-index">01 / 01</span>
              <blockquote>“Every committed case reached the correct route — answer, review, or block.”</blockquote>
              <div><strong>Provenance evaluation suite</strong><span>Committed project evidence</span></div>
              <Link href="/evals" aria-label="Open evaluation evidence"><ArrowIcon /></Link>
            </Reveal>
          </div>
        </div>
      </section>

      <section id="case-study" className="ah-work-section">
        <div className="ah-shell">
          <div className="ah-section-heading ah-section-heading-light">
            <div><p className="ah-parenthetical">( Live product )</p><h2>Three responsible outcomes</h2></div>
            <p>One evidence pipeline handles a routine answer, an unsupported request, and an adversarial instruction.</p>
          </div>

          <div className="ah-work-list">
            {GUIDED_SCENARIOS.map((scenario, index) => (
              <Reveal key={scenario.id} className="ah-work-card">
                <div className="ah-work-copy">
                  <span className="ah-work-number">0{index + 1} / 03</span>
                  <OutcomeMark outcome={scenario.expectedOutcome} compact />
                  <h3>{scenario.label}</h3>
                  <p>{scenario.question.replace("Meridian Nine", "the workspace")}</p>
                  <Link className="ah-text-link" href="/demo">Run this scenario <ArrowIcon /></Link>
                </div>
                <RouteInfographic outcome={scenario.expectedOutcome} index={index} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="engineering" className="ah-services-section">
        <div className="ah-shell">
          <div className="ah-section-heading">
            <div><p className="ah-parenthetical">( What it does )</p><h2>Built to know its limits</h2></div>
            <Link className="ah-pill ah-pill-light" href="/architecture">Read the architecture <ArrowIcon /></Link>
          </div>

          <div className="ah-service-layout">
            <div className="ah-service-list">
              {SERVICES.map((service) => (
                <Reveal className="ah-service-row" key={service.number}>
                  <span>{service.number}</span>
                  <div><h3>{service.title}</h3><p>{service.copy}</p><ul>{service.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul></div>
                </Reveal>
              ))}
            </div>
            <div className="ah-process-art" aria-label="Pipeline process illustrations">
              <div className="ah-process-art-header">
                <div><span>Completed run</span><strong>One answer, fully inspectable</strong></div>
                <i aria-hidden="true" />
                <small>run_7F2A</small>
              </div>
              <div className="ah-proof-packet">
                <div className="ah-proof-question">
                  <span>Incoming question</span>
                  <p>Does a Dedicated Desk membership include after-hours access?</p>
                </div>
                <div className="ah-proof-signal" aria-label="Run status">
                  <span><i /> screened</span><b>→</b><span><i /> grounded</span><b>→</b><span><i /> approved</span>
                </div>
                <div className="ah-proof-evidence-card">
                  <div className="ah-proof-document" aria-hidden="true"><i /><i /><i /><i /></div>
                  <div><span>Top source match</span><strong>PRICING-03</strong><small>Approved policy · similarity 0.91</small></div>
                  <em>52 passages searched</em>
                </div>
                <div className="ah-proof-result-grid">
                  <div className="ah-proof-score"><span>Groundedness</span><strong>0.96</strong><small>Above 0.70 threshold</small></div>
                  <div className="ah-proof-route"><span>Final route</span><strong>Answer</strong><small>3 citations attached</small></div>
                </div>
                <div className="ah-proof-audit"><span>✓ Evidence visible at every decision</span><small>audit/7F2A.json</small></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="about-ariel" className="ah-builder-section">
        <div className="ah-shell">
          <div className="ah-section-heading">
            <div><p className="ah-parenthetical">( The builder )</p><h2>Meet Ariel</h2></div>
          </div>
          <div className="ah-builder-grid">
            <Reveal className="ah-builder-portrait">
              <div className="ah-builder-card-top"><span>ARIEL MAGALSO</span><i>AVAILABLE · 2026</i></div>
              <div className="ah-builder-identity">
                <div className="ah-builder-avatar" aria-hidden="true"><span>AM</span><i /></div>
                <p>Designing AI products that can explain themselves.</p>
                <small>Manila, Philippines · UTC+8</small>
              </div>
              <div className="ah-builder-metrics" aria-label="Project proof points">
                <div><strong>01</strong><span>End-to-end<br />product</span></div>
                <div><strong>45</strong><span>Committed<br />eval cases</span></div>
                <div><strong>08</strong><span>Inspectible<br />stages</span></div>
              </div>
              <div className="ah-builder-disciplines"><span>Product design</span><span>Full-stack AI</span><span>Responsible systems</span></div>
              <div className="ah-builder-signal" aria-hidden="true"><i /><i /><i /><i /><i /></div>
            </Reveal>
            <Reveal delay={0.08} className="ah-builder-copy">
              <p className="ah-builder-role">Product designer + AI engineer</p>
              <h3>One accountable builder, from product framing to production workflow.</h3>
              <p>Ariel designed and built the interface, retrieval pipeline, verification gates, evaluation suite, and human-review handoff behind Provenance.</p>
              <div className="ah-builder-links">
                <a href="https://arielmagalso.com" target="_blank" rel="noopener noreferrer">Portfolio <ArrowIcon /></a>
                <a href="https://github.com/ArielMagalsoDev/provenance" target="_blank" rel="noopener noreferrer">Source <ArrowIcon /></a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section id="evidence" className="ah-evidence-section">
        <div className="ah-shell">
          <div className="ah-section-heading">
            <div><p className="ah-parenthetical">( Project archive )</p><h2>Evidence, organized</h2></div>
            <p>Open the artifacts behind the product—from approved knowledge to the human-review handoff.</p>
          </div>
          <div className="ah-evidence-list">
            {EVIDENCE.map(([number, title, copy, href], index) => (
              <Link href={href} className="ah-evidence-row" key={number}>
                <span className="ah-evidence-number">{number}</span>
                <span className="ah-evidence-icon" aria-hidden="true"><InlineInfographic variant={index === 0 ? "evidence" : index === 1 ? "route" : index === 2 ? "verify" : "handoff"} /></span>
                <span className="ah-evidence-copy"><strong>{title}</strong><p>{copy}</p></span>
                <span className="ah-evidence-meta">{["52 passages", "8 stages", "45 cases", "Live queue"][index]}</span>
                <ArrowIcon />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="ah-review-section">
        <div className="ah-shell">
          <div className="ah-section-heading">
            <div><p className="ah-parenthetical">( Choose your depth )</p><h2>Review the project your way</h2></div>
          </div>
          <div className="ah-review-grid">
            <Reveal className="ah-review-card">
              <div className="ah-review-card-top"><span>Fast path</span><strong>01 / 02</strong></div>
              <div className="ah-review-visual ah-review-visual-fast" aria-hidden="true">
                <i><span>01</span><FastPathIcon variant="ask" /><small>Ask</small></i><b>→</b>
                <i><span>02</span><FastPathIcon variant="verify" /><small>Verify</small></i><b>→</b>
                <i><span>03</span><FastPathIcon variant="route" /><small>Route</small></i>
              </div>
              <div className="ah-review-card-copy"><h3>90-second tour</h3><p>Run a scenario, watch the evidence gate, and inspect the final route.</p>
                <ul><li>Live workflow</li><li>Visible citations</li><li>Three outcomes</li></ul>
                <Link className="ah-pill ah-pill-dark" href="/demo">Start the tour <ArrowIcon /></Link></div>
            </Reveal>
            <Reveal delay={0.08} className="ah-review-card ah-review-card-accent">
              <div className="ah-review-card-top"><span>Deep path</span><strong>02 / 02</strong></div>
              <div className="ah-review-visual ah-review-visual-deep" aria-hidden="true"><i>Architecture</i><i>Evaluations</i><i>Corpus</i><i>Source</i></div>
              <div className="ah-review-card-copy"><h3>Full system review</h3><p>Open the architecture, committed results, policy corpus, and source.</p>
                <ul><li>Eight stages</li><li>45 evaluation cases</li><li>Full audit model</li></ul>
                <Link className="ah-pill ah-pill-light" href="/architecture">Read the system <ArrowIcon /></Link></div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="ah-faq-section">
        <div className="ah-shell ah-faq-grid">
          <div className="ah-faq-intro"><p className="ah-parenthetical">( Questions )</p><h2>Useful context, answered</h2><p>What to know before you open the source or run the live workflow.</p><div className="ah-faq-signal"><strong>04</strong><span>Direct answers<br />for reviewers</span><i>✓</i></div></div>
          <div className="ah-faq-list">
            {FAQ_ITEMS.map(([question, answer]) => (
              <details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>
            ))}
          </div>
        </div>
      </section>

      <section className="ah-contact-section">
        <div className="ah-shell">
          <Reveal className="ah-contact-card">
            <div className="ah-contact-copy">
              <p className="ah-parenthetical">( Let&apos;s connect )</p>
              <h2>Need a product designer who can ship the AI?</h2>
              <p>I bridge product framing, interface design, and full-stack AI engineering—then leave the system inspectable.</p>
              <div className="ah-contact-actions">
                <a className="ah-pill ah-pill-light" href="mailto:ariel.r.magalso@gmail.com">Contact Ariel <ArrowIcon /></a>
                <a className="ah-contact-text-link" href="/architecture">Review the build <ArrowIcon /></a>
              </div>
            </div>
            <div className="ah-contact-profile">
              <div className="ah-contact-status"><i aria-hidden="true" /><span>Available for new roles</span><small>2026</small></div>
              <div className="ah-contact-role-card">
                <small>Next role</small>
                <h3>Product design<br /><span>× AI engineering</span></h3>
                <p>For teams turning ambitious AI prototypes into trustworthy products.</p>
              </div>
              <div className="ah-contact-strengths" aria-label="Core strengths">
                <div><i aria-hidden="true">01</i><span>Product strategy<br />and interaction</span></div>
                <div><i aria-hidden="true">02</i><span>Full-stack AI<br />product delivery</span></div>
                <div><i aria-hidden="true">03</i><span>Evaluation and<br />responsible systems</span></div>
              </div>
              <div className="ah-contact-details">
                <div><small>Based in</small><strong>Manila, Philippines</strong></div>
                <div><small>Work setup</small><strong>Remote-friendly · UTC+8</strong></div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
