import type { Metadata } from "next";
import { AgentInbox } from "../components/AgentInbox";

export const metadata: Metadata = {
  title: "Agent Inbox — Provenance",
  description: "Review escalated tickets, edit the proposed response, and teach the assistant a correction.",
};

export default function InboxPage() {
  return (
    <div className="flex-1">
      <AgentInbox />
    </div>
  );
}
