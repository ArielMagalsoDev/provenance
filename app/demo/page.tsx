import type { Metadata } from "next";
import Link from "next/link";
import { TicketWorkflow } from "../components/TicketWorkflow";
import { EditorialHeader } from "../components/Editorial";

export const metadata: Metadata = {
  title: "Guided demo",
  description: "A fictional support inbox showing automated resolution, human-review routing, and audit trail.",
};

export default function DemoPage() {
  return (
    <main>
      <EditorialHeader
        index="01 / Live product"
        eyebrow="Guided demo"
        title="one inbox. three responsible outcomes."
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
    </main>
  );
}
