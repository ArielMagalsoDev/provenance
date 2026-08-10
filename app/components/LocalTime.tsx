"use client";

// Agero's footer "London → 01:25:18" live clock, localized to Manila (where
// Ariel is based). Renders nothing until mounted client-side to avoid a
// server/client time mismatch, then ticks once a second.
import { useEffect, useState } from "react";

export function LocalTime({ city = "Manila", timeZone = "Asia/Manila" }: { city?: string; timeZone?: string }) {
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
