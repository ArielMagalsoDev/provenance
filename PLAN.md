# Provenance recruiter-first website plan

## Scope

Make the homepage work first for recruiters and hiring managers evaluating Ariel for product design, product engineering, and full-stack AI roles. Keep the current Agero-inspired visual direction, but reorganize the story around role fit, individual ownership, credible proof, and fast contact. Inner pages remain supporting evidence rather than required reading.

## Primary outcome

A recruiter should understand the following within 30 seconds:

1. Who Ariel is and which roles he is open to.
2. What Provenance is and why it matters.
3. What Ariel personally designed and built.
4. Whether the project demonstrates product judgment and engineering depth.
5. How to view proof, run the demo, or contact Ariel.

## Audience priorities

### Recruiter

Needs fast role alignment, location and availability, concise proof of capability, recognizable skills, and a clear contact action.

### Hiring manager

Needs evidence of ownership, product decisions, system thinking, execution quality, tradeoffs, and measurable outcomes.

### Technical reviewer

Needs optional access to architecture, source, evaluation results, corpus design, and the live workflow without forcing that detail into the primary narrative.

## Recruiter-first homepage hierarchy

### 1. Immediate positioning

- Availability and role focus above the fold.
- Headline that identifies Ariel as a product designer and AI engineer, not only the product name.
- One-sentence project value proposition.
- Primary CTA: `Contact Ariel`.
- Secondary CTA: `View the 90-second case study` or `Run the live demo`.
- Compact metadata: Manila, Philippines; open to remote or relevant arrangements; portfolio and GitHub links.

### 2. Fast qualification strip

Show a compact, scannable summary:

- Product design
- Frontend and full-stack engineering
- AI retrieval and verification
- Evaluation and human-in-the-loop workflows
- Next.js, TypeScript, Postgres, pgvector, Supabase, and Vercel

Avoid duplicate marquees or long technology lists in the first viewport.

### 3. Ownership statement

Use a strong section titled `What I owned` with four clear areas:

- Product framing and interaction design
- Frontend system and responsive implementation
- Retrieval, claim verification, and responsible routing
- Evaluation suite, documentation, and deployment

Write ownership in first person and distinguish completed work from simulated or fictional elements.

### 4. Project case study

Explain Provenance through a short recruiter-friendly sequence:

1. Problem — support AI can sound confident without proof.
2. Product decision — require approved evidence and route uncertainty safely.
3. Build — retrieval, verification, review, and audit workflow.
4. Outcome — answer, human review, or block.

Each step should use concise copy, one meaningful visual, and an optional deep link.

### 5. Evidence of execution

Feature only verifiable project metrics:

- 45/45 committed development cases passing
- 52 indexed policy passages
- 100% route accuracy on the committed suite
- Three inspectable product outcomes

Add direct links to evaluations, architecture, source, and corpus. Clearly label fictional data and simulated customer sending.

### 6. Product walkthrough

Present the three guided scenarios as portfolio work rather than feature marketing:

- Routine answer with citations
- Unsupported request routed to human review
- Prompt-injection attempt blocked before generation

Give recruiters a single `Start the 90-second tour` action and technical reviewers a `Inspect the workflow` action.

### 7. Ariel profile

Include a concise professional profile with:

- Product designer + full-stack AI engineer
- Manila, Philippines
- Open to new roles
- Core strengths and preferred role types
- Portfolio, GitHub, LinkedIn, résumé, and email

Use a real portrait when available. Until then, use a restrained branded placeholder rather than a fictional testimonial treatment.

### 8. Contact close

End with a direct recruiting prompt such as `Building an accountable AI product? Let’s talk.` Include email, portfolio, LinkedIn, and résumé access without requiring a form.

## Content rules

- Lead with Ariel’s role and ownership; introduce the product as evidence of those capabilities.
- Use first-person language for personal contributions.
- Keep primary paragraphs under three lines on desktop.
- Prefer concrete verbs: designed, implemented, evaluated, documented, deployed.
- Do not use fictional testimonials, employers, customers, revenue, or production claims.
- Label the workspace and dataset as fictional wherever relevant.
- Separate committed metrics from future production recommendations.
- Keep technical depth available through progressive disclosure and deep links.

## Visual direction

- Retain the soft off-white Agero-inspired canvas, charcoal controls, orange accent, oversized typography, and inline infographic language.
- Reduce decorative repetition when it competes with recruiter scanning.
- Use section labels, short headlines, and structured grids for fast comprehension.
- Use orange for role fit, proof, and actions—not as general decoration.
- Maintain generous whitespace, but keep related headline, proof, and CTA content visually grouped.
- Favor meaningful diagrams and interface evidence over generic imagery.

## Navigation

Recommended labels:

- `Work`
- `What I built`
- `Evidence`
- `About Ariel`
- `Source`
- Primary button: `Contact`

Keep the announcement tab concise: `Open to product + AI engineering roles`.

## Implementation phases

### Phase 1 — Homepage recruiter pass

- Rewrite the hero around Ariel’s role, availability, and ownership.
- Replace redundant capability treatments with one qualification strip.
- Reorder sections into ownership → case study → proof → profile → contact.
- Add a clear 90-second review path.
- Preserve all current routes and working product functionality.

### Phase 2 — Supporting evidence pages

After homepage approval, align `/demo`, `/architecture`, `/evals`, `/corpus`, and `/inbox` with the same recruiter-first framing while preserving their technical detail.

### Phase 3 — Hiring assets

- Add a downloadable résumé.
- Add final portfolio, GitHub, LinkedIn, and contact links.
- Add a professional portrait and optimized social preview.
- Review copy for consistency with current availability and target roles.

## Acceptance criteria

- Role, availability, location, and contact action are clear without scrolling.
- Ariel’s personal ownership is explicit before the first major project-detail section.
- A recruiter can complete the primary story in 60–90 seconds.
- A hiring manager can reach project proof in one click.
- A technical reviewer can reach architecture, evaluations, corpus, and source in one click.
- No fictional employment, customer, testimonial, or production claims are presented as real.
- All CTAs, navigation, keyboard focus, semantic headings, and responsive layouts work.
- No horizontal overflow at mobile, tablet, or desktop sizes.
- `npx tsc --noEmit` and the production build pass after implementation.

## Recommended next implementation step

Implement Phase 1 on the homepage only, starting with the hero, qualification strip, ownership section, and recruiter-oriented section order. Review that direction before applying it to the supporting pages.
