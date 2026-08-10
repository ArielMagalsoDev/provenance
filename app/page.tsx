import type { Metadata } from "next";
import Link from "next/link";
import { GUIDED_SCENARIOS } from "@/lib/scenarios";
import { Button } from "@/components/ui/button";
import { ButtonArrow } from "./components/ButtonArrow";
import { CountUp } from "./components/CountUp";
import { DottedArrows } from "./components/DottedArrows";
import { FramePanel } from "./components/FramePanel";
import { PixelBlocks } from "./components/PixelBlocks";
import { PROCESS_ART, StatsArt } from "./components/ProcessArt";
import { Reveal } from "./components/Reveal";
import { OutcomeMark, SectionIntro } from "./components/Editorial";

export const metadata: Metadata = {
  title: "Provenance — AI support automation case study by Ariel Magalso",
  description: "Provenance is an auditable AI support workflow designed and built by Ariel Magalso, with cited answers, claim verification, human review, and a live evaluation suite.",
};

const STACK_MARQUEE = ["Next.js 16", "React 19", "Postgres", "pgvector", "Claude Haiku", "Supabase", "Vercel", "TypeScript"];

const FRAMER_HERO_PIXEL_PATTERN = [
  true, false, true, true,
  false, true, false, false,
  true, false, false, false,
] as const;

const FRAMER_BOTTOM_PIXEL_PATTERN = [
  false, false, false, true,
  false, false, true, false,
  true, true, false, true,
] as const;

const ROUTE_SHORT = {
  approved: "Answered with citation",
  human_review: "Escalated to review",
  blocked: "Blocked pre-generation",
} as const;

const OUTCOME_LABEL = {
  approved: "A cited policy answer is safe to send.",
  human_review: "Evidence is insufficient, so judgment stays human.",
  blocked: "Unsafe instructions stop before retrieval and generation.",
} as const;

// The stages each route actually reaches. Screening runs before any expensive
// call, so a blocked ticket never touches retrieval or verification — those
// stages render as skipped rather than passed.
const PIPELINE_STAGES = ["Screen", "Retrieve", "Verify"] as const;

const STAGES_REACHED = {
  approved: 3,
  human_review: 3,
  blocked: 1,
} as const;

const SERVICES = [
  {
    label: "Retrieval",
    num: "01",
    description: "Every ticket is embedded and compared against 52 indexed policy passages with cosine similarity.",
    items: ["Postgres + pgvector", "gte-small embeddings", "Exact similarity scan", "Stable passage IDs"],
  },
  {
    label: "Claim verification",
    num: "02",
    description: "The drafted answer is decomposed into atomic claims and checked against retrieved evidence.",
    items: ["Batched entailment scoring", "Mean-score gate", "Per-claim floor", "Lexical sanity check"],
  },
  {
    label: "Responsible routing",
    num: "03",
    description: "Verified drafts become cited answers. Missing evidence goes to review. Unsafe input gets blocked.",
    items: ["Pre-generation screening", "Threshold routing", "Rate limiting", "Refusal as an outcome"],
  },
  {
    label: "Audit + handoff",
    num: "04",
    description: "Every stage writes a persisted event, and human-review tickets carry evidence into the inbox.",
    items: ["Full audit log", "Agent inbox", "Slack notifications", "Session-scoped teaching"],
  },
];

const PROCESS = [
  ["01", "Analyze & screen", "The ticket is classified and checked for manipulative or off-topic intent before anything costs money."],
  ["02", "Retrieve & plan", "Relevant policy passages return with similarity scores — the evidence the answer is allowed to use."],
  ["03", "Generate & verify", "A draft is written from evidence only, then decomposed into claims and checked one by one."],
  ["04", "Route & evolve", "The system answers, escalates, or blocks — and every run feeds the committed eval suite."],
] as const;

const COMPARISON = {
  other: [
    "Answers without citing a source",
    "Hides uncertainty behind confident wording",
    "No evaluation suite, just vibes",
    "Black-box decision, no audit trail",
    "Demo-only, no human-review path",
  ],
  us: [
    "Every claim traces to a cited passage",
    "Refusal is a first-class, visible outcome",
    "45 committed development-set cases",
    "Every stage logs a reviewable event",
    "Live inbox with approve, dismiss, teach",
  ],
};

