# Provenance Recruiter-First Layout Plan

## Goal

Rearrange the Provenance homepage so a recruiter or hiring manager can understand the following within the first 15–20 seconds:

- Who built the project
- What Ariel's role and scope were
- What problem the system solves
- What makes the implementation technically substantial
- What evidence supports its reliability claims
- Where to view the demo, source code, portfolio, and contact details

Provenance should continue to feel like a real product prototype, but the homepage narrative should prioritize Ariel's capability and decision-making over SaaS-style product marketing.

## Recruiter-first principle

The homepage should answer questions in this order:

1. **Who built this?**
2. **What did they personally own?**
3. **What works?**
4. **How was it engineered?**
5. **How was it tested?**
6. **What did they learn?**
7. **How can I contact them?**

## Current layout problem

The homepage contains the necessary recruiter information, but the story is spread across a long product-marketing sequence:

1. Product hero and creator note
2. Product preview
3. Statistics
4. Case-study cards
5. Guided-demo scenarios
6. Workflow
7. Product promises
8. Technical stack
9. Business calculator
10. Reliability evidence
11. Engineering decisions
12. Architecture feature grid
13. Lessons learned
14. Recruiter CTA

This delays the strongest engineering proof and introduces the illustrative business calculator before the reliability and decision-making story.

## Proposed homepage order

### 1. Disclosure banner

Keep the fictional-workspace disclosure, but shorten it:

> Independent portfolio project. Fictional workspace. No customer data.

Secondary link:

> Run the live demo →

### 2. Recruiter-first navigation

Recommended navigation:

- Overview
- Demo
- Engineering
- Evidence
- Source ↗
- Ariel Magalso ↗

Primary button:

> View live demo

Changes:

- Replace “Corpus” as a top-level recruiter navigation item with “Engineering” or “Evidence.”
- Keep Corpus accessible through the architecture/evidence sections and footer.
- Keep Inbox accessible from the demo or product navigation, but it does not need to compete with the recruiter story in the main navigation.
- Add clear anchor targets: `#overview`, `#demo`, `#engineering`, and `#evidence`.

### 3. Split recruiter hero

Use a two-column desktop hero and a single-column mobile hero.

#### Left column

Eyebrow:

> AI automation case study · Designed and built by Ariel Magalso

Headline:

> Reliable support automation that knows when not to answer.

Supporting copy:

> Provenance is an end-to-end AI support workflow that retrieves approved policy, verifies generated claims, and routes each ticket to answer, human review, or refusal.

Role metadata:

- Product design
- Full-stack development
- AI workflow architecture
- Evaluation and deployment

Primary actions:

- View live demo
- View source code

Secondary text link:

- Visit Ariel's portfolio ↗

#### Right column

Use the existing product-response preview showing:

- Incoming ticket
- Proposed cited response
- Approved-with-citations status
- Visible passage reference

The preview should remain interactive as a link to `/demo`.

#### Above-the-fold acceptance criteria

At common desktop sizes, the first viewport must visibly contain:

- Ariel Magalso's name
- Ariel's ownership/role
- A one-sentence project definition
- A real interface preview
- Demo and source-code actions
- At least two proof metrics

### 4. Proof strip

Place directly beneath the hero.

Recommended metrics:

- **45/45** development-set cases passing
- **52** indexed policy passages
- **3** responsible outcomes
- **1** live human-review workflow

Label the evaluation number precisely. Do not use “100% reliable” or imply production performance.

### 5. Project snapshot

Replace the current four equal case-study cards with a more scannable two-column layout.

#### Left: Problem and solution

> **The problem**  
> A support bot becomes a liability when it confidently invents prices, refund terms, or policy.

> **The solution**  
> Provenance checks every material claim against retrieved evidence and chooses whether to answer, escalate, or refuse.

#### Right: Ariel's contribution

> **What I owned**

- Product concept and interaction design
- Next.js interface and API routes
- Supabase/Postgres retrieval and audit layer
- Claim-level verification and decision routing
- Workspace upload and human-review workflow
- Evaluation suite, deployment, and documentation

