import type { Metadata } from "next";
import Link from "next/link";
import { TicketWorkflow } from "../components/TicketWorkflow";
import { EditorialHeader } from "../components/Editorial";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Guided demo",
  description: "A fictional support inbox showing automated resolution, human-review routing, and audit trail.",
};

export default function DemoPage() {
  return (
    <main className="agero-inner-page">
      <EditorialHeader
        index="01"
        eyebrow="Live product"
        title="one inbox. three responsible outcomes."
        ghost="Demo"
        intro={<p>Run a routine answer, an unsupported question, or an adversarial request through the same live evidence pipeline. Only the final customer send is simulated.</p>}
        metadata={[
          { label: "Pipeline", value: "Screen → retrieve → generate → verify → route" },
          { label: "Corpus", value: "52 fictional policy passages" },
          { label: "Outcomes", value: "Answer · human review · block" },
          { label: "Evidence", value: "Visible at every stage" },
        ]}
        actions={<Link className="text-link" href="/architecture">See how the pipeline works →</Link>}
      />
      <aside className="notice-rail shell" aria-label="What recruiters should notice">
        <strong>What to notice</strong>
        <span>01 · Source passages remain visible</span>
        <span>02 · Citations come from verified support</span>
        <span>03 · Weak claims route to a person</span>
        <span>04 · Every decision creates an audit event</span>
      </aside>
      <TicketWorkflow showHeader={false} />

      <section className="editorial-section">
        <div className="shell">
          <div className="page-cta">
            <div className="page-cta-label">
              <span className="kicker-square" aria-hidden="true" />
              <h2>Curious how each decision is made?</h2>
            </div>
            <Button asChild variant="ink"><Link href="/architecture">Read the architecture →</Link></Button>
          </div>
        </div>
      </section>
    </main>
  );
}
