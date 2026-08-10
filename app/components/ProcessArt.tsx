// Original SVG illustrations for the four process cards. Each drawing depicts
// the actual pipeline stage it sits on: screening, retrieval, verification,
// routing. Ink/cobalt/gray palette only; semantic outcome dots (green/amber/red)
// appear solely in the routing scene.

const INK = "#0a0a0c";
const LIME = "#3b82f6";
const BAR = "#eef0f3";
const LINE = "#d1d5db";
const MUT = "#9ca3af";

function Chip({ x, y, w, label }: { x: number; y: number; w: number; label: string }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={30} rx={6} fill={INK} />
      <text x={x + w / 2} y={y + 19} textAnchor="middle" fontFamily="var(--font-display), monospace" fontSize="10" letterSpacing="0.6" fill={LIME}>{label}</text>
    </g>
  );
}

function Bar({ x, y, w, h = 26, fill = BAR }: { x: number; y: number; w: number; h?: number; fill?: string }) {
  return <rect x={x} y={y} width={w} height={h} rx={6} fill={fill} />;
}

export function ScreenArt() {
  return (
    <svg viewBox="0 0 640 210" role="img" aria-label="A ticket passes an input screen before any model call">
      <Bar x={40} y={40} w={140} h={30} />
      <text x={110} y={59} textAnchor="middle" fontFamily="var(--font-body), sans-serif" fontSize="11" fill={MUT}>Incoming ticket</text>
      <path d="M180 55 H236" stroke={LINE} strokeWidth="1.5" />
      <Chip x={240} y={40} w={92} label="SCREEN" />
      <path d="M332 55 H388" stroke={LINE} strokeWidth="1.5" />
      <Bar x={392} y={40} w={120} h={30} />
      <text x={452} y={59} textAnchor="middle" fontFamily="var(--font-body), sans-serif" fontSize="11" fill={MUT}>Safe to continue</text>
      <path d="M286 70 V126" stroke={LINE} strokeWidth="1.5" strokeDasharray="4 4" />
      <Chip x={240} y={130} w={92} label="CLASSIFY" />
      <path d="M332 145 H388" stroke={LINE} strokeWidth="1.5" />
      <Bar x={392} y={130} w={150} h={30} />
      <text x={467} y={149} textAnchor="middle" fontFamily="var(--font-body), sans-serif" fontSize="11" fill={MUT}>Manipulation blocked</text>
      <rect x={548} y={130} width={30} height={30} rx={6} fill={LIME} />
      <text x={563} y={149} textAnchor="middle" fontFamily="var(--font-body), sans-serif" fontSize="13" fill={INK}>✓</text>
    </svg>
  );
}

export function RetrieveArt() {
  return (
    <svg viewBox="0 0 640 210" role="img" aria-label="Passages ranked by similarity score">
      <ellipse cx={100} cy={52} rx={44} ry={14} fill={INK} />
      <rect x={56} y={52} width={88} height={64} fill={INK} />
      <ellipse cx={100} cy={116} rx={44} ry={14} fill={INK} />
      <ellipse cx={100} cy={52} rx={44} ry={14} fill="none" stroke={LIME} strokeWidth="1.5" />
      <text x={100} y={92} textAnchor="middle" fontFamily="var(--font-display), monospace" fontSize="10" letterSpacing="0.6" fill={LIME}>52 PASSAGES</text>
      <path d="M150 84 H206" stroke={LINE} strokeWidth="1.5" />
      <Bar x={210} y={34} w={300} h={26} fill={BAR} />
      <rect x={210} y={34} width={240} height={26} rx={6} fill={LIME} opacity="0.35" />
      <text x={524} y={51} fontFamily="var(--font-display), monospace" fontSize="11" fill={MUT}>0.81</text>
      <Bar x={210} y={72} w={300} h={26} />
      <rect x={210} y={72} width={200} height={26} rx={6} fill={LIME} opacity="0.25" />
      <text x={524} y={89} fontFamily="var(--font-display), monospace" fontSize="11" fill={MUT}>0.74</text>
      <Bar x={210} y={110} w={300} h={26} />
      <rect x={210} y={110} width={150} height={26} rx={6} fill={LIME} opacity="0.16" />
      <text x={524} y={127} fontFamily="var(--font-display), monospace" fontSize="11" fill={MUT}>0.69</text>
      <Bar x={210} y={148} w={300} h={26} />
      <text x={524} y={165} fontFamily="var(--font-display), monospace" fontSize="11" fill={MUT}>0.61</text>
    </svg>
  );
}

