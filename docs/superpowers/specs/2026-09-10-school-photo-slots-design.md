# School Photo Slots — Design

**Date:** 2026-09-10
**Status:** Awaiting review
**Brief:** The admin portal needs an interface where staff upload pictures for each
school, and those pictures appear on that school's page in the right place —
clubs, facilities, students, sport and the other categories the pages already use.

## Why

The `gallery` table exists, `/admin/gallery` can write to it, and **nothing on the
live site reads it.** Its only consumer is `src/components/school/school-page.tsx:243`,
a generic page component no route imports any more. All three school pages are
bespoke and draw every photograph from a build-time import — 36 of them across
`schools.alpha-high.tsx`, `schools.alpha-girls.tsx` and `schools.nursery-primary.tsx`.

So today the school can upload photographs that no parent will ever see, while
every photograph a parent does see requires a developer and a deploy to change.

Two consequences are already visible on the live site:

- `FACILITIES` in `schools.alpha-high.tsx:812` and `schools.alpha-girls.tsx:742`
  are identical four-item arrays of **stand-ins that show the wrong thing**.
  "Library" is `campusNursery`, a photograph of the nursery campus. "Boarding" is
  `aviation`. Both pages ship both errors.
- `campusGirls` is named for a campus and actually shows the debate team with
  their certificates. `schools.alpha-girls.tsx:793` carries a source comment
  explaining that the alt text describes what the photo really shows, "because
  alt text that names the wrong subject is a lie told to a screen reader."

This feature is what lets the school fix those without a deploy.

## Approach

A `photo_slots` table holding one row per named position, and a code-side registry
declaring every position: key, school, section, label, target aspect, composition
constraints, and the bundled asset it falls back to.

The registry lives in code because a photo *position* is a layout fact. The
photograph in it is a content fact and lives in the database. Adding a position is
a layout change and needs a deploy; changing a photograph does not.

Two alternatives were rejected:

- **Add `slot_key` and `category` to `gallery`.** Less new surface, but `gallery`
  means "many, ordered" and a slot means "exactly one". Mixing them makes
  `sort_order` meaningless for half the rows, and leaves the existing
  `/admin/gallery` CRUD able to create rows that collide with slots.
- **A JSON map on `pages`.** No per-photo metadata, no row-level RLS, poor
  editing ergonomics.

### Precedent this follows

`HeroSlideshow` (`src/components/hero-slideshow.tsx`) already does exactly this
shape: it queries Supabase for `hero_slides` by `pageKey` and falls back to the
page's bundled images until real photos are added, managed from
`/admin/hero-slides`. This design extends that established pattern to the
non-hero positions rather than inventing a second mechanism.

**Heroes are therefore out of scope** — they are already solved. So is the
facilities *section* rendered by `SchoolFacilitiesSection`, which is already
driven by the `facilities` and `facility_photos` tables.

## Data model

New migration `alpha_migration_photo_slots.sql`, matching the existing
top-level-SQL-file convention.

```sql
create table if not exists public.photo_slots (
  slot_key    text primary key,
  school_slug text not null references public.schools(slug),
  image_url   text not null,
  alt_text    text not null,
  credit      text,
  updated_at  timestamptz not null default now()
);

create index if not exists photo_slots_school_idx on public.photo_slots (school_slug);
```

Grants and RLS mirror the existing content-table pattern exactly:

```sql
alter table public.photo_slots enable row level security;
create policy "photo_slots public read" on public.photo_slots for select using (true);
create policy "photo_slots staff all"   on public.photo_slots for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
```

Notes on the columns:

- `slot_key` is the primary key, so a slot physically cannot hold two photographs.
- There is **no `published` column.** A row exists only when the school has
  deliberately replaced a photograph, so existence is publication. Reverting a
  slot to its bundled default is a `DELETE`, which is the honest representation
  and needs no extra state.
- `alt_text` is `not null`. Every photograph on these pages carries real alt text
  today; an upload path that lets it be skipped would silently degrade that.
- `school_slug` is redundant with the key prefix but is what the admin screen and
  the bundle query filter on, and it keeps the foreign key meaningful.

`PhotoSlotRow` is added to `src/integrations/alpha-supabase/types.ts` and to the
`Database` interface alongside the other tables.

## Slot registry

`src/lib/photo-slots.ts` exports the slot definitions. Shape:

```ts
export type SlotDef = {
  key: string;                 // 'alpha-high.clubs.drama'
  school: SchoolSlug;
  section: string;             // grouping label in the admin UI
  label: string;               // 'Drama club'
  aspect: string;              // '16/10' | '1/1' | '4/5'
  guidance?: string;           // composition constraint shown on the card
  fallback?: string;           // the imported @/assets/*.webp URL; absent = no honest default exists
};
```

The `section` values are the categories the brief asks for. They are derived from
the sections the pages already have, not invented:

| School | Sections |
|---|---|
| Alpha High | Clubs · Sport · Campus & facilities |
| Alpha Girls | Campus & facilities · Students |
| Nursery & Primary | Our days · Primary · Gallery |

