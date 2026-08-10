// Original SVG illustrations for the eight /architecture pipeline stages.
// Each drawing depicts what that specific stage actually does — replacing
// the earlier generic skeleton-bar placeholder. Same ink/cobalt/gray palette
// as ProcessArt.tsx; semantic outcome colors (green/amber/red) appear only
// in the routing scene, matching the rest of the site's convention.

const INK = "#0a0a0c";
const LIME = "#3b82f6";
const BAR = "#eef0f3";
const LINE = "#d1d5db";
const MUT = "#9ca3af";

function Tag({ x, y, w, label, fill = INK, textFill = LIME }: { x: number; y: number; w: number; label: string; fill?: string; textFill?: string }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={24} rx={5} fill={fill} />
      <text x={x + w / 2} y={y + 16} textAnchor="middle" fontFamily="var(--font-display), monospace" fontSize="9" letterSpacing="0.5" fill={textFill}>{label}</text>
    </g>
  );
}

// 01 — Policy ingestion + versioning: a markdown doc is chunked, embedded,
// and upserted into a versioned Postgres table.
export function StageIngestArt() {
  return (
    <svg viewBox="0 0 240 140" role="img" aria-label="A markdown policy document is chunked, embedded, and upserted into a versioned Postgres table">
      <rect x={10} y={16} width={54} height={68} rx={6} fill="#ffffff" stroke={LINE} />
      <path d="M20 32h34M20 42h34M20 52h22" stroke={LINE} strokeWidth="3" strokeLinecap="round" />
      <path d="M72 50h20" stroke={LINE} strokeWidth="1.5" strokeDasharray="3 3" />
      <rect x={96} y={20} width={26} height={22} rx={4} fill={BAR} />
      <rect x={96} y={46} width={26} height={22} rx={4} fill={BAR} />
      <rect x={96} y={72} width={26} height={22} rx={4} fill={BAR} />
      <path d="M126 32h16M126 57h16M126 83h16" stroke={LINE} strokeWidth="1.5" strokeDasharray="3 3" />
      <ellipse cx={190} cy={40} rx={38} ry={13} fill={INK} />
      <rect x={152} y={40} width={76} height={54} fill={INK} />
      <ellipse cx={190} cy={94} rx={38} ry={13} fill={INK} />
      <ellipse cx={190} cy={40} rx={38} ry={13} fill="none" stroke={LIME} strokeWidth="1.5" />
      <text x={190} y={71} textAnchor="middle" fontFamily="var(--font-display), monospace" fontSize="9" letterSpacing="0.5" fill={LIME}>POSTGRES</text>
      <Tag x={152} y={110} w={76} label="CORPUS V.12" />
    </svg>
  );
}

// 02 — Input security before spend: a ticket clears a deny-list and a
// classifier before anything expensive runs.
export function StageScreenArt() {
  return (
    <svg viewBox="0 0 240 140" role="img" aria-label="A ticket clears a deny-list and a classifier before retrieval or generation begins">
      <rect x={10} y={16} width={90} height={26} rx={6} fill="#ffffff" stroke={LINE} />
      <text x={55} y={33} textAnchor="middle" fontFamily="var(--font-body), sans-serif" fontSize="10" fill={MUT}>Incoming ticket</text>
      <path d="M55 42v14" stroke={LINE} strokeWidth="1.5" strokeDasharray="3 3" />
      <Tag x={10} y={58} w={90} label="DENY-LIST" />
      <path d="M55 82v14" stroke={LINE} strokeWidth="1.5" strokeDasharray="3 3" />
      <Tag x={10} y={98} w={90} label="CLASSIFY" />
      <path d="M104 33h24M104 110h24" stroke={LINE} strokeWidth="1.5" />
      <rect x={132} y={20} width={98} height={26} rx={6} fill="#ffffff" stroke={LIME} strokeWidth="1.5" />
      <circle cx={148} cy={33} r={8} fill={LIME} />
      <text x={148} y={37} textAnchor="middle" fontSize="10" fill={INK}>✓</text>
      <text x={192} y={37} textAnchor="middle" fontFamily="var(--font-body), sans-serif" fontSize="10" fill={INK}>Safe to continue</text>
      <rect x={132} y={97} width={98} height={26} rx={6} fill="#ffffff" stroke="#c1272d" strokeWidth="1.5" />
      <circle cx={148} cy={110} r={8} fill="#c1272d" />
      <text x={148} y={114} textAnchor="middle" fontSize="10" fill="#ffffff">✕</text>
      <text x={192} y={114} textAnchor="middle" fontFamily="var(--font-body), sans-serif" fontSize="10" fill={INK}>Blocked pre-spend</text>
    </svg>
  );
}

