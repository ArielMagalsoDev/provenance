# Provenance → Agenio Redesign Plan (v3)

Reference: https://agenio.framer.website/ (AgencyIO — "AI agency" template)

## Purpose

Rebuild every Provenance page in the Agenio design language — the "design-canvas blueprint" aesthetic — pixel-faithful on tokens, motifs, layout grammar, and animations. We recreate the visual system and motion in our own code with Provenance's own honest content; no template assets, images, copy text, or code are cloned. This replaces the current Agero (v2) system entirely.

## Extracted design system (measured from the live site)

### Colors (computed from DOM — it literally uses the Tailwind gray scale + one neon)

```css
--canvas:        #f9fafb;   /* gray-50 page background */
--surface:       #f3f4f6;   /* gray-100 panels, grid cells */
--surface-2:     #fafafc;
--white:         #ffffff;   /* nav bar, cards, light buttons */
--ink:           #030712;   /* gray-950 — headings, dark buttons, banner */
--ink-2:         #121212;   /* glossy dark button fill */
--muted:         #6b7280;   /* gray-500 body copy */
--line:          #e5e7eb;   /* gray-200 gridlines */
--line-2:        #d1d5db;   /* gray-300 dashed frames */
--lime:          #98ff03;   /* THE accent — pixel blocks, banner highlight, icon tiles */
--lime-soft:     rgba(152, 255, 3, 0.15);
```

Semantic outcome colors (approved/review/blocked) stay green/amber/red — lime is decoration + interaction only, never an outcome signal.

### Typography (measured)

- **Display**: Space Grotesk — hero landmark 120px/500 uppercase; section display 60px/600. Giant ghost numerals: Inter 200px/500.
- **Headings**: Urbanist 600 — 100px (statement), 40/38/34/32px section titles, 26px card titles.
- **Body/UI**: Urbanist 500 — 16px body, 14px UI; Space Grotesk 400–500 12px for uppercase micro-labels (`//WE'VE TRUSTED BY`, `//01`).
- Load via next/font: Urbanist + keep Space Grotesk; drop Inter as body (stays only for ghost numerals fallback).
- Label grammar: uppercase, `//` prefix on eyebrows and step numbers; `™` superscript on the wordmark.

### Shapes + motifs (the signature look)

- **Blueprint canvas**: faint 1px gray-200 grid over the gray-50 background; sections sit inside "frames" with dashed gray-300 borders and small black square **corner handles** (like selected objects on a design canvas).
- **Pixel blocks**: staircase clusters of solid lime squares in hero corners/edges.
- **Dotted arrow trails**: rows of dot-matrix chevrons (‹ ‹ ‹ / › › ›) as decorative flourishes and marquee fillers.
- Radii: 999px pills, 8–12px cards/buttons, 24px panels, 40px feature panels.
- **Glossy dark button**: near-black `#121212` rounded-12 with inner top highlight + drop shadow, often paired with a lime icon tile on the left. Light variant: plain white rounded-12 card-button with shadow.
- Top **announcement banner**: black, centered `WE ARE AVAILABLE FOR <lime>...</lime>` with animated dotted arrows on both sides.
- Nav: white bar inside a handle-framed rectangle; uppercase links; glossy Request button.

### Animation inventory (to replicate)

1. Banner dotted arrows: continuous stepping/pulse animation.
2. Hero: side text panels (`WE ARE` / `AI DRIVEN`, huge light-gray uppercase) slide in from left/right; center logo card scales in; pixel blocks pop in stepwise (staggered square-by-square).
3. Count-up stats that start at 0 (`0% → 98%` style) on scroll into view — reuse `CountUp`.
4. Word/element scroll reveals (fade + rise, staggered) — reuse `Reveal`/`StaggerText`.
5. Marquee bands: repeating uppercase words (`INNOVATIVE VISIONARY` → ours: `VERIFIED · AUDITABLE`) — reuse `.marquee` with outline-text styling.
6. Accordion FAQ: height + icon rotation.
7. Hovers: glossy button lift, card border → lime, comparison rows highlight.
8. `prefers-reduced-motion` strips all of the above.

## Page mapping (Agenio page → Provenance route, honest content only)

Agenio's separate pages (Home/About/Services/Projects/Pricing/Contact) map onto Provenance's existing URLs — URLs, APIs, and product behavior unchanged. No fake team, prices, offices, awards, or client testimonials: each pattern is refilled with real project facts (as in v2).

### `/` — Agenio Home, section by section

