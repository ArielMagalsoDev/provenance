import type { ElementType, ReactNode } from "react";

// Agenio's signature "design-canvas" motif: a dashed-border panel with four
// small solid corner handles, as if the panel were a selected object on a
// design tool's canvas. Purely decorative CSS/markup — no external assets.
export function FramePanel({
  children,
  className = "",
  as: Tag = "div",
  ...props
}: {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  [key: string]: unknown;
}) {
  return (
    <Tag className={`frame-panel ${className}`} {...props}>
      <span className="frame-handle tl" aria-hidden="true" />
      <span className="frame-handle tr" aria-hidden="true" />
      <span className="frame-handle bl" aria-hidden="true" />
      <span className="frame-handle br" aria-hidden="true" />
      {children}
    </Tag>
  );
}