// 03 — Transparent retrieval: the ticket is embedded and every indexed
// passage returns ranked with a similarity score.
export function StageRetrieveArt() {
  return (
    <svg viewBox="0 0 240 140" role="img" aria-label="Passages return ranked by cosine similarity score">
      <circle cx={26} cy={70} r={16} fill={INK} />
      <circle cx={26} cy={70} r={16} fill="none" stroke={LIME} strokeWidth="1.5" />
      <text x={26} y={74} textAnchor="middle" fontFamily="var(--font-display), monospace" fontSize="9" fill={LIME}>Q</text>
      <path d="M44 70h20" stroke={LINE} strokeWidth="1.5" />
      <rect x={68} y={16} width={162} height={20} rx={5} fill={BAR} />
      <rect x={68} y={16} width={128} height={20} rx={5} fill={LIME} opacity="0.35" />
      <text x={214} y={30} textAnchor="middle" fontFamily="var(--font-display), monospace" fontSize="9" fill={MUT}>.81</text>
      <rect x={68} y={42} width={162} height={20} rx={5} fill={BAR} />
      <rect x={68} y={42} width={104} height={20} rx={5} fill={LIME} opacity="0.24" />
      <text x={214} y={56} textAnchor="middle" fontFamily="var(--font-display), monospace" fontSize="9" fill={MUT}>.74</text>
      <rect x={68} y={68} width={162} height={20} rx={5} fill={BAR} />
      <rect x={68} y={68} width={78} height={20} rx={5} fill={LIME} opacity="0.15" />
      <text x={214} y={82} textAnchor="middle" fontFamily="var(--font-display), monospace" fontSize="9" fill={MUT}>.69</text>
      <rect x={68} y={94} width={162} height={20} rx={5} fill={BAR} />
      <text x={214} y={108} textAnchor="middle" fontFamily="var(--font-display), monospace" fontSize="9" fill={MUT}>.61</text>
      <text x={68} y={128} fontFamily="var(--font-display), monospace" fontSize="9" letterSpacing="0.5" fill={MUT}>52 INDEXED PASSAGES</text>
    </svg>
  );
}

// 04 — Evidence-bound generation: the draft is written only from the
// retrieved passages, or left empty when they don't cover the question.
export function StageGenerateArt() {
  return (
    <svg viewBox="0 0 240 140" role="img" aria-label="A draft answer is written only from retrieved passages, or left empty when support is missing">
      <rect x={10} y={20} width={64} height={18} rx={4} fill={BAR} />
      <rect x={10} y={44} width={64} height={18} rx={4} fill={BAR} />
      <rect x={10} y={68} width={64} height={18} rx={4} fill={BAR} />
      <path d="M78 47h20" stroke={LINE} strokeWidth="1.5" />
      <Tag x={102} y={38} w={70} label="GENERATE" />
      <path d="M137 62v16" stroke={LINE} strokeWidth="1.5" />
      <rect x={98} y={82} width={78} height={40} rx={6} fill="#ffffff" stroke={LINE} />
      <path d="M108 94h58M108 104h58M108 114h34" stroke={LINE} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M137 20v-6M137 8h50" stroke={LINE} strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
      <rect x={190} y={0} width={40} height={20} rx={5} fill="none" stroke={MUT} strokeWidth="1.2" strokeDasharray="3 3" />
      <text x={210} y={14} textAnchor="middle" fontFamily="var(--font-display), monospace" fontSize="8" fill={MUT}>EMPTY</text>
    </svg>
  );
}

// 05 — Claim-level verification: the draft is decomposed into claims, each
// checked against evidence, then gated on a mean + per-claim floor.
export function StageVerifyArt() {
  return (
    <svg viewBox="0 0 240 140" role="img" aria-label="Each claim is checked against evidence and gated on a mean and per-claim score">
      <rect x={10} y={14} width={110} height={100} rx={8} fill="#ffffff" stroke={LINE} />
      <path d="M24 34h60" stroke={LINE} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx={100} cy={34} r={8} fill={LIME} /><text x={100} y={38} textAnchor="middle" fontSize="9" fill={INK}>✓</text>
      <path d="M24 56h72" stroke={LINE} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx={100} cy={56} r={8} fill={LIME} /><text x={100} y={60} textAnchor="middle" fontSize="9" fill={INK}>✓</text>
      <path d="M24 78h50" stroke={LINE} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx={100} cy={78} r={8} fill={LIME} /><text x={100} y={82} textAnchor="middle" fontSize="9" fill={INK}>✓</text>
      <path d="M24 100h64" stroke={LINE} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx={100} cy={100} r={8} fill={LIME} /><text x={100} y={104} textAnchor="middle" fontSize="9" fill={INK}>✓</text>
      <path d="M128 64h18" stroke={LINE} strokeWidth="1.5" />
      <rect x={150} y={26} width={80} height={78} rx={8} fill={INK} />
      <text x={190} y={64} textAnchor="middle" fontFamily="var(--font-body), sans-serif" fontSize="22" fontWeight="600" fill="#ffffff">0.96</text>
      <text x={190} y={86} textAnchor="middle" fontFamily="var(--font-display), monospace" fontSize="8" letterSpacing="0.5" fill={LIME}>MEAN ≥ 0.70</text>
    </svg>
  );
}

