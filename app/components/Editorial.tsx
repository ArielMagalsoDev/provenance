import type { ReactNode } from "react";
import Link from "next/link";
import { Reveal } from "./Reveal";

type MetadataItem = {
  label: string;
  value: string;
};

export function EditorialHeader({
  eyebrow,
  index,
  title,
  intro,
  metadata = [],
  actions,
  ghost,
}: {
  eyebrow: string;
  index?: string;
  title: string;
  intro: ReactNode;
  metadata?: MetadataItem[];
  actions?: ReactNode;
  ghost?: string;
}) {
  return (
    <header className={`editorial-page-header shell${ghost ? " has-ghost" : ""}`}>
      {ghost && <span className="ghost-heading page-ghost" aria-hidden="true">{ghost}</span>}
      <Reveal>
        <div className="editorial-page-kicker">
          <span>//{index ?? "Case study"}</span>
          <span>{eyebrow}</span>
        </div>
        <h1>{title}</h1>
        <div className="editorial-page-intro">{intro}</div>
        {metadata.length > 0 && (
          <dl className="editorial-metadata">
            {metadata.map((item) => (
              <div key={item.label}>
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
        )}
        {actions && <div className="editorial-header-actions">{actions}</div>}
      </Reveal>
    </header>
  );
}

export function EditorialStat({ value, label, note }: { value: ReactNode; label: string; note?: string }) {
  return (
    <article className="editorial-stat">
      <div className="editorial-stat-value">{value}</div>
      <h3>{label}</h3>
      {note && <p>{note}</p>}
    </article>
  );
}

const OUTCOME_COPY = {
  approved: { icon: "✓", label: "Approved with citations" },
  human_review: { icon: "○", label: "Human review required" },
  blocked: { icon: "◇", label: "Blocked before generation" },
} as const;

export function OutcomeMark({ outcome, compact = false }: { outcome: keyof typeof OUTCOME_COPY; compact?: boolean }) {
  const copy = OUTCOME_COPY[outcome];
  return (
    <span className={`outcome-mark outcome-mark-${outcome}${compact ? " outcome-mark-compact" : ""}`}>
      <span aria-hidden="true">{copy.icon}</span>
      {copy.label}
    </span>
  );
}

export type RouteIndexItem = {
  href: string;
  index: string;
  label: string;
};

export function RouteIndex({ title = "On this page", items }: { title?: string; items: RouteIndexItem[] }) {
  return (
    <nav className="route-index" aria-label={title}>
      <p>{title}</p>
      <ol>
        {items.map((item) => (
          <li key={item.href}>
            <Link href={item.href}><span>{item.index}</span>{item.label}</Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function ArchiveTable({
  label,
  columns,
  rows,
}: {
  label: string;
  columns: string[];
  rows: ReactNode[][];
}) {
  return (
    <div className="archive-table" role="table" aria-label={label}>
      <div className="archive-row archive-head" role="row">
        {columns.map((column) => <span role="columnheader" key={column}>{column}</span>)}
      </div>
      {rows.map((row, rowIndex) => (
        <div className="archive-row" role="row" key={rowIndex}>
          {row.map((cell, cellIndex) => (
            <span role="cell" data-label={columns[cellIndex]} key={cellIndex}>{cell}</span>
          ))}
        </div>
      ))}
    </div>
  );
}

export function SectionIntro({
  index,
  eyebrow,
  title,
  copy,
  center = false,
  ghost,
}: {
  index: string;
  eyebrow: string;
  title: string;
  copy?: ReactNode;
  center?: boolean;
  ghost?: string;
}) {
  return (
    <Reveal className={`editorial-section-intro${center ? " centered" : ""}${ghost ? " has-ghost" : ""}`}>
      {ghost && <span className="ghost-heading" aria-hidden="true">{ghost}</span>}
      <div className="editorial-section-kicker"><span>//{index}</span><span>{eyebrow}</span></div>
      <h2>{title}</h2>
      {copy && <div className="editorial-section-copy">{copy}</div>}
    </Reveal>
  );
}

/** Standalone "(Label)" parenthetical eyebrow, matching Agero's section labels. */
export function SectionEyebrow({ children }: { children: ReactNode }) {
  return <span className="section-eyebrow-paren">({children})</span>;
}
