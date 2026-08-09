# Provenance Agero-Inspired Recruiter-First Redesign Plan

Reference: [Agero](https://agero.framer.website/)

## Purpose

Redesign every Provenance page using the spacious, image-led, modern agency language of Agero while keeping Provenance unmistakably an AI automation case study built by Ariel Magalso.

This plan replaces the visual direction in `PLAN-td-apex-recruiter-first-redesign.md`. It preserves the recruiter-first information strategy, the working demo, the fictional-workspace disclosure, the committed evaluation evidence, and the honest limitations of the project.

The redesign should borrow Agero's composition, pacing, typography hierarchy, rounded surfaces, and motion grammar. It must not copy Agero's brand, copywriting, portfolio projects, imagery, pricing, testimonials, founder story, or claims.

## Recruiter outcome

Within 15 seconds, a recruiter should understand:

- Provenance is a working AI support-automation case study.
- Ariel Magalso designed and built the product.
- The system retrieves evidence, verifies claims, and chooses whether to answer, request human review, or block.
- The product has a live demo, source code, architecture, evaluation results, and human-review workflow.
- The project uses fictional data and does not claim production adoption.

Within 60 seconds, a technical reviewer should be able to find:

- Ariel's exact ownership and technical scope.
- The end-to-end pipeline and engineering decisions.
- The three responsible outcomes.
- The committed `45/45` development-set result.
- The limitation that this is not held-out production proof.
- The audit trail, corpus, and operator workflow.

## Reference-site findings

The Agero reference uses a calm, premium agency system rather than a dense product-dashboard system.

### Visual system

- Soft gray canvas: approximately `#dcdcdc`.
- Lighter section surface: approximately `#f0f0f0`.
- Primary ink: approximately `#131313`.
- Muted copy: approximately `#5c5c5c`.
- Warm orange accent: approximately `#ff4d00`.
- Large display face: Cal Sans, usually 64–100px on desktop.
- Body/UI face: Inter.
- Frequent radii: 24px, 32px, and 50px pills.
- Generous open space before and after major statements.
- Thin, low-contrast separators inside information-heavy sections.

### Layout grammar

- Segmented hero headlines with selected words in orange or muted gray.
- Large rounded hero containers rather than edge-to-edge dark canvases.
- Very large, low-contrast section titles used as background landmarks.
- Black rounded portfolio panels with a central media object and metadata around it.
- Editorial two-column service rows: visual proof on one side, explanation and metadata on the other.
- Centered manifesto statements with mixed black and gray text.
- Large image cards in two-column archives.
- Contact sections that pair a simple form with a strong visual panel.
- Pill chips for capabilities, tags, and compact calls to action.
- Motion based on fade, rise, scale, and horizontal marquees rather than heavy parallax.

### Responsive observations

- Primary mobile breakpoint: approximately `810px`.
- Additional layout changes around `1200px` and `1440px`.
- Desktop multi-column panels become single-column narratives on mobile.
- Display headlines remain prominent but wrap into shorter lines.
- Rounded cards remain, with reduced radius and padding.
- Navigation collapses into a simple menu rather than compressing every link.

## What Provenance should adopt

- Soft-gray page canvas and light rounded section surfaces.
- Black rounded proof panels for the live product, architecture, and evaluation artifacts.
- Segmented headlines with a single warm-orange emphasis.
- Large ghost headings as section landmarks where contrast remains accessible.
- Editorial image/interface-led sections with metadata placed around the proof.
- Alternating centered statements and asymmetric two-column layouts.
- Pill tags for ownership, stack, evidence, and status.
- Calm motion and generous white space.
- Stronger visual separation between assumptions, evidence, and conclusions.
- A consistent contact/recruiter CTA on every route.

## What Provenance must not copy

- Do not copy the Agero name, logo, project names, founder identity, pricing, testimonials, awards, or service claims.
- Do not use Agero's project images or reproduce its portfolio mockups.
- Do not invent customers, production use, conversion metrics, awards, revenue, or endorsements.
- Do not present the `45/45` development set as held-out or production evidence.
- Do not add a contact form unless it has a real submission workflow.
- Do not use orange as an outcome color. Approved, review, and blocked must retain semantic status colors.
- Do not add decorative motion that delays access to the live demo or hides essential text.
- Do not retain the existing Apex visual layer alongside the Agero system.

## Preserve recent design decisions

The redesign must retain the user's recent preferences:

- Keep the homepage headline smaller and centered.
- Keep section spacing compact; do not return to 120–160px gaps.
- Do not add decorative full-width eyebrow divider lines.
- Use the selected single Evidence Split hero card.
- Do not restore the two decorative stacked cards behind the hero interface.
- Keep outcome icons and labels large and readable.
- Keep process numbers visually prominent.
- Keep the recruiter FAQ centered.
- Keep the `45/45` score large, readable, and explained with context.
- Keep strong contrast for every light-surface table and section heading.
- Keep the improved Product Thinking calculator as a structured assumptions-to-results dashboard.

## Recruiter-first content order

Every route should answer questions in this order:

1. What is this page proving?
2. What did Ariel build personally?
3. What working artifact can I inspect?
4. Which engineering decision matters most?
5. What evidence supports the claim?
6. What limitation remains?
7. What should I open next?

## Design system

### Color tokens

```css
--agero-canvas: #dcdcdc;
--agero-surface: #f0f0f0;
--agero-surface-raised: #f7f7f5;
--agero-ink: #131313;
--agero-ink-soft: #303030;
--agero-muted: #5c5c5c;
--agero-faint: rgba(19, 19, 19, 0.16);
--agero-ghost: rgba(19, 19, 19, 0.10);
--agero-panel: #0c0c0c;
--agero-panel-raised: #191919;
--agero-panel-copy: rgba(255, 255, 255, 0.72);
--agero-orange: #ff4d00;
--agero-orange-dark: #bf3a00;
--approved: #56a622;
--human-review: #b77900;
--blocked: #d84545;
```

Status colors remain semantic:

- Approved: green + check icon + text.
- Human review: amber + review icon + text.
- Blocked: red + shield icon + text.
- Orange: navigation, editorial emphasis, interactive focus, and recruiter CTA only.

### Typography

- Display: Cal Sans if licensed and available locally.
- Safe display fallback: Space Grotesk or Geist Sans.
- Body/UI: Inter.
- Utility/code: existing system mono stack.
- Homepage hero: `clamp(48px, 6vw, 82px)`, weight 500–600, line-height `0.94–1`.
- Inner-page hero: `clamp(44px, 5.5vw, 76px)`.
- Ghost section landmark: `clamp(64px, 10vw, 120px)` with low contrast.
- Primary section title: `clamp(38px, 5vw, 68px)`.
- Card title: `24–42px`.
- Body: `15–18px`, line-height `1.55–1.7`.
- Utility label: `10–12px`, mono or Inter, uppercase only when useful.

### Spacing and shape

- Desktop section padding: `64–96px`.
- Tablet section padding: `52–72px`.
- Mobile section padding: `40–56px`.
- Keep the current compact page rhythm; use open space inside sections instead of giant empty gaps between sections.
- Main content width: `1240–1360px`.
- Reading width: `680–780px`.
- Major rounded surface: `28–32px`.
- Standard card: `20–24px`.
- Controls and fields: `12–16px`.
- Buttons and chips: `999px`.
- Use separators only inside tables, timelines, accordions, and forms.

### Motion

- Initial hero words: staggered fade and rise, total duration under 700ms.
- Section reveals: opacity + `12–20px` rise.
- Portfolio/proof panels: subtle scale from `0.98` to `1`.
- Marquees: slow and optional; pause on hover and under reduced motion.
- Card hover: media scale no more than `1.02`; metadata remains stationary.
- Accordion: animate content height and icon rotation without hiding focus.
- `prefers-reduced-motion` must remove all nonessential motion.

## Global shell

### Navigation

Desktop layout:

```text
PROVENANCE                         DEMO  ENGINEERING  EVIDENCE  SOURCE  ARIEL  CONTACT
```

- Place the navigation inside a light rounded top container inspired by Agero.
- Keep the fictional-project disclosure as a compact status pill: `Independent project · No customer data`.
- Use a small orange dot for availability/project status.
- Make `Contact` or `Run demo` the dark pill CTA.
- Use sentence case rather than all-uppercase navigation.

Mobile:

- Wordmark left, rounded menu trigger right.
- Full-screen light menu with oversized route labels.
- Preserve focus trap, Escape handling, body-scroll lock, and focus restoration.

### Footer

- Light-gray footer with a large rounded black recruiter CTA panel.
- Heading: `Looking for someone who can turn AI prototypes into accountable products?`
- Primary CTA: `Contact Ariel`.
- Secondary actions: Portfolio, GitHub, LinkedIn, Source, Demo.
- Include route directory, authorship, and fictional-project disclosure.
- No newsletter or fake contact form.

## Shared component strategy

Create or refactor shared components instead of adding another override layer to `globals.css`:

- `AgeroPageHero`: segmented headline, intro, metadata, actions.
- `GhostSectionHeading`: large low-contrast landmark behind a readable heading.
- `ProofPanel`: black rounded evidence surface with media and metadata slots.
- `EditorialSplit`: media/content two-column section.
- `PillMarquee`: optional ownership/stack/evidence ticker.
- `MetricStrip`: recruiter proof numbers.
- `StatusPill`: approved, review, blocked.
- `RecruiterCTA`: consistent final action panel.
- `ArchiveGrid`: two-column evidence/document archive.
- `Accordion`: centered, accessible disclosure rows.

Use shared tokens and component classes. Do not append a fourth visual-system patch to the end of the existing stylesheet.

## Page-by-page redesign

### 1. Homepage `/`

#### Hero

- Place the hero inside a large light rounded container.
- Keep the centered headline: `Reliable automation needs proof.`
- Segment the headline with restrained emphasis:
  - `Reliable automation` in primary ink.
  - `needs` in muted gray.
  - `proof.` in warm orange.
- Keep `Designed and built by Ariel Magalso` visible above the title.
- Supporting sentence: `Provenance retrieves approved policy, verifies generated claims, and knows when not to answer.`
- Primary action: `Run the live demo`.
- Secondary actions: Source and Ariel's portfolio.
- Keep ownership pills: Product design, Full-stack, AI architecture, Evaluation.

#### Hero product artifact

- Use the selected Evidence Split design as one black rounded panel.
- Do not use decorative stacked background cards.
- Center a ticket/answer split within the panel.
- Keep citation ID, unsupported-claim count, outcome label, and `0.96` gate score visible.
- Use orange only for a small active/proof accent; retain semantic green for approval.
- On mobile, stack ticket, response, and proof strip vertically.

#### Remove design-selection artifacts

- Remove the temporary `Compare 3 mockups` link.
- Remove the production-facing mockup comparison board after mockup 1 is established.
- Delete `HeroMockups.tsx` only during implementation after confirming no remaining references.

#### Ownership and proof strip

- Follow the Agero marquee rhythm using real recruiter facts:
  - Product design.
  - Full-stack development.
  - AI workflow architecture.
  - Evaluation and deployment.
- Follow immediately with `45/45`, `52 passages`, `3 routes`, and `1 human-review workflow`.
- Every metric includes one line of context.

#### Thesis / manifesto

- Use an Agero-style centered statement with mixed black and gray typography.
- Keep the existing smaller thesis headline.
- Place the orange emphasis on `permission to act`, not on a fabricated metric.
- Keep role, scope, constraint, and next proof in a compact metadata rail.

#### Three responsible outcomes

- Recompose the three scenario cards as Agero-style portfolio panels.
- Use one large black panel at a time on desktop or a two-column archive with strong crops.
- Each scenario shows:
  - question;
  - route;
  - why the route was chosen;
  - evidence or refusal reason;
  - `Run this scenario` action.
- Keep the larger outcome icon and label.
- Ensure hover state changes icon, label, and background together with sufficient contrast.

#### Engineering capability section

- Adapt Agero's `What we do` service rows.
- Each row pairs a live interface/diagram with implementation details:
  - Retrieval.
  - Claim verification.
  - Responsible routing.
  - Audit and human handoff.
- Include technology, purpose, and recruiter-relevant ownership.

#### Published evidence

- Use a black rounded proof panel containing:
  - large readable `45/45`;
  - development-set label;
  - route-category breakdown;
  - limitation card;
  - scorecard CTA.
- Preserve the evidence context added to the score card.
- Never allow label styles to override the animated number size.

#### Operational process

- Use six clean Agero-style service rows or a two-by-three grid.
- Keep the larger `01–06` process numbers.
- Pair each step with one concise sentence and optional diagram.
- Avoid decorative lines outside the grid itself.

#### Recruiter FAQ

- Keep the centered 820px accordion column.
- Use a large ghost heading behind the readable section title.
- Keep the four current recruiter questions.
- Add orange focus/active treatment, not orange body text.

#### Product Thinking calculator

- Preserve the redesigned assumptions-to-results dashboard.
- Place it inside a large black rounded panel on the light page.
- Keep the first result card highlighted.
- Add a compact formula/assumption disclosure.
- Do not imply measured customer ROI.

#### Closing recruiter CTA

- Replace the current generic learning ending with a rounded black CTA followed by the learning notes.
- Primary action: `View Ariel's portfolio`.
- Secondary action: `Inspect the source`.

### 2. Guided demo `/demo`

- Use a segmented page hero: `See the pipeline / make / a responsible decision.`
- Place the live workflow inside a large black rounded ProofPanel.
- Keep the scenario selector visible before the console.
- Use an editorial split:
  - left: question and scenario context;
  - center: retrieval and response;
  - right: route decision and evidence.
- Turn the audit trail into an Agero-style vertical project timeline.
- Add a concise ownership strip: interface, API routes, retrieval, verification, persistence.
- Keep all current interactions and APIs unchanged.

### 3. Architecture `/architecture`

- Use a light rounded hero with a segmented engineering headline.
- Recompose the eight stages using Agero service rows:
  - large number;
  - implementation explanation;
  - diagram/interface proof;
  - implementation note disclosure.
- Alternate media left/right to avoid a repetitive vertical list.
- Keep the Decision Gates section on a light surface with dark readable copy.
- Preserve the recently fixed contrast for the title, gate names, failure conditions, and routes.
- Keep the eval-caught bug as a warm-orange editorial note, clearly labeled as a development finding.

### 4. Evaluation evidence `/evals`

- Use a ghost `Evaluation Evidence` landmark heading.
- Place the `45/45` result in a black rounded proof panel with a large light number.
- Use a metric strip for answerable, unanswerable, adversarial, false approval, and unsafe completion.
- Present the committed evaluation document like an Agero blog/article page.
- Use orange for section navigation and anchors; use semantic status colors inside results.
- Give the limitation its own prominent card near the score rather than burying it at the bottom.

### 5. Policy corpus `/corpus`

- Adapt Agero's blog/archive layout.
- Use a large ghost `Policy Corpus` heading.
- Add visible category chips for pricing, access, refunds, liability, and operations.
- Present policy documents in a two-column archive on desktop and one column on mobile.
- Each card shows passage ID, policy title, version, updated date, and excerpt.
- Opening a document should preserve stable anchor links and code/citation readability.
- Do not use unrelated photography; use typography, document previews, and interface crops.

### 6. Agent inbox `/inbox`

- Adapt Agero's contact-page split layout.
- Left side: live review queue and selected ticket context.
- Right side: large decision panel with evidence, route reason, and approve/reject actions.
- Use a black rounded operator panel rather than a decorative image.
- Keep audit history visible below as an archive grid.
- Preserve API behavior, persistence, accessibility, and destructive-action confirmation.
- Make `Human judgment, where automation stops.` the page's segmented headline.

## Responsive plan

### Desktop: `1200px+`

- Two-column heroes and editorial splits.
- 1240–1360px content shell.
- 64–100px display landmarks.
- Black proof panels can use three-column metadata.

### Tablet: `810–1199px`

- Preserve two columns only where each side remains at least 340px wide.
- Stack product UI under page intros.
- Reduce section padding and display size.
- Convert archives to two balanced columns.

### Mobile: `<810px`

- One-column flow everywhere.
- 20px page gutters.
- 18–22px panel radius.
- Hero headline `40–52px`.
- Hide ghost headings when they reduce readability.
- Stack ticket, answer, and route blocks.
- Make controls and actions full width.
- Preserve 44px minimum touch targets.
- Prevent tables, code, and audit rows from causing horizontal overflow.

## Accessibility requirements

- Meet WCAG AA contrast for all body copy and controls.
- Ghost headings are decorative and must not carry unique information.
- Every icon has adjacent text or an accessible label.
- Outcome must never be communicated by color alone.
- Maintain visible focus on links, buttons, sliders, accordions, menu items, and form controls.
- Preserve semantic heading order.
- Use real buttons for actions and links for navigation.
- Accordions use native `details/summary` or an equivalent accessible implementation.
- Mobile menu retains focus trap, Escape close, and focus restoration.
- Respect reduced-motion and reduced-transparency preferences.

## Performance requirements

- Prefer CSS and SVG diagrams over heavyweight video.
- Use `next/image` for any captured interface imagery.
- Keep hero media below 250KB where practical.
- Avoid loading reference-site assets.
- Remove unused Apex and Moro CSS rather than carrying three design systems.
- Keep fonts to one display family, Inter, and the system mono stack.
- Use content visibility only for long below-the-fold route sections.

## Implementation file map

### Global foundation

- `app/layout.tsx`
  - update font setup and metadata theme colors.
- `app/globals.css`
  - consolidate tokens and components into one Agero system;
  - remove obsolete Moro/Apex override layers;
  - keep shared product UI tokens where behavior depends on them.
- `app/components/SiteNav.tsx`
  - rounded light navigation and mobile menu.
- `app/components/SiteFooter.tsx`
  - black recruiter CTA plus light route directory.
- `components/ui/button.tsx`
  - dark/orange pill variants and accessible focus states.

### Shared editorial components

- `app/components/Editorial.tsx`
  - refactor header, section intro, archive, metric, and status primitives.
- New `app/components/AgeroPageHero.tsx`.
- New `app/components/ProofPanel.tsx`.
- New `app/components/EditorialSplit.tsx`.
- New `app/components/RecruiterCTA.tsx`.

### Homepage

- `app/page.tsx`
  - reorder and recompose recruiter-first sections.
- `app/components/BusinessImpactCalculator.tsx`
  - preserve logic; restyle through consolidated classes.
- `app/components/HeroMockups.tsx`
  - remove after mockup 1 is fully integrated and references are gone.

### Inner routes

- `app/demo/page.tsx`
- `app/components/TicketWorkflow.tsx`
- `app/architecture/page.tsx`
- `app/evals/page.tsx`
- `app/corpus/page.tsx`
- `app/inbox/page.tsx`
- `app/components/AgentInbox.tsx`

### Metadata and social preview

- Update `app/opengraph-image.png` to the soft-gray, black-panel, orange-accent system.
- Keep `app/opengraph-image.alt.txt` accurate.

## Implementation phases

### Phase 0 — Baseline and cleanup map

- Capture current screenshots for all six routes.
- Record working demo, inbox, navigation, accordion, and calculator behavior.
- Identify every Apex/Moro override block before removing it.
- Confirm the exact files containing uncommitted user work.

### Phase 1 — Tokens and global shell

- Implement colors, typography, radii, spacing, focus, and motion tokens.
- Rebuild navigation, buttons, and footer.
- Verify light/dark surface contrast before moving to page work.

### Phase 2 — Shared components

- Build page hero, proof panel, editorial split, archive, metric strip, status pill, and recruiter CTA.
- Add Storybook-like route examples only if already supported; do not add a new framework solely for this redesign.

### Phase 3 — Homepage

- Implement the rounded hero and selected Evidence Split artifact.
- Remove temporary mockup-selection UI.
- Recompose outcomes, engineering, evidence, process, FAQ, calculator, and closing CTA.
- Verify recruiter comprehension at the 15-second and 60-second marks.

### Phase 4 — Inner routes

- Redesign Demo and Inbox first because they contain live behavior.
- Redesign Architecture, Evals, and Corpus using the shared editorial templates.
- Preserve URLs, API calls, query/state behavior, and anchor links.

### Phase 5 — Responsive and motion

- Tune desktop, tablet, and mobile layouts.
- Add motion after layout is stable.
- Verify reduced-motion behavior.

### Phase 6 — CSS consolidation

- Remove obsolete Apex/Moro declarations and redundant final-precedence patches.
- Confirm no deleted class remains referenced.
- Keep one authoritative token block and one responsive system.

### Phase 7 — Verification

- Run TypeScript, lint if configured, `git diff --check`, and production build.
- Test every public route at desktop and mobile widths.
- Test all interactive flows in the browser.
- Check console errors and horizontal overflow.
- Verify metadata and social preview.

## Acceptance checklist

### Recruiter clarity

- [ ] Ariel's authorship and ownership are visible above the fold.
- [ ] The live demo, source, architecture, evals, portfolio, and contact actions are easy to find.
- [ ] The system's three responsible outcomes are understandable without reading source code.
- [ ] The evidence and limitation are both visible.
- [ ] No customer, production, revenue, or endorsement claim is invented.

### Visual quality

- [ ] One coherent Agero-inspired system is used across all routes.
- [ ] Soft-gray, light, black, and orange surfaces maintain readable contrast.
- [ ] The single hero evidence card has no stacked decorative layers.
- [ ] Ghost headings never replace accessible headings.
- [ ] Cards, radii, spacing, and motion are consistent.
- [ ] The temporary mockup comparison UI is removed.

### Functional quality

- [ ] Demo scenarios still run.
- [ ] Ticket creation and routing still work.
- [ ] Inbox actions and audit history still work.
- [ ] Calculator values update correctly.
- [ ] Navigation and mobile menu work with keyboard and touch.
- [ ] FAQ accordion remains accessible.
- [ ] Corpus anchors and source links remain correct.

### Technical quality

- [ ] `npx tsc --noEmit` passes.
- [ ] `git diff --check` passes.
- [ ] `npm run build` passes.
- [ ] No browser console errors.
- [ ] No horizontal overflow at supported widths.
- [ ] No obsolete Agero reference assets or copied content are included.

## Recommended implementation order

1. Consolidate the design tokens and remove conflicting visual layers.
2. Rebuild navigation, footer, buttons, and shared editorial primitives.
3. Redesign the homepage and remove the temporary mockup comparison UI.
4. Redesign Demo and Inbox while verifying live behavior.
5. Redesign Architecture, Evals, and Corpus.
6. Update social preview and metadata styling.
7. Complete responsive, accessibility, performance, and production-build QA.

## Definition of done

The redesign is complete when all six public routes use one coherent Agero-inspired visual system, the working product behavior is preserved, recruiter evidence is easier to scan, every limitation remains honest, the temporary mockup-selection UI is removed, and the production build passes without accessibility, contrast, overflow, or console regressions.
