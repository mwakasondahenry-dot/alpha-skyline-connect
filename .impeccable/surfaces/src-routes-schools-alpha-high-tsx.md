---
version: 1
slug: "src-routes-schools-alpha-high-tsx"
primary_target: "src/routes/schools.alpha-high.tsx"
related_targets: []
---

# /schools/alpha-high — surface brief

Mode: Persuade. Visitor: a Dar es Salaam parent or a Form 4 / Form 6 leaver
on a mid-range Android phone, comparing secondary schools. Job: read the
school like a prospectus, in order, and apply.

User's direction (2026-10-22, replacing "the feed" of 2026-10-21): "I want
someone to pick information about the school and present it in an organized
manner": who the school is, what it teaches, how its students perform, life
outside class, who runs it, how to join, in that order. "Bold and youthful,
not like a corporate site." Typography unchanged. No AI slop.

Content: all academic data unchanged (17 O-Level subjects, option subjects
per form, 12 A-Level combinations, admission steps, both placeholders,
unconfirmed notes). New: NECTA's published results for centre S2549 (CSEE
2024, CSEE 2025, ACSEE 2026) in src/lib/high-results.ts. Photographs: the
school's own folder and Instagram captures already in src/assets/ah-*.webp,
plus the aerial campus photo. Students unnamed.

## Direction contract

THESIS: A prospectus a parent can read top to bottom: six chapters in a
fixed order, each led by its own photographs, with NECTA's numbers as the
proof chapter. Refuses the feed (random moments) and the corporate page
(stat strip, card grid, kicker labels).

OWN-WORLD: Alpha's site world: navy #002e6a fields for the academics head
and the results chapter, gold #f2b012 as rule, mark, sticker and Division I
colour, white and off-white chapters between, Mulish 800 display over Hanken
Grotesk body at the site's sizes, photographs at 1.75rem radius with one
tilted inset per chapter, hairline-ruled fact rows.

STORY: The parent lands on the lab photo and the two-line headline, reads
four facts in the hero foot, meets the mission and the campus from the air,
filters the subjects to their child's form, sees 60 of 92 Division I squares
light up in gold, scrolls the clubs, trips, meals and graduation day, meets
the Head Teacher, reads the four admission steps and taps Enroll Now.

FIRST VIEWPORT: Full-bleed lab practical under the site scrim; "Excellence
through challenge. / Built for the long climb." lower left; a blurb naming
Mikocheni, co-education, Form 1 to 6; gold Enroll Now and outlined See the
results; a credential strip at the foot: Form 1–6 · Mikocheni · Co-education
· Since 2007.

FORM: Prospectus chapters, the user-specified structure (no roll). Signature
interaction: the results chapter fills one gold square per Division I
candidate as it scrolls in (ResultsChart), and the subject explorer narrows
the lists live by form, stream and search. Nothing loops.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
