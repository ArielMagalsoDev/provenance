# Provenance TD Apex–Inspired Recruiter-First Redesign Plan

Reference: [TD Apex](https://td-apex.framer.website/)

## Purpose

Redesign every public Provenance page using the compact, high-contrast, performance-focused visual language of TD Apex while making the portfolio easier for a recruiter or hiring manager to evaluate.

This plan supersedes the visual direction in `docs/PLAN-td-moro-redesign.md`. It preserves the information strategy in `docs/PLAN-recruiter-first-layout.md`, the live product behavior, the fictional-workspace disclosure, the committed evaluation evidence, and the honest limitations of the project.

The redesign should borrow TD Apex's visual grammar, not its fitness brand, wording, photography, testimonials, pricing, or claims.

## Recruiter outcome

Within the first 15 seconds, a recruiter should understand:

- Ariel Magalso designed and built Provenance.
- Provenance is a working AI support-automation case study, not a static concept.
- The system retrieves policy evidence, verifies claims, and chooses whether to answer, request human review, or block.
- Ariel owned product design, full-stack implementation, AI workflow architecture, evaluation, and deployment.
- The live demo, source code, architecture, eval results, portfolio, and contact action are immediately available.

Within the first 60 seconds, a technical reviewer should be able to find:

- The system pipeline and technical stack.
- The three responsible outcomes.
- The committed 45-case development-set result.
- A known limitation and next validation step.
- A real human-review workflow and audit history.

## Reference-site findings

TD Apex uses a compact, conversion-oriented visual system:

- Near-black charcoal canvas, approximately `#1a1e1e`.
- Warm off-white type, approximately `#f3eee4`.
- Electric lime primary accent, approximately `#b8ff3f`.
- Warm peach ticker/accent surface, approximately `#efcbbb`.
- Display type similar to Clash Grotesk: bold, condensed-feeling, uppercase, and tightly composed.
- Measured desktop hero type: approximately `64px / 59.5px`, weight 600.
- Measured mobile hero type: approximately `40px / 37.2px`.
- Navigation height: approximately `64px` on desktop and mobile.
- Full-bleed hero media with dark overlays and text anchored over the image.
- A continuous announcement ticker above navigation.
- Neon pill CTAs with a circular arrow treatment.
- Strong numerical proof directly after the opening proposition.
- Compact system/process steps instead of long explanatory cards.
- Alternation between dark full-bleed sections, warm light panels, and neon highlights.
- Monospaced utility labels and navigation paired with a bold grotesk display face.
- Inner pages repeat the same hero-image treatment, dark surfaces, category labels, compact metadata, and conversion panel.
- Mobile layouts preserve the visual impact while dropping the navigation into a simple menu trigger.

## What Provenance should adopt

- Dark, confident, full-bleed presentation.
- Smaller, centered headline scale rather than the previous oversized editorial type.
- Neon-lime primary actions and selected states.
- A compact announcement/disclosure ticker.
- Real interface imagery as the hero asset.
- Strong proof numbers early in the page.
- Clear three-step and outcome-based storytelling.
- Compact uppercase labels using a mono face.
- Image or interface crops that carry the visual weight of each section.
- Rounded CTA pills with a circular arrow end-cap.
- Dense but readable operational panels for the demo and inbox.
- A consistent recruiter CTA across all routes.

## What not to copy

- Do not copy the Apex name, wordmark, fitness copy, photography, trainer imagery, testimonials, review counts, pricing cards, coaching tiers, article content, or footer details.
- Do not invent customers, production usage, revenue, awards, endorsements, or reliability claims.
- Do not present the 45-case development set as held-out or production evidence.
- Do not use generic AI-generated people or office photography as proof.
- Do not replace working UI with static screenshots where interaction matters.
- Do not add a newsletter or contact form unless the submission workflow is real.
- Do not use lime as the only indicator of status; every outcome requires text and an icon.
- Do not retain the TD Moro cyan-led visual language alongside Apex lime; the new system should be coherent.

## Recruiter-first content order

Every route should answer reviewer questions in this order:

1. What is this page proving?
2. What did Ariel personally own?
3. What works in the product?
4. What engineering decision made it reliable?
5. What evidence supports the claim?
6. What limitation remains?
7. Where can the reviewer go next?

## Design direction

### Color tokens

```css
--apex-bg: #171b1b;
--apex-bg-deep: #0b0e0e;
--apex-panel: #222727;
--apex-panel-raised: #2b3030;
--apex-cream: #f3eee4;
--apex-cream-muted: #c8c1b7;
--apex-lime: #b8ff3f;
--apex-lime-dark: #77a91f;
--apex-peach: #efcbbb;
--apex-line-dark: rgba(243, 238, 228, 0.16);
--apex-line-light: rgba(23, 27, 27, 0.18);
--status-review: #ffc95a;
--status-blocked: #ff6b6b;
```

Status mapping:

- Approved: lime + check icon + `Approved with citations`.
- Human review: amber + person icon + `Human review required`.
- Blocked: coral + shield icon + `Blocked before generation`.

### Typography

- Preferred display font: licensed Clash Grotesk via `next/font/local` if Ariel owns the font files.
- Safe implementation fallback: Space Grotesk or Archivo via `next/font/google`.
- Body/UI: Inter.
- Utility/navigation/code labels: Roboto Mono or the existing system mono stack.
- Homepage hero: `clamp(46px, 5.5vw, 84px)`, centered, weight 600, line-height `0.92–0.98`.
- Inner-page hero: `clamp(44px, 5vw, 72px)`.
- Mobile hero: `clamp(38px, 10.5vw, 48px)`.
- Section statement: `clamp(34px, 4vw, 58px)`.
- Card heading: `24–36px`.
- Body: `15–17px`, line-height `1.55–1.7`.
- Mono utility label: `11–13px`, uppercase, letter-spacing `0.04–0.08em`.

### Spacing and shape

The implementation must preserve Ariel's recent spacing preferences:

- Do not restore the previous 120–160px section gaps.
- Desktop section padding: `56–88px`.
- Tablet section padding: `48–64px`.
- Mobile section padding: `36–52px`.
- Homepage hero top padding: `48–68px` below navigation.
- No decorative full-width line beneath section eyebrows.
- Internal table and audit-row separators may remain where they improve scanning.
- Standard content width: `1280–1440px`.
- Reading width: `680–780px`.
- Major panels: `20–28px` radius.
- Controls: `12–18px` radius.
- CTAs: full pill with a circular arrow end-cap.

### Imagery

Use product evidence instead of fitness photography:

- Live or captured ticket interface.
- Retrieved passage cards with IDs and similarity scores.
- Claim-verification score panels.
- Audit timeline and human-review queue.
- Architecture diagrams generated with HTML/CSS or SVG.
- Evaluation charts produced from committed results.

Images must never imply a real customer deployment.

## Global shell

### Announcement ticker

Replace the static disclosure bar with a compact Apex-style ticker:

```text
INDEPENDENT PORTFOLIO PROJECT  ✦  FICTIONAL WORKSPACE  ✦  NO CUSTOMER DATA  ✦  RUN THE LIVE DEMO  →
```

- Warm peach background with dark mono text.
- Motion may loop slowly but must stop under `prefers-reduced-motion`.
- The disclosure must remain readable without animation.

### Navigation

Desktop:

```text
PROVENANCE                     DEMO   ENGINEERING   EVIDENCE   SOURCE   CONTACT
```

- Dark transparent/overlay navigation, 64px high.
- Provenance wordmark left.
- Recruiter routes right.
- `CONTACT` or `RUN DEMO` receives the lime treatment.
- Keep Portfolio and GitHub accessible without crowding the main route list.

Mobile:

- Wordmark left, 44px menu button right.
- Full-screen dark menu.
- Large route labels with visible focus styles.
- Menu traps focus, closes with Escape, restores trigger focus, and locks background scrolling.

### Footer

- Deep charcoal background with a warm-cream upper CTA panel.
- Lead statement: `Ready to see how Ariel builds accountable AI workflows?`
- Primary action: `View Ariel's portfolio`.
- Secondary actions: Email, LinkedIn, GitHub, Source, Demo.
- Route columns: Case study, Product, Evidence, Ariel.
- Keep `Designed and built by Ariel Magalso` and the fictional-project disclosure.
- No newsletter form.

## Page-by-page redesign

### 1. Homepage `/`

#### Hero — recruiter identity and working proof

- Full-width dark hero with a real Provenance interface crop as the background/focal media.
- Add a subtle dark gradient so text remains readable.
- Centered headline: `Reliable automation needs proof.`
- Keep the headline smaller than the previous Moro version: maximum 84px.
- Supporting statement: `Provenance retrieves approved policy, verifies every material claim, and routes uncertainty to a person.`
- Visible ownership line: `Designed and built by Ariel Magalso`.
- Role tags: Product design, Full-stack, AI architecture, Evaluation.
- Primary lime CTA: `Run the live demo`.
- Secondary actions: Source code, Architecture, Ariel's portfolio.
- Include one precise proof statement above the fold: `45/45 development-set cases passing`.

#### Recruiter proof strip

Adapt Apex's numerical proof row:

- `45/45` development-set cases passing.
- `52` indexed passages.
- `3` responsible outcomes.
- `1` human-review workflow.

Use a warm-cream or lime surface and compact labels. Do not imply production performance.

#### Project statement

Adapt the Apex owner manifesto into a recruiter statement:

> I designed Provenance to automate the safe portion of support work while keeping uncertainty visible and accountable.

Pair it with:

- Problem.
- Approach.
- Ariel's role.
- Current result.
- Known limitation.

#### The system

Adapt Apex's three-step system into:

1. Retrieve approved evidence.
2. Verify every material claim.
3. Answer, route, or block.

Each step should include the actual implementation and an observable product result.

#### What Ariel built

Translate Apex's feature grid into six engineering capabilities:

- Policy ingestion and versioning.
- Vector retrieval.
- Structured cited generation.
- Claim-level verification.
- Human review and Slack handoff.
- Persisted audit and evaluation.

Each card should link to the relevant route or source location.

#### Three responsible outcomes

Replace Apex's transformation/testimonial section with product proof:

- Approved with citations.
- Human review required.
- Blocked before generation.

Use real interface states, not quotes or fabricated user stories.

#### Evaluation evidence

- Large `45/45` result.
- Group breakdown: answerable, unanswerable, adversarial.
- 0% false refusal and 0% fabrication only with explicit `committed development set` language.
- Place the known limitation beside the result.
- CTA: `Read the committed scorecard`.

#### Engineering fit

Adapt Apex's `For every level` grid into hiring-relevant capability areas:

- Product-minded frontend.
- Full-stack workflow engineering.
- AI retrieval and verification.
- Operations and human-in-the-loop design.

This section should explain how the project demonstrates Ariel's fit, without using self-awarded skill ratings.

#### FAQ for recruiters

Use a compact accordion:

- What did Ariel build personally?
- Is the demo connected to real customer data?
- What parts are simulated?
- How is hallucination risk handled?
- What would need to change before production?
- Where can I inspect the source and evals?

#### Closing recruiter CTA

- Headline: `Looking for someone who can turn an AI prototype into an accountable workflow?`
- Primary: `View Ariel's portfolio`.
- Secondary: Contact Ariel, LinkedIn, Source, Replay demo.

### 2. Guided demo `/demo`

- Dark full-bleed page opening: `One inbox. Three responsible outcomes.`
- Put the working ticket panel immediately below the opening, above secondary explanation.
- Restyle the three scenarios as compact Apex-style selector tabs.
- Selected scenario uses lime; review uses amber; blocked uses coral.
- Preserve custom questions, channel selection, workspace upload, Turnstile, loading, caching, errors, and audit behavior.
- Keep the three-column desktop product view:
  - Incoming ticket.
  - Evidence pipeline.
  - Automation decision.
- Use dense dark panels with warm-cream text and strong numeric groundedness scores.
- Present decision history as a compact mono audit archive.
- Add a recruiter rail titled `What this proves`:
  - evidence remains visible;
  - citations come from verified support;
  - weak claims route to a human;
  - decisions persist in the audit trail.
- Keep sending to the customer clearly labeled as simulated.

### 3. Architecture `/architecture`

- Hero: `How Provenance earns permission to act.`
- Use a dark architectural canvas with a large pipeline diagram as the visual asset.
- Preserve the eight current stages.
- Recompose them into three Apex-style system groups:
  - Control: ingestion and input screening.
  - Reasoning: retrieval, generation, verification.
  - Operation: routing, handoff, audit/evaluation.
- Use large stage numbers, compact mono labels, and lime active connections.
- Keep a sticky route index on desktop and horizontal index on mobile.
- Add an explicit decision-threshold table.
- Highlight the insurance/liability concept-conflation bug as `Bug found by evals`.
- End with Demo, Evals, Corpus, and Source actions.

### 4. Evaluation scorecard `/evals`

- Hero: `Evidence, published as it ran.`
- Use Apex's proof-number rhythm for the summary:
  - 45/45 passing.
  - 100% route accuracy on the committed development set.
  - 0% false refusal.
  - 0% fabrication.
- Keep the Markdown result server-rendered from `evals/results.md`.
- Turn generic Markdown tables into dark archive rows with lime numerical emphasis.
- Separate:
  - Current result.
  - Test groups.
  - Bugs found.
  - Known limitation.
  - Next validation step.
- State prominently: `Development-set evidence is not held-out production proof.`
- Actions: View eval source, Run demo, Inspect architecture.

### 5. Policy corpus `/corpus`

- Hero: `The source material behind every answer.`
- Use a dark knowledge-library treatment inspired by Apex's article archive.
- Sticky document/category index on desktop.
- Compact horizontal document selector on mobile.
- Each document preview should show:
  - filename;
  - topic;
  - section count;
  - relevant passage IDs;
  - `Try this policy in the demo` action.
- Preserve server-side filesystem reading.
- Keep full policy content readable on a warm-cream article surface.
- Use mono styling for filenames, IDs, and code.
- Do not move corpus content into client state.

### 6. Agent inbox `/inbox`

- Hero: `Human judgment, where automation stops.`
- Treat the queue like Apex's category/archive list rather than stacked SaaS cards.
- Queue rows show ticket summary, reason, status, source, and time.
- Lime indicates the selected ticket and primary approval action.
- Amber indicates human-review context.
- Coral indicates rejection or blocked context.
- Keep selected ticket detail in a high-contrast panel.
- Preserve loading, empty, error, approve, dismiss, replay, and correction-learning states.
- Keep the decision controls sticky on desktop and in flow on mobile.
- Explain the session-scoped correction model and 30-minute expiry.
- Link the workflow explicitly to the demo, Slack handoff, and architecture route.

## Shared component plan

### Create or refactor

- `ApexTicker` — disclosure and live-demo message.
- `ApexNav` — dark desktop navigation and accessible mobile menu.
- `ApexFooter` — recruiter CTA and route directory.
- `ApexHero` — centered title, proof, ownership, actions, and optional media.
- `ArrowPill` — lime/cream/outline CTA with circular arrow end-cap.
- `ProofStat` — large number, exact qualifier, evidence link.
- `SystemStep` — number, implementation, operational result.
- `InterfaceMedia` — live UI or screenshot crop with dark overlay.
- `RecruiterProof` — ownership, stack, result, limitation.
- `OutcomeCard` — approved/review/blocked with icon and text.
- `DarkArchive` — responsive technical and evidence rows.
- `RecruiterFAQ` — accessible accordion with interview questions.

### Preserve and restyle

- `TicketWorkflow`.
- `AgentInbox`.
- `WorkspaceUpload`.
- `DecisionPanel`.
- `EvidenceSteps`.
- `SlackNotificationCard`.
- `TurnstileWidget`.
- `BusinessImpactCalculator` as an optional bottom-of-page exploration.
- Corpus and eval server-side Markdown rendering.

## File-level implementation map

| File | Planned work |
| --- | --- |
| `app/layout.tsx` | Load final font stack, update metadata theme, install Apex shell |
| `app/globals.css` | Replace Moro tokens with the compact dark/lime system |
| `app/components/SiteNav.tsx` | Implement ticker, dark nav, mobile menu, recruiter links |
| `app/components/SiteFooter.tsx` | Implement recruiter CTA and dark footer directory |
| `app/components/Editorial.tsx` | Refactor shared header/stat/archive primitives into Apex variants |
| `app/page.tsx` | Recompose homepage around identity, proof, system, outcomes, evidence, FAQ, contact |
| `app/demo/page.tsx` | Add Apex hero and recruiter proof rail |
| `app/components/TicketWorkflow.tsx` | Restyle scenario selector, evidence panels, decision, and audit archive |
| `app/architecture/page.tsx` | Group eight stages into control/reasoning/operation system narrative |
| `app/evals/page.tsx` | Add proof summary, limitations, and dark committed-result publication |
| `app/corpus/page.tsx` | Convert to dark archive plus warm reading surface |
| `app/inbox/page.tsx` | Add recruiter-oriented page opening and operational context |
| `app/components/AgentInbox.tsx` | Restyle queue, detail, and sticky decision controls |
| `components/ui/button.tsx` | Add lime arrow-pill, cream, and outline variants |
| `app/opengraph-image.png` | Update to dark/lime Provenance social artwork |

## Motion plan

- Announcement ticker: slow continuous movement; static under reduced motion.
- Hero media: subtle scale-in or opacity reveal under 500ms.
- Headline: one short grouped reveal, not character-by-character animation.
- CTA arrow: small horizontal movement on hover.
- Stats: optional one-time count-up without layout shift.
- System connections: restrained lime progress sweep.
- Archive rows: subtle background or text-color change on hover.
- No page transition may delay navigation or hide content.
- `prefers-reduced-motion` must render every element immediately and stop looping movement.

## Responsive behavior

### Desktop, 1200px+

- Full dark navigation and ticker.
- Centered 64–84px homepage headline.
- Hero interface media remains visible in the first viewport.
- Four-column proof strip.
- Multi-column operational panels.
- Sticky architecture, corpus, and inbox rails.

### Tablet, 768–1199px

- Headline reduces to 54–68px.
- Hero media moves below the recruiter summary if space is constrained.
- Proof grid becomes two columns.
- Demo and inbox may use two columns before stacking.
- Remove nonessential media parallax.

### Mobile, below 768px

- 64px navigation and compact ticker.
- Hero type around 38–48px.
- One-column recruiter summary and interface media.
- Proof stats become a two-column grid.
- Operational panels stack in decision order.
- Sticky rails return to normal document flow.
- Archive tables become labeled rows.
- Touch targets remain at least 44px.
- No horizontal overflow at 375px.

## Accessibility requirements

- One semantic `h1` per route.
- Correct heading sequence throughout each page.
- Skip-to-content link remains available.
- Navigation and menu are fully keyboard operable.
- Mobile menu traps focus, supports Escape, and restores focus.
- Scenario selectors and inbox rows expose selected state programmatically.
- Every form input retains an accessible label.
- Status always uses icon plus text, never color alone.
- Lime/cream combinations must meet WCAG AA for their text size.
- Focus rings must remain visible on dark and light surfaces.
- Decorative media uses empty alternative text; interface evidence gets concise alt text.
- Motion respects `prefers-reduced-motion`.

## Performance requirements

- Use `next/font`; do not load fonts through runtime CSS imports.
- Self-host Clash Grotesk only if licensed font files are available.
- Use optimized images with responsive `sizes`.
- Prefer real UI, CSS, and SVG diagrams over autoplay video.
- Lazy-load below-the-fold media.
- Preserve Server Components for corpus and eval filesystem access.
- Keep client components limited to interactions, animation wrappers, and live product flows.
- Add `content-visibility` to long corpus and architecture sections where safe.
- Avoid layout shift from counters, media, and ticker animation.

## Implementation phases

### Phase 1 — Foundation

- Confirm the final display-font option.
- Replace the cyan/Moro token system with charcoal, cream, lime, and peach.
- Build the ticker, navigation, mobile menu, buttons, and footer.
- Refactor shared hero, stat, system-step, outcome, and archive components.

### Phase 2 — Recruiter-first homepage

- Build the new centered hero and real product media.
- Move precise proof metrics above the fold.
- Add Ariel's ownership and recruiter actions.
- Recompose the system, outcomes, evidence, capability fit, FAQ, and closing CTA.

### Phase 3 — Product routes

- Redesign `/demo` and `TicketWorkflow` without changing API behavior.
- Redesign `/inbox` and `AgentInbox` without changing resolution behavior.
- Verify loading, cached, error, empty, approved, review, blocked, and correction states.

### Phase 4 — Evidence routes

- Redesign `/architecture` around the three system groups and eight stages.
- Redesign `/evals` around proof, limitations, and committed results.
- Redesign `/corpus` as a dark source archive with a warm reading surface.

### Phase 5 — Responsive, accessibility, and social QA

- Update the Open Graph image.
- Verify 375px, 768px, 1024px, 1280px, and 1440px widths.
- Test keyboard navigation and reduced-motion mode.
- Run TypeScript, production build, console, overflow, and direct-route checks.

## Verification checklist

### Recruiter clarity

- Ariel's name and ownership are visible above the fold.
- The first viewport defines the product in one sentence.
- Demo, source, portfolio, and contact actions are visible without searching.
- The exact development-set qualifier appears beside every evaluation result.
- A known limitation and next validation step remain visible.
- No fake customer, review, award, funding, or production claim is introduced.

### Functional behavior

- Guided scenarios still run.
- Custom tickets still run.
- Workspace upload, status, and clear still work.
- Evidence, citations, and decision status still render.
- Inbox loading, empty, selection, approve, dismiss, correction, and replay states still work.
- Slack handoff status still renders.
- Corpus and eval content remain server-rendered from committed files.

### Responsive and visual

- No horizontal overflow at 375px.
- Navigation works at every breakpoint.
- Homepage hero remains legible over product media.
- Section spacing stays within the compact 36–88px system.
- Section eyebrow dividers do not reappear.
- Operational panels stack in a meaningful order.
- Lime is reserved for primary actions, selected states, and key proof.
- Internal table and audit separators remain readable.

### Accessibility and build quality

- Keyboard navigation passes across all interactive elements.
- Focus states are visible on dark and light panels.
- Outcome status is understandable without color.
- Reduced-motion mode stops ticker and reveal animation.
- `npx tsc --noEmit` passes.
- `npm run build` passes.
- Browser console is clean on every route.
- Every route loads directly and through client navigation.
- Metadata and Open Graph artwork match the new visual system.

## Definition of done

The redesign is complete when all six public routes share the TD Apex–inspired dark/lime system; the homepage makes Ariel's ownership, working proof, engineering depth, evaluation evidence, limitations, and contact path clear to recruiters; the live demo and inbox remain fully operational; the recent smaller-heading, compact-spacing, centered-hero, and no-divider preferences are preserved; mobile and accessibility checks pass; and the production build succeeds.
