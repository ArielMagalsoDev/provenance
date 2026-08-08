# Provenance → Salix Redesign Plan

Redesign https://provenance.arielmagalso.com (Next.js app at `provenance/`) to match the visual system of https://salix.framer.website — typography, layout, buttons, padding rhythm, card layout, and animations — while keeping all existing Provenance content and functionality (demo, evals, calculator, contact).

---

## 1. Salix design system (extracted from the live site)

### Typography
| Role | Salix spec |
|---|---|
| Display font | **Geist**, weight 500 |
| Body font | **Inter**, weight 500 |
| Hero h1 | 64px / 1.1 line-height / letter-spacing −3.5px (≈ −0.055em) |
| Section h2 | 44px / 1.2 / −2.5px (≈ −0.057em) |
| Body copy | 14px / 1.7, color #181818 (secondary gray #46484D) |
| Badges & labels | 12px pill text |

Headings are sentence case, always dark near-black — never gray. Subtitles are short, centered, max ~2 lines.

### Color
- Canvas: pure white `#FFFFFF`
- Ink: `#181818` (headings) and `#46484D` (secondary text)
- Soft surface for cards: `#FAFAFA` / `rgba(108,111,118,0.06)`
- Accent blue: `#466CF3` (logo, small accents, links)
- CTA buttons: near-black `#030303` pill with a subtle **blue→purple→pink gradient glow** behind it
- Hairlines are extremely light; most separation comes from surface tint, not borders

### Buttons
- Primary CTA: dark pill, `border-radius: 100px`, white 14–15px label, generous padding (~16px 28px), gradient glow underneath, slight scale-up on hover with the glow intensifying. Salix renders a duplicated label that slides on hover (text-swap animation).
- Secondary: white pill with hairline border and soft shadow.
- Microcopy under CTA ("No Credit Card Required" style) in 13px gray.

### Section label badge
White pill, `radius 100px`, `padding 9px 16px`, `box-shadow 0 4px 16px rgba(0,0,0,0.06)`, 12px text, small colored dot/icon at left. Every section opens with one ("Power Pack", "Key Tools", "Core Features"…).

### Layout & padding rhythm
- Content max-width ~1200px, centered.
- Section vertical rhythm: **hero 160px top / 110px bottom; other sections 110–120px bottom padding**, mostly white background throughout — sections are separated by rhythm and badges, not background changes.
- Floating **pill navbar**: detached from the top, rounded ~20px, white/near-white with soft shadow, logo left, center links, Login + dark pill CTA right. Becomes compact/sticky on scroll.
- Section headers: centered badge → h2 → one-line subtitle, then content grid.