// 06 — Three responsible routes: a verified draft becomes a cited answer;
// missing evidence goes to review; unsafe input stays blocked.
export function StageRouteArt() {
  return (
    <svg viewBox="0 0 240 140" role="img" aria-label="A verified draft routes to a cited answer, human review, or a safe block">
      <path d="M28 70h20M48 20v100M48 20h24M48 70h24M48 120h24" stroke={LINE} strokeWidth="1.5" fill="none" />
      <Tag x={0} y={58} w={30} label="" fill={INK} />
      <circle cx={16} cy={70} r={13} fill={INK} />
      <text x={16} y={74} textAnchor="middle" fontFamily="var(--font-display), monospace" fontSize="9" fill={LIME}>?</text>
      <rect x={76} y={8} width={154} height={24} rx={6} fill="#ffffff" stroke={LINE} />
      <circle cx={92} cy={20} r={6} fill="#16803c" />
      <text x={106} y={24} fontFamily="var(--font-body), sans-serif" fontSize="10" fill={INK}>Answer with citations</text>
      <rect x={76} y={58} width={154} height={24} rx={6} fill="#ffffff" stroke={LINE} />
      <circle cx={92} cy={70} r={6} fill="#9c6206" />
      <text x={106} y={74} fontFamily="var(--font-body), sans-serif" fontSize="10" fill={INK}>Human review</text>
      <rect x={76} y={108} width={154} height={24} rx={6} fill="#ffffff" stroke={LINE} />
      <circle cx={92} cy={120} r={6} fill="#c1272d" />
      <text x={106} y={124} fontFamily="var(--font-body), sans-serif" fontSize="10" fill={INK}>Blocked safely</text>
    </svg>
  );
}

// 07 — Ticketing + human handoff: evidence and a decision carry into the
// operator's inbox, where a person approves or rejects the reply.
export function StageOperateArt() {
  return (
    <svg viewBox="0 0 240 140" role="img" aria-label="Evidence and the routing decision carry into an operator inbox with approve or reject controls">
      <rect x={10} y={30} width={80} height={56} rx={7} fill="#ffffff" stroke={LINE} />
      <path d="M22 46h50M22 58h56M22 70h34" stroke={LINE} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M94 58h20" stroke={LINE} strokeWidth="1.5" />
      <rect x={118} y={16} width={112} height={92} rx={8} fill={BAR} />
      <text x={132} y={36} fontFamily="var(--font-display), monospace" fontSize="9" letterSpacing="0.5" fill={MUT}>INBOX</text>
      <rect x={128} y={46} width={92} height={26} rx={6} fill="#ffffff" stroke={LINE} />
      <circle cx={140} cy={59} r={5} fill="#9c6206" />
      <text x={152} y={63} fontFamily="var(--font-body), sans-serif" fontSize="9" fill={INK}>Needs review</text>
      <rect x={128} y={80} width={42} height={20} rx={5} fill={LIME} />
      <text x={149} y={94} textAnchor="middle" fontFamily="var(--font-body), sans-serif" fontSize="9" fontWeight="600" fill={INK}>Approve</text>
      <rect x={176} y={80} width={44} height={20} rx={5} fill="none" stroke={LINE} />
      <text x={198} y={94} textAnchor="middle" fontFamily="var(--font-body), sans-serif" fontSize="9" fill={MUT}>Reject</text>
    </svg>
  );
}

// 08 — Audit + evaluation: every stage writes a persisted event, and the
// committed development suite reports the scorecard.
export function StageEvaluateArt() {
  return (
    <svg viewBox="0 0 240 140" role="img" aria-label="Every stage writes a persisted event and the committed evaluation suite reports a scorecard">
      <path d="M20 30v70" stroke={LINE} strokeWidth="1.5" />
      <circle cx={20} cy={30} r={5} fill={LIME} />
      <circle cx={20} cy={55} r={5} fill={LIME} />
      <circle cx={20} cy={80} r={5} fill={LIME} />
      <circle cx={20} cy={100} r={5} fill={LIME} />
      <text x={34} y={34} fontFamily="var(--font-display), monospace" fontSize="9" fill={MUT}>screen</text>
      <text x={34} y={59} fontFamily="var(--font-display), monospace" fontSize="9" fill={MUT}>retrieve</text>
      <text x={34} y={84} fontFamily="var(--font-display), monospace" fontSize="9" fill={MUT}>verify</text>
      <text x={34} y={104} fontFamily="var(--font-display), monospace" fontSize="9" fill={MUT}>route</text>
      <rect x={148} y={14} width={82} height={96} rx={8} fill={INK} />
      <text x={189} y={38} textAnchor="middle" fontFamily="var(--font-display), monospace" fontSize="9" letterSpacing="0.5" fill={MUT}>DEV SET</text>
      <text x={189} y={70} textAnchor="middle" fontFamily="var(--font-body), sans-serif" fontSize="26" fontWeight="600" fill="#ffffff">45/45</text>
      <text x={189} y={92} textAnchor="middle" fontFamily="var(--font-display), monospace" fontSize="8" letterSpacing="0.5" fill={LIME}>PASSING</text>
    </svg>
  );
}

export const STAGE_ART = [
  StageIngestArt,
  StageScreenArt,
  StageRetrieveArt,
  StageGenerateArt,
  StageVerifyArt,
  StageRouteArt,
  StageOperateArt,
  StageEvaluateArt,
];
