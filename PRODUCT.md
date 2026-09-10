# Alpha Schools — product truth

Captured 2026-09-03 from `AGENTS.md`, `design/README.md`,
`design/CONTENT-FROM-SCHOOL.md`, `ALPHA_MASTER_BUILD.md` and the codebase.
Product truth only. Visual decisions live in `DESIGN.md`.

## What it is

A school group in Dar es Salaam, Tanzania, running three schools on two
campuses:

| School | Intake | Campus | Ages / forms |
|---|---|---|---|
| Nursery & Primary | Co-educational | Combined campus | 2–12 |
| Alpha High | **Co-education** | Mikocheni | Form 1–6 |
| Alpha Girls | **Girls only** | Kunduchi | Form 1–6 |

Founded 19 March 2007 by the late Professor Wenceslaus Aloyce Mayo. The
secondary schools teach the Tanzanian national curriculum to NECTA — CSEE at
O-Level, ACSEE at A-Level.

## The mechanism — what only Alpha has

**An aviation programme inside a NECTA secondary school.** Ground school
(aircraft general knowledge, meteorology, navigation, principles of flight),
aircraft engineering (airframe, hydraulics, landing gear, fuel systems),
practical work in hangars under qualified instructors, progressing to solo
flights and a Private Pilot Licence. Coding runs alongside it from primary up.

This is the single thing a competing school in Dar es Salaam cannot copy from
its prospectus. Everything else — subjects, combinations, clubs, sport — is
comparable to other schools.

## Who decides

A parent choosing a secondary or primary school for their child, in Dar es
Salaam, **on a mid-range Android phone over mobile data**. Kiswahili is the
language most are most comfortable reading; the site is currently
English-only, which is a known gap.

They are comparing two or three schools at once. The decision is expensive,
irreversible in practice, and made largely on trust.

## What success looks like

1. A parent can tell the three schools apart and pick the right one.
2. They understand the aviation programme is real, not a marketing line.
3. They know exactly how to enquire, and can act on a phone in one tap.

## Brand commitments

- **ALPHA** is the school brand: logo, header wordmark, page titles, meta
  descriptions, marketing copy, social handles, domain, and the three school
  names.
- **ALFA EDUCATION CENTRE** is the legal entity: footer copyright, postal
  address, "operated by" lines, terms and privacy, structured data legal name.
  Nowhere else.
- Palette: deep navy, gold, bright blue (Nursery & Primary), blue-violet
  (Alpha Girls). Confirmed as durable.
- Logo red `#E22321` and green `#00923F` are **logo-only**, never UI colour.
- Gold is a fill, a rule and a figure colour. It measures 1.91:1 on white and
  is never small text on a light ground.
- Say **"Co-education"**, never "Mixed".

## Hard constraints

- **Performance:** mid-range Android on mobile data. Motion is permitted
  within a budget that holds 60fps on that device and collapses fully under
  `prefers-reduced-motion`. No parallax, scroll-jacking, autoplay video, or
  JS animation libraries.
- **No invented content, ever.** No fabricated statistics, testimonials,
  names, quotes or subject lists. This has already happened twice: invented
  parent testimonials shipped on a school page, and A-Level codes `KLF` and
  `ECA` that exist in no school document were live on two pages.
- **Square-bracket placeholders stay visible** and clearly marked. They record
  what the school still owes. Never invent replacement copy, never quietly
  delete the section.
- **Testimonial sections hide entirely** when no published quotes exist.
- The years figure is calculated from the founding year, never hardcoded.
- Verify every change at 375px.

## Still owed by the school

Fee structure per school · entry requirements for Nursery & Primary and Alpha
High O-Level · approved aviation positioning wording · Alpha Girls' founding
year (the timeline says 2020; their own document implies a 5th Form VI
graduation in 2026) · whether Form Three and Form Four options are genuinely
identical · testimonial quotes with consent · the Director's **photograph**
(her message arrived September 2026) · the founder's correct full name — her
message says "Professor Aloysius Mayo", the site says "Professor Wenceslaus
Aloyce Mayo", and both are live on /about · application form PDF · term dates ·
confirmed social handles · Google Maps links per campus.

The aviation **module lists** are no longer owed: ground school and aircraft
engineering modules arrived September 2026 and are live on /aviation. The
aviation **positioning claim** is still blocked — see
design/CONTENT-FROM-SCHOOL.md.

## Technical

TanStack Start · Vite · Tailwind v4 · Supabase · deployed via nitro
`cloudflare-module`. Do not migrate frameworks.
