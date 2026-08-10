"use client";

// Word-level staggered rise+fade, matching Agero's hero entrance. Words are
// wrapped in spans with incremental animation-delay; total run stays under
// ~700ms. Under prefers-reduced-motion the CSS strips the animation entirely
// and words render in place.
import type { ReactNode } from "react";

function words(text: string, baseDelay: number, extra?: "muted" | "accent") {
  return text.split(" ").map((word, i) => (
    <span
      className={`stagger-word${extra ? ` ${extra}` : ""}`}
      style={{ animationDelay: `${baseDelay + i * 60}ms` }}
      key={`${word}-${i}`}
    >
      {word}
      {" "}
    </span>
  ));
}

export type StaggerSegment = { text: string; tone?: "muted" | "accent"; break?: boolean };

export function StaggerText({ segments, delay = 0 }: { segments: StaggerSegment[]; delay?: number }) {
  let offset = delay;
  const nodes: ReactNode[] = [];
  segments.forEach((segment, i) => {
    const count = segment.text.split(" ").length;
    nodes.push(<span key={i}>{words(segment.text, offset, segment.tone)}</span>);
    if (segment.break) nodes.push(<br key={`br-${i}`} />);
    offset += count * 60;
  });
  return <span className="stagger-text">{nodes}</span>;
}
