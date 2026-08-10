// Decorative dot-matrix chevron trail, used in the announcement banner and
// as a small flourish elsewhere. Pure CSS/SVG-free markup, no external assets.
export function DottedArrows({ count = 3, direction = "right" }: { count?: number; direction?: "left" | "right" }) {
  return (
    <span className="dotted-arrows" aria-hidden="true" style={direction === "left" ? { transform: "scaleX(-1)" } : undefined}>
      {Array.from({ length: count }, (_, i) => (
        <span className="chevron" key={i}><i /><i /><i /></span>
      ))}
    </span>
  );
}
