# Content supplied by the school

Extracted from three documents received from Alpha in August 2026:
`AVIATION_IN_ALPHA_SCHOOLS.docx`, `Combinations.docx`,
`ALPHA_GIRLS_WEBSITE.docx`.

**This file is a reference for building pages. It is not web copy.** The source
documents are internal, written for school management, and include photo-request
lists and section structures that must not appear on the public site. Extract
the facts; discard the framing.

---

## ⚠ OPEN — one claim still blocked, two items resolved

The site went live on 2026-09-10. Nothing in this section blocks that: the one
remaining item is held behind a visible placeholder, which is what AGENTS.md
requires of content the school still owes. What must never happen is building
approved-sounding copy around it.

### The aviation positioning claim — STILL BLOCKED

The school's aviation document states that Alpha Schools are the **pioneer
institutions in Tanzania** to introduce aviation and flying as part of their
extracurricular activities.

The client's written feedback says: *"'1st in Tanzania to teach aviation' is not
true — remove/revise everywhere."*

These conflict. The document's version is narrower (first to offer aviation *as
an extracurricular activity*, rather than first to teach it), which may be the
intended compromise — but that is a guess.

**Do not build any aviation positioning copy until one named person at the
school confirms the exact approved wording.** Until then the existing
`[Aviation positioning statement — wording to be confirmed]` placeholder stays
on all five pages that use it.

### The founder's name — RESOLVED 2026-09-10

The site now says **Professor Aloysius Mayo** everywhere.

The Managing Director's signed letter of September 2026 uses that form, and it
is the most recent and most senior source on the record. Adopting it changed
four references in `src/routes/about.tsx` — the timeline entry, the portrait's
alt text, the founder heading and the founder paragraph — and left her letter
untouched, which is the safer edit: a signed document should not be rewritten
to match the site around it.

The earlier form, *Professor Wenceslaus Aloyce Mayo*, is retired. If the school
later confirms that *Wenceslaus* belongs in the name, this is a one-line change
back in those four places.

### Alpha Girls founding date — RESOLVED 2026-09-10

The timeline keeps **2020**.

The apparent contradiction assumed the school opened by admitting Form 1, in
which case five Form VI graduating classes by April 2026 would be impossible.
It reconciles if Alpha Girls opened in 2020 already teaching Form 5 and 6: the
first Form VI cohort then graduates in 2022, the fifth in April 2026, and
2020–2026 counted inclusively is the school's 7th year, which is what the
October 2026 anniversary refers to.

That reading is consistent with every figure the school has supplied, so
nothing changes. If the school confirms a different founding year, the timeline
entry in `src/routes/about.tsx` is the only place it appears.

---

## ✅ RESOLVED — confirmed by the school, 2026-09-02

### A-Level combinations — CONFIRMED

**The same 12 combinations apply to both Alpha High and Alpha Girls:**

`HGL` · `HKL` · `EBuAC` · `BUAcM` · `HGE` · `ECsM` · `EGM` · `PCB` · `PCM` ·
`PMCs` · `PGM` · `CBG`

This casing is the convention. Apply it everywhere.

Corrections made at the same time:

- **`KLF` and `ECA` were fabricated.** Both were live on `/schools/alpha-high`
  and `/schools/alpha-girls` and appear in no school document. Removed.
- **`PMC` was a typo** for `PMCs`. Corrected.
- **`BUAcCs` and `MEBu`**, which appeared only in `ALPHA_GIRLS_WEBSITE.docx`,
  are **not offered**. The school confirms 12, not 14. Removed.

### O-Level structure — CONFIRMED

The **"Science / Arts / Business / Optional" four-way grouping that was live
was invented.** It matched no school document. Removed.

The real structure is two distinct things, and they should not be conflated:

1. **17 subjects offered** — the full subject list below.
2. **Option subjects per form** — a different thing from the subject list.
   Form One and Form Two share seven options, with Form Two adding Book
   Keeping. Form Three and Form Four share nine.

### Record of fabrications found live and removed

