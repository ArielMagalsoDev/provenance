import type { ReactNode } from "react";
import Link from "next/link";
import { Reveal } from "./Reveal";
import { PixelBlocks } from "./PixelBlocks";

const FRAMER_TOP_LEFT_MOTIF = [
  true, false, true, true,
  false, true, false, false,
  true, false, false, false,
] as const;

const FRAMER_BOTTOM_RIGHT_MOTIF = [
  false, false, false, true,
  false, false, true, false,
  true, true, false, true,
] as const;

type MetadataItem = {
  label: string;
  value: string;
};

const HERO_GRAPHICS = {
  architecture: {
    eyebrow: "Permission model",
    title: "Eight guarded decisions",
    stat: "8 stages",
    nodes: ["Screen", "Classify", "Retrieve", "Generate", "Verify", "Route", "Notify", "Audit"],
  },
  evidence: {
    eyebrow: "Evaluation signal",
    title: "Every route is tested",
    stat: "45 / 45",
    nodes: ["Answer", "Review", "Block"],
  },
  corpus: {
    eyebrow: "Source library",
    title: "Approved knowledge only",
    stat: "52 passages",
    nodes: ["Pricing", "Access", "Liability", "Membership"],
  },
  inbox: {
    eyebrow: "Human handoff",
    title: "Judgment stays human",
    stat: "3 routes",
    nodes: ["Approve", "Dismiss", "Teach"],
  },
} as const;

function EditorialHeroGraphic({ pageKey }: { pageKey: string }) {
  const graphic = HERO_GRAPHICS[pageKey as keyof typeof HERO_GRAPHICS] ?? HERO_GRAPHICS.architecture;

  return (
    <Reveal className={`editorial-hero-graphic editorial-hero-graphic-${pageKey}`}>
      <div className="editorial-graphic-head">
        <div><span>{graphic.eyebrow}</span><strong>{graphic.title}</strong></div>
        <small><i /> Live system</small>
      </div>
      <div className="editorial-graphic-stage">
        <div className="editorial-graphic-score"><span>System signal</span><strong>{graphic.stat}</strong><small>inspectable at every step</small></div>
        <ol>
          {graphic.nodes.map((node, index) => (
            <li key={node}><span>{String(index + 1).padStart(2, "0")}</span><strong>{node}</strong><i aria-hidden="true">→</i></li>
          ))}
        </ol>
      </div>
      <div className="editorial-graphic-footer"><span><i /> Evidence attached</span><small>PROVENANCE / {pageKey.toUpperCase()}</small></div>
    </Reveal>
  );
}

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
  const pageKey = ghost?.toLowerCase() ?? "page";

  return (
    <header className={`editorial-page-header${ghost ? " has-ghost" : ""}`} data-page={pageKey}>
      <div className="editorial-page-blueprint" aria-hidden="true" />
      <PixelBlocks className="editorial-pixel editorial-pixel-left" columns={4} pattern={[...FRAMER_TOP_LEFT_MOTIF]} />
      <PixelBlocks className="editorial-pixel editorial-pixel-right" columns={4} pattern={[...FRAMER_BOTTOM_RIGHT_MOTIF]} />
      <div className="shell editorial-page-frame" data-page={pageKey}>
        {ghost && <span className="ghost-heading page-ghost" aria-hidden="true">{ghost}</span>}
        <Reveal className="editorial-page-copy">
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
        <EditorialHeroGraphic pageKey={pageKey} />
      </div>
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
