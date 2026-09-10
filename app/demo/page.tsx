import type { Metadata } from "next";
import Link from "next/link";
import { TicketWorkflow } from "../components/TicketWorkflow";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Client support demo",
  description: "See how Provenance answers supported questions, escalates uncertainty, and blocks unsafe requests.",
};

export default function DemoPage() {
  return (
    <main className="agero-inner-page">
      <header className="demo-hero">
        <div className="shell demo-hero-shell">
          <div className="demo-hero-copy">
            <div className="demo-hero-kicker">
              <span>01</span>
              <strong>Client use case</strong>
              <i aria-hidden="true" />
              <small>Meridian Nine support</small>
            </div>
            <h1>AI support that knows when not to answer.</h1>
            <p>Provenance answers routine customer questions from approved company documents, verifies every claim, and sends uncertain or unsafe requests to the right place.</p>
            <div className="demo-outcomes" aria-label="Supported outcomes">
              <span><i className="is-answer" />Approve automatically</span>
              <span><i className="is-review" />Send to a person</span>
              <span><i className="is-block" />Block safely</span>
            </div>
            <div className="demo-hero-actions">
              <Link className="demo-primary-link" href="#live-workflow">Run the guided demo <span aria-hidden="true">↘</span></Link>
              <Link className="demo-secondary-link" href="#client-value">See what it solves <span aria-hidden="true">→</span></Link>
            </div>
          </div>

          <div className="demo-pipeline-art" role="img" aria-label="A ticket moves through screening, retrieval, verification, and routing to one of three responsible outcomes">
            <div className="demo-art-topline">
              <div><span>Live pipeline</span><strong>Decision trace</strong></div>
              <small><i /> RUN_7F2A</small>
            </div>
            <div className="demo-ticket-card">
              <small>Incoming ticket</small>
              <strong>Does membership include after-hours access?</strong>
              <span>Ticket #1842</span>
            </div>
            <ol className="demo-pipeline-steps">
              <li><span>01</span><i>Screen</i><b>Safe</b></li>
              <li><span>02</span><i>Retrieve</i><b>52 passages</b></li>
              <li><span>03</span><i>Verify</i><b>0.96</b></li>
              <li><span>04</span><i>Route</i><b>Answer</b></li>
            </ol>
            <div className="demo-route-map">
              <div className="demo-route-source"><small>Groundedness</small><strong>0.96</strong><span>Above 0.70 threshold</span></div>
              <div className="demo-route-line" aria-hidden="true"><i /><i /><i /></div>
              <div className="demo-route-results">
                <span className="is-active"><i />Answer with citations</span>
                <span><i />Human review</span>
                <span><i />Blocked safely</span>
              </div>
            </div>
            <div className="demo-art-footer"><span>✓ Evidence attached at every stage</span><small>audit/7F2A.json</small></div>
          </div>
        </div>
      </header>
      <aside className="notice-rail shell" aria-label="What Provenance solves">
        <div className="notice-rail-heading">
          <span>Business problem</span>
          <strong>Automate support without automating risk</strong>
        </div>
        <div className="notice-rail-list">
          <span><i>01</i><b>Reduce repetitive work</b><small>Routine questions can be answered automatically.</small></span>
          <span><i>02</i><b>Prevent invented policies</b><small>Every claim must be supported before it reaches a customer.</small></span>
          <span><i>03</i><b>Keep human judgment</b><small>Uncertain or sensitive questions go to an operator.</small></span>
          <span><i>04</i><b>Explain every decision</b><small>Sources, checks, and routing stay visible for review.</small></span>
        </div>
      </aside>
      <div id="live-workflow"><TicketWorkflow showHeader={false} /></div>

      <section id="client-value" className="demo-client-value">
        <div className="shell">
          <div className="demo-section-heading">
            <span>What the client gets</span>
            <h2>Controlled automation, not blind automation.</h2>
            <p>The system handles the work it can prove, and keeps people in control of everything else.</p>
          </div>
          <div className="demo-value-grid">
            <article><span>01</span><h3>Faster routine support</h3><p>Approved answers can move from intake to a cited response without an agent researching the same policy again.</p></article>
            <article><span>02</span><h3>Lower answer risk</h3><p>A response is withheld when even one important claim cannot be verified against approved documentation.</p></article>
            <article><span>03</span><h3>Clear human handoff</h3><p>Liability, missing-policy, and uncertain cases arrive with evidence and a reason for escalation.</p></article>
            <article><span>04</span><h3>Auditable decisions</h3><p>Each ticket keeps its source passages, verification result, route, and decision history.</p></article>
          </div>
        </div>
      </section>

      <section className="demo-architecture-cta">
        <div className="shell demo-architecture-card">
          <div className="demo-architecture-copy">
            <span>How it works · inspectable by design</span>
            <h2>Every answer earns permission to be sent.</h2>
            <p>A customer message is screened, matched to approved knowledge, drafted, and checked claim by claim. The result is then approved, escalated, or blocked.</p>
            <Button asChild variant="ink"><Link href="/architecture">Explore the architecture <span aria-hidden="true">↗</span></Link></Button>
          </div>
          <div className="demo-architecture-art" role="img" aria-label="Architecture infographic showing a request moving through screen, retrieve, verify, and route stages">
            <div className="demo-architecture-art-head"><span>System map</span><small>PROV / 01</small></div>
            <div className="demo-architecture-flow">
              <div><i>01</i><strong>Screen</strong><small>Input safety</small></div>
              <b aria-hidden="true">→</b>
              <div><i>02</i><strong>Retrieve</strong><small>Policy match</small></div>
              <b aria-hidden="true">→</b>
              <div><i>03</i><strong>Verify</strong><small>Claim support</small></div>
              <b aria-hidden="true">→</b>
              <div className="is-final"><i>04</i><strong>Route</strong><small>Answer · review · block</small></div>
            </div>
            <div className="demo-architecture-signal" aria-hidden="true">
              <span /><span /><span /><span /><span /><span /><span /><span />
            </div>
            <div className="demo-architecture-legend"><span><i /> Evidence visible</span><span><i /> Human gate</span><span><i /> Audit written</span></div>
          </div>
        </div>
      </section>

      <section className="demo-proof">
        <div className="shell demo-proof-grid">
          <div>
            <span>Measured on the demo corpus</span>
            <h2>Built to prove the decision, not just produce text.</h2>
            <p>The committed evaluation suite covers answerable, unsupported, adversarial, guided-scenario, and workspace-overlay cases. These are demonstration-corpus results, not universal production claims.</p>
          </div>
          <dl>
            <div><dt>45</dt><dd>evaluated cases</dd></div>
            <div><dt>0%</dt><dd>fabrication rate</dd></div>
            <div><dt>0%</dt><dd>false-refusal rate</dd></div>
          </dl>
        </div>
      </section>
    </main>
  );
}
