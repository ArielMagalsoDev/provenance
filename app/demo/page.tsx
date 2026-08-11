import type { Metadata } from "next";
import Link from "next/link";
import { TicketWorkflow } from "../components/TicketWorkflow";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Guided demo",
  description: "A fictional support inbox showing automated resolution, human-review routing, and audit trail.",
};

export default function DemoPage() {
  return (
    <main className="agero-inner-page">
      <header className="demo-hero">
        <div className="shell demo-hero-shell">
          <div className="demo-hero-copy">
            <div className="demo-hero-kicker">
              <span>01</span>
              <strong>Live product</strong>
              <i aria-hidden="true" />
              <small>Inspect every decision</small>
            </div>
            <h1>One inbox.<br />Three responsible outcomes.</h1>
            <p>Run a routine answer, an unsupported question, or an adversarial request through one inspectable evidence pipeline.</p>
            <div className="demo-outcomes" aria-label="Supported outcomes">
              <span><i className="is-answer" />Answer</span>
              <span><i className="is-review" />Human review</span>
              <span><i className="is-block" />Block</span>
            </div>
            <div className="demo-hero-actions">
              <Link className="demo-primary-link" href="#live-workflow">Run a scenario <span aria-hidden="true">↘</span></Link>
              <Link className="demo-secondary-link" href="/architecture">View architecture <span aria-hidden="true">→</span></Link>
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
      <aside className="notice-rail shell" aria-label="What recruiters should notice">
        <div className="notice-rail-heading">
          <span>Review guide</span>
          <strong>What recruiters should notice</strong>
        </div>
        <div className="notice-rail-list">
          <span><i>01</i><b>Visible sources</b><small>Source passages stay attached to the answer.</small></span>
          <span><i>02</i><b>Verified citations</b><small>Every citation resolves to approved support.</small></span>
          <span><i>03</i><b>Human judgment</b><small>Weak claims route to a person before sending.</small></span>
          <span><i>04</i><b>Audit ready</b><small>Every decision produces an inspectable event.</small></span>
        </div>
      </aside>
      <div id="live-workflow"><TicketWorkflow showHeader={false} /></div>

      <section className="demo-architecture-cta">
        <div className="shell demo-architecture-card">
          <div className="demo-architecture-copy">
            <span>Under the hood · 08 stages</span>
            <h2>Curious how each decision is made?</h2>
            <p>Follow one request from safety screening to its final route. Every threshold, source match, and handoff stays visible.</p>
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
    </main>
  );
}