### Card layout
- Feature cards: soft-gray (#FAFAFA) rounded ~16–20px cards, generous inner padding (~30px), icon or small visual on top, 18–20px title, 14px gray description. 3-column grid.
- Alternating two-column "key tools" rows: text block (badge, h3, paragraph, link) beside a large rounded product-visual card.
- Stat/testimonial band: big animated counters (0 → target %) paired with quote cards (photo, name, role).
- Pricing-style cards: white card, hairline border, price large, feature checklist, dark pill CTA, "MOST POPULAR" tag on one card.
- FAQ: single-column accordion, hairline dividers, plus/close icon rotation.
- Final CTA band: centered big heading + dark pill CTA on white (or very soft tint), followed by a multi-column footer (brand blurb left, link columns right, copyright row).

### Animations
- Scroll-triggered **fade + rise** (~20–30px translate, ~0.5s ease-out, slight stagger per card) on every section.
- Number counters animate from 0 when scrolled into view.
- Button hover: scale ~1.03 + glow, label slide-swap.
- Accordion open/close height animation.
- Navbar shrink/stick on scroll.

---

## 2. Current Provenance state (what we're mapping from)

`app/page.tsx` sections, in order:
1. Hero (`recruiter-hero-section`) — eyebrow label, h1, copy, CTAs
2. Proof strip (metrics)
3. Snapshot ("What Ariel owned" — 6 tech cards)
4. Demo (guided scenarios, link to /demo)
5. Engineering (workflow steps with arrows)
6. Evidence
7. Decisions & tradeoffs (5 Q/A items)
8. Lessons & limitations panel
9. Business impact calculator
10. Recruiter CTA / contact

Good news: `globals.css` already uses a very close skeleton (Geist-style display font at 500 weight, −0.05em tracking, `#181818` ink, `#FAFAFA` soft surface, pill buttons, `.section-label` dot pills, `.shell` max-width container). This is a **restyle + re-layout**, not a rebuild. The pink accent (`--accent-pink #f83d69`) gets replaced by Salix blue `#466CF3` + gradient glow.

---

## 3. Section-by-section mapping (all sections based on Salix)

| # | Salix pattern | Provenance content |
|---|---|---|
| Nav | Floating pill navbar, sticky-shrink | Provenance logo left; Overview / Demo / Engineering / Evidence links center; "Contact Ariel" as the dark pill CTA right |
| 1 | Hero: badge pill → huge centered h1 → 2-line subtitle → glowing dark pill CTA → microcopy | Badge: "AI automation case study · Built by Ariel Magalso". H1: "Reliable support automation that knows when not to answer." CTA: "Run the 60-second demo", microcopy: "No signup required" |
| 2 | Logo/trust strip → "Why businesses choose" 3-card grid | Proof strip metrics become the 3-card grid ("Why this project matters"): eval results, verified citations, human-review workflow |
| 3 | "Key Tools" alternating two-column rows with big visual cards | The 3 guided demo scenarios — each row: badge, h3, description, "Run scenario →" link beside a rounded screenshot/visual card of the demo UI |
| 4 | "Core Features — What's inside Salix?" 6-card soft-gray grid | Snapshot section ("What's inside Provenance?"): the 6 stack cards (interface, retrieval, AI workflow, operations, safety, delivery) |
| 5 | "Growth Gear — Advanced analytics" feature row | Engineering workflow: the 7-step pipeline restyled as a Salix-style visual card with the step list beside it |
| 6 | Stat counters + testimonial cards | Evaluation evidence: animated counters (45 eval cases, 10/10 held-out, groundedness thresholds) with "quote" cards holding the honest-limitations copy |
| 7 | Pricing cards | Repurpose the card pattern for **Decisions & tradeoffs**: white hairline cards in a grid, each a defended implementation choice (no fake pricing) |
| 8 | FAQ accordion | Lessons & limitations + calculator assumptions as an accordion ("Is the demo live or simulated?", "What are the limits?", "How is impact calculated?") — calculator stays, placed under it |
| 9 | Final CTA band "Ready to get started fast?" | "Looking for someone who can take AI automation from prototype to accountable workflow?" → dark pill "Contact Ariel" + secondary "View portfolio" |
| Footer | Multi-column footer | Brand blurb left; columns: Project (Demo, Evals, Architecture, Source), Ariel (Portfolio, LinkedIn, Email); copyright row |

---

## 4. Implementation phases

### Phase 1 — Design tokens & typography (globals.css)
- Add **Geist** (display) and **Inter** (body) via `next/font` in `app/layout.tsx`.
- Update tokens: accent `#466CF3`; remove pink accent; keep `#181818` ink, `#FAFAFA` surface.
- Type scale: hero `clamp(40px, 6.4vw, 64px)` w 500 / −0.055em; section h2 `clamp(30px, 4.5vw, 44px)` / −0.057em; body 14–15px / 1.7.
- Section rhythm utilities: `--section-pt: 110px`, hero 160px top, mobile ~70px.

### Phase 2 — Buttons, badges, navbar
- `.btn-primary`: radius 100px, `#030303`, gradient-glow pseudo-element (blue→purple→pink blur), hover scale 1.03.
- `.btn-secondary`: white pill, hairline, soft shadow.
- `.section-label`: restyle to Salix badge (white pill, 0 4px 16px shadow, dot icon).
- New floating pill navbar component (sticky, shrink on scroll, mobile menu).

### Phase 3 — Section rebuilds (order above)
Rebuild `app/page.tsx` section markup to the Salix layouts in the mapping table: centered section headers, 3-col card grids, alternating rows, counter band, decision cards, accordion, CTA band, footer. All existing copy and links preserved; components (`BusinessImpactCalculator`, scenario links) re-wrapped, not rewritten.

### Phase 4 — Animations
- Small `Reveal` client component (IntersectionObserver + CSS transition): fade-up 24px, 0.5s, staggered children. Wrap every section.
- `CountUp` component for the eval stats.
- Accordion with animated height (details/summary + grid-rows trick or small state component).
- Respect `prefers-reduced-motion`.

### Phase 5 — Inner pages & QA
- Apply navbar/footer/buttons/typography to `/demo`, `/architecture`, `/evals`, `/inbox`, `/corpus` so the system is consistent.
- Verify: mobile (375px) hero scaling, navbar collapse, card grids stacking; dark-ink contrast; Lighthouse; run existing eval pages untouched functionally.
- Deploy to Vercel.

---

## 5. Estimated effort
- Phase 1–2: ~1 session (tokens, fonts, buttons, navbar)
- Phase 3: ~1–2 sessions (nine section rebuilds)
- Phase 4–5: ~1 session (animations, inner pages, QA, deploy)
