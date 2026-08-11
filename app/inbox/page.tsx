import type { Metadata } from "next";
import Link from "next/link";
import { AgentInbox } from "../components/AgentInbox";
import { EditorialHeader } from "../components/Editorial";
import { Button } from "@/components/ui/button";
import { ButtonArrow } from "../components/ButtonArrow";

export const metadata: Metadata = {
  title: "Agent inbox",
  description: "Review escalated tickets, edit the proposed response, and teach the assistant a correction.",
};

export default function InboxPage() {
  return (
    <main className="agero-inner-page">
      <EditorialHeader
        index="05"
        eyebrow="Operations"
        title="human judgment, where automation stops."
        ghost="Inbox"
        intro={<p>Review escalated tickets with the retrieved evidence attached, resolve them safely, and teach a session-scoped correction without changing the shared corpus.</p>}
        metadata={[
          { label: "Queue", value: "Human-review tickets" },
          { label: "Actions", value: "Approve, dismiss, teach" },
          { label: "Learning", value: "Private 30-minute workspace" },
          { label: "Handoff", value: "Inbox + optional Slack" },
        ]}
        actions={<><Link className="text-link" href="/demo">Generate a review ticket →</Link><Link className="text-link" href="/architecture">Read the routing design →</Link></>}
      />
      <AgentInbox showHeader={false} />

      <section className="editorial-section light-cta-section">
        <div className="shell">
          <div className="page-cta">
            <div className="page-cta-label">
              <span className="kicker-square" aria-hidden="true" />
              <h2>Curious about Ariel&apos;s other work?</h2>
            </div>
            <Button asChild variant="ink"><a href="https://arielmagalso.com" target="_blank" rel="noopener noreferrer">View portfolio<ButtonArrow /></a></Button>
          </div>
        </div>
      </section>
    </main>
  );
}