export function VerifyArt() {
  return (
    <svg viewBox="0 0 640 210" role="img" aria-label="Each drafted claim is checked against evidence and the gate score passes">
      <rect x={48} y={30} width={250} height={150} rx={10} fill="#ffffff" stroke={LINE} />
      <Bar x={68} y={52} w={180} h={12} />
      <Bar x={68} y={76} w={210} h={12} />
      <Bar x={68} y={100} w={160} h={12} />
      <Bar x={68} y={124} w={195} h={12} />
      <g>
        <circle cx={310} cy={58} r={9} fill={LIME} /><text x={310} y={62} textAnchor="middle" fontSize="10" fill={INK}>✓</text>
        <circle cx={310} cy={82} r={9} fill={LIME} /><text x={310} y={86} textAnchor="middle" fontSize="10" fill={INK}>✓</text>
        <circle cx={310} cy={106} r={9} fill={LIME} /><text x={310} y={110} textAnchor="middle" fontSize="10" fill={INK}>✓</text>
        <circle cx={310} cy={130} r={9} fill={LIME} /><text x={310} y={134} textAnchor="middle" fontSize="10" fill={INK}>✓</text>
      </g>
      <path d="M340 105 H396" stroke={LINE} strokeWidth="1.5" />
      <rect x={400} y={60} width={190} height={90} rx={10} fill={INK} />
      <text x={495} y={98} textAnchor="middle" fontFamily="var(--font-body), sans-serif" fontSize="26" fontWeight="600" fill="#ffffff">0.96</text>
      <text x={495} y={122} textAnchor="middle" fontFamily="var(--font-display), monospace" fontSize="9" letterSpacing="0.8" fill={LIME}>MEAN GROUNDEDNESS</text>
    </svg>
  );
}

export function RouteArt() {
  return (
    <svg viewBox="0 0 640 210" role="img" aria-label="A verified draft routes to answer, human review, or block">
      <Chip x={60} y={90} w={110} label="DECISION" />
      <path d="M170 105 H230 M230 45 V165 M230 45 H286 M230 105 H286 M230 165 H286" stroke={LINE} strokeWidth="1.5" fill="none" />
      <rect x={290} y={30} width={230} height={34} rx={7} fill="#ffffff" stroke={LINE} />
      <circle cx={312} cy={47} r={6} fill="#16803c" />
      <text x={330} y={51} fontFamily="var(--font-body), sans-serif" fontSize="12" fill={INK}>Answer with citations</text>
      <rect x={290} y={88} width={230} height={34} rx={7} fill="#ffffff" stroke={LINE} />
      <circle cx={312} cy={105} r={6} fill="#d97706" />
      <text x={330} y={109} fontFamily="var(--font-body), sans-serif" fontSize="12" fill={INK}>Human review</text>
      <rect x={290} y={146} width={230} height={34} rx={7} fill="#ffffff" stroke={LINE} />
      <circle cx={312} cy={163} r={6} fill="#c1272d" />
      <text x={330} y={167} fontFamily="var(--font-body), sans-serif" fontSize="12" fill={INK}>Blocked safely</text>
      <path d="M520 47 H560 M520 105 H560 M520 163 H560 M560 47 V163 M560 105 H596" stroke={LINE} strokeWidth="1.5" strokeDasharray="4 4" fill="none" />
      <rect x={572} y={90} width={30} height={30} rx={6} fill={LIME} />
      <text x={587} y={109} textAnchor="middle" fontFamily="var(--font-body), sans-serif" fontSize="12" fill={INK}>⟳</text>
    </svg>
  );
}

export const PROCESS_ART = [ScreenArt, RetrieveArt, VerifyArt, RouteArt];

export const PROCESS_ART_META = [
  { number: "01", title: "Screen", note: "Input safety" },
  { number: "02", title: "Retrieve", note: "Approved knowledge" },
  { number: "03", title: "Verify", note: "Claim-level evidence" },
  { number: "04", title: "Route", note: "Answer · review · block" },
] as const;

