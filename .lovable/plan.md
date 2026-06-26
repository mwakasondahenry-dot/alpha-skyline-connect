## Build the three school pages

Target routes (already stubbed):
- `/schools/nursery-primary`
- `/schools/alpha-high`
- `/schools/alpha-girls`

Each page gets the same section skeleton so the three feel like one family, with school-specific accent colour, hero image, and copy slots you'll fill in.

### Section skeleton (per school)

1. **Sub-site header band** — sits under the global header. School name, campus, tagline, "Apply Now" + "Book a visit" CTAs, on a tinted background using the school's accent.
2. **Hero** — full-bleed campus photo, dark fade, headline + intro paragraph, breadcrumb back to Home.
3. **About this school** — 2-column: narrative on the left, key facts card on the right (ages, campus, language of instruction, curriculum).
4. **Programs & curriculum** — 3–4 cards (e.g. Early Years / Lower Primary / Upper Primary, or O-Level / A-Level / Aviation / Coding depending on the school).
5. **Daily life / Facilities** — image + bullet list (classrooms, labs, sports, boarding where relevant).
6. **Latest from this school** — live Supabase: 3 most recent published `news` rows where `school_slug = <this school>`, with empty state.
7. **Upcoming events at this school** — live Supabase: next 4 published `events` rows for this school, with empty state.
8. **Gallery strip** — live Supabase: up to 8 `gallery` rows for this school in a horizontal scroller (graceful empty state).
9. **Admission CTA band** — accent-coloured strip linking to `/admission` and `/contact`.

### Data layer additions

New server functions in `src/lib/alpha-content.functions.ts`, all filtered by `school_slug` and `published = true`:

- `getSchoolBundle(slug)` → returns `{ school, news, events, gallery }` in one round-trip for SSR. Hard-fails to empty arrays on Supabase error (same defensive pattern as the homepage). Uses the existing publishable server client.

Wired into each route's loader via `ensureQueryData` + `useSuspenseQuery`, matching the homepage pattern. Each route sets its own `head()` meta (title, description, og:title, og:description) — no shared metadata.

### Shared building blocks (new)

- `src/components/school/SchoolHero.tsx` — image + overlay + intro slot.
- `src/components/school/SchoolFacts.tsx` — key facts card.
- `src/components/school/ProgramCard.tsx` — program tile.
- `src/components/school/SchoolNewsGrid.tsx` — reuses the homepage news card styling, school-scoped.
- `src/components/school/SchoolEventsList.tsx` — vertical list variant of the events rail.
- `src/components/school/GalleryStrip.tsx` — horizontal-scroll thumbnails with lightbox-on-click (simple `<dialog>`).

These keep the three route files thin — each route just supplies copy, image, accent colour, and the school slug.

### Per-school config

A small static map in `src/lib/schools.ts` holds non-CMS content per school: accent hex, hero image asset, headline, intro, key facts, program tiles, facilities bullets. This is the **content surface you'll fill in**. Until copy lands, I'll use clearly-marked `TODO copy:` placeholders so nothing ships looking polished but fake.

### Copy I need from you (per school)

For each of Nursery & Primary / Alpha High / Alpha Girls:

- Tagline (one line under the school name)
- Intro paragraph (2–4 sentences for the hero)
- "About this school" narrative (1–2 paragraphs)
- Key facts: ages, campus, curriculum, language, boarding y/n, anything else
- 3–4 programs with title + 1-sentence description each
- 4–6 facility bullets
- Admission CTA line

You can drop it all in one message per school, or section by section — I'll wire it as it comes.

### Build order

1. Data layer (`getSchoolBundle`) + per-school config scaffold + shared components.
2. `/schools/nursery-primary` end-to-end with placeholder copy, verified against live Supabase.
3. `/schools/alpha-high` and `/schools/alpha-girls` (same skeleton, different config).
4. Swap in your real copy as you send it.

### Out of scope for this pass

Aviation/Coding program pages, Admission/Scholarships, About/Contact/Facilities, and News/Events/Gallery archive index pages. Those come next once schools are signed off.