Add a compact stack line below this list.

### 6. Sixty-second proof demo

Move the guided scenarios immediately after the project snapshot.

Keep the three outcomes:

1. Routine answer
2. Unsupported question
3. Prompt-injection attempt

Improve the layout by showing the expected decision on every card:

- Answer with citations
- Route to human review
- Block before generation

CTA:

> Run all three scenarios →

### 7. Engineering story

Combine the current workflow, product promises, technical stack, and dark architecture grid into one cohesive section.

Heading:

> How the system earns permission to act

#### Pipeline visualization

Use the existing seven-stage flow:

1. Approved policies
2. Index updated
3. Ticket arrives
4. Evidence retrieved
5. Claims verified
6. Reply or route
7. Decision logged

#### Technical layers

Show six compact rows or cards:

| Layer | Implementation |
| --- | --- |
| Interface | Next.js 16, React 19, TypeScript, Tailwind CSS |
| Retrieval | Supabase Postgres, pgvector, gte-small embeddings |
| Generation | Claude Haiku with structured cited responses |
| Verification | Claim decomposition, entailment scoring, lexical checks |
| Operations | Persisted audit events, inbox, Slack approval workflow |
| Safety | Turnstile, rate limits, cache, spend cap, injection screening |

Actions:

- Read architecture walkthrough
- Inspect the policy corpus

### 8. Reliability evidence

Move this before the business calculator.

Heading:

> Tested against the ways support automation fails

Show:

- 45/45 development-set cases passing
- 0% false refusal rate on the committed development set
- 0% fabrication rate on the committed development set
- Answerable, unanswerable, adversarial, and workspace cases

Keep the known-limitation card directly beside the scorecard:

> A clean development-set result is not held-out proof.

Requirements:

- Use “development set” everywhere the score appears.
- Keep the link to `/evals` visible.
- State that a held-out test set is the next validation step.
- Do not frame these results as production customer performance.

### 9. Engineering decisions and bugs found

Keep the current accordion structure but make the content more interview-oriented.

Recommended items:

1. Why screening happens before paid generation
2. Why citations come from verified support rather than model self-report
3. Why both mean groundedness and minimum-claim thresholds are required
4. How the evaluation suite exposed concept conflation
5. Why exact vector search is appropriate at the current corpus size
6. Why workspace knowledge expires and remains visitor-isolated

Add a highlighted “Bug caught by evals” card:

> The verifier initially allowed a liability passage to support an insurance-coverage claim. The evaluation suite exposed the concept conflation, leading to stricter generation and entailment instructions.

### 10. Lessons and limitations

Keep the existing “What I learned” content, immediately after engineering decisions.

Use three lessons:

- Retrieval quality does not guarantee grounded output.
- Refusal and escalation are successful outcomes when evidence is insufficient.
- Evaluation cases should model business risk and near-misses, not only typical questions.

Keep the next step visible:

> Build a held-out evaluation set and calibrate routing thresholds using unseen cases.

### 11. Illustrative business calculator

Move the calculator close to the bottom of the page.

Reason:

The calculator is useful product thinking, but it is weaker hiring evidence than the architecture, evaluation suite, and engineering decisions.

Add an eyebrow that clearly labels it:

> Optional business-model exploration

Keep the disclaimer that its results are illustrative and not measured customer outcomes.

### 12. Recruiter conversion section

Keep this as the final major section.

Heading:

> Looking for someone who can take AI automation from prototype to accountable workflow?

Supporting copy:

> I'm Ariel Magalso, a web developer and AI automation engineer building systems that connect models, business data, and human operations.

Actions:

- View Ariel's portfolio
- Contact Ariel
- LinkedIn
- Source code
- Replay demo

Recommended priority:

1. View Ariel's portfolio
2. Contact Ariel
3. LinkedIn
4. Source code
5. Replay demo

### 13. Footer

Keep the Provenance product identity and fictional-product disclosure.