const ROLES = [
  ["01", "Shape", "Product design", "PD"],
  ["02", "Build", "Frontend engineering", "FE"],
  ["03", "Ground", "Retrieval pipeline", "RP"],
  ["04", "Verify", "Claim verification", "CV"],
  ["05", "Measure", "Evaluation suite", "EV"],
  ["06", "Operate", "Human-in-the-loop ops", "HL"],
  ["07", "Explain", "Documentation", "DC"],
] as const;

const EVIDENCE_TIMELINE = [
  ["JUL 2026", "Policy corpus + coverage map committed", "Corpus →", "/corpus"],
  ["JUL 2026", "Retrieval + verification pipeline shipped", "Architecture →", "/architecture"],
  ["AUG 2026", "45/45 development-set suite passing", "Evals →", "/evals"],
  ["AUG 2026", "Verifier bug caught by the eval suite", "Architecture →", "/architecture"],
  ["AUG 2026", "Human-review inbox + Slack handoff shipped", "Inbox →", "/inbox"],
] as const;

const WHY_CHOOSE = [
  ["Evidence-bound", "Every answer cites a real passage — nothing is generated from nothing."],
  ["Refusal-safe", "Insufficient evidence routes to a person instead of a confident guess."],
  ["Fully audited", "Every pipeline stage writes an event you can inspect after the run."],
  ["Honestly evaluated", "A committed 45-case suite, limitations included, not hidden."],
] as const;

const FAQ_ITEMS = [
  ["What did Ariel build personally?", "The product concept, interface, Next.js routes, retrieval layer, claim verification, audit workflow, evaluation suite, deployment, and documentation."],
  ["Is the demo connected to real customer data?", "No. It uses a fictional workspace and committed policy corpus. No customer data is used."],
  ["What parts are simulated?", "The pipeline runs live, but sending a response to a real customer is simulated. Optional Slack operator notifications can be real when configured."],
  ["What would need to change before production?", "A held-out evaluation set, threshold calibration, authenticated tenancy, durable connector permissions, and production observability would be required."],
] as const;