| Item | Where it was | Status |
|---|---|---|
| A-Level `KLF` | both secondary pages | fabricated — removed |
| A-Level `ECA` | both secondary pages | fabricated — removed |
| A-Level `PMC` | both secondary pages | typo for `PMCs` — corrected |
| A-Level `BUAcCs`, `MEBu` | Alpha Girls document only | not offered — removed |
| O-Level "Science / Arts / Business / Optional" grouping | both secondary pages | invented — replaced with the real structure |

---

## ⚠ STILL OPEN on the confirmed content

### Form Three and Form Four option subjects

The source lists Form Three and Form Four as **identical**, and its numbering
**skips (ix) in both**, so nine items are numbered to ten.

Both pages now carry this as a source comment beside the data. **Ask before
publishing Form Three and Form Four as identical** — a genuine duplication and
a copy-paste error look the same in a Word table.

---

## ✅ CLEARED — usable content

### Aviation modules (replaces the placeholder on `/aviation`)

**Ground school**

- Aircraft General Knowledge
- Flight Performance and Planning
- Human Performance and Limitations
- Meteorology
- Navigation
- Operational Procedures
- Principles of Flight

**Aircraft Engineering**

- Technical Drawing
- Engineering Mathematics
- Principles of Aerodynamics
- Airframe Design
- Aircraft Interiors, Equipment and Furnishings
- Aircraft Hydraulic Systems
- Landing Gear Systems
- Air Conditioning and Pressurisation
- Fuel Systems
- Aircraft Pneumatic Systems and Maintenance

### Aviation programme description

Secondary students receive a foundation in aeronautics covering regulations,
safety, meteorology and flight operations, plus aircraft engines, electrical
systems and structural components. Practical work takes place in hangars under
qualified instructors. Students progress to solo flights and can go on to
obtain a Private Pilot Licence (PPL).

Programme coordinator: **Mr. Johnson, 0717742248**. Confirm before publishing a
personal mobile number on a public website — an official school line or email
is usually the better choice.

The source document includes a quotation from naval aviator Jack R. Hunt. If
used, attribute it. Verify the school has cleared it.

### A-Level combinations (12) — CONFIRMED for both schools

HGL · HKL · EBuAC · BUAcM · HGE · ECsM · EGM · PCB · PCM · PMCs · PGM · CBG

Subject definitions were only given in the Alpha Girls document; the school
has confirmed the same 12 apply at Alpha High, so the definitions are reused
for both.

### Alpha High — O-Level option subjects

**Form One and Form Two** — Chinese, French, Computer Science, History,
Biology, Physics, Chemistry. Form Two adds Book Keeping.

**Form Three and Form Four** — Chinese, French, ICS, Literature in English,
Commerce, Book Keeping, Physics, Chemistry, Additional Mathematics.

⚠ The source lists Form Three and Form Four as **identical**, and its numbering
skips (ix) in both. Verify these are genuinely the same and not a copy-paste
error.

### Alpha High — O-Level subject list

Historia ya Tanzania na Maadili · Civics · History · Geography · Kiswahili ·
English Language · Business Studies · Book Keeping · Computer Science ·
Physics · Chemistry · Biology · Chinese · French · Literature in English ·
ICS · Additional Mathematics

### Alpha High — admission criteria

1. Pay application fee — **TSh 35,000**
2. Sit the entrance examination
3. Pass at the school average of **55%**
4. Parents receive joining instructions after paying **TSh 500,000** as part of
   the first tuition instalment

⚠ This is an admissions process with two fee figures, **not a fee structure**.
The full per-school fee schedule is still outstanding. Do not present these two
numbers as if they were the complete cost.

### Alpha Girls — O-Level subjects (15)

Historia na Maadili ya Tanzania · History · Geography · Kiswahili · English
Language · Basic Mathematics · Biology · Physics · Chemistry · Business
Studies · Book-keeping · Computer Science · Chinese · French · Literature in
English

### Alpha Girls — A-Level combinations and entry criteria

**Arts** — HGL (History, Geography, English Language); HKL (History, Kiswahili,
English Language).
Entry: at least Division III, maximum 23 points, minimum C in every principal
subject.

