import Link from "next/link";
import { PROJECTS, type EscalationProject, type ProjectId } from "@/lib/projects";
import { Reveal } from "./Reveal";

// Shared cross-project section, identical in intent (data + copy) across
// Provenance, Verdict, and LedgerGuard — three sibling recruiter-portfolio
// sites that automate judgment work an LLM could get wrong, at escalating
// consequence. This lets a visitor landing on any one of the three learn all
// three exist, in order, and why the order matters. See lib/projects.ts.

interface EscalationStripProps {
  current: ProjectId;
  variant?: "full" | "compact";
  currentMetric?: { value: string; label: string };
}

// Card 1 is always the coolest color on the ramp, card 3 the hottest —
// regardless of which project is `current`. The full variant leans on the
// agero-home dialect (ah-shell / ah-section-heading / ah-parenthetical), so
// it assumes it is mounted inside .provenance-agero-home (the homepage).
const RAMP_BY_ORDER: Record<1 | 2 | 3, "cool" | "warm" | "hot"> = {
  1: "cool",
  2: "warm",
  3: "hot",
};

export function EscalationStrip({ current, variant = "full", currentMetric }: EscalationStripProps) {
  if (variant === "compact") {
    return <CompactEscalationStrip current={current} />;
  }
  return <FullEscalationStrip current={current} currentMetric={currentMetric} />;
}

function FullEscalationStrip({
  current,
  currentMetric,
}: {
  current: ProjectId;
  currentMetric?: { value: string; label: string };
}) {
  const currentName = PROJECTS.find((p) => p.id === current)?.name ?? "this project";

  return (
    <section
      id="escalation"
      aria-label="Three related accountability projects, ordered by rising consequence"
      className="escalation-section"
    >
      <div className="ah-shell">
        <div className="ah-section-heading escalation-heading">
          <div>
            <p className="ah-parenthetical">( Beyond {currentName} )</p>
            <h2>Three systems, one argument.</h2>
          </div>
          <p>
            Each one automates judgment work an LLM will confidently get wrong — and each is built against a
            bigger consequence than the last. The safeguards get harder as the cost of being wrong goes up.
          </p>
        </div>

        <div className="escalation-ladder">
          {PROJECTS.map((project, index) => {
            const isCurrent = project.id === current;
            const ramp = RAMP_BY_ORDER[project.order];
            const metric = isCurrent ? currentMetric : undefined;
            const cardClassName = `escalation-card${isCurrent ? " escalation-card-current" : ""}`;

            return (
              <Reveal key={project.id} delay={index * 0.08} className="escalation-step">
                {isCurrent ? (
                  <Link href="/evals" aria-current="page" className={cardClassName} data-ramp={ramp}>
                    <EscalationCardContent project={project} isCurrent metric={metric} />
                  </Link>
                ) : (
                  <a href={project.href} target="_blank" rel="noopener noreferrer" className={cardClassName} data-ramp={ramp}>
                    <EscalationCardContent project={project} isCurrent={false} />
                  </a>
                )}
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function EscalationCardContent({
  project,
  isCurrent,
  metric,
}: {
  project: EscalationProject;
  isCurrent: boolean;
  metric?: { value: string; label: string };
}) {
  const ramp = RAMP_BY_ORDER[project.order];

  return (
    <>
      <div className="escalation-card-top">
        <small>
          <strong>0{project.order}</strong>
          <span>/ 0{PROJECTS.length}</span>
        </small>
        <span className="escalation-card-sys">
          <i className={`escalation-dot escalation-dot-${ramp}`} aria-hidden="true" />
          {project.domain}
        </span>
      </div>
      <div className="escalation-identity">
        <h3 className="escalation-name">{project.name}</h3>
        <span className={`escalation-stake escalation-stake-${ramp}`}>{project.stake}</span>
      </div>
      <dl className="escalation-dl">
        <div>
          <dt>If it&apos;s wrong</dt>
          <dd>{project.consequence}</dd>
        </div>
        <div>
          <dt>So it can&apos;t</dt>
          <dd>{project.safeguard}</dd>
        </div>
      </dl>
      <div className="escalation-card-foot">
        {isCurrent ? (
          <span className="escalation-here">
            <i aria-hidden="true" /> You are here
          </span>
        ) : (
          <span className="escalation-open">Open project</span>
        )}
        {isCurrent && metric ? (
          <small className="escalation-metric">
            <strong>{metric.value}</strong> {metric.label}
          </small>
        ) : !isCurrent ? (
          <span className="escalation-arrow" aria-hidden="true">
            <svg viewBox="0 0 20 20">
              <path d="M5 15 15 5M7 5h8v8" />
            </svg>
          </span>
        ) : null}
      </div>
    </>
  );
}

function CompactEscalationStrip({ current }: { current: ProjectId }) {
  return (
    <section id="escalation" aria-label="Related accountability projects" className="escalation-section escalation-section-compact">
      <div className="shell">
        <div className="escalation-compact-strip">
          {PROJECTS.map((project) => {
            const isCurrent = project.id === current;
            const ramp = RAMP_BY_ORDER[project.order];
            const cellClassName = `escalation-compact-cell${isCurrent ? " escalation-compact-cell-current" : ""}`;

            const inner = (
              <>
                <span className={`escalation-tick escalation-tick-${ramp}`} aria-hidden="true" />
                <span className="escalation-compact-name">{project.name}</span>
                <span className="escalation-compact-meta">
                  {isCurrent ? "You are here" : `${project.domain} · ${project.stake}`}
                </span>
              </>
            );

            return isCurrent ? (
              <Link key={project.id} href="/evals" aria-current="page" className={cellClassName}>
                {inner}
              </Link>
            ) : (
              <a key={project.id} href={project.href} target="_blank" rel="noopener noreferrer" className={cellClassName}>
                {inner}
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
