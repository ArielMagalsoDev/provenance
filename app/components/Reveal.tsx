"use client";

// Scroll-triggered fade-and-rise, matching salix.framer.website's section
// entrance (≈24px rise, ~0.6s ease-out, staggered via --reveal-delay).
// Pure CSS transition driven by one IntersectionObserver per element; the
// reduced-motion media query in globals.css disables the whole effect.
import { useEffect, useRef, type ReactNode } from "react";

export function Reveal({ children, delay = 0, className = "", style }: { children: ReactNode; delay?: number; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.classList.add("is-visible");
            io.disconnect();
          }
        }
      },
      // threshold 0, not 0.15 — a block taller than the viewport can never
      // reach 15% visibility, so it would stay invisible forever.
      { threshold: 0, rootMargin: "0px 0px -60px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const mergedStyle = {
    ...(delay ? ({ "--reveal-delay": `${delay}s` } as React.CSSProperties) : undefined),
    ...style,
  };

  return (
    <div ref={ref} className={`reveal ${className}`} style={Object.keys(mergedStyle).length ? mergedStyle : undefined}>
      {children}
    </div>
  );
}
