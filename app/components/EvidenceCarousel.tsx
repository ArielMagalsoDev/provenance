"use client";

// Agero's testimonial carousel, re-grounded in real project evidence instead
// of fabricated client quotes. Every line is attributed to a committed
// artifact (evals/results.md, architecture docs, source) — never a person
// who doesn't exist. Auto-advances every 5s, pauses on hover/focus, and
// stops auto-advancing under prefers-reduced-motion (still click/dot
// navigable).
import { useEffect, useRef, useState } from "react";

export type EvidenceQuote = {
  quote: string;
  source: string;
  href: string;
};

export function EvidenceCarousel({ items }: { items: EvidenceQuote[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduceMotionRef = useRef(false);

  useEffect(() => {
    reduceMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    if (paused || reduceMotionRef.current) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % items.length), 5000);
    return () => clearInterval(id);
  }, [paused, items.length]);

  const active = items[index];

  return (
    <div
      className="evidence-carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="evidence-carousel-count">
        <span>{String(index + 1).padStart(2, "0")}</span> / {String(items.length).padStart(2, "0")}
      </div>
      <blockquote className="evidence-carousel-quote" key={index}>
        &ldquo;{active.quote}&rdquo;
      </blockquote>
      <a className="evidence-carousel-source" href={active.href}>From the project&apos;s committed evidence — {active.source}</a>
      <div className="evidence-carousel-dots" role="tablist" aria-label="Evidence quotes">
        {items.map((item, i) => (
          <button
            type="button"
            key={item.source}
            role="tab"
            aria-selected={i === index}
            aria-label={`Show evidence quote ${i + 1}`}
            className={i === index ? "active" : ""}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </div>
  );
}
