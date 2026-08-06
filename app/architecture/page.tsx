import type { Metadata } from "next";
import Link from "next/link";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: "Architecture — Meridian Assist",
  description: "How the production-shaped automation pipeline works, in plain language.",
};

const STAGES = [
  {
    title: "Policy ingestion and versioning",
    body: (
      <>
        Source policy documents live in <code>/corpus</code> as plain markdown, committed to the repository. A
        script splits each document on headings, chunks the content, embeds it, and upserts it into Postgres.
        Re-running ingestion re-indexes the corpus without any application code changing. Each ingest run is
        stamped with a corpus version that flows through to every citation shown to a user.
      </>
    ),
  },
  {
    title: "Input-security screening",
    body: "Before anything else touches a model or a database write that costs money, the incoming message is checked against a fast deny-list of unambiguous injection phrasing, then — if that doesn't already catch it — a small classifier judges whether the message is a genuine on-topic question, off-topic, or an attempt to manipulate the system. A blocked request never reaches retrieval or generation.",
  },
  {
    title: "Retrieval",
    body: "The message is embedded and compared against every indexed passage by cosine similarity; the top handful of passages come back with a similarity score each. Retrieval doesn't decide anything on its own — a passage that merely mentions similar words is not evidence the question is answered, which is exactly what the next two stages check for.",
  },
  {
    title: "Grounded response generation",
    body: "A response is drafted using only the retrieved passages as source material, with instructions to state only what those passages directly support, to leave the response empty rather than reason from what the passages don't say, and not to conflate related-but-distinct policy concepts (liability is not insurance, premises coverage is not member coverage).",
  },
  {
    title: "Claim verification and the evidence-sufficiency gate",
    body: "The draft is broken into individual factual claims, and each claim is scored against the retrieved passages for whether it's actually entailed by them — plus a small non-model lexical check as a sanity test against the verifier over-agreeing with its own generator. A response is only kept if the mean claim score clears a threshold and the single weakest claim clears its own floor — one fabricated or conflated claim hiding among several well-supported ones is not enough to pass.",
  },
  {
    title: "Routing: automatic reply vs. human review vs. blocked",
    body: "If verification passes, the ticket is approved for an automatic reply, citing exactly the passages the verifier confirmed. If it doesn't — missing, ambiguous, or only topically adjacent evidence — the ticket routes to human review with the retrieved evidence and a plain-language reason attached. If screening blocked it, it never reaches this stage at all.",
  },
  {
    title: "Ticketing and messaging integration",
    body: (
      <>
        The guided demo simulates this stage: an approved response can be marked &quot;sent&quot; and a
        human-review ticket can be marked &quot;escalated to Operations,&quot; each logged as a real audit event.
        No email, helpdesk, or chat platform is actually connected — see the roadmap in{" "}
        <code>docs/PRODUCT-PLAN.md</code> for what a real integration (webhook intake, idempotent delivery, one
        downstream connector) would add.
      </>
    ),
  },
  {
    title: "Audit events and evaluation",
    body: (
      <>
        Every ticket writes a real, persisted audit event per stage — this isn&apos;t simulated, even though the
        downstream send/escalate action is. Separately, a 43-case evaluation suite (including the three guided
        scenarios, pinned as regression cases) runs the same pipeline directly and reports accuracy, false-refusal
        rate, and fabrication rate per category — see <Link href="/evals" style={{ textDecoration: "underline" }}>/evals</Link>.
      </>
    ),
  },
];

export default function ArchitecturePage() {
  return (
    <main>
      <header className="shell" style={{ paddingTop: "56px", paddingBottom: "32px" }}>
        <span className="section-label">
          <i className="dot" aria-hidden="true" />
          System design
        </span>
        <h1 className="text-display-lg" style={{ marginTop: "16px" }}>Architecture</h1>
        <p className="text-subtitle-md" style={{ maxWidth: "680px", color: "var(--charcoal)", marginTop: "16px" }}>
          A ticket enters, and one of three things happens: it gets an approved automatic response, it gets routed
          to a human with the evidence attached, or it gets blocked outright. Every stage below runs for every
          ticket, in this order, and every stage&apos;s outcome is shown live in{" "}
          <Link href="/demo" style={{ textDecoration: "underline" }}>the guided demo</Link> — nothing in the UI is
          reconstructed after the fact.
        </p>
      </header>

      <section style={{ paddingTop: 0 }}>
        <div className="shell" style={{ maxWidth: "760px" }}>
          <Accordion type="single" defaultValue="stage-0" collapsible>
            {STAGES.map((s, i) => (
              <AccordionItem value={`stage-${i}`} key={s.title} className="!border-b-0 mb-3 rounded-xl border border-[var(--hairline-soft)] px-5">
                <AccordionTrigger className="text-[18px] font-bold no-underline hover:no-underline py-4">
                  <span>
                    <span className="text-caption" style={{ color: "var(--stone)", marginRight: "10px" }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {s.title}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-[16px] leading-[1.5] pb-4" style={{ color: "var(--charcoal)" }}>
                  {s.body}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </main>
  );
}
