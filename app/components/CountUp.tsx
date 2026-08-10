"use client";

import { useEffect, useRef, useState } from "react";

// Counts up from 0 once scrolled into view. Falls back to rendering the final
// value immediately under prefers-reduced-motion, and on first paint before
// the observer fires, so the recruiter proof numbers are never blank.
export function CountUp({ value, prefix = "", suffix = "", duration = 1100 }: { value: number; prefix?: string; suffix?: string; duration?: number }) {
  const [display, setDisplay] = useState(value);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    setDisplay(0);

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !started.current) {
            started.current = true;
            const start = performance.now();
            const tick = (now: number) => {
              const progress = Math.min(1, (now - start) / duration);
              const eased = 1 - Math.pow(1 - progress, 3);
              setDisplay(Math.round(value * eased));
              if (progress < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
            io.disconnect();
          }
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}
