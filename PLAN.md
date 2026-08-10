# Provenance × Agenio implementation plan

Reference: https://agenio.framer.website/

## Goal

Recreate Agenio's design language and homepage composition in the Provenance Next.js app while keeping Provenance's own copy, routes, functionality, and evidence-based product story.

## Design translation

- Preserve the near-black announcement rail, white framed navigation, gray blueprint canvas, dashed selection frames, black corner handles, neon-lime pixel blocks, compact uppercase labels, glossy dark buttons, and oversized editorial typography.
- Rebuild the hero around Agenio's three-part composition: left statement, central dimensional mark, and right statement, followed by concise copy and paired CTAs.
- Keep all claims honest. Do not copy Agenio's company name, client claims, pricing, team, awards, imagery, or contact details.
- Retain all existing Provenance routes and working product UI: demo, architecture, evaluations, corpus, and review inbox.

## Implementation sequence

1. Align the announcement rail and framed navigation with the reference proportions.
2. Replace the current text-only hero with a responsive blueprint hero and original proof/orbit artwork.
3. Preserve and refine the existing Agenio-inspired sections below the fold.
4. Verify desktop and mobile layouts, keyboard navigation, reduced motion, and horizontal overflow.
5. Run TypeScript and production-build checks.

## Cross-page rollout

- `/demo`: project-showcase header, framed live workflow, and compact observation rail.
- `/architecture`: Agenio services-page rhythm with numbered capability cards and decision-gate archive.
- `/evals`: results-led hero, counter band, and framed committed-evidence publication.
- `/corpus`: project-archive treatment for every committed policy document.
- `/inbox`: contact/workspace composition for human review and operational handoff.
- Shared system: every route uses the same announcement rail, selection-frame navigation, blueprint page hero, lime pixels, corner handles, metadata grid, and closing CTA.

## Acceptance criteria

- The first viewport clearly matches Agenio's layout grammar and visual rhythm.
- Provenance remains recognizably its own product and uses no copied template assets.
- Desktop and mobile layouts have no horizontal overflow.
- Navigation and primary calls to action remain accessible and functional.
- `npx tsc --noEmit` and `npm run build` pass.