1. **Black banner**: `WE ARE AVAILABLE FOR <lime>NEW OPPORTUNITIES</lime>` + animated dotted arrows; keeps a compact fictional-workspace disclosure link.
2. **Framed nav**: white bar w/ corner handles; `provenance™` wordmark; uppercase links (HOME→Overview, DEMO, ENGINEERING, EVIDENCE, CORPUS, INBOX); glossy `Request` → `Contact` button.
3. **Hero**: `WE ARE` … `EVIDENCE DRIVEN` giant gray uppercase flanking a central white card containing the mini ticket-proof mockup (our "3D logo card" equivalent); sub-line + two buttons (white `View the evidence`, glossy dark + lime tile `Run the live demo`); pixel-block clusters + grid + dashed frames.
4. **`//TRUSTED BY` strip** → `//BUILT WITH`: real stack logos as text chips (Next.js, React, Postgres, pgvector, Claude, Supabase, Vercel).
5. **About + counters**: statement "great automation is more than answers — it's proof" + three 0→N count-ups: `45/45` eval cases · `52` passages · `100%` route accuracy (dev-set labeled).
6. **Services 4-grid** (numbered 01–04, capability chip lists): Retrieval · Claim verification · Responsible routing · Audit + human handoff — each with 4 sub-capability rows, exactly the Agenio card anatomy.
7. **Vision + featured case**: statement section + one case panel with three metric chips (like their `+70% / 1 unified / 4 weeks`): `0.96 mean groundedness · 3 routes · 45/45 dev-set` linking to /demo.
8. **Process `//01–//04`**: Analyze (screen) → Plan (retrieve) → Build (generate+verify) → Evolve (route+audit) — 4 steps with visuals, mapped to the real pipeline.
9. **Marquee band**: outlined uppercase `VERIFIED / AUDITABLE / GROUNDED`.
10. **Comparison table**: `Typical AI demos` vs `provenance™` — honest contrasts (no citations vs per-claim citations; hides uncertainty vs refusal as an outcome; no evals vs committed 45-case suite; black box vs full audit trail; demo-only vs human-review workflow).
11. **Team grid → "The build, end to end"**: instead of fake teammates, 6–7 cards of the roles Ariel personally covered (Product design · Frontend · Pipeline · Verification · Evals · Ops/HITL · Docs) + a "We're searching for talents" panel → "Ariel is searching for a team" apply-style CTA (honest inversion).
12. **Awards timeline → Evidence timeline**: dated real milestones (corpus committed, verifier bug caught by evals, 45/45 suite passing, HITL + Slack shipped) each linking to its proof page.
13. **Testimonial → Evidence quote**: single large quote card attributed to a committed artifact (evals/results.md), labeled as such.
14. **Why choose 4-grid**: Evidence-bound · Refusal-safe · Fully audited · Honestly evaluated.
15. **Pricing 2 cards → "Two ways to review"**: Starter→`90-second tour` (label `Available now`), Growth→`Deep dive` — same card anatomy: availability chip, description, big value (`~90 sec` / `15+ min` where price sits), feature checklist, Get-started button.
16. **FAQ**: existing 4 recruiter questions, Agenio accordion style.
17. **Big CTA + contact block**: `LET'S START / YOUR REVIEW` giant lines + contact panel: email + `/YOUR NAME`-style faux-terminal labels rendered as **mailto buttons and links only — no fake form**; "Offices" → `Based in Manila, PH (remote-friendly)`.
18. **Footer**: wordmark™, nav columns, socials (GitHub/LinkedIn/Portfolio), `Back to Home`→Back to top, disclosure line.

### Inner pages (all get: banner + framed nav + blueprint canvas + closing CTA)

- **/demo** → Agenio *Projects* page: `OUR WORK IN ACTION` hero → TicketWorkflow inside a dashed handle-frame panel; scenario cards as project cards with metric chips; "Why delay" 3-numbered section → "What to notice" 4 points with stat bars (real: coverage %, route split).
- **/architecture** → Agenio *Services* page: services-grid anatomy for the 8 stages (numbered `//01–//08`, chip lists), decision-gates as comparison-table styling, eval-bug callout card.
- **/evals** → About/results pattern: counters band (0→45/45, 100%, 0%, 0%), evidence timeline, markdown scorecard in a framed panel.
- **/corpus** → Projects-archive pattern: document cards with `//NN` labels, category chips, metric chips (sections/passages).
- **/inbox** → Contact-page pattern: split layout — queue + decision panel inside framed panels; audit rows below; contact CTA.

## Implementation

- **CSS**: replace the v2 Agero token/section layers in `app/globals.css` wholesale with the Agenio system (tokens above, blueprint-grid utilities, frame/handle/pixel/dotted-arrow motifs, glossy buttons, all v3 section styles). Keep: shadcn bridge, product-UI class contracts (`.card-feature`, `.input`, `.radio-option`, `.badge-*`, `.ticket-grid`, scoped `.product-workspace` token remap — restyled light this time to match Agenio's light canvas), reveal/marquee/countup plumbing.
- **Fonts**: `app/layout.tsx` → add Urbanist (body+headings), keep Space Grotesk (labels/display).
- **Components**: keep `Reveal`, `CountUp`, `StaggerText`, `Marquee` styles, `LocalTime`, accordion. New: `Banner` (animated dotted arrows), `FramePanel` (dashed border + corner handles wrapper), `PixelBlocks` (staggered lime squares), `ServiceCard` (numbered + chip list), `ComparisonTable`, `EvidenceTimeline`, `MetricChips`. Rebuild `SiteNav`/`SiteFooter` to Agenio anatomy. Retire Agero-specific ones no longer used (`EvidenceCarousel` → single quote card, `CapabilityTabs` → services grid).
- **Pages**: rewrite `app/page.tsx` per section list; recompose the 5 inner pages per mapping. TicketWorkflow/AgentInbox/Calculator logic untouched.

## Constraints

- No template assets/images/copy cloned; recreate motifs in CSS/SVG. No fake team members, prices, offices, awards, clients, or testimonials — every filled pattern uses real project facts, 45/45 always labeled development-set.
- No fake contact form (mailto CTAs only). Disclosure stays visible. Semantic outcome colors never lime. WCAG AA. Reduced-motion strips all animation. APIs/URLs/behavior unchanged. No commits without approval.

## Verification

1. `npx tsc --noEmit` + `npm run build` pass.
2. :3011 — all 6 routes at 1280 + 375: screenshots, `scrollWidth === clientWidth` (no overflow).
3. Animations: banner arrows loop, hero side-slide + pixel stagger play once, count-ups fire on scroll, marquees scroll + pause on hover, FAQ accordion, comparison hover, glossy button states, mobile menu.
4. Live flows: demo scenario click renders (env 500s pre-existing), calculator sliders, inbox loads.
5. Reduced-motion emulation spot check.
