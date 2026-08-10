"use client";

// Agero's "(Services) What we do" tabbed panel — a big tab-label row that
// switches one large description panel, rather than four separate cards.
import { useState } from "react";
import Link from "next/link";

export type Capability = {
  label: string;
  description: string;
  detail: string;
  chips: string[];
  href: string;
};

export function CapabilityTabs({ items }: { items: Capability[] }) {
  const [active, setActive] = useState(0);
  const current = items[active];

  return (
    <div className="capability-tabs">
      <div className="capability-tab-labels" role="tablist" aria-label="Engineering capabilities">
        {items.map((item, i) => (
          <button
            type="button"
            key={item.label}
            role="tab"
            aria-selected={i === active}
            className={`capability-tab-label${i === active ? " active" : ""}`}
            onClick={() => setActive(i)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="capability-panel" role="tabpanel">
        <p className="capability-panel-description">{current.description}</p>
        <p className="capability-panel-detail">{current.detail}</p>
        <div className="capability-panel-chips">
          {current.chips.map((chip) => <span key={chip}>{chip}</span>)}
        </div>
        <Link className="text-link" href={current.href}>See this stage in the architecture →</Link>
      </div>
    </div>
  );
}
