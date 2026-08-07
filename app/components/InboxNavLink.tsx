"use client";

// Client-only badge so the rest of SiteNav (and the pages that render it,
// most of which are otherwise statically generated) doesn't need to become
// dynamic just to show an open-ticket count.
import { useEffect, useState } from "react";
import Link from "next/link";

export function InboxNavLink() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/inbox")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { tickets: unknown[] } | null) => {
        if (!cancelled && data) setCount(data.tickets.length);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Link href="/inbox" className="pill-tab" style={{ border: "none", display: "inline-flex", alignItems: "center", gap: "6px" }}>
      Inbox
      {Boolean(count) && (
        <span
          className="text-caption-bold"
          style={{ background: "var(--accent-pink)", color: "#fff", borderRadius: "999px", padding: "1px 7px", lineHeight: "1.4" }}
        >
          {count}
        </span>
      )}
    </Link>
  );
}