Footer columns:

- Case study: Overview, Engineering, Evidence
- Product: Demo, Inbox, Corpus
- Ariel: Portfolio, GitHub, LinkedIn, Contact

Signature:

> Designed and built by Ariel Magalso.

## Desktop wireframe

```text
┌───────────────────────────────────────────────────────────────┐
│ Disclosure banner                                             │
├───────────────────────────────────────────────────────────────┤
│ Provenance   Overview Demo Engineering Evidence   View demo   │
├───────────────────────────────┬───────────────────────────────┤
│ Built by Ariel                │ Live product response preview │
│ Headline + project definition │ Ticket → cited response       │
│ Role/scope                     │ Approved status                │
│ Demo · Source · Portfolio      │                               │
├───────────────────────────────┴───────────────────────────────┤
│ 45/45 cases · 52 passages · 3 outcomes · human review         │
├───────────────────────────────┬───────────────────────────────┤
│ Problem + solution            │ What Ariel owned              │
├───────────────────────────────┴───────────────────────────────┤
│ 60-second proof demo: answer · escalate · block               │
├───────────────────────────────────────────────────────────────┤
│ Engineering pipeline + technical layers                       │
├───────────────────────────────┬───────────────────────────────┤
│ Reliability scorecard         │ Known limitation              │
├───────────────────────────────┴───────────────────────────────┤
│ Decisions · bugs found · tradeoffs                             │
├───────────────────────────────────────────────────────────────┤
│ Lessons and next steps                                         │
├───────────────────────────────────────────────────────────────┤
│ Optional business calculator                                  │
├───────────────────────────────────────────────────────────────┤
│ Recruiter CTA                                                  │
└───────────────────────────────────────────────────────────────┘
```

## Mobile arrangement

At widths below 768px, use this order:

1. Product mark and View demo button
2. Builder attribution
3. Headline and project definition
4. Role chips
5. Demo and source buttons
6. Product preview
7. Proof metrics in a two-column grid
8. Problem and solution
9. Ariel's contribution
10. Demo scenario cards
11. Pipeline as a vertical flow
12. Stack rows
13. Reliability and limitation
14. Decision accordions
15. Lessons
16. Calculator
17. Recruiter CTA
18. Footer

Mobile requirements:

- No horizontal scrolling at 320px, 375px, or 390px.
- Keep primary CTAs at least 44px tall.
- Do not hide Ariel's name or role on mobile.
- Stack tables into cards if columns become unreadable.
- Keep the scorecard's “development set” qualifier visible.

## Component implementation map

Refactor the static homepage into focused Server Components while keeping interactive features isolated.

Suggested structure:

```text
app/
  page.tsx
  components/
    HomeHero.tsx
    ProofStrip.tsx
    ProjectSnapshot.tsx
    GuidedDemoSection.tsx
    EngineeringStory.tsx
    ReliabilitySection.tsx
    EngineeringDecisions.tsx
    LessonsSection.tsx
    RecruiterCta.tsx
    BusinessImpactCalculator.tsx  # remains a Client Component
    SiteNav.tsx
    SiteFooter.tsx
```

Rules:

- Keep `app/page.tsx` a Server Component.
- Do not add `"use client"` to static marketing sections.
- Keep calculator state inside `BusinessImpactCalculator.tsx`.
- Hoist static content arrays to module scope.
- Reuse the existing design tokens in `app/globals.css`.
- Avoid adding dependencies for a layout-only refactor.

## CSS/layout work

Add or revise classes for:

- `.recruiter-hero`
- `.recruiter-hero-copy`
- `.recruiter-hero-preview`
- `.proof-strip`
- `.project-snapshot`
- `.contribution-list`
- `.engineering-story`
- `.reliability-layout`
- `.bug-callout`
- `.recruiter-actions`

Layout requirements:

- Use `minmax(0, 1fr)` for grid tracks.
- Use fluid spacing through the existing `clamp()` and spacing tokens.
- Preserve the current brand gradient, product mark, rounded cards, and typography.
- Reduce duplicate cards and repeated section introductions.
- Keep the homepage visually calm despite the additional recruiter information.

