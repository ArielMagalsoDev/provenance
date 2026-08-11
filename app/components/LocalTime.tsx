"use client";

// Agero's footer "London → 01:25:18" live clock, localized to the
// Philippines (where Ariel is based). Renders nothing until mounted
// client-side to avoid a server/client time mismatch, then ticks once a
// second. timeZone stays "Asia/Manila" — that's the correct IANA zone for
// the whole Philippines, a technical value rather than a location claim.
import { useEffect, useState } from "react";

export function LocalTime({ city = "Philippines", timeZone = "Asia/Manila" }: { city?: string; timeZone?: string }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const label = now
    ? now.toLocaleTimeString("en-US", { timeZone, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })
    : "--:--:--";

  return (
    <span className="local-time">
      {city} <span aria-hidden="true">→</span> <span suppressHydrationWarning>{label}</span>
    </span>
  );
}
