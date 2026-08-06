# Corpus coverage

Source of truth for what Meridian Nine Coworking's policy docs do and do not answer.
Used to write `evals/cases.json` and to sanity-check any refusal a reviewer sees in the
demo — a refusal is only "correct" if the topic is actually listed as a gap below.

## Files

| File | Covers |
|---|---|
| `pricing.md` | Membership tiers, pricing, what's included/excluded, Team Accounts, switching/cancelling a tier |
| `membership-limits.md` | Occupancy, meeting-room credit limits, printing limits, storage limits, simultaneous bookings, guest limits |
| `booking-and-cancellation.md` | Booking a room, cancellation window, no-shows, recurring bookings, walk-ups, building closures |
| `refunds.md` | Membership refunds, annual contract early cancellation, Day Pass refunds, booking refunds, billing disputes |
| `hours-and-access.md` | Building hours, 24/7 access, keycards, holiday closures, entrance/location, wifi, front desk staffing |
| `guest-policy.md` | Guest sign-in, guest allowances per tier, what guests can access, outside event bookings |
| `damage-and-liability.md` | Personal property responsibility, damage to Meridian Nine property, found property, premises insurance, injury on premises |
| `equipment.md` | Printing costs, meeting room AV, loaner equipment, standing desks, kitchen equipment, event AV |

## Topics covered (answerable)

Pricing and tiers, membership limits, booking/cancellation mechanics, refund rules,
building hours and access, keycards, holiday closures, guest policy, damage/liability
for both personal and company property, premises insurance (for the building, not for
members — see gaps), equipment and loaner gear, printing costs, wifi.

## Topics deliberately never covered (gaps)

These are never mentioned anywhere in the corpus. A correct system refuses on all of
them. Every eval case in the `unanswerable` bucket that isn't a near-miss targets one of
these.

1. **Insurance coverage for members' own property or business** — the corpus states
   Meridian Nine's *premises* liability insurance and requires outside event bookers to
   carry *their own* certificate of insurance, but never says whether a member's
   equipment, inventory, or business activity is covered by anything. See the
   insurance near-miss below.
2. **Corporate invoicing / NET-30 / purchase orders** — billing is described only as
   recurring card charges. Invoicing terms for corporate procurement are never
   mentioned. See the Team Accounts near-miss below.
3. **Accessibility specifics (ADA compliance, accessible restrooms, desk heights)** —
   the corpus mentions a step-free entrance in passing but never states ADA compliance,
   accessible restroom availability, or accessible desk/workstation specifics. See the
   accessibility near-miss below.
4. **Pet policy** — never mentioned in any document. No near-miss; a query about pets
   should retrieve weakly across everything and refuse cleanly.
5. **Parking** — never mentioned. See the parking near-miss below.
6. **Data privacy / handling of personal information** — wifi signup and billing are
   described mechanically, but nothing states what happens to the personal data
   collected (retention, sharing, deletion rights, etc). No near-miss; should retrieve
   weakly.

## Near-miss passages

Content that is topically adjacent to a gap, will retrieve with high similarity, and
will tempt a naive RAG system into fabricating an answer that isn't actually supported.

| # | Gap it's adjacent to | Where it lives | Why it's a trap |
|---|---|---|---|
| 1 | Insurance coverage | `damage-and-liability.md` § Premises insurance; `guest-policy.md` § Outside event bookings | Both passages contain the word "insurance" in a policy-document context and will rank high for "am I insured / is my equipment insured" queries — but both are about the *building's* liability coverage and *outside groups'* insurance requirements, never about a member's own coverage. |
| 2 | Corporate invoicing | `pricing.md` § Team Accounts | Describes multi-seat billing mechanics (pooled credit, per-seat card charges) in enough detail to look like a billing-terms answer, but never mentions invoices, NET terms, or purchase orders — the only payment method described anywhere in the corpus is a card on file. |
| 3 | Parking | `hours-and-access.md` § Building entrance and location | Describes the Fifth Street entrance and its proximity to the Fernbridge Transit Center in detail — exactly the kind of passage a "where do I park" query embeds close to — without parking ever being mentioned. |
| 4 | Accessibility specifics | `hours-and-access.md` § Building entrance and location | The same passage states "street-level access with no stairs from the sidewalk to the lobby," which is accessibility-adjacent language, but says nothing about ADA compliance, accessible restrooms, or accessible workstations. |

## What "correct" looks like

- A question inside "Topics covered" → `answered`, with citations resolving to real
  passage IDs from the relevant file(s).
- A question about any of the 6 gap topics above, including one that fishes near a
  near-miss passage, → `refused`, with `citations: []` and a grounding score below
  threshold (near-miss retrieval will often *pass screening and retrieval* with a
  plausible-looking passage at high similarity — the point is that generation or
  grounding catches it, not that retrieval refuses to return anything).
