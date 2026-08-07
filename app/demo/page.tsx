import type { Metadata } from "next";
import { TicketWorkflow } from "../components/TicketWorkflow";

export const metadata: Metadata = {
  title: "Guided demo — Provenance",
  description: "A fictional support inbox showing automated resolution, human-review routing, and audit trail.",
};

export default function DemoPage() {
  return (
    <div className="flex-1">
      <TicketWorkflow />
    </div>
  );
}