### The 39 slots

**Alpha High — Clubs (10).** Each tile in `CLUBS`
(`schools.alpha-high.tsx:659`) is labelled with a named club, so each is its own
slot: `aviation`, `drama`, `music`, `debate`, `art`, `cookery`, `scout`,
`speaking`, `model-un`, `environment`.

**Alpha High — Sport (5).** `SPORTS` (`schools.alpha-high.tsx:670`):
`football`, `basketball`, `volleyball`, `netball`, `athletics`. New positions —
see Decision 1 for the two-state rendering. No `fallback`; no sport photograph
exists in the repo.

**Alpha High — Campus & facilities (4).** `FACILITIES`
(`schools.alpha-high.tsx:812`): `science-labs`, `library`, `sports-field`,
`boarding`. All four are currently wrong stand-ins and carry **no `fallback`** —
see Decision 2.

**Alpha Girls — Campus & facilities (4).** `FACILITIES`
(`schools.alpha-girls.tsx:742`): the same four labels, the same four wrong
stand-ins, and likewise no `fallback`. Separate keys — Kunduchi's library is not
Mikocheni's.

**Alpha Girls — Students (1).** `life.campus-plate`
(`schools.alpha-girls.tsx:799`), the 16/10 → 2/1 figure currently showing the
debate team.

**Nursery & Primary — Our days (3).** The tilted card cluster at
`schools.nursery-primary.tsx:267–291`: `hippo-ride`, `girl-portrait`, `teacher`.
Each sits in a rotated coloured frame at a fixed height, so each carries an
aspect and a guidance note.

**Nursery & Primary — Primary (1).** `pupil-portrait`
(`schools.nursery-primary.tsx:479`). This one is **circularly masked**
(`rounded-[50%]`, `object-cover object-top`) rather than a transparent cutout.
Its guidance reads: head-and-shoulders portrait, subject centred and near the top
of the frame; anything else crops badly.

**Nursery & Primary — Gallery (11).** The `GalleryTile` grid at
`schools.nursery-primary.tsx:865–876`. The captions are already written and stay
in code; only the photographs become slots: `play-discovery`, `shapes`,
`toy-car`, `playground`, `speakers-team`, `speakers-challenge`, `one-to-one`,
`telescope`, `sports-teamwork`, `musical-chairs`, `dance`. The grid is not
uniform — `playground` and `sports-teamwork` span two columns and want a wider
crop, and `play-discovery` spans two rows and wants a tall one. Their `aspect`
values record that.

Note that `photoTeacher` currently fills two positions — the tilted card at
`:291` and the "One-on-one learning" tile at `:871`. That is one asset used
twice, so it becomes **two** slots (`nursery-primary.days.teacher` and
`nursery-primary.gallery.one-to-one`) sharing a fallback. It is not a
duplicate in the registry.

## Admin surface

New route `/admin/photos`, replacing `/admin/gallery` in the header nav and on the
dashboard. It does **not** use `AdminCrud` — a table of rows with a URL field is
the wrong shape for "swap the picture in this position".

Layout: a school selector, then slots grouped under their section headings as a
grid of cards. Each card shows the photograph that is on the page right now, the
slot label, the target aspect, any guidance, and whether the current image is the
school's upload or the bundled default. Controls per card: **Replace** (opens the
file picker) and, when an upload exists, **Revert to default** (deletes the row,
behind a confirm).

Replacing prompts for alt text in the same step and will not save without it.

Existing surfaces are untouched: `/admin/hero-slides`, `/admin/facility-photos`,
`/admin/staff`, `/admin/news`, `/admin/events`, `/admin/testimonials`.
`/admin/gallery` and the `gallery` table are left in place but delinked from the
nav — see Open questions.

## Read path

`getSchoolBundle` in `src/lib/alpha-content.functions.ts` gains one more query to
the existing `Promise.all`, selecting `photo_slots` rows for the page's school.
`SchoolBundle` gains:

```ts
photos: Record<string, { image_url: string; alt_text: string; credit: string | null }>;
```

keyed by `slot_key`, so a lookup is a property access rather than a scan. Failure
returns `{}` like every other field in that function's `empty` fallback.

A helper in `src/lib/photo-slots.ts`:

```ts
export function slotPhoto(
  bundle: Pick<SchoolBundle, "photos">,
  key: string,
): { src: string; alt: string } | null
```

Resolution order: the uploaded row, else the registry `fallback`, else `null`.

`null` is returned only by the thirteen slots that deliberately have no
fallback: the eight facility stand-ins (four per secondary page) and the five
sport positions, per Decisions 1 and 2. Every other slot always resolves, so **for them the site can
never show a hole**: an empty slot renders precisely what it renders today, from
the same bundled asset. For those pages the only change is that a literal
`src={photoDance}` becomes a `slotPhoto(bundle, "nursery-primary.gallery.dance")`
lookup — no layout, spacing, class or caption changes.