**Business** — EBuAC (Economics, Business Studies, Accountancy); BUAcM
(Business Studies, Accountancy, Advanced Mathematics); ECsM (Economics,
Computer Studies, Advanced Mathematics); HGE (History, Geography, Economics);
EGM (Economics, Geography, Advanced Mathematics).
~~BUAcCs~~ and ~~MEBu~~ are NOT offered — removed 2026-09-02.
Entry: Division II with at least C in every principal subject, plus
mathematics or computer requirements depending on combination.

**Science** — PCM (Physics, Chemistry, Advanced Mathematics); PCB (Physics,
Chemistry, Biology); PMCs (Physics, Advanced Mathematics, Computer Studies);
PGM (Physics, Geography, Advanced Mathematics); CBG (Chemistry, Biology,
Geography).
Entry: minimum Division II with 19 points, plus subject-specific requirements.

### Alpha Girls — clubs

Aviation · Entrepreneurship · Debate · Driving · ICT/Computer · Music/Arts ·
Environmental

⚠ The source table lists the Driving Club's focus as "Scientific inquiry."
That is a copy-paste error in the school's document. Do not reproduce it.

⚠ These clubs do not match the existing club images in the repo
(`club-art`, `club-aviation`, `club-cookery`, `club-debate`, `club-drama`,
`club-environment`, `club-music-dance`, `club-public-speaking`, `club-scout`,
`club-un`). There is no image for Driving or Entrepreneurship, and `club-un`
appears in no document. Reconcile before building a club section.

### Alpha Girls — 2026 calendar

Ready to load into the `calendar` and `events` tables.

| Date | Event |
|---|---|
| 7–8 January | Departmental Meetings |
| 9 January | Staff Meeting |
| 14 January | Classes Commence |
| 31 January | School Board Meeting |
| 6 February | Students Government Election |
| 15 February | Form IV Academic Parents Meeting |
| 22 February | Form II Academic Parents Meeting |
| 16–21 March | Field Trip / Study Tour |
| 18 April | 5th Form VI Graduation |
| 25 April | Visiting Day & PTC |
| 1–3 May | TCRO Dar Open Schools Debate Championship |
| 23–29 June | Pan African Schools Championship, South Africa |
| 20 June–3 July | Aviation Holiday Training / Study Tour |
| 6 July | Classes Resume |
| 9–11 August | Tanzania National World Schools Debate Championship |
| 17–21 August | Graduation Preparation Week |
| 22 August | 4th Form IV Graduation Day |
| 7–11 September | Field Trip / Study Tour |
| 26 September | Annual Parents Meeting |
| 3 October | Annual Sports Day |
| 5–9 October | Alpha Girls High School Week |
| 5–9 October | Career Orientation / Academic Activities |
| 24 October | Visiting Day & PTC |
| 9–26 November | CSEE Examination |
| 4 December | Annual Staff Meeting |
| 5 December | School Board Meeting |
| 5–23 December | Aviation Holiday Training / Study Tour |

Academic year: first term for O-Level and second term for A-Level began
13 January 2026, classes from 14 January. Second period runs 6 July to
4 December 2026.

**Three of these are still ahead** as of early September 2026 — the September
field trip, Sports Day, and Alpha Girls High School Week. Load those first; an
Events section showing only past dates looks abandoned.

---

## Still outstanding

These blockers are **not** answered by these documents:

1. Full fee structure per school
2. Entry requirements for Nursery & Primary
3. Entry requirements for Alpha High O-Level (only the process is given)
4. Approved aviation positioning wording — **see the blocked section above**
5. ~~Managing Director's written message~~ — supplied September 2026
   (Ms. Fatina Said), live on `/about`. Her **photograph** is still owed.
6. "Life at Alpha" photographs
7. FAQs content
8. Google Maps links per campus
9. Social media handles for Facebook, X, LinkedIn
10. Parent and alumni testimonial quotes, with consent
11. Founder biography, and the Director's photograph. Her name is now
    known: Ms. Fatina Said, Managing Director, Alpha High School.
12. Application form PDF
13. Term start dates and application deadlines for Alpha High and Nursery &
    Primary (only the Alpha Girls calendar was supplied)
14. Email channel structure decision
15. Verification of the homepage statistics in the design mockup