## Content accuracy rules

- Use **45 development-set cases**, based on the committed eval result.
- Use **52 indexed passages** only while it matches the live corpus.
- Describe Slack as live only when the deployed connector has been verified.
- Clearly distinguish simulated customer sending from real pipeline decisions.
- Do not claim real customer adoption, revenue, savings, or production reliability.
- Do not publish private prompts, credentials, or security-sensitive implementation details.
- Preserve the fictional-workspace disclosure.

## Implementation phases

### Phase 1: Information architecture

- [x] Add stable section IDs.
- [x] Reorder sections according to the proposed homepage order.
- [x] Move the calculator below engineering, evidence, and lessons.
- [x] Update navigation and footer links.

### Phase 2: Hero and snapshot

- [x] Convert the hero to a desktop split layout.
- [x] Integrate creator attribution into the hero hierarchy.
- [x] Add source code and portfolio actions above the fold.
- [x] Move proof metrics directly beneath the hero.
- [x] Replace four generic summary cards with the project snapshot layout.

### Phase 3: Consolidate technical proof

- [x] Combine workflow, promises, stack, and architecture features.
- [x] Keep the seven-stage pipeline visible.
- [x] Add a compact technical-layer table or grid.
- [x] Remove duplicated engineering descriptions.

### Phase 4: Evidence and decisions

- [x] Move reliability evidence above the calculator.
- [x] Strengthen development-set qualifiers.
- [x] Expand engineering decisions with bugs and tradeoffs.
- [x] Add the evaluation bug callout.

### Phase 5: Conversion and refinement

- [x] Update recruiter CTA copy and action priority.
- [x] Reorganize footer columns.
- [x] Review page length and remove redundant copy.
- [x] Confirm external links and email action.

## Verification checklist

### Content

- [x] Ariel's name and ownership appear above the fold.
- [x] Role and scope are understandable without opening another page.
- [x] Demo, source, portfolio, and contact actions are visible and correct.
- [x] Evaluation figures match `evals/results.md`.
- [x] Fictional, simulated, illustrative, and development-set qualifiers remain visible.

### Functional

- [x] Navigation anchors land on the correct sections.
- [x] Demo, architecture, evals, corpus, inbox, portfolio, GitHub, LinkedIn, and email links work.
- [x] The calculator still updates correctly through controlled range inputs and derived results.
- [x] Existing demo and API routes are unaffected.

### Responsive

- [x] Verify at 1440px desktop.
- [x] Verify at 1024px tablet.
- [x] Verify at 768px breakpoint.
- [x] Verify at 390px mobile.
- [x] Verify at 320px narrow mobile.
- [x] Confirm there is no horizontal overflow.

### Accessibility

- [x] Maintain one `h1` and a logical heading hierarchy.
- [x] Preserve visible keyboard focus states.
- [x] Ensure interactive previews have descriptive accessible names.
- [x] Ensure text and controls meet contrast requirements.
- [x] Ensure buttons and links have usable touch targets.
- [x] Respect reduced-motion preferences if motion is introduced.

### Build quality

- [x] `npx tsc --noEmit` passes.
- [x] `npx next build --webpack` passes.
- [x] `git diff --check` passes.
- [x] Browser console contains no new errors or warnings.
- [x] No Next.js error overlay appears.
- [x] Homepage remains a Server Component except for isolated interactive children.

## Definition of done

The recruiter-first rearrangement is complete when:

- A recruiter can identify Ariel, his role, the project scope, and the primary technical proof from the first viewport.
- Engineering and evaluation evidence appear before the illustrative calculator.
- Duplicate product-marketing content has been consolidated.
- The page provides a clear path to the demo, code, portfolio, LinkedIn, and contact information.
- The layout works without overflow or hidden recruiter context across desktop, tablet, and mobile.
- Type checking, production build, and browser verification all pass.