Components that consume a nullable slot (`FacilityTile`, the sport grid) render
a labelled accent panel instead of an `<img>` when they get `null`. A `null`
never reaches an `<img src>`.

## Image pipeline

New `src/lib/image-compress.ts`, used by the admin upload path only.

Draw the selected file to a canvas, downscale so the long edge is at most 1600px,
re-encode to WebP at quality 0.82, preserving aspect. Images already smaller than
the cap are re-encoded but not upscaled. The card reports the result — "4.2 MB →
148 KB" — before the upload begins.

A file still over 400KB after compression is **rejected** with an explanation
rather than shipped, and the slot keeps its previous photograph.

This is the mechanism that protects the constraint `PRODUCT.md` treats as
non-negotiable: mid-range Android on mobile data, 60fps. The 36 bundled assets are
build-optimised WebP; uploads arrive as 3–5MB phone JPEGs, and putting those on
these pages unprocessed would be a serious regression. Supabase image
transformations were considered and set aside: they are a paid add-on, and this
gets the same result at the point of upload with no plan dependency.

Uploads go to the existing public `media` bucket under a `photo-slots/` prefix,
using the storage policies already in `alpha_schema.sql`.

## Error handling

- **Upload fails** (network, RLS, quota): the card shows the Supabase error, the
  slot keeps its previous photograph, no row is written.
- **Row written but image 404s later** (object deleted in the Supabase console):
  the page shows a broken image. Accepted — the same is true of every other
  image-bearing table in this schema, and the fix belongs in one place if we ever
  add it.
- **Canvas encode fails** (corrupt file, unsupported format): rejected before
  upload with the reason.
- **Bundle query fails:** `photos` is `{}`, every slot falls back, the pages look
  exactly as they do today. A Supabase outage must not blank the school pages.

## Testing

The repo has no test runner, so verification is manual and evidence-based:

1. `npm run build` clean.
2. Against the real Supabase project: upload to a slot, confirm it appears on the
   page; revert, confirm the bundled default returns.
3. Reject paths: a 5MB photo compresses and uploads; a file that stays over 400KB
   is refused; saving without alt text is refused.
4. All three school pages at 375px, per `PRODUCT.md`.
5. With an empty `photo_slots` table, confirm the three pages are unchanged from
   the current site **except** for the two changes Decisions 1 and 2 make
   deliberately: the eight facility tiles show labelled accent panels rather
   than the wrong photographs, and the sport block still renders as today's
   pills. Everything else is the fallback path and must be pixel-identical.

## Out of scope

- The `/gallery` public stub. Nursery & Primary's "See the full gallery →" link
  (`schools.nursery-primary.tsx:860`) still points at it. Unchanged here.
- `facility_photos` and `hero_slides`, both already working.
- Any photo position that does not exist on the pages today, with the single
  deliberate exception of the five sport slots (Decision 1).
- Kiswahili alt text. The site is English-only; that gap is recorded in
  `PRODUCT.md` and is not this feature's to close.

## Decisions

Resolved 2026-09-10, on the instruction to do what gives the best experience.

**1 · Sport gets photo slots.** `SPORTS` on Alpha High
(`schools.alpha-high.tsx:670`) is a five-item text list — Football, Basketball,
Volleyball, Netball, Athletics — rendered as pills with no imagery. Sport was
named explicitly in the brief, so the five become slots:
`alpha-high.sport.football` and so on.

The section must look deliberate whether the school has uploaded five photos,
two, or none, so it does not mix photo tiles with pills. It has two states:

- **No sport photo uploaded** — renders exactly the pill list it renders today.
  Zero visual change from the current site.
- **One or more uploaded** — the whole block becomes a tile grid. Sports without
  a photograph get an accent-filled tile carrying the sport's name in the same
  type as the photo tiles, so the grid is uniform.

This is the one place the design adds a layout position rather than filling an
existing one, and it stays faithful because its empty state *is* the current
design.

**2 · The four facility stand-ins lose their photographs.** `FACILITIES` on both
secondary pages currently captions a nursery-campus photo "Library" and an
aviation photo "Boarding". `PRODUCT.md` is unambiguous — "No invented content,
ever" — and this is exactly that, on the pages parents use to compare schools.

Their registry entries therefore carry **no `fallback`**. Until the school
uploads, the tile renders as an accent-filled panel with the facility name and
the same "Facility" eyebrow — honest, deliberate-looking, and visibly awaiting a
photograph. `SlotDef.fallback` becomes optional to allow this, and `slotPhoto`
returns `null` for a slot with neither an upload nor a fallback, which the tile
components handle.

This is a visible change to the live site made before any upload exists. It is
the point: a labelled blank is better than a confident lie.

**3 · `/admin/gallery` and the `gallery` table stay dormant.** Delinked from the
nav, route and table left in place. Removing them is a decision for after the
school has used `/admin/photos` for a term.

**4 · Alpha Girls gets no club slots.** The page has no Clubs section. Adding one
is a content and layout question for the school, not something to invent here.
