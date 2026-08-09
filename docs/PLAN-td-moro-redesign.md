# Provenance TD Moro–Inspired Full-Site Redesign Plan

Reference: [TD Moro](https://td-moro.framer.website/)

## Purpose

Redesign every public Provenance page using the editorial, high-contrast visual language of TD Moro while preserving Provenance's recruiter-first information architecture, working product demo, evidence transparency, and honest portfolio positioning.

This plan supersedes the Salix visual direction in `REDESIGN-SALIX.md`. It does not replace the content strategy in `docs/PLAN-recruiter-first-layout.md`; the recruiter-first story remains the source of truth.

## Desired outcome

Within the first 15–20 seconds, a recruiter should understand:

- Ariel Magalso designed and built the project.
- Provenance is an end-to-end AI support automation workflow.
- The system answers, escalates, or blocks based on evidence.
- The implementation includes retrieval, verification, human review, audit logging, and evaluation.
- The demo, architecture, eval scorecard, source code, portfolio, and contact details are easy to reach.

The redesign should feel like an editorial technology case study rather than a generic SaaS landing page.

## Reference-site findings

The TD Moro reference uses a deliberately sparse, editorial system:

- Off-white canvas: approximately `#f6f6f9`.
- Near-black ink: `#000000`, with dark panels around `#131316`.
- Electric cyan accent: approximately `#1ef7ff`.
- Soft gray secondary surface: approximately `#e3e4e8`.
- Display type: Outfit, approximately `120px / 108px`, weight 500, `-8.4px` tracking on desktop.
- Mobile display type: approximately `60px / 60px`, `-2.4px` tracking.
- Supporting headings: Inter Variable, approximately `40px / 44.8px`, weight 400.
- Utility headings: Inter, approximately `16px / 22px`, weight 600.
- Desktop navigation height: approximately `80px`.
- Mobile navigation height: approximately `66px` with a compact menu.
- Large desktop section rhythm: commonly `160px` top and bottom.
- Card radii: primarily `20px`, `32px`, and full pills.
- The page alternates oversized editorial statements, product imagery, compact metadata, tables, and dark conversion sections.
- Inner pages use the same large-type opening, generous whitespace, project grids, archive tables, and simple content columns.
- Motion includes parallax imagery, text reveals, duplicated-label hover transitions, and restrained scroll entrances.

## What to adopt

- Editorial typography and asymmetric composition.
- Oversized statements with short supporting copy.
- Off-white canvas and black/cyan contrast.
- Wide spacing and fewer visible borders.
- Project-style metadata blocks.
- Table and archive patterns for structured technical information.
- Image-led or interface-led case-study moments.
- Dark closing CTA and substantial footer.
- Compact mobile header with a deliberate menu pattern.

## What not to copy

- Do not reproduce the Moro wordmark, agency copy, project names, 3D artwork, testimonials, awards, pricing, team profiles, or footer credits.
- Do not add fake customers, client results, funding numbers, awards, or production reliability claims.
- Do not use decorative animation that hides essential evidence or blocks the demo.
- Do not turn the working application pages into static mockups.
- Do not obscure the fictional-workspace disclosure.
- Do not reduce text contrast below WCAG AA.

## Design principles for Provenance

1. **Editorial, not ornamental** — every large visual should explain the product, Ariel's role, or a technical decision.
2. **Evidence is the hero asset** — retrieved passages, verified claims, audit stages, and eval results replace agency photography.
3. **One cyan action per viewport** — use cyan for the primary action and selected state; keep secondary actions monochrome.
4. **Recruiter-first reading order** — ownership, working proof, engineering depth, evidence, limitations, and contact.
5. **Product pages stay operational** — demo inputs, ticket actions, workspace upload, and inbox review remain fully functional.
6. **Motion supports hierarchy** — animation may reveal or connect content, but it must never delay understanding.

## Proposed design tokens

### Color

```css
--moro-canvas: #f6f6f9;
--moro-paper: #ffffff;
--moro-ink: #000000;
--moro-ink-soft: #333338;
--moro-muted: #77777f;
--moro-line: #dedee3;
--moro-surface: #e3e4e8;
--moro-dark: #131316;
--moro-cyan: #1ef7ff;
--moro-cyan-soft: rgba(30, 247, 255, 0.16);
--moro-warning: #ffcd59;
--moro-critical: #ff5f73;
```

Status colors must remain understandable without relying on color alone:

- Approved: cyan + check icon + text label.
- Human review: amber + person icon + text label.
- Blocked: coral/red + shield icon + text label.

### Typography

- Display: Outfit via `next/font/google`.
- Body and UI: Inter via `next/font/google`.
- Hero: `clamp(58px, 9.4vw, 120px)`, line-height `0.9–1`, weight 500, tight negative tracking.
- Page title: `clamp(56px, 8vw, 104px)`.
- Section statement: `clamp(36px, 5vw, 64px)`.
- Supporting heading: `clamp(28px, 3.4vw, 40px)`.
- Body: 15–17px with 1.55–1.7 line-height.
- Utility labels: 12–14px, weight 600.
- Keep code and IDs in the existing mono stack.

### Spacing and shape

- Page max width: `1440px`.
- Standard content width: `1280px`.
- Reading width: `720–820px`.
- Desktop section spacing: `120–160px`.
- Tablet section spacing: `88–112px`.
- Mobile section spacing: `64–80px`.
- Major panels: `24–32px` radius.
- UI cards and controls: `16–20px` radius.
- Pills: `999px` radius.
- Prefer surface contrast and whitespace over heavy borders and shadows.

## Global shell

### Navigation

Desktop arrangement:

```text
Overview  Demo  Engineering  Evidence        Provenance        GitHub  Portfolio    Contact
```

- Use a transparent 80px header on the off-white canvas.
- Center the Provenance wordmark.
- Keep recruiter-oriented navigation on the left.
- Place external links and one cyan Contact button on the right.
- Use the reference's doubled-label hover movement only for text links.
- Keep the fictional-workspace disclosure as a narrow utility line above or immediately below the header.

Mobile arrangement:

- Provenance wordmark left.
- Cyan `Demo` or `Contact` action.
- Menu trigger right.
- Full-screen off-white menu with large route labels and a visible close control.
- Menu must trap focus and close with Escape.

### Footer

- Use a dark `#131316` footer or dark pre-footer CTA.
- Lead with: `Reliable automation needs evidence, judgment, and a person accountable for both.`
- Columns: Case study, Product, Evidence, Ariel.
- Include portfolio, GitHub, LinkedIn, email, source code, demo, architecture, evals, inbox, and corpus.
- Keep the fictional-product disclosure and `Designed and built by Ariel Magalso.`
- Do not include a newsletter form unless a real subscription workflow exists.

### Shared page opening

Every inner page should begin with:

1. Compact eyebrow or route index.
2. Oversized editorial title.
3. One concise paragraph explaining why the page matters to a reviewer.
4. A route-specific proof or action directly below the title.

## Page-by-page redesign

### 1. Homepage `/`

Keep the recruiter-first section order but restyle it as an editorial case study.

#### Hero

- Oversized two- or three-line title: `reliable support automation that knows when not to answer.`
- Place short ownership chips around the hero visual: Product design, Full-stack, AI workflow, Evaluation.
- Replace the generic 3D reference object with a layered Provenance response preview:
  - incoming ticket;
  - retrieved evidence;
  - verified response;
  - approved / review / blocked state.
- Primary cyan action: `Run the live demo`.
- Secondary black text links: Source, Portfolio, Architecture.
- Keep `Designed and built by Ariel Magalso` visible without scrolling.

#### Proof stats

- Use four tall editorial columns inspired by Moro's stats section.
- Preserve precise language:
  - 45/45 development-set cases passing;
  - 52 indexed passages;
  - three responsible outcomes;
  - one human-review workflow.
- Do not call this production reliability.

#### Project thesis

- Large statement: `A useful support system must know when evidence is enough — and when a person should decide.`
- Pair with a compact `Problem / Approach / Ariel's role / Result` metadata grid.

#### Featured case study

- Treat the live demo like Moro's featured project block.
- Use a large product screenshot or live UI frame.
- Add compact metadata: Type, Role, Stack, Status, Year.
- Show two outcomes and one limitation near the visual.
- CTA: `Open the working product`.

#### Engineering archive

- Convert the current technical stack and decisions into a table-like archive:

```text
Layer              Implementation                         Why it exists
Retrieval          pgvector + gte-small                  Find candidate evidence
Verification       claim scoring + lexical checks        Reject unsupported claims
Operations         inbox + Slack approval                Keep a human accountable
Safety             screening + limits + spend cap        Control abuse and cost
```

#### Evaluation section

- Use large black numbers with cyan emphasis.
- Place the known-limitation copy beside the scorecard.
- Include a prominent link to `/evals`.

#### Process section

- Adapt Moro's Discovery / Concept / Execution / Launch grid to:
  1. Ingest
  2. Retrieve
  3. Generate
  4. Verify
  5. Route
  6. Log
- Show the operational result beneath each phase.

#### Lessons and CTA

- Use an editorial quote treatment for Ariel's main learning.
- End with a dark recruiter CTA containing portfolio, email, LinkedIn, source, and demo links.

### 2. Guided demo `/demo`

- Open with a large title: `one inbox. three responsible outcomes.`
- Keep the three scenario cards as a horizontal selector on desktop and a stacked selector on mobile.
- Restyle the working ticket interface as a large white editorial panel on the off-white canvas.
- Use a three-column desktop structure:
  - Incoming ticket
  - Evidence pipeline
  - Automation decision
- Make the audit timeline read like an archive table instead of small cards.
- Use cyan for the active scenario and primary action only.
- Keep approved, human-review, and blocked outcomes distinct with icons and labels.
- Preserve custom question input, channel selection, workspace upload, Turnstile, loading, error, and audit behaviors.
- Add a compact `What to notice` rail explaining retrieval, citations, verification, and routing for recruiters.

### 3. Architecture `/architecture`

- Open with an oversized title: `how provenance earns permission to act.`
- Add a top metadata row: System type, Corpus, Model, Retrieval, Deployment.
- Replace the current accordion-only layout with:
  - a sticky left route index;
  - a vertical eight-stage case-study narrative;
  - large stage numbers;
  - one diagram or interface crop per major stage.
- Keep accordions as the mobile and progressive-disclosure fallback.
- Add a table for thresholds, failure conditions, and route outcomes.
- Include the eval-discovered insurance/liability bug as a highlighted engineering note.
- End with links to Demo, Evals, Corpus, and Source.

### 4. Eval scorecard `/evals`

- Open with: `evidence, published as it ran.`
- Use a large score summary above the committed Markdown results.
- Separate the page into:
  - Current development-set result
  - Test groups
  - Bugs found
  - Known limitations
  - Next validation step
- Render the committed Markdown as editorial tables and rows, not generic prose cards.
- Keep the generation timestamp or commit context visible if present.
- Add a cyan `View eval source` action and a monochrome `Run the demo` action.
- Explicitly state that the suite is a development set and not held-out production proof.

### 5. Policy corpus `/corpus`

- Open with: `the source material behind every answer.`
- Use a two-column documentation layout:
  - sticky document index on the left;
  - active policy content on the right.
- On mobile, use a select menu or disclosure list for navigation.
- Present each file as an archive row with filename, topic, and section count before the full content.
- Keep passage IDs and filenames easy to copy.
- Add a `Try this policy in the demo` action where practical.
- Preserve server-side file reading and do not move policy content into client state.

### 6. Agent inbox `/inbox`

- Open with: `human judgment, where automation stops.`
- Treat the queue as an editorial archive table with ticket, reason, status, and time.
- Keep selected-ticket detail in a large white panel.
- Use a sticky decision rail for Edit, Approve, Reject, and Learn correction actions.
- Cyan marks the current selection and primary approval action.
- Amber marks review-required context; coral marks rejection or blocked state.
- Preserve loading, empty, error, resolution, correction, and disabled states.
- Make the connection to the demo and Slack workflow explicit.

## Shared component plan

### Create or refactor

- `EditorialHeader` — route eyebrow, oversized title, summary, metadata.
- `MoroNav` — desktop editorial nav and accessible mobile menu.
- `EditorialFooter` — dark CTA, route columns, disclosure.
- `SplitLabel` — animated duplicated-label hover used selectively.
- `RouteIndex` — sticky desktop page index with mobile fallback.
- `ArchiveTable` — responsive structured rows for stack, tickets, policies, and eval groups.
- `EditorialStat` — large number plus precise qualifier.
- `CaseStudyFrame` — white product UI panel with optional metadata rail.
- `OutcomeMark` — icon, text, and color for approved/review/blocked.
- `EditorialReveal` — restrained intersection-based entrance with reduced-motion support.

### Preserve and restyle

- `TicketWorkflow`
- `AgentInbox`
- `BusinessImpactCalculator`
- `WorkspaceUpload`
- `DecisionPanel`
- `EvidenceSteps`
- `SlackNotificationCard`
- `TurnstileWidget`
- Markdown rendering for corpus and eval results

## File-level implementation map

| File | Planned work |
| --- | --- |
| `app/layout.tsx` | Load Outfit + Inter, update metadata base, install redesigned global shell |
| `app/globals.css` | Replace Salix-era tokens and layout utilities with the TD Moro–inspired system |
| `app/components/SiteNav.tsx` | Rebuild desktop/mobile navigation |
| `app/components/SiteFooter.tsx` | Rebuild dark editorial footer and CTA |
| `app/page.tsx` | Recompose recruiter-first homepage using editorial case-study sections |
| `app/demo/page.tsx` | Add route-level editorial opening and demo context |
| `app/components/TicketWorkflow.tsx` | Restyle scenario selector, pipeline, decision, and audit archive |
| `app/architecture/page.tsx` | Replace accordion-only page with staged narrative and technical tables |
| `app/evals/page.tsx` | Add score summary, limitations, and editorial result rendering |
| `app/corpus/page.tsx` | Add document index, archive metadata, and readable policy layout |
| `app/inbox/page.tsx` | Add route-level editorial opening |
| `app/components/AgentInbox.tsx` | Restyle queue, detail, and decision rail |
| `components/ui/*` | Align controls with cyan/black tokens while preserving semantics |
| `app/opengraph-image.*` | Update social preview after the redesign stabilizes |

## Motion plan

- Hero type: short opacity/translate reveal; no character-by-character delay longer than 400ms.
- Product visual: slight parallax or layered movement limited to desktop pointer devices.
- Links: optional duplicated-label slide on hover.
- Stats: count up once when visible.
- Archive rows: subtle underline or background sweep on hover.
- Sections: 20–28px rise with 450–600ms easing.
- Route transitions: avoid custom full-page transitions unless they remain instant and accessible.
- Respect `prefers-reduced-motion`; all content must be visible without animation.

## Responsive behavior

### Desktop, 1200px+

- Full editorial navigation.
- 120px hero display type where it fits.
- Asymmetric two-column sections.
- Sticky route indexes and decision rails.
- Multi-column product and evidence layouts.

### Tablet, 768–1199px

- Reduce hero type to 72–88px.
- Collapse three-column operational views to two columns or a horizontal sequence.
- Keep metadata grids at two columns.
- Remove nonessential parallax.

### Mobile, below 768px

- Compact 66px header and menu.
- Hero type around 52–60px with no horizontal overflow.
- All product interfaces become one column.
- Tables transform into labeled stacked rows.
- Sticky sidebars become in-flow disclosures.
- Touch targets remain at least 44px.
- Actions stack in priority order.

## Accessibility requirements

- Semantic heading hierarchy on every route.
- Skip-to-content link.
- Keyboard-operable mobile menu, accordions, scenario selector, ticket queue, and action controls.
- Visible focus styles using cyan plus a dark outline.
- Status is communicated through icon and text, not color alone.
- Form labels remain programmatically associated.
- Motion and count-up effects honor reduced motion.
- Decorative visuals use empty alt text; informative interface images use concise descriptive alt text.
- Maintain WCAG AA contrast for text and controls.

## Performance requirements

- Use `next/font` for Outfit and Inter.
- Use `next/image` for new image assets with responsive `sizes`.
- Prefer CSS textures, SVG patterns, and real product screenshots over large video backgrounds.
- Lazy-load below-the-fold images.
- Avoid layout shift from parallax and animated counters.
- Keep client components limited to interactive UI and motion wrappers.
- Preserve Server Components for corpus and eval file reading.
- Target no new console errors and no horizontal overflow at 375px.

## Implementation phases

### Phase 1 — Foundation

- Add Outfit and update global font variables.
- Replace color, type, spacing, radius, and focus tokens.
- Build the global navigation, mobile menu, disclosure line, and footer.
- Create the shared editorial header, stat, archive, and outcome components.

### Phase 2 — Homepage

- Rebuild hero and working product visual.
- Restyle proof stats, project thesis, featured demo, engineering archive, eval evidence, process, lessons, and CTA.
- Confirm recruiter-first content order remains intact.

### Phase 3 — Product pages

- Redesign `/demo` and `TicketWorkflow`.
- Redesign `/inbox` and `AgentInbox`.
- Verify all API-backed states and actions.

### Phase 4 — Evidence pages

- Redesign `/architecture` as a staged technical narrative.
- Redesign `/evals` as an evidence publication.
- Redesign `/corpus` as an indexed source archive.

### Phase 5 — Motion, responsive QA, and social assets

- Add restrained animation and reduced-motion fallbacks.
- Verify 375px, 768px, 1024px, 1280px, and 1440px layouts.
- Update the Open Graph image.
- Run production build and browser verification on all routes.
- Deploy a Vercel preview before promoting to production.

## Verification checklist

### Content

- Ariel's name and ownership appear above the fold.
- No agency-template copy remains.
- No fake customer, award, funding, or production claim is introduced.
- Development-set results are labelled precisely.
- Limitations and next validation steps remain visible.

### Functional

- Guided scenarios still run.
- Custom questions still run.
- Workspace upload and clear still work.
- Inbox queue, edit, approve, reject, and correction flows still work.
- Slack handoff status still renders.
- Corpus and eval content still render from committed files.

### Responsive

- No horizontal overflow at 375px.
- Navigation is usable at every breakpoint.
- Product panels stack in a meaningful order.
- Archive tables remain readable on mobile.
- Sticky elements return to normal flow on small screens.

### Accessibility

- Keyboard navigation passes across all interactive controls.
- Focus states are visible.
- Status colors have textual equivalents.
- Reduced-motion mode reveals all content immediately.
- Heading order and landmark structure are valid.

### Build quality

- `npx tsc --noEmit` passes.
- `npm run build` passes.
- Browser console is clean on all routes.
- Every route loads directly and after client navigation.
- Production metadata and Open Graph URLs resolve correctly.

## Definition of done

The redesign is complete when every public route shares the TD Moro–inspired editorial system, the recruiter-first narrative is clearer than the current site, all live product behavior still works, mobile and accessibility checks pass, the production build succeeds, and the result is deployed through a verified Vercel preview before production promotion.
