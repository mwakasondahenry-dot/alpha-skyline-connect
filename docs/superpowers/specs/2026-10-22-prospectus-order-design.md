# Prospectus order for the school pages, and a bolder home page

Design, 2026-10-22. Requested by the site owner after the "feed" version of
Alpha High went live: "I don't like the design and flow of the Alpha High
page, it's just random. I want someone to pick information about the school
and present it in an organized manner. Same for Alpha Girls." The order was
confirmed in chat: who the school is, what it teaches, how its students
perform, life outside class, who runs it, how to join. The design should be
"bold and youthful, not like a corporate site". The home page: "the video is
cropped and the design is dull".

## Intent

A parent comparing two or three secondary schools on a phone should be able
to read either school page top to bottom like a good prospectus and come
away knowing six things in order, with the photographs serving each section
rather than being the structure. The pages stay picture-full and youthful.

## Goals

- Both secondary pages follow the same six-part order under the same sticky
  sub-nav: About · Academics · Results · Student life · People · Admission.
- Every fact already on the pages survives the reorganisation: the 17
  O-Level subjects, the option subjects per form, the 12 A-Level
  combinations, the admission steps and both fee placeholders (Alpha High);
  the NECTA results, journey, competitions, enterprise pathway, clubs, entry
  criteria, calendar and all unconfirmed notes (Alpha Girls).
- Alpha High gets a real "how its students perform" section: NECTA's
  published results for examination centre S2549, Alpha Secondary School,
  Dar es Salaam (CSEE 2024, CSEE 2025, ACSEE 2026), one square per
  candidate, each sitting linked to its NECTA page. The subject explorer
  (chips, form dropdown, stream filter, search) stays as the academics
  interaction.
- The home video plays uncropped: a 16:9 frame on every viewport, never
  `object-fit: cover`.
- The home page gets bolder: colour fields that own whole bands, larger
  photography, the two schools' real NECTA headline results, and the
  aviation programme as a full-bleed chapter instead of a small card.

## Non-goals

- No change to typography roles, tokens, header, footer or the other pages.
- No new copy claims. Section intros reuse the school's own sentences (the
  mission and vision on /about, the Instagram captions already quoted).
- No change to the Nursery & Primary or aviation pages beyond the
  coordinator wording already committed.

## Anti-goals

- A corporate school site: hero, stat strip, grid of identical cards, kicker
  labels above headings.
- Invented statistics, names, quotes or subject lists. Square-bracket
  placeholders stay visible where the school still owes content.
- A results section that rounds or editorialises NECTA's numbers.

## Constraints

- AGENTS.md naming rule, placeholder rule, no force-push.
- DESIGN.md world: navy field and gold line for Alpha High and home; the
  sea-green register for Alpha Girls. Colours from tokens only; red and green
  are logo-only; gold never as small text on white.
- Verified at 375px and 1440px; motion collapses under reduced motion.
- Performance budget for a mid-range Android phone: no new JS libraries, no
  autoplay video outside the home video section, lazy images below the fold.

## Decisions

### Section order and content, both schools

1. **Hero (who the school is, in one screen).** Full-bleed photograph under
   the site scrim, two-tone headline, a blurb that names intake, campus and
   forms, Enroll Now (gold) and "See the results" (ghost, jumps to
   #results). Foot: four quick facts as a credential strip (Form 1–6 ·
   campus · intake · year established).
2. **About.** The school's mission and vision in its own words, three or
   four facts as a hairline-ruled list, and the campus photographs. Alpha
   High: the aerial campus photo leads. Alpha Girls: the Class of 2026 and
   the journey milestones (2020 opening, graduations) live here.
3. **Academics.** A navy (High) or deep sea-green (Girls) band with the
   headline "Seventeen subjects at O-Level, twelve combinations at A-Level",
   then the SubjectExplorer on white, the core-subjects placeholder, the
   guidance link. Alpha Girls keeps its entry criteria here. Both link to
   /aviation and /coding as "also on the timetable".
4. **Results.** NECTA's published results, one square per candidate
   (ResultsChart), newest Form Four sitting first, Form Six beside it, the
   year before below, centre GPA rows, and source links. Then "beyond the
   exam hall": the competition results already on the pages (High: TAWECE
   2024 2nd of 24, Debate 2026 Best Institution from East Africa and Junior
   Plate; Girls: competitions list).
5. **Student life.** Grouped, captioned photo sets: clubs (the ten club
   slots with photographs), sport, trips and visits (TBC, TIMEXPO), every
   day (library, tablets, four meals, counselling), giving back (beach
   clean-up, Alpha Aid), and graduation day. Alpha Girls: enterprise
   pathway, clubs, campus and facilities, graduation portraits, coming up.
6. **People.** Staff from the bundle (Head Teacher placeholder when empty),
   then parent voices.
7. **Admission.** High: the four documented steps, both placeholders, Get
   the application form and Book a tour. Girls: the same shape with the
   entry criteria pointer. Then the gold apply banner, facilities, footer.

### Alpha High results data

`src/lib/high-results.ts`, same shape as `girls-results.ts`, copied from
NECTA's pages for centre S2549:

| Sitting | Candidates sat | I | II | III | IV | 0 | GPA |
|---|---|---|---|---|---|---|---|
| CSEE 2025 | 92 | 60 | 19 | 12 | 1 | 0 | 1.9439, Grade B |
| CSEE 2024 | 90 | 39 | 35 | 12 | 4 | 0 | 2.2157, Grade B |
| ACSEE 2026 | 188 | 85 | 76 | 27 | 0 | 0 | 2.5062, Grade C |

CSEE 2025 English Language: GPA 1.5761, Grade A, 92 sat. The page names the
centre as NECTA names it. S2549 "Alpha Secondary School, Dar es Salaam" was
matched to Alpha High (co-education, Dar es Salaam, the only Alpha centre
besides Alpha Girls and Alpha Adventist) and the site owner confirmed the
match on 2026-10-22.

### Home page

- Video: the section becomes a navy band holding a 16:9 frame at shell
  width (heading above, controls beside the heading), poster inside the
  frame at the same ratio. The player code is unchanged; only the frame
  and its CSS change. The `home-video.test.ts` decisions still hold.
- Order: hero → stat band (phones) → find the right school → results band
  (both schools' headline NECTA figures, linking to each page's results) →
  video → aviation chapter (full-bleed photo, the approved sentence, a
  module list teaser) → testimonials → news & events.
- Bolder: the results band is a deep navy field with gold figures; the
  aviation chapter is full-bleed; the school cards grow to the full
  viewport height on phones.

## Left to the builder

Exact photo choice per slot, the quick-fact strip wording, how the student
life groups wrap at 375px, the order of clubs, and the sticky sub-nav
offsets.
