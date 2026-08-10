// Staircase cluster of solid accent squares, staggered in on mount. Purely
// decorative — a small set of CSS grid squares, no external image assets.
// `pattern` marks which of the 3x3 grid cells are filled (true) vs void.
const DEFAULT_PATTERN = [true, true, false, true, true, true, false, true, false];

export function PixelBlocks({ className = "", pattern = DEFAULT_PATTERN }: { className?: string; pattern?: boolean[] }) {
  return (
    <span className={`pixel-blocks ${className}`} aria-hidden="true">
      {pattern.map((filled, i) => (
        <span
          className={filled ? "" : "void"}
          style={filled ? ({ "--pixel-delay": `${i * 60}ms` } as React.CSSProperties) : undefined}
          key={i}
        />
      ))}
    </span>
  );
}