// Background diagram for the featured-scenario case panel: the actual
// question in that card ("Does a Dedicated Desk membership...") flowing
// through retrieval into a cited, gated answer. Sits behind the overlay
// card, so its content is weighted to the right two-thirds of the frame.
export function CaseArt() {
  return (
    <svg viewBox="0 0 900 460" role="img" aria-label="Diagram: the ticket is retrieved, matched to a policy passage, and gated before a cited answer ships" preserveAspectRatio="xMidYMid slice" style={{ width: "100%", height: "100%" }}>
      <defs>
        <pattern id="case-stripes" width="44" height="44" patternTransform="rotate(115)" patternUnits="userSpaceOnUse">
          <rect width="44" height="44" fill="#101014" />
          <rect width="22" height="44" fill="#131318" />
        </pattern>
      </defs>
      <rect width="900" height="460" fill="url(#case-stripes)" />

      <g opacity="0.95">
        <rect x={560} y={54} width={300} height={62} rx={10} fill="#17171b" stroke="#2a2a30" />
        <text x={580} y={78} fontFamily="var(--font-body), sans-serif" fontSize="12" fill="#e5e7eb">Does a Dedicated Desk membership</text>
        <text x={580} y={96} fontFamily="var(--font-body), sans-serif" fontSize="12" fill="#e5e7eb">include after-hours access?</text>

        <path d="M710 116 V150" stroke="#3a3a42" strokeWidth="1.5" strokeDasharray="4 4" />

        <rect x={600} y={154} width={220} height={40} rx={8} fill="#17171b" stroke="#2a2a30" />
        <rect x={600} y={154} width={172} height={40} rx={8} fill={LIME} opacity="0.22" />
        <text x={614} y={179} fontFamily="var(--font-display), monospace" fontSize="10" letterSpacing="0.5" fill="#d4ffa3">PRICING-03 · 0.91 SIM</text>

        <path d="M710 194 V228" stroke="#3a3a42" strokeWidth="1.5" strokeDasharray="4 4" />

        <rect x={560} y={232} width={300} height={96} rx={10} fill="#101012" stroke={LIME} strokeOpacity="0.4" />
        <text x={710} y={272} textAnchor="middle" fontFamily="var(--font-body), sans-serif" fontSize="30" fontWeight="600" fill="#ffffff">0.96</text>
        <text x={710} y={294} textAnchor="middle" fontFamily="var(--font-display), monospace" fontSize="9" letterSpacing="0.8" fill={LIME}>GROUNDEDNESS GATE</text>
        <text x={710} y={314} textAnchor="middle" fontFamily="var(--font-body), sans-serif" fontSize="10" fill="#9ca3af">passes → cited answer ships</text>
      </g>
    </svg>
  );
}

// Dark companion visual for the About stats panel: a miniature eval scorecard,
// since the numbers beside it are the committed evaluation results.
export function StatsArt() {
  const rows = [
    ["ans-01", "answered"],
    ["unans-04", "refused"],
    ["adv-07", "blocked"],
    ["ans-12", "answered"],
  ] as const;
  return (
    <svg viewBox="0 0 520 300" role="img" aria-label="Miniature evaluation scorecard: every committed case passing">
      <rect x={0} y={0} width={520} height={300} fill="#101012" />
      <text x={36} y={46} fontFamily="var(--font-display), monospace" fontSize="11" letterSpacing="1" fill={MUT}>EVALS / RESULTS.MD</text>
      <rect x={392} y={26} width={92} height={32} rx={6} fill={LIME} />
      <text x={438} y={47} textAnchor="middle" fontFamily="var(--font-body), sans-serif" fontSize="14" fontWeight="600" fill={INK}>45/45</text>
      {rows.map(([id, route], i) => (
        <g key={id}>
          <rect x={36} y={74 + i * 46} width={448} height={34} rx={7} fill="#1a1a1f" />
          <text x={54} y={95 + i * 46} fontFamily="var(--font-display), monospace" fontSize="11" fill="#e5e7eb">{id}</text>
          <text x={150} y={95 + i * 46} fontFamily="var(--font-body), sans-serif" fontSize="11" fill={MUT}>{route}</text>
          <circle cx={462} cy={91 + i * 46} r={9} fill={LIME} />
          <text x={462} y={95 + i * 46} textAnchor="middle" fontSize="10" fill={INK}>✓</text>
        </g>
      ))}
      <text x={36} y={280} fontFamily="var(--font-body), sans-serif" fontSize="11" fill={MUT}>Development set · committed to the repository</text>
    </svg>
  );
}
