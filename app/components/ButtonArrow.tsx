import { cn } from "@/lib/utils";

// Replaces the literal "↗" text glyph in Button children. Button renders
// with the `group/button` class (cva, see components/ui/button.tsx), which
// Radix Slot merges onto the child <a> when asChild is used — so this arrow
// can react to that same hover state without any extra wrapper.
export function ButtonArrow({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 15 15"
      fill="none"
      aria-hidden="true"
      className={cn("transition-transform duration-200 ease-out group-hover/button:translate-x-[3px] group-hover/button:-translate-y-[3px]", className)}
    >
      <path d="M4 11L11 4M11 4H5M11 4V10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Same diagonal arrow as ButtonArrow, for the plain <a> tags outside the
// Button component (nav, footer CTA, .text-link) that can't rely on
// Tailwind's group-hover/button convention. Hover motion comes from the
// .icon-arrow rule in globals.css instead — any ancestor `a:hover` triggers it.
export function ArrowUpRight({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 15 15" width="13" height="13" fill="none" aria-hidden="true" className={cn("icon-arrow", className)}>
      <path d="M4 11L11 4M11 4H5M11 4V10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