export default function Home() {
  return (
    <main>
      <section id="overview" className="agero-hero">
        <div className="hero-blueprint" aria-hidden="true" />
        <PixelBlocks className="hero-pixel-tl" columns={4} pattern={[...FRAMER_HERO_PIXEL_PATTERN]} />
        <PixelBlocks className="hero-pixel-br" columns={4} pattern={[...FRAMER_BOTTOM_PIXEL_PATTERN]} />
        <div className="shell hero-shell">
          <div className="hero-frame">
            <Reveal className="hero-lockup">
              <h1 className="hero-logo-free-title"><span>We build</span> <strong>proof driven</strong></h1>
            </Reveal>
            <div className="hero-arrow-rail" aria-hidden="true"><DottedArrows /><DottedArrows /><DottedArrows /></div>
          </div>

          <Reveal delay={0.1} className="hero-copy-block">
            <p className="hero-sub">Provenance retrieves approved policy, verifies every generated claim, and knows when not to answer.</p>
            <div className="hero-actions">
              <Button asChild variant="ink-outline"><Link href="/#evidence">View the evidence</Link></Button>
              <Button asChild variant="ink"><Link href="/demo"><span className="hero-cta-icon" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></span>Run the live demo</Link></Button>
            </div>
            <p className="hero-trusted">Designed + built by Ariel Magalso · fictional workspace</p>
          </Reveal>
          </div>
      </section>

      <section aria-label="Built with" style={{ padding: "clamp(40px, 5vw, 64px) 0" }}>
        <div className="shell">
          <p className="label-mono" style={{ textAlign: "center", marginBottom: "20px" }}><span className="slash">//</span>Built with</p>
          <div className="static-row">
            {STACK_MARQUEE.map((item, i) => (
              <span className="marquee-item" key={i}><span className="marquee-dot" /><b>{item}</b></span>
            ))}
          </div>
        </div>
      </section>

      <section className="editorial-section">
        <div className="shell">
          <SectionIntro index="01" eyebrow="About this project" title="Great automation is more than answers, it's proof" />
          <Reveal delay={0.08}>
            <div className="stats-panel">
              <div className="stats-rows">
                <p>The results are committed to the repo. Each number is reproducible.</p>
                <div className="stat-row">
                  <span className="stat-icon-tile">45</span>
                  <div className="stat-row-body"><strong><CountUp value={45} suffix="/45" /></strong><span>Development-set cases passing</span></div>
                </div>
                <div className="stat-row">
                  <span className="stat-icon-tile">52</span>
                  <div className="stat-row-body"><strong><CountUp value={52} /></strong><span>Indexed policy passages</span></div>
                </div>
                <div className="stat-row">
                  <span className="stat-icon-tile">%</span>
                  <div className="stat-row-body"><strong><CountUp value={100} suffix="%" /></strong><span>Route accuracy across the committed dev set</span></div>
                </div>
              </div>
              <div className="stats-visual"><StatsArt /></div>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="engineering" className="editorial-section">
        <div className="shell">
          <SectionIntro index="02" eyebrow="Services" title="We build evidence-bound AI systems" />
          <div className="service-grid">
            {SERVICES.map((s, i) => (
              <Reveal key={s.label} className={`service-card${i === 0 ? " service-card-featured" : ""}`}>
                <span className="service-card-chip">{s.label}</span>
                <p className="service-desc">{s.description}</p>
                <span className="service-num-giant" aria-hidden="true">{s.num}</span>
                <ul>{s.items.map((item) => <li key={item}>{item}</li>)}</ul>
                {i === 0 && <Link className="service-arrow" href="/architecture" aria-label="Read the architecture">→</Link>}
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="editorial-section">
        <div className="shell">
          <Reveal>
            <p className="editorial-section-kicker" style={{ justifyContent: "center", display: "flex" }}><span /> <span>Our vision</span></p>
            <p className="vision-statement">
              Every answer we ship starts <span className="vision-chip" aria-hidden="true">0.96</span> with a deep understanding of evidence
            </p>
            <p className="vision-copy">Provenance is a solo AI-automation case study focused on verification, not just generation. The pipeline doesn&apos;t just look grounded — it proves it on every run.</p>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="case-panel" style={{ marginTop: "clamp(32px, 4vw, 48px)" }}>
              <div className="case-grid">
                <div className="case-overlay">
                  <h3>Routine pricing question, fully cited</h3>
                  <p>A Dedicated Desk pricing question retrieves the right passage, drafts an answer, and clears both groundedness gates before it&apos;s allowed to send.</p>
                </div>
                <div className="case-flow">
                  <p className="case-flow-question">Does a Dedicated Desk membership include after-hours access?</p>
                  <span className="case-flow-hop">matches</span>
                  <p className="case-flow-match">PRICING-03 <b>· 0.91 sim</b></p>
                  <span className="case-flow-hop">gates</span>
                  <div className="case-flow-gate"><strong>0.96</strong><span>passes → ships</span></div>
                </div>
              </div>
              <div className="case-metrics">
                <div><strong>0.96</strong><span>Mean groundedness</span></div>
                <div><strong>1 source</strong><span>Citation resolved</span></div>
                <div><strong>&lt;3s</strong><span>Pipeline latency</span></div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="process" className="editorial-section">
        <div className="shell">
          <SectionIntro index="04" eyebrow="Process" title="Combine retrieval with verification" copy={<p>Every stage is designed to narrow what the system is allowed to do.</p>} />
          <div className="process-stack">
            {PROCESS.map(([index, title, copy], i) => {
              const Art = PROCESS_ART[i];
              return (
                <Reveal key={index} className="process-card">
                  <div className="process-visual">
                    <Art />
                  </div>
                  <div className="process-card-foot">
                    <span>//{index}</span>
                    <div><h3>{title}</h3><p>{copy}</p></div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section aria-label="Verified auditable grounded" style={{ padding: "clamp(32px, 4vw, 48px) 0" }}>
        <div className="word-band" aria-hidden="true">
          <span className="word">VERIFIED</span>
          <DottedArrows />
          <span className="word">AUDITABLE</span>
          <DottedArrows />
          <span className="word">GROUNDED</span>
        </div>
      </section>
      <div className="hatch-divider" aria-hidden="true" />

      <section className="editorial-section">
        <div className="shell">
          <SectionIntro index="05" eyebrow="The difference" title="Why this is not a typical AI demo" center />
          <div className="comparison-wrap">
            <div className="comparison-table">
              <Reveal className="comparison-col comparison-col-other">
                <h3>Typical AI demos</h3>
                <ul>{COMPARISON.other.map((item) => <li key={item}>{item}</li>)}</ul>
              </Reveal>
              <Reveal delay={0.08} className="comparison-col comparison-col-us">
                <h3 className="comparison-brand">Provenance</h3>
                <ul>{COMPARISON.us.map((item) => <li key={item}>{item}</li>)}</ul>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <section id="build" className="editorial-section">
        <div className="shell">
          <SectionIntro index="06" eyebrow="The build, end to end" title="every role on this project, covered solo." />
          <div className="build-map">
            <Reveal className="build-owner-card">
              <div className="build-owner-mark" aria-hidden="true">AM</div>
              <div>
                <span className="build-owner-label">One accountable builder</span>
                <h3>Ariel Magalso</h3>
                <p>From product framing to production UI, retrieval, verification, evaluation, and operator handoff.</p>
              </div>
              <dl className="build-owner-stats">
                <div><dt>Disciplines</dt><dd>07</dd></div>
                <div><dt>Core product</dt><dd>01</dd></div>
              </dl>
            </Reveal>
            <div className="roles-grid">
              {ROLES.map(([index, phase, role, initials]) => (
                <Reveal key={role} className="role-card">
                  <span className="role-card-index">//{index}</span>
                  <span className="role-card-avatar">{initials}</span>
                  <div><span className="role-card-phase">{phase}</span><strong>{role}</strong></div>
                </Reveal>
              ))}
            </div>
          </div>
          <Reveal delay={0.1} className="frame-panel" style={{ marginTop: "16px", padding: "clamp(24px, 3vw, 32px)", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "20px" }}>
            <div>
              <p className="text-heading-sm">Ariel is searching for a team.</p>
              <p className="text-body-sm" style={{ color: "var(--muted)", marginTop: "6px" }}>Open to product design and full-stack AI engineering roles.</p>
            </div>
            <Button asChild variant="ink"><a href="mailto:ariel.r.magalso@gmail.com">Contact Ariel →</a></Button>
          </Reveal>
        </div>
      </section>

      <section id="evidence" className="editorial-section surface-section">
        <div className="shell">
          <SectionIntro index="07" eyebrow="Evidence timeline" title="AI solutions that stand on evidence." />
          <div className="evidence-timeline">
            {EVIDENCE_TIMELINE.map(([date, title, cta, href]) => (
              <Link className="evidence-timeline-row" href={href} key={title}>
                <span>{date}</span><strong>{title}</strong><span>{cta}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="editorial-section">
        <div className="shell">
          <Reveal className="evidence-quote-card">
            <blockquote>&ldquo;Every committed case reached the correct route — answer, review, or block.&rdquo;</blockquote>
            <cite>From the project&apos;s committed evidence — <Link href="/evals">evals/results.md</Link></cite>
          </Reveal>
        </div>
      </section>

      <section className="editorial-section surface-section">
        <div className="shell">
          <SectionIntro index="08" eyebrow="Why choose this approach" title="built to help you trust the answer." />
          <div className="why-choose-grid">
            {WHY_CHOOSE.map(([title, copy]) => (
              <Reveal key={title} className="why-choose-card">
                <span>0{WHY_CHOOSE.findIndex(([t]) => t === title) + 1}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="case-study" className="editorial-section">
        <div className="shell">
          <SectionIntro index="09" eyebrow="Recent work" title="one inbox. three responsible outcomes." copy={<p>The same live pipeline handles a routine answer, an unsupported request, and an adversarial instruction.</p>} />
          <div className="work-panel-stack">
            {GUIDED_SCENARIOS.map((scenario, index) => (
              <Reveal delay={index * 0.08} key={scenario.id}>
                <Link className="work-panel-full" href="/demo">
                  <div className="work-panel-full-top">
                    <div className="work-panel-full-head">
                      <span className="work-panel-full-count">0{index + 1} / 03</span>
                      <h3>{scenario.label}</h3>
                    </div>
                    <OutcomeMark outcome={scenario.expectedOutcome} compact />
                  </div>

                  <p className="work-panel-question">{scenario.question.replace("Meridian Nine", "the workspace")}</p>

                  <div className="work-pipeline" aria-label={`Pipeline route: ${ROUTE_SHORT[scenario.expectedOutcome]}`}>
                    {PIPELINE_STAGES.map((stage, stageIndex) => (
                      <span className="work-pipeline-node" key={stage}>
                        <span className={`work-pipeline-step${stageIndex >= STAGES_REACHED[scenario.expectedOutcome] ? " is-skipped" : ""}`}>{stage}</span>
                        <span className="work-pipeline-sep" aria-hidden="true">›</span>
                      </span>
                    ))}
                    <span className={`work-pipeline-step work-pipeline-final work-pipeline-final-${scenario.expectedOutcome}`}>
                      {ROUTE_SHORT[scenario.expectedOutcome]}
                    </span>
                  </div>

                  <div className="work-panel-foot">
                    <div className="work-panel-facts">
                      <span>{scenario.channel[0].toUpperCase() + scenario.channel.slice(1)}</span>
                      <span>{scenario.category}</span>
                      <span>{OUTCOME_LABEL[scenario.expectedOutcome]}</span>
                    </div>
                    <b>Run this scenario →</b>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="editorial-section surface-section">
        <div className="shell">
          <SectionIntro index="10" eyebrow="Two ways to review" title="90 seconds, or the deep dive." />
          <div className="review-grid">
            <Reveal className="review-card review-card-light">
              <span className="review-card-time">Available now</span>
              <h3>The 90-second tour</h3>
              <ul>
                <li>Run the routine-answer scenario</li>
                <li>Watch the groundedness score gate the response</li>
                <li>See a citation resolve to a real passage</li>
                <li>Compare it against the blocked scenario</li>
              </ul>
              <Button asChild variant="ink"><Link href="/demo">Run the demo</Link></Button>
            </Reveal>
            <Reveal delay={0.08} className="review-card review-card-dark">
              <span className="review-card-time">Available now</span>
              <h3>The deep dive</h3>
              <ul>
                <li>Read all 8 architecture stages</li>
                <li>Open the 45-case eval scorecard</li>
                <li>Browse the full policy corpus</li>
                <li>Review the source on GitHub</li>
              </ul>
              <Button asChild variant="ink-outline" style={{ borderColor: "rgba(255,255,255,0.3)", color: "#fff", background: "transparent" }}><Link href="/architecture">Read the architecture</Link></Button>
            </Reveal>
          </div>
        </div>
      </section>

      <section id="recruiter-faq" className="editorial-section surface-section">
        <div className="shell">
          <SectionIntro index="11" eyebrow="Before you get started" title="the useful questions before you open the source." center ghost="FAQ" />
          <div className="faq-centered">
            <div className="faq-list">
              {FAQ_ITEMS.map(([question, answer]) => (
                <details className="faq-row" key={question}>
                  <summary><span>{question}</span><b aria-hidden="true">+</b></summary>
                  <p>{answer}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="editorial-section">
        <div className="shell">
          <div className="lessons-strip">
            <span><b>01 ·</b> Retrieval quality does not guarantee grounded output.</span>
            <span><b>02 ·</b> Refusal is a successful outcome, not a failure state.</span>
            <span><b>03 ·</b> Evaluation cases should model near-misses, not only typical questions.</span>
          </div>
        </div>
      </section>

      <section>
        <div className="shell">
          <div className="contact-split">
            <Reveal>
              <p className="label-mono" style={{ marginBottom: "12px" }}><span className="slash">//</span>Let&apos;s connect</p>
              <h2>Got a role in mind?</h2>
              <p>I&apos;m designing and building accountable AI products, and I&apos;m open to product design and full-stack AI engineering roles.</p>
              <div className="contact-split-actions">
                <Button asChild variant="ink"><a href="mailto:ariel.r.magalso@gmail.com">Contact Ariel →</a></Button>
                <Button asChild variant="ink-outline"><a href="https://arielmagalso.com" target="_blank" rel="noopener noreferrer">Portfolio<ButtonArrow /></a></Button>
              </div>
            </Reveal>
            <Reveal delay={0.1} className="contact-split-panel">
              <FramePanel className="contact-frame-panel">
                <dl>
                  <div><dt>Email</dt><dd>ariel.r.magalso@gmail.com</dd></div>
                  <div><dt>Based in</dt><dd>Manila, Philippines</dd></div>
                  <div><dt>Availability</dt><dd>Open to new roles</dd></div>
                </dl>
              </FramePanel>
            </Reveal>
          </div>
        </div>
      </section>
    </main>
  );
}
