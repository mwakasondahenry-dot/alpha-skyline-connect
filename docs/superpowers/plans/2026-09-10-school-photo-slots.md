# School Photo Slots Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let school staff replace any photograph on the three school pages from the admin portal, without a deploy, with the photo landing in the exact position it belongs to.

**Architecture:** A `photo_slots` table holds one row per named position; a code-side registry in `src/lib/photo-slots.ts` declares all 39 positions with their school, section, aspect and bundled fallback. Pages resolve `slotPhoto(photos, key)` — uploaded row, else fallback, else `null`. This extends the pattern `HeroSlideshow` already established rather than inventing a second one.

**Tech Stack:** TanStack Start · Vite · Tailwind v4 · Supabase (`media` bucket, RLS) · Vitest (added in Task 1 for pure-logic tests only)

**Spec:** `docs/superpowers/specs/2026-09-10-school-photo-slots-design.md` — read it before starting. This plan implements it, including its four Decisions.

## Global Constraints

- **Every commit message ends with these two lines**, exactly:
  ```
  Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_0113254pwxhtgexCtUpEWkyV
  ```
- **Never force push, rebase, or amend a pushed commit.** This branch syncs with Lovable; rewriting history destroys the project history there (`AGENTS.md`).
- Only tokens from `src/styles.css`. No new colours, type sizes or component shapes.
- **ALPHA** is the school brand; **ALFA EDUCATION CENTRE** is the legal entity, used only in footer copyright, postal address, "operated by", terms/privacy and structured data. Never mix them.
- Use **"Co-education"**, never "Mixed".
- Red `#E22321` and green `#00923F` are logo-only, never UI colour.
- Gold is a fill, a rule and a figure colour. Never small text on a light ground (1.91:1 on white).
- **No invented content, ever.** No fabricated statistics, testimonials, names, quotes or subject lists.
- Preserve every `[bracketed placeholder]` verbatim.
- Performance budget: mid-range Android on mobile data, 60fps. No parallax, scroll-jacking, autoplay video, or JS animation libraries. All motion collapses under `prefers-reduced-motion`.
- Verify at 375px before moving on. `npm run build` must pass at the end of every task.
- One task per commit.

## File Structure

**Created:**

| File | Responsibility |
|---|---|
| `alpha_migration_photo_slots.sql` | Table, grants, RLS. Top-level, matching the existing migration convention. |
| `src/lib/photo-slots.ts` | The registry of 39 slots + pure resolution helpers. No React, no Supabase. |
| `src/lib/photo-slots.test.ts` | Registry invariants and `slotPhoto` resolution. |
| `src/lib/image-compress.ts` | Canvas downscale + WebP re-encode. Browser-only. |
| `src/lib/image-compress.test.ts` | `fitWithin` geometry (the pure part). |
| `src/components/admin/photo-slot-card.tsx` | One slot card: current photo, replace, revert. |
| `src/routes/admin.photos.tsx` | The `/admin/photos` screen: school picker + sectioned grid. |
| `src/components/school/facility-tile.tsx` | Shared 4/5 facility tile, photo or labelled panel. Used by both secondary pages. |

**Modified:**

| File | Change |
|---|---|
| `src/integrations/alpha-supabase/types.ts` | `PhotoSlotRow` + `Database` entry. |
| `src/lib/alpha-content.functions.ts` | `SchoolPhotoMap` type; `photos` on `SchoolBundle`; one more query in `getSchoolBundle`. |
| `src/routes/admin.tsx:63` | Nav: replace the Activities link with Photos. |
| `src/routes/admin.index.tsx:29` | Dashboard: same swap. |
| `src/routes/schools.nursery-primary.tsx` | 15 slots wired. |
| `src/routes/schools.alpha-girls.tsx` | 5 slots wired; local `FACILITIES` render replaced with `FacilityTile`. |
| `src/routes/schools.alpha-high.tsx` | 19 slots wired; `FacilityTile`; two-state sport block. |

**Testing note:** the repo has no test runner today. Task 1 adds Vitest and it is used **only** for pure logic — registry integrity and geometry — where a typo silently blanks a photo on a live page. Canvas, Supabase and layout are verified manually, per the spec's Testing section. Do not add jsdom or component tests; that is not this plan's scope.

---

### Task 1: Migration, types and test harness

**Files:**
- Create: `alpha_migration_photo_slots.sql`
- Modify: `src/integrations/alpha-supabase/types.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: nothing.
- Produces: `PhotoSlotRow` (`slot_key: string; school_slug: SchoolSlug; image_url: string; alt_text: string; credit: string | null; updated_at: string`), the `photo_slots` entry on `Database["public"]["Tables"]`, and an `npm test` script running Vitest.

- [ ] **Step 1: Write the migration**

Create `alpha_migration_photo_slots.sql`:

```sql
-- ============================================================
-- PHOTO SLOTS — one row per named photo position on a school page.
-- The positions themselves are declared in src/lib/photo-slots.ts.
-- A row exists only when staff have deliberately replaced a photo,
-- so existence IS publication and there is no `published` column.
-- Reverting a slot to its built-in default is a DELETE.
-- ============================================================

create table if not exists public.photo_slots (
  slot_key    text primary key,
  school_slug text not null references public.schools(slug),
  image_url   text not null,
  alt_text    text not null,
  credit      text,
  updated_at  timestamptz not null default now()
);

create index if not exists photo_slots_school_idx on public.photo_slots (school_slug);

grant select on public.photo_slots to anon;
grant select, insert, update, delete on public.photo_slots to authenticated;
grant all on public.photo_slots to service_role;

alter table public.photo_slots enable row level security;

create policy "photo_slots public read" on public.photo_slots for select using (true);
create policy "photo_slots staff all"   on public.photo_slots for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
```

- [ ] **Step 2: Run the migration against Supabase**

Paste the file into the Supabase SQL editor for the Alpha project and run it. Then confirm in Table Editor that `photo_slots` exists with six columns and RLS enabled.

Expected: table present, "RLS enabled" badge showing, two policies listed.

- [ ] **Step 3: Add the row type**

In `src/integrations/alpha-supabase/types.ts`, add alongside the other row interfaces:

```ts
export interface PhotoSlotRow {
  slot_key: string;
  school_slug: SchoolSlug;
  image_url: string;
  alt_text: string;
  credit: string | null;
  updated_at: string;
}
```

And in the `Database` interface's `Tables` block, beside `facility_photos`:

```ts
      photo_slots: { Row: PhotoSlotRow; Insert: Partial<PhotoSlotRow>; Update: Partial<PhotoSlotRow> };
```

- [ ] **Step 4: Add Vitest**

```bash
npm install -D vitest@^3
```

Add to `package.json` scripts, after `"lint"`:

```json
    "test": "vitest run",
```

- [ ] **Step 5: Verify the harness runs**

Run: `npm test`
Expected: Vitest starts and exits reporting "No test files found" — a clean exit, not a crash. (Vitest exits non-zero on no files; that is fine here and resolves in Task 2.)

- [ ] **Step 6: Verify the build still passes**

Run: `npm run build`
Expected: build completes with no TypeScript errors.

- [ ] **Step 7: Commit**

```bash
git add alpha_migration_photo_slots.sql src/integrations/alpha-supabase/types.ts package.json package-lock.json
git commit -m "Add the photo_slots table a school page position can be stored in

Existence is publication: a row appears only when staff replace a
photo, so reverting to the built-in default is a DELETE rather than a
flag. Adds Vitest for the pure registry logic landing next.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_0113254pwxhtgexCtUpEWkyV"
```

---

### Task 2: The slot registry

**Files:**
- Create: `src/lib/photo-slots.ts`
- Create: `src/lib/photo-slots.test.ts`

**Interfaces:**
- Consumes: `SchoolSlug` from `src/integrations/alpha-supabase/types.ts`.
- Produces:
  - `type SlotDef = { key: string; school: SchoolSlug; section: string; label: string; aspect: string; guidance?: string; fallback?: string }`
  - `type SlotPhotoMap = Record<string, { image_url: string; alt_text: string; credit: string | null }>`
  - `const PHOTO_SLOTS: readonly SlotDef[]`
  - `function slotDef(key: string): SlotDef | undefined`
  - `function slotsBySection(school: SchoolSlug): { section: string; slots: SlotDef[] }[]`
  - `function slotPhoto(photos: SlotPhotoMap, key: string): { src: string; alt: string } | null`

`slotPhoto` takes the map directly, not the bundle. The spec sketched `Pick<SchoolBundle, "photos">`; passing the map keeps this file free of any import from `alpha-content.functions.ts` and therefore keeps the asset imports out of the server bundle.

- [ ] **Step 1: Write the failing test**

Create `src/lib/photo-slots.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { PHOTO_SLOTS, slotDef, slotsBySection, slotPhoto } from "./photo-slots";

describe("registry integrity", () => {
  it("declares 39 slots", () => {
    expect(PHOTO_SLOTS).toHaveLength(39);
  });

  it("has no duplicate keys", () => {
    const keys = PHOTO_SLOTS.map((s) => s.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("prefixes every key with its own school", () => {
    for (const s of PHOTO_SLOTS) {
      expect(s.key.startsWith(`${s.school}.`)).toBe(true);
    }
  });

  it("leaves exactly the 13 deliberate slots without a fallback", () => {
    const bare = PHOTO_SLOTS.filter((s) => !s.fallback).map((s) => s.key).sort();
    expect(bare).toEqual([
      "alpha-girls.facilities.boarding",
      "alpha-girls.facilities.library",
      "alpha-girls.facilities.science-labs",
      "alpha-girls.facilities.sports-field",
      "alpha-high.facilities.boarding",
      "alpha-high.facilities.library",
      "alpha-high.facilities.science-labs",
      "alpha-high.facilities.sports-field",
      "alpha-high.sport.athletics",
      "alpha-high.sport.basketball",
      "alpha-high.sport.football",
      "alpha-high.sport.netball",
      "alpha-high.sport.volleyball",
    ]);
  });
});

describe("slotsBySection", () => {
  it("groups a school's slots and excludes other schools", () => {
    const groups = slotsBySection("alpha-girls");
    const all = groups.flatMap((g) => g.slots);
    expect(all.every((s) => s.school === "alpha-girls")).toBe(true);
    expect(all).toHaveLength(5);
    expect(groups.map((g) => g.section)).toEqual(["Campus & facilities", "Students"]);
  });
});

describe("slotPhoto", () => {
  const key = "nursery-primary.gallery.dance";

  it("prefers the uploaded row", () => {
    const got = slotPhoto(
      { [key]: { image_url: "https://cdn/x.webp", alt_text: "Pupils dancing", credit: null } },
      key,
    );
    expect(got).toEqual({ src: "https://cdn/x.webp", alt: "Pupils dancing" });
  });

  it("falls back to the bundled asset when nothing is uploaded", () => {
    const got = slotPhoto({}, key);
    expect(got).not.toBeNull();
    expect(got!.src).toBe(slotDef(key)!.fallback);
  });

  it("returns null for a slot with no upload and no fallback", () => {
    expect(slotPhoto({}, "alpha-high.facilities.library")).toBeNull();
  });

  it("returns null for an unknown key rather than throwing", () => {
    expect(slotPhoto({}, "nope.not.real")).toBeNull();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test`
Expected: FAIL — cannot resolve `./photo-slots`.

- [ ] **Step 3: Write the registry**

Create `src/lib/photo-slots.ts`. The asset import list is copied from the three page files; keep the same specifiers.

```ts
/**
 * Every replaceable photo position on the three school pages.
 *
 * A position is a layout fact, so it lives here in code. The photograph in
 * it is a content fact and lives in `photo_slots` in Supabase. Adding a
 * position needs a deploy; changing a photograph does not.
 *
 * `fallback` is the picture the page shipped with. Thirteen slots
 * deliberately have none — the eight facility tiles whose stand-ins showed
 * the wrong building, and the five sport positions that never had a
 * photograph. Those render a labelled panel until staff upload something
 * real. A labelled blank is better than a confident lie.
 */
import type { SchoolSlug } from "@/integrations/alpha-supabase/types";

import clubAviation from "@/assets/club-aviation.webp";
import clubDrama from "@/assets/club-drama.webp";
import clubMusic from "@/assets/club-music-dance.webp";
import clubDebate from "@/assets/club-debate.webp";
import clubArt from "@/assets/club-art.webp";
import clubCookery from "@/assets/club-cookery.webp";
import clubScout from "@/assets/club-scout.webp";
import clubSpeaking from "@/assets/club-public-speaking.webp";
import clubUn from "@/assets/club-un.webp";
import clubEnvironment from "@/assets/club-environment.webp";
import campusGirls from "@/assets/campus-girls.webp";
import photoHippoRide from "@/assets/np-hippo-ride.webp";
import photoGirlPortrait from "@/assets/np-girl-portrait.webp";
import photoTeacher from "@/assets/np-teacher-pupils.webp";
import girlCutout from "@/assets/alpha-girl-uniform.webp";
import photoBallPit from "@/assets/np-ball-pit.webp";
import photoShapesClass from "@/assets/np-shapes-class.webp";
import photoToyCar from "@/assets/np-toy-car.webp";
import photoPlayground from "@/assets/np-playground.webp";
import photoSpeakersTeam from "@/assets/np-junior-speakers-team.webp";
import photoSpeakersGroup from "@/assets/np-junior-speakers-group.webp";
import photoTelescope from "@/assets/np-telescope.webp";
import photoTeam from "@/assets/np-team-thumbs.webp";
import photoMusicalChairs from "@/assets/np-musical-chairs.webp";
import photoDance from "@/assets/np-traditional-dance.webp";

export type SlotDef = {
  /** Stable identity, `<school>.<section>.<name>`. Never change a shipped key. */
  key: string;
  school: SchoolSlug;
  /** Grouping heading in the admin screen. */
  section: string;
  label: string;
  /** CSS aspect-ratio the position crops to, shown as upload guidance. */
  aspect: string;
  guidance?: string;
  fallback?: string;
};

export type SlotPhotoMap = Record<
  string,
  { image_url: string; alt_text: string; credit: string | null }
>;

const WIDE = "16 / 10";
const TILE = "4 / 5";
const CARD = "3 / 2";

export const PHOTO_SLOTS: readonly SlotDef[] = [
  // ---- Alpha High · Clubs (marquee ribbon, 288x224 tiles) ----
  { key: "alpha-high.clubs.aviation", school: "alpha-high", section: "Clubs", label: "Aviation club", aspect: CARD, fallback: clubAviation },
  { key: "alpha-high.clubs.drama", school: "alpha-high", section: "Clubs", label: "Drama club", aspect: CARD, fallback: clubDrama },
  { key: "alpha-high.clubs.music", school: "alpha-high", section: "Clubs", label: "Music & Dance club", aspect: CARD, fallback: clubMusic },
  { key: "alpha-high.clubs.debate", school: "alpha-high", section: "Clubs", label: "Debate club", aspect: CARD, fallback: clubDebate },
  { key: "alpha-high.clubs.art", school: "alpha-high", section: "Clubs", label: "Art & Drawing club", aspect: CARD, fallback: clubArt },
  { key: "alpha-high.clubs.cookery", school: "alpha-high", section: "Clubs", label: "Cookery club", aspect: CARD, fallback: clubCookery },
  { key: "alpha-high.clubs.scout", school: "alpha-high", section: "Clubs", label: "Scout club", aspect: CARD, fallback: clubScout },
  { key: "alpha-high.clubs.speaking", school: "alpha-high", section: "Clubs", label: "Public Speaking club", aspect: CARD, fallback: clubSpeaking },
  { key: "alpha-high.clubs.model-un", school: "alpha-high", section: "Clubs", label: "Model UN club", aspect: CARD, fallback: clubUn },
  { key: "alpha-high.clubs.environment", school: "alpha-high", section: "Clubs", label: "Environment club", aspect: CARD, fallback: clubEnvironment },

  // ---- Alpha High · Sport (no photograph has ever existed for these) ----
  { key: "alpha-high.sport.football", school: "alpha-high", section: "Sport", label: "Football", aspect: TILE, guidance: "Players in action if possible, not an empty pitch." },
  { key: "alpha-high.sport.basketball", school: "alpha-high", section: "Sport", label: "Basketball", aspect: TILE, guidance: "Players in action if possible, not an empty court." },
  { key: "alpha-high.sport.volleyball", school: "alpha-high", section: "Sport", label: "Volleyball", aspect: TILE, guidance: "Players in action if possible, not an empty court." },
  { key: "alpha-high.sport.netball", school: "alpha-high", section: "Sport", label: "Netball", aspect: TILE, guidance: "Players in action if possible, not an empty court." },
  { key: "alpha-high.sport.athletics", school: "alpha-high", section: "Sport", label: "Athletics", aspect: TILE, guidance: "Runners or field events, not an empty track." },

  // ---- Alpha High · Campus & facilities (stand-ins removed, see spec Decision 2) ----
  { key: "alpha-high.facilities.science-labs", school: "alpha-high", section: "Campus & facilities", label: "Science labs", aspect: TILE, guidance: "A Mikocheni lab. The tile is portrait — shoot or crop tall." },
  { key: "alpha-high.facilities.library", school: "alpha-high", section: "Campus & facilities", label: "Library", aspect: TILE, guidance: "The Mikocheni library. Portrait crop." },
  { key: "alpha-high.facilities.sports-field", school: "alpha-high", section: "Campus & facilities", label: "Sports field", aspect: TILE, guidance: "The Mikocheni field. Portrait crop." },
  { key: "alpha-high.facilities.boarding", school: "alpha-high", section: "Campus & facilities", label: "Boarding", aspect: TILE, guidance: "Mikocheni boarding. Portrait crop." },

  // ---- Alpha Girls · Campus & facilities ----
  { key: "alpha-girls.facilities.science-labs", school: "alpha-girls", section: "Campus & facilities", label: "Science labs", aspect: TILE, guidance: "A Kunduchi lab. Portrait crop." },
  { key: "alpha-girls.facilities.library", school: "alpha-girls", section: "Campus & facilities", label: "Library", aspect: TILE, guidance: "The Kunduchi library. Portrait crop." },
  { key: "alpha-girls.facilities.sports-field", school: "alpha-girls", section: "Campus & facilities", label: "Sports field", aspect: TILE, guidance: "The Kunduchi field. Portrait crop." },
  { key: "alpha-girls.facilities.boarding", school: "alpha-girls", section: "Campus & facilities", label: "Boarding", aspect: TILE, guidance: "Kunduchi boarding. Portrait crop." },

  // ---- Alpha Girls · Students ----
  { key: "alpha-girls.students.campus-plate", school: "alpha-girls", section: "Students", label: "Full-width campus plate", aspect: WIDE, guidance: "Wide and full-bleed; a caption sits over the bottom third, so keep faces out of it.", fallback: campusGirls },

  // ---- Nursery & Primary · Our days (tilted card cluster) ----
  { key: "nursery-primary.days.hippo-ride", school: "nursery-primary", section: "Our days", label: "Courtyard play card", aspect: CARD, guidance: "Sits in a tilted lilac frame, top right of the cluster.", fallback: photoHippoRide },
  { key: "nursery-primary.days.girl-portrait", school: "nursery-primary", section: "Our days", label: "Gold-frame portrait card", aspect: CARD, guidance: "The largest card, tilted left in a gold frame. A single pupil reads best.", fallback: photoGirlPortrait },
  { key: "nursery-primary.days.teacher", school: "nursery-primary", section: "Our days", label: "Teaching card", aspect: CARD, guidance: "Tilted navy frame, bottom right. A teacher with pupils.", fallback: photoTeacher },

  // ---- Nursery & Primary · Primary ----
  { key: "nursery-primary.primary.pupil-portrait", school: "nursery-primary", section: "Primary", label: "Circular pupil portrait", aspect: "1 / 1", guidance: "Masked to a circle and anchored to the top of the frame. Use a head-and-shoulders portrait with the face high and centred; anything else crops badly.", fallback: girlCutout },

  // ---- Nursery & Primary · Gallery (captions stay in the page) ----
  { key: "nursery-primary.gallery.play-discovery", school: "nursery-primary", section: "Gallery", label: "Play & discovery", aspect: "3 / 4", guidance: "The tall tile — spans two rows. Use an upright photo.", fallback: photoBallPit },
  { key: "nursery-primary.gallery.shapes", school: "nursery-primary", section: "Gallery", label: "Learning shapes", aspect: WIDE, fallback: photoShapesClass },
  { key: "nursery-primary.gallery.toy-car", school: "nursery-primary", section: "Gallery", label: "Little drivers", aspect: WIDE, fallback: photoToyCar },
  { key: "nursery-primary.gallery.playground", school: "nursery-primary", section: "Gallery", label: "Outdoor adventures", aspect: "2 / 1", guidance: "Spans two columns — use a wide photo.", fallback: photoPlayground },
  { key: "nursery-primary.gallery.speakers-team", school: "nursery-primary", section: "Gallery", label: "Junior Speakers team", aspect: WIDE, fallback: photoSpeakersTeam },
  { key: "nursery-primary.gallery.speakers-challenge", school: "nursery-primary", section: "Gallery", label: "Speakers Challenge 2025", aspect: WIDE, fallback: photoSpeakersGroup },
  { key: "nursery-primary.gallery.one-to-one", school: "nursery-primary", section: "Gallery", label: "One-on-one learning", aspect: WIDE, fallback: photoTeacher },
  { key: "nursery-primary.gallery.telescope", school: "nursery-primary", section: "Gallery", label: "Curious minds", aspect: WIDE, fallback: photoTelescope },
  { key: "nursery-primary.gallery.sports-teamwork", school: "nursery-primary", section: "Gallery", label: "Sports & teamwork", aspect: "2 / 1", guidance: "Spans two columns — use a wide photo.", fallback: photoTeam },
  { key: "nursery-primary.gallery.musical-chairs", school: "nursery-primary", section: "Gallery", label: "Active play", aspect: WIDE, fallback: photoMusicalChairs },
  { key: "nursery-primary.gallery.dance", school: "nursery-primary", section: "Gallery", label: "Culture & dance", aspect: WIDE, fallback: photoDance },
] as const;

const BY_KEY = new Map(PHOTO_SLOTS.map((s) => [s.key, s]));

export function slotDef(key: string): SlotDef | undefined {
  return BY_KEY.get(key);
}

/** Slots for one school, grouped under their section, both in registry order. */
export function slotsBySection(school: SchoolSlug): { section: string; slots: SlotDef[] }[] {
  const groups: { section: string; slots: SlotDef[] }[] = [];
  for (const slot of PHOTO_SLOTS) {
    if (slot.school !== school) continue;
    const existing = groups.find((g) => g.section === slot.section);
    if (existing) existing.slots.push(slot);
    else groups.push({ section: slot.section, slots: [slot] });
  }
  return groups;
}

/**
 * The photograph to render: the staff upload, else what the page shipped
 * with, else nothing. Returns null rather than throwing on an unknown key so
 * a stale key can never blank a page at runtime — the registry test is what
 * catches that, at build time.
 */
export function slotPhoto(
  photos: SlotPhotoMap,
  key: string,
): { src: string; alt: string } | null {
  const uploaded = photos[key];
  if (uploaded) return { src: uploaded.image_url, alt: uploaded.alt_text };
  const def = BY_KEY.get(key);
  if (def?.fallback) return { src: def.fallback, alt: def.label };
  return null;
}
```

- [ ] **Step 4: Confirm every asset specifier resolves**

The import list above was transcribed from three files. Verify none was mistyped:

Run: `ls src/assets/ | sort`
Expected: every path imported above appears. If a name differs, correct the import — do not invent an asset.

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS, 9 tests.

- [ ] **Step 6: Verify the build**

Run: `npm run build`
Expected: clean.

- [ ] **Step 7: Commit**

```bash
git add src/lib/photo-slots.ts src/lib/photo-slots.test.ts
git commit -m "Declare the 39 photo positions the school pages actually have

A position is a layout fact and belongs in code; the photograph in it is
content and belongs in the database. Thirteen slots ship with no
fallback on purpose — the facility tiles that showed the wrong building
and the sport positions that never had a photo at all.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_0113254pwxhtgexCtUpEWkyV"
```

---

### Task 3: Browser image compression

**Files:**
- Create: `src/lib/image-compress.ts`
- Create: `src/lib/image-compress.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `const MAX_EDGE = 1600`, `const MAX_UPLOAD_BYTES = 400 * 1024`
  - `function fitWithin(w: number, h: number, maxEdge: number): { width: number; height: number }`
  - `function formatBytes(n: number): string`
  - `type CompressResult = { blob: Blob; width: number; height: number; originalBytes: number; bytes: number; ext: "webp" | "png" }`
  - `async function compressImage(file: File): Promise<CompressResult>` — throws `Error` with a staff-readable message on an unreadable file or an over-budget result.

- [ ] **Step 1: Write the failing test**

Create `src/lib/image-compress.test.ts`. Only the pure geometry and formatting are tested; canvas encoding is verified by hand in Task 5.

```ts
import { describe, it, expect } from "vitest";
import { fitWithin, formatBytes, MAX_EDGE } from "./image-compress";

describe("fitWithin", () => {
  it("leaves an image smaller than the cap alone", () => {
    expect(fitWithin(800, 600, 1600)).toEqual({ width: 800, height: 600 });
  });

  it("scales a landscape photo by its width", () => {
    expect(fitWithin(4000, 3000, 1600)).toEqual({ width: 1600, height: 1200 });
  });

  it("scales a portrait photo by its height", () => {
    expect(fitWithin(3000, 4000, 1600)).toEqual({ width: 1200, height: 1600 });
  });

  it("never returns a zero dimension for an extreme panorama", () => {
    const got = fitWithin(8000, 30, 1600);
    expect(got.width).toBe(1600);
    expect(got.height).toBeGreaterThanOrEqual(1);
  });

  it("caps the long edge at 1600 by default", () => {
    expect(MAX_EDGE).toBe(1600);
  });
});

describe("formatBytes", () => {
  it("reports KB under a megabyte", () => {
    expect(formatBytes(148 * 1024)).toBe("148 KB");
  });

  it("reports MB with one decimal above it", () => {
    expect(formatBytes(4.2 * 1024 * 1024)).toBe("4.2 MB");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test`
Expected: FAIL — cannot resolve `./image-compress`.

- [ ] **Step 3: Write the implementation**

Create `src/lib/image-compress.ts`:

```ts
/**
 * Shrink a staff upload before it reaches Supabase.
 *
 * The pages this feeds must hold 60fps on a mid-range Android over mobile
 * data (PRODUCT.md). The photographs they shipped with are build-optimised
 * WebP; an unprocessed 4MB phone JPEG in the same slot would undo that. So
 * every upload is downscaled and re-encoded here, in the browser, before it
 * is stored — no Supabase image-transformation add-on required.
 */

export const MAX_EDGE = 1600;
export const MAX_UPLOAD_BYTES = 400 * 1024;
const QUALITY = 0.82;

export type CompressResult = {
  blob: Blob;
  width: number;
  height: number;
  originalBytes: number;
  bytes: number;
  ext: "webp" | "png";
};

/** Box-fit preserving aspect. Never returns a dimension below 1px. */
export function fitWithin(w: number, h: number, maxEdge: number) {
  const longest = Math.max(w, h);
  if (longest <= maxEdge) return { width: w, height: h };
  const scale = maxEdge / longest;
  return {
    width: Math.max(1, Math.round(w * scale)),
    height: Math.max(1, Math.round(h * scale)),
  };
}

export function formatBytes(n: number): string {
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("That file could not be read as an image."));
    };
    img.src = url;
  });
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("The image could not be re-encoded."))),
      type,
      quality,
    );
  });
}

/**
 * PNG is preserved for images that carry transparency, because re-encoding
 * one to WebP with a flattened background would put a white box on the page.
 */
function hasTransparency(ctx: CanvasRenderingContext2D, w: number, h: number): boolean {
  const { data } = ctx.getImageData(0, 0, w, h);
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 250) return true;
  }
  return false;
}

export async function compressImage(file: File): Promise<CompressResult> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Choose an image file — JPG, PNG or WebP.");
  }

  const img = await loadImage(file);
  const { width, height } = fitWithin(img.naturalWidth, img.naturalHeight, MAX_EDGE);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("This browser could not process the image.");
  ctx.drawImage(img, 0, 0, width, height);

  const transparent = file.type === "image/png" && hasTransparency(ctx, width, height);
  const ext = transparent ? "png" : "webp";
  const blob = await toBlob(canvas, transparent ? "image/png" : "image/webp", QUALITY);

  if (blob.size > MAX_UPLOAD_BYTES) {
    throw new Error(
      `This photo is still ${formatBytes(blob.size)} after compression, over the ` +
        `${formatBytes(MAX_UPLOAD_BYTES)} limit. Very detailed or very large images can do ` +
        `this. Try a photo with less fine detail, or crop it tighter before uploading.`,
    );
  }

  return {
    blob,
    width,
    height,
    originalBytes: file.size,
    bytes: blob.size,
    ext,
  };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS, 16 tests (9 from Task 2, 7 here).

- [ ] **Step 5: Verify the build**

Run: `npm run build`
Expected: clean.

- [ ] **Step 6: Commit**

```bash
git add src/lib/image-compress.ts src/lib/image-compress.test.ts
git commit -m "Shrink staff uploads in the browser before they reach storage

These pages have to hold 60fps on a mid-range Android over mobile data.
Every photo they ship with is build-optimised WebP, so putting a raw 4MB
phone JPEG in the same slot would quietly undo that. Downscales to
1600px and re-encodes, keeping PNG when the image has transparency.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_0113254pwxhtgexCtUpEWkyV"
```

---

### Task 4: Read path — `photos` on the school bundle

**Files:**
- Modify: `src/lib/alpha-content.functions.ts:236-283` (the `SchoolBundle` type and `getSchoolBundle`)

**Interfaces:**
- Consumes: the `photo_slots` table from Task 1.
- Produces: `type SchoolPhotoMap` re-exported shape, and `SchoolBundle.photos: SchoolPhotoMap`, keyed by `slot_key`. Tasks 6–8 read it.

- [ ] **Step 1: Add the type to the bundle**

In `src/lib/alpha-content.functions.ts`, beside the other `School*Item` types above `SchoolBundle`:

```ts
/** Keyed by photo_slots.slot_key — see src/lib/photo-slots.ts. */
export type SchoolPhotoMap = Record<
  string,
  { image_url: string; alt_text: string; credit: string | null }
>;
```

Add the field to `SchoolBundle`:

```ts
  facilities: SchoolFacilityItem[];
  photos: SchoolPhotoMap;
```

- [ ] **Step 2: Add it to the empty fallback**

In `getSchoolBundle`, extend the `empty` constant so a Supabase outage still renders the pages from their bundled fallbacks:

```ts
    const empty: SchoolBundle = { school: null, news: [], events: [], gallery: [], staff: [], facilities: [], photos: {} };
```

- [ ] **Step 3: Add the query**

Add a seventh promise to the existing `Promise.all` destructure and array:

```ts
      const [schoolRes, newsRes, eventsRes, galleryRes, staffRes, facilitiesRes, photosRes] = await Promise.all([
```

and, as the last entry in the array:

```ts
        sb.from("photo_slots").select("slot_key,image_url,alt_text,credit")
          .eq("school_slug", data.slug),
```

- [ ] **Step 4: Build the map in the return**

Immediately before the `return`, add:

```ts
      const photos: SchoolPhotoMap = {};
      for (const row of photosRes.data ?? []) {
        photos[row.slot_key] = {
          image_url: row.image_url,
          alt_text: row.alt_text,
          credit: row.credit,
        };
      }
```

and add `photos,` to the returned object after `facilities`.

- [ ] **Step 5: Verify the build**

Run: `npm run build`
Expected: clean. TypeScript will flag nothing yet — Tasks 6–8 are the consumers.

- [ ] **Step 6: Verify the query against real data**

Run `npm run dev`, open `/schools/alpha-high`, and confirm in the Network tab that the bundle response now carries a `photos` key (an empty object is the correct result — no rows exist yet).

Expected: `"photos":{}` present, page renders unchanged.

- [ ] **Step 7: Commit**

```bash
git add src/lib/alpha-content.functions.ts
git commit -m "Carry the school's uploaded photos on the page bundle

Keyed by slot so a page position is a property lookup rather than a
scan. An outage yields an empty map, which is the fallback path: the
pages render exactly what they ship with.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_0113254pwxhtgexCtUpEWkyV"
```

---

### Task 5: The `/admin/photos` screen

> **REQUIRED SUB-SKILL for this task:** invoke the `impeccable` skill before writing the UI. This is the one genuinely new interface in the plan and it is what the school will live in.

**Files:**
- Create: `src/components/admin/photo-slot-card.tsx`
- Create: `src/routes/admin.photos.tsx`
- Modify: `src/routes/admin.tsx:63` (nav)
- Modify: `src/routes/admin.index.tsx:29` (dashboard card)

**Interfaces:**
- Consumes: `slotsBySection`, `SlotDef`, `SlotPhotoMap` (Task 2); `compressImage`, `formatBytes`, `MAX_UPLOAD_BYTES` (Task 3); `useAdminAuth` from `src/lib/admin-auth.tsx`.
- Produces: the `/admin/photos` route. No exports other tasks consume.

**Behaviour this screen must have:**

1. A school picker across `nursery-primary`, `alpha-high`, `alpha-girls` — reuse the labels from `SCHOOL_OPTIONS` in `src/lib/admin-crud.tsx`, minus `group-wide`, which owns no slots.
2. Slots grouped under their `section` heading, as a responsive grid: one column at 375px, two at `sm`, three at `lg`.
3. Each card shows the photograph now on the page, the slot label, the target aspect, its `guidance` if any, and a badge reading **Uploaded** or **Built-in default** or **No photo yet**.
4. **Replace** opens the file picker. On selection: compress, then show the result — "4.2 MB → 148 KB" via `formatBytes` — a preview, and a required **alt text** field, before an explicit Save. Save is disabled while alt text is empty.
5. **Revert to default** appears only on an uploaded slot, behind a `confirm()`, and `DELETE`s the row.
6. Errors render per-card, not as an `alert()`. A failed upload leaves the previous photograph in place.
7. Alt-text help, verbatim: *"Describe what the photo shows, for parents using a screen reader. 'Form 3 students in the chemistry lab', not 'photo' or 'IMG_2024'."*

- [ ] **Step 1: Write the card component**

Create `src/components/admin/photo-slot-card.tsx`:

```tsx
import { useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { SlotDef, SlotPhotoMap } from "@/lib/photo-slots";
import { compressImage, formatBytes } from "@/lib/image-compress";

type Staged = { url: string; blob: Blob; ext: string; from: number; to: number };

export function PhotoSlotCard({
  slot,
  photos,
  client,
  onSaved,
}: {
  slot: SlotDef;
  photos: SlotPhotoMap;
  client: SupabaseClient;
  onSaved: () => Promise<void> | void;
}) {
  const uploaded = photos[slot.key];
  const current = uploaded?.image_url ?? slot.fallback ?? null;

  const [staged, setStaged] = useState<Staged | null>(null);
  const [alt, setAlt] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const status = uploaded ? "Uploaded" : slot.fallback ? "Built-in default" : "No photo yet";

  async function onPick(file: File) {
    setError(null);
    try {
      const r = await compressImage(file);
      setStaged({
        url: URL.createObjectURL(r.blob),
        blob: r.blob,
        ext: r.ext,
        from: r.originalBytes,
        to: r.bytes,
      });
      setAlt(uploaded?.alt_text ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "That image could not be prepared.");
    }
  }

  async function onSave() {
    if (!staged || !alt.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const path = `photo-slots/${slot.key}-${Date.now()}.${staged.ext}`;
      const up = await client.storage
        .from("media")
        .upload(path, staged.blob, { upsert: false, contentType: staged.blob.type });
      if (up.error) throw up.error;

      const { data } = client.storage.from("media").getPublicUrl(path);
      const { error: dbError } = await client.from("photo_slots").upsert(
        {
          slot_key: slot.key,
          school_slug: slot.school,
          image_url: data.publicUrl,
          alt_text: alt.trim(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "slot_key" },
      );
      if (dbError) throw dbError;

      URL.revokeObjectURL(staged.url);
      setStaged(null);
      await onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save this photo.");
    } finally {
      setBusy(false);
    }
  }

  async function onRevert() {
    if (!confirm(`Remove the uploaded photo for "${slot.label}"? The page goes back to its built-in picture.`)) return;
    setBusy(true);
    setError(null);
    try {
      const { error: dbError } = await client.from("photo_slots").delete().eq("slot_key", slot.key);
      if (dbError) throw dbError;
      await onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove this photo.");
    } finally {
      setBusy(false);
    }
  }

  function cancel() {
    if (staged) URL.revokeObjectURL(staged.url);
    setStaged(null);
    setError(null);
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-[var(--color-deep-blue)]/10 bg-white shadow-sm">
      <div
        className="relative w-full bg-[var(--color-deep-blue)]/5"
        style={{ aspectRatio: slot.aspect }}
      >
        {staged ? (
          <img src={staged.url} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : current ? (
          <img src={current} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="absolute inset-0 grid place-items-center px-4 text-center">
            <span className="text-xs font-semibold text-[var(--color-deep-blue)]/50">
              No photo yet
            </span>
          </div>
        )}
        <span className="absolute left-2 top-2 rounded bg-black/65 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
          {staged ? "Ready to save" : status}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div>
          <h3 className="text-sm font-bold text-[var(--color-deep-blue)]">{slot.label}</h3>
          <p className="mt-0.5 text-[11px] text-[var(--color-ink)]/55">Crops to {slot.aspect}</p>
          {slot.guidance ? (
            <p className="mt-1 text-xs leading-snug text-[var(--color-ink)]/70">{slot.guidance}</p>
          ) : null}
        </div>

        {staged ? (
          <div className="mt-1 space-y-2">
            <p className="text-xs font-semibold text-[var(--color-deep-blue)]">
              {formatBytes(staged.from)} → {formatBytes(staged.to)}
            </p>
            <label className="block text-[11px] font-semibold uppercase tracking-wide text-[var(--color-deep-blue)]/80">
              Alt text <span className="text-red-600">*</span>
            </label>
            <textarea
              rows={2}
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              className="w-full rounded-lg border border-[var(--color-deep-blue)]/20 px-2.5 py-1.5 text-sm outline-none focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold)]/30"
            />
            <p className="text-[11px] leading-snug text-[var(--color-ink)]/60">
              Describe what the photo shows, for parents using a screen reader. "Form 3 students in
              the chemistry lab", not "photo" or "IMG_2024".
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => void onSave()}
                disabled={busy || !alt.trim()}
                className="rounded-md bg-[var(--color-gold)] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
              >
                {busy ? "Saving…" : "Save photo"}
              </button>
              <button
                type="button"
                onClick={cancel}
                disabled={busy}
                className="rounded-md px-3 py-1.5 text-xs text-[var(--color-ink)] hover:bg-black/5"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-auto flex flex-wrap gap-2 pt-2">
            <label className="cursor-pointer rounded-md border border-dashed border-[var(--color-deep-blue)]/30 px-3 py-1.5 text-xs font-semibold text-[var(--color-deep-blue)] hover:bg-[var(--color-deep-blue)]/5">
              {current ? "Replace" : "Add photo"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  e.target.value = "";
                  if (f) void onPick(f);
                }}
              />
            </label>
            {uploaded ? (
              <button
                type="button"
                onClick={() => void onRevert()}
                disabled={busy}
                className="rounded-md border border-[var(--color-deep-blue)]/20 px-3 py-1.5 text-xs font-semibold text-[var(--color-ink)]/70 hover:bg-black/5 disabled:opacity-50"
              >
                Revert to default
              </button>
            ) : null}
          </div>
        )}

        {error ? (
          <p role="alert" className="mt-1 rounded border border-red-200 bg-red-50 px-2 py-1.5 text-xs text-red-700">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write the route**

Create `src/routes/admin.photos.tsx`:

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { useAdminAuth } from "@/lib/admin-auth";
import { slotsBySection, type SlotPhotoMap } from "@/lib/photo-slots";
import { PhotoSlotCard } from "@/components/admin/photo-slot-card";
import type { SchoolSlug } from "@/integrations/alpha-supabase/types";

export const Route = createFileRoute("/admin/photos")({
  head: () => ({ meta: [{ title: "School Photos · Alpha Admin" }] }),
  component: AdminPhotos,
});

const SCHOOLS: { value: SchoolSlug; label: string }[] = [
  { value: "nursery-primary", label: "Nursery & Primary" },
  { value: "alpha-high", label: "Alpha High" },
  { value: "alpha-girls", label: "Alpha Girls" },
];

function AdminPhotos() {
  const { client, session } = useAdminAuth();
  const [school, setSchool] = useState<SchoolSlug>("nursery-primary");
  const [photos, setPhotos] = useState<SlotPhotoMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!client) return;
    setLoading(true);
    setError(null);
    const { data, error } = await client
      .from("photo_slots")
      .select("slot_key,image_url,alt_text,credit")
      .eq("school_slug", school);
    if (error) setError(error.message);
    const map: SlotPhotoMap = {};
    for (const r of data ?? []) {
      map[r.slot_key] = { image_url: r.image_url, alt_text: r.alt_text, credit: r.credit };
    }
    setPhotos(map);
    setLoading(false);
  }, [client, school]);

  useEffect(() => {
    if (client && session) void refresh();
  }, [client, session, refresh]);

  const groups = slotsBySection(school);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-[var(--color-deep-blue)]">School Photos</h1>
        <p className="mt-1 max-w-2xl text-sm text-[var(--color-ink)]/70">
          Every photograph on a school page, in the place it appears. Replace one and it is live on
          the site — no developer needed. Photos are shrunk automatically so the pages stay fast on
          a phone.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {SCHOOLS.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => setSchool(s.value)}
            className={
              school === s.value
                ? "rounded-md bg-[var(--color-deep-blue)] px-4 py-2 text-sm font-semibold text-white"
                : "rounded-md border border-[var(--color-deep-blue)]/20 px-4 py-2 text-sm font-semibold text-[var(--color-deep-blue)] hover:bg-[var(--color-deep-blue)]/5"
            }
          >
            {s.label}
          </button>
        ))}
      </div>

      {error ? (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <p className="text-sm text-[var(--color-deep-blue)]">Loading photos…</p>
      ) : (
        groups.map((g) => (
          <section key={g.section} className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-deep-blue)]/70">
              {g.section}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {g.slots.map((slot) => (
                <PhotoSlotCard
                  key={slot.key}
                  slot={slot}
                  photos={photos}
                  client={client!}
                  onSaved={refresh}
                />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
```

- [ ] **Step 3: Swap the nav link**

In `src/routes/admin.tsx`, replace the Activities nav entry:

```tsx
            <AdminNavLink to="/admin/gallery">Activities</AdminNavLink>
```

with:

```tsx
            <AdminNavLink to="/admin/photos">School photos</AdminNavLink>
```

- [ ] **Step 4: Swap the dashboard card**

In `src/routes/admin.index.tsx`, replace:

```tsx
        <DashCard title="Activities Gallery" href="/admin/gallery" hint="School-life photos" />
```

with:

```tsx
        <DashCard title="School Photos" href="/admin/photos" hint="Photos on the school pages" />
```

- [ ] **Step 5: Verify the build**

Run: `npm run build`
Expected: clean, and the generated `src/routeTree.gen.ts` now includes `/admin/photos`.

- [ ] **Step 6: Verify end to end against real Supabase**

Run `npm run dev` and sign in at `/admin/login`, then at `/admin/photos`:

1. All three school tabs render their sections — Nursery & Primary 15 cards, Alpha High 19, Alpha Girls 5.
2. Upload a large photo (>2MB) to `alpha-high.facilities.library`. Confirm the before/after sizes appear and Save is disabled until alt text is typed.
3. Save, then load `/schools/alpha-high` and confirm the Library tile shows the new photo with the alt text (inspect the `<img>`).
4. Back on `/admin/photos`, **Revert to default** on that slot; confirm the card returns to "No photo yet" and the page tile returns to the labelled panel.
5. Check the whole screen at 375px — one column, no horizontal scroll, every button at least 44px tall.

- [ ] **Step 7: Commit**

```bash
git add src/components/admin/photo-slot-card.tsx src/routes/admin.photos.tsx src/routes/admin.tsx src/routes/admin.index.tsx src/routeTree.gen.ts
git commit -m "Give staff a screen that shows the photos as the page shows them

A table of rows with a URL field is the wrong shape for 'swap the
picture in this position'. This is the positions themselves, grouped by
where they sit on the page, each showing what is live right now.

Alt text is required on save: these photographs are how a parent reads
the school, including the parents using a screen reader.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_0113254pwxhtgexCtUpEWkyV"
```

---

### Task 6: Wire Nursery & Primary (15 slots)

Start here: all 15 slots have fallbacks, so this task is a pure refactor whose correct outcome is **no visible change**. It proves the resolution path before Tasks 7 and 8 change what the site looks like.

**Files:**
- Modify: `src/routes/schools.nursery-primary.tsx`

**Interfaces:**
- Consumes: `slotPhoto` (Task 2), `bundle.photos` (Task 4).
- Produces: nothing.

- [ ] **Step 1: Import the helper**

Add to the imports in `src/routes/schools.nursery-primary.tsx`:

```ts
import { slotPhoto } from "@/lib/photo-slots";
```

- [ ] **Step 2: Thread `photos` to the three consuming sections**

The cluster at `:267–291`, the circular portrait at `:479`, and the gallery grid at `:865–876` live in different components. Pass `photos={bundle.photos}` from the page component into each, typed `photos: SchoolBundle["photos"]`. Follow the existing prop-passing style in the file — the page already passes `bundle` sections down this way.

- [ ] **Step 3: Replace the three cluster images**

At `:267`, `:279` and `:291`, replace each `src`/`alt` pair. The pattern, for the first:

```tsx
              <img
                src={slotPhoto(photos, "nursery-primary.days.hippo-ride")!.src}
                alt={slotPhoto(photos, "nursery-primary.days.hippo-ride")!.alt}
```

Read it once into a local instead of calling twice — above the `return` of that component:

```tsx
  const hippo = slotPhoto(photos, "nursery-primary.days.hippo-ride")!;
  const portrait = slotPhoto(photos, "nursery-primary.days.girl-portrait")!;
  const teacher = slotPhoto(photos, "nursery-primary.days.teacher")!;
```

then `src={hippo.src} alt={hippo.alt}`, and likewise for the other two. The non-null assertion is correct here and only here: these three slots have fallbacks, guaranteed by the Task 2 test.

**Keep the existing alt text as the fallback's alt.** The registry supplies `slot.label` as alt for a fallback, which is weaker than the hand-written alt already in the page (e.g. "Pupil on a play hippo in the courtyard"). So instead of the default, pass the page's existing string when no upload exists:

```tsx
  const hippo = slotPhoto(photos, "nursery-primary.days.hippo-ride")!;
  const hippoAlt = photos["nursery-primary.days.hippo-ride"]?.alt_text
    ?? "Pupil on a play hippo in the courtyard";
```

Use `src={hippo.src} alt={hippoAlt}`. Apply the same treatment everywhere in this task — the hand-written alt text on this page is good and must not be downgraded.

- [ ] **Step 4: Replace the circular portrait**

At `:479`, same pattern, key `nursery-primary.primary.pupil-portrait`, existing alt `"Alpha pupil"`.

- [ ] **Step 5: Replace the 11 gallery tiles**

`GalleryTile` at `:904` takes `src` and uses `caption` as its alt. Give it an explicit alt so an upload's alt text is used:

```tsx
function GalleryTile({ src, alt, caption, className = "" }: { src: string; alt: string; caption: string; className?: string }) {
```

and inside, `alt={alt}`. Then each of the 11 call sites at `:865–876` becomes, for the first:

```tsx
          <GalleryTile
            src={slotPhoto(photos, "nursery-primary.gallery.play-discovery")!.src}
            alt={photos["nursery-primary.gallery.play-discovery"]?.alt_text ?? "Play & discovery"}
            caption="Play & discovery"
            className="md:col-span-1 md:row-span-2 h-72 md:h-full"
          />
```

Keep every `className` and `caption` exactly as it is. The keys, in the grid's existing order: `play-discovery`, `shapes`, `toy-car`, `playground`, `speakers-team`, `speakers-challenge`, `one-to-one`, `telescope`, `sports-teamwork`, `musical-chairs`, `dance`.

- [ ] **Step 6: Remove the now-unused asset imports**

The 14 `@/assets/np-*` and `girlCutout` imports at `:16–28` are now referenced only by the registry. Delete the ones no longer used in this file. `npm run build` will fail on any you miss or delete wrongly.

- [ ] **Step 7: Verify nothing changed**

Run: `npm run build`
Expected: clean, no unused-import errors.

Run `npm run dev` and compare `/schools/nursery-primary` against `git stash`-ed original at 375px and 1440px.
Expected: **pixel-identical.** `photo_slots` has no rows for this school, so every slot resolves to its fallback. Any visible difference is a bug in this task.

- [ ] **Step 8: Commit**

```bash
git add src/routes/schools.nursery-primary.tsx
git commit -m "Let the nursery page's fifteen photographs be replaced from admin

A pure swap of build-time imports for slot lookups: with no uploads the
page is pixel-identical, which is how this task is checked. Hand-written
alt text is kept as each fallback's description rather than dropping to
the slot label.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_0113254pwxhtgexCtUpEWkyV"
```

---

### Task 7: Wire Alpha Girls (5 slots) and build the shared facility tile

**Files:**
- Create: `src/components/school/facility-tile.tsx`
- Modify: `src/routes/schools.alpha-girls.tsx`

**Interfaces:**
- Consumes: `slotPhoto`, `slotDef` (Task 2); `bundle.photos` (Task 4).
- Produces: `<FacilityTile slotKey={string} label={string} photos={SlotPhotoMap} accent={string} delay={number} />` — used again in Task 8.

- [ ] **Step 1: Write the shared tile**

Both secondary pages render an identical 4/5 facility tile. Create `src/components/school/facility-tile.tsx`:

```tsx
/**
 * A facility tile that is honest when it has no photograph.
 *
 * Both secondary pages shipped four stand-ins that showed the wrong
 * building — the nursery campus captioned "Library", an aviation photo
 * captioned "Boarding". PRODUCT.md: no invented content, ever. So these
 * slots carry no fallback, and until staff upload the real thing the tile
 * renders as a labelled panel: visibly awaiting a photograph rather than
 * confidently showing the wrong one.
 */
import { Reveal } from "@/components/reveal";
import { slotPhoto, type SlotPhotoMap } from "@/lib/photo-slots";

export function FacilityTile({
  slotKey,
  label,
  photos,
  accent,
  delay = 0,
}: {
  slotKey: string;
  label: string;
  photos: SlotPhotoMap;
  accent: string;
  delay?: number;
}) {
  const photo = slotPhoto(photos, slotKey);
  const alt = photos[slotKey]?.alt_text ?? label;

  return (
    <Reveal direction="up" delay={delay}>
      <div className="group relative aspect-[4/5] overflow-hidden rounded-2xl shadow-sm ring-1 ring-black/5 transition hover:-translate-y-1 active:translate-y-0 hover:shadow-xl">
        {photo ? (
          <>
            <img
              src={photo.src}
              alt={alt}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
          </>
        ) : (
          <div
            aria-hidden
            className="absolute inset-0"
            style={{ background: `linear-gradient(160deg, ${accent}, color-mix(in srgb, ${accent} 70%, black))` }}
          />
        )}
        <div className="absolute inset-x-0 bottom-0 p-5">
          <span
            className="text-[10px] font-bold uppercase tracking-[0.2em]"
            style={{ color: "var(--color-gold)" }}
          >
            Facility
          </span>
          <h3 className="mt-1 font-display text-lg font-bold text-white">{label}</h3>
          {!photo ? (
            <p className="mt-1 text-[11px] text-white/70">Photograph coming soon</p>
          ) : null}
        </div>
      </div>
    </Reveal>
  );
}
```

- [ ] **Step 2: Use it on Alpha Girls**

In `src/routes/schools.alpha-girls.tsx`, replace the `FACILITIES` constant at `:742` with keys and labels:

```tsx
const FACILITIES = [
  { key: "alpha-girls.facilities.science-labs", label: "Science labs" },
  { key: "alpha-girls.facilities.library", label: "Library" },
  { key: "alpha-girls.facilities.sports-field", label: "Sports field" },
  { key: "alpha-girls.facilities.boarding", label: "Boarding" },
];
```

and replace the whole `FACILITIES.map(...)` block at `:828–851` with:

```tsx
          {FACILITIES.map((f, i) => (
            <FacilityTile
              key={f.key}
              slotKey={f.key}
              label={f.label}
              photos={photos}
              accent={ACCENT}
              delay={i * 70}
            />
          ))}
```

Import `FacilityTile`, and thread `photos` into `LifeAtKunduchi` the way the file already passes bundle data down.

- [ ] **Step 3: Wire the campus plate**

At `:799`, replace `src={campusGirls}` with the slot lookup, keeping the existing hand-written alt as the fallback description and **keeping the source comment above it** — it explains why the alt text says what it says:

```tsx
            <img
              src={slotPhoto(photos, "alpha-girls.students.campus-plate")!.src}
              alt={
                photos["alpha-girls.students.campus-plate"]?.alt_text
                ?? "Alpha Girls students celebrating with medals and certificates"
              }
```

- [ ] **Step 4: Remove unused asset imports**

`campusHigh`, `campusNursery` and `aviation` were used only by the old `FACILITIES` array. Remove any import this file no longer references; the build will tell you.

- [ ] **Step 5: Verify**

Run: `npm run build`
Expected: clean.

Run `npm run dev`, open `/schools/alpha-girls` at 375px and 1440px.
Expected: the campus plate is unchanged. The four facility tiles are now teal-gradient panels reading "Science labs / Library / Sports field / Boarding" with "Photograph coming soon" — **this change is intended**, per spec Decision 2. Confirm the gold eyebrow keeps its contrast on the gradient and the tiles still hover-lift.

- [ ] **Step 6: Commit**

```bash
git add src/components/school/facility-tile.tsx src/routes/schools.alpha-girls.tsx
git commit -m "Stop Alpha Girls captioning the wrong building as its library

The four facility tiles showed stand-ins: a nursery-campus photo labelled
Library, an aviation photo labelled Boarding. Both were live on a page
parents use to compare schools, which is exactly what PRODUCT.md's no
invented content rule exists to prevent.

They now render as labelled panels until staff upload the real rooms. A
labelled blank is better than a confident lie.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_0113254pwxhtgexCtUpEWkyV"
```

---

### Task 8: Wire Alpha High (19 slots) and the two-state sport block

**Files:**
- Modify: `src/routes/schools.alpha-high.tsx`

**Interfaces:**
- Consumes: `slotPhoto`, `slotsBySection` (Task 2); `FacilityTile` (Task 7); `bundle.photos` (Task 4).
- Produces: nothing.

- [ ] **Step 1: Wire the ten club photos**

Replace the `CLUBS` constant at `:659` with keys:

```tsx
const CLUBS = [
  { name: "Aviation", key: "alpha-high.clubs.aviation" },
  { name: "Drama", key: "alpha-high.clubs.drama" },
  { name: "Music & Dance", key: "alpha-high.clubs.music" },
  { name: "Debate", key: "alpha-high.clubs.debate" },
  { name: "Art & Drawing", key: "alpha-high.clubs.art" },
  { name: "Cookery", key: "alpha-high.clubs.cookery" },
  { name: "Scout", key: "alpha-high.clubs.scout" },
  { name: "Public Speaking", key: "alpha-high.clubs.speaking" },
  { name: "Model UN", key: "alpha-high.clubs.model-un" },
  { name: "Environment", key: "alpha-high.clubs.environment" },
];
```

`ClubsRibbon` at `:673` takes `photos` as a prop. Inside the `loop.map`, replace `src={c.photo}`:

```tsx
              <img
                src={slotPhoto(photos, c.key)!.src}
                alt={photos[c.key]?.alt_text ?? `${c.name} club at Alpha High`}
```

All ten have fallbacks, so the assertion is safe.

- [ ] **Step 2: Replace the facility tiles**

Same as Task 7 Step 2, with `alpha-high.facilities.*` keys and the labels already in the file. Replace the `FACILITIES.map(...)` block at `:840–862` with `FacilityTile` calls, passing `accent={ACCENT}`.

- [ ] **Step 3: Build the two-state sport block**

`SPORTS` at `:670` is a five-item string array rendered as pills. Replace the constant:

```tsx
const SPORTS = [
  { name: "Football", key: "alpha-high.sport.football" },
  { name: "Basketball", key: "alpha-high.sport.basketball" },
  { name: "Volleyball", key: "alpha-high.sport.volleyball" },
  { name: "Netball", key: "alpha-high.sport.netball" },
  { name: "Athletics", key: "alpha-high.sport.athletics" },
];
```

Replace the `<ul>` of pills inside the Sports card with a block that switches on whether **any** sport photo exists, so the section never mixes photo tiles with pills:

```tsx
              {SPORTS.some((s) => photos[s.key]) ? (
                <ul className="mt-4 grid grid-cols-2 gap-3">
                  {SPORTS.map((s) => {
                    const photo = slotPhoto(photos, s.key);
                    return (
                      <li
                        key={s.key}
                        className="relative aspect-[4/5] overflow-hidden rounded-lg ring-1 ring-black/5"
                      >
                        {photo ? (
                          <>
                            <img
                              src={photo.src}
                              alt={photos[s.key]?.alt_text ?? `${s.name} at Alpha High`}
                              loading="lazy"
                              decoding="async"
                              className="absolute inset-0 h-full w-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                          </>
                        ) : (
                          <div aria-hidden className="absolute inset-0" style={{ background: ACCENT }} />
                        )}
                        <span className="absolute inset-x-0 bottom-0 p-2 text-xs font-semibold text-white">
                          {s.name}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <ul className="mt-4 space-y-2">
                  {SPORTS.map((s) => (
                    <li
                      key={s.key}
                      className="flex items-center gap-3 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold ring-1 ring-black/5"
                      style={{ color: ACCENT }}
                    >
                      <span aria-hidden className="h-2 w-2 rounded-full" style={{ background: GOLD }} />
                      {s.name}
                    </li>
                  ))}
                </ul>
              )}
```

The second branch is the current design, unchanged — that is the point. With no uploads the section looks exactly as it does today.

- [ ] **Step 4: Thread `photos` and remove unused imports**

Pass `photos={bundle.photos}` into `BeyondClassroom`, `ClubsRibbon` and `LifeAtMikocheni`. Remove the ten `club*` imports plus `campusHigh`, `campusGirls`, `campusNursery` and `aviation` if this file no longer references them. Note `campusAerial`, `graduate` and `clubAviation` are still used by the `HeroSlideshow` fallback at `:157–159` — **leave those imports in place.**

- [ ] **Step 5: Verify**

Run: `npm run build`
Expected: clean.

Run: `npm test`
Expected: PASS, 16 tests.

Run `npm run dev`, open `/schools/alpha-high` at 375px and 1440px:
- The club marquee is unchanged and still pauses on hover and under `prefers-reduced-motion`.
- The four facility tiles are navy panels with "Photograph coming soon" — intended.
- The sport list is unchanged pills.
- Then upload one sport photo via `/admin/photos` and reload: the block flips to a five-tile grid, four of them accent panels. Confirm it looks deliberate at 375px.

- [ ] **Step 6: Commit**

```bash
git add src/routes/schools.alpha-high.tsx
git commit -m "Put Alpha High's clubs, sport and facilities under school control

Nineteen positions: ten club photos that keep their built-in pictures,
four facility tiles that lose the wrong ones, and five sport positions
that never had a photograph at all.

Sport has two states rather than a half-filled grid — today's pill list
until a photo exists, a tile grid once one does — so the section looks
deliberate either way.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_0113254pwxhtgexCtUpEWkyV"
```

---

### Task 9: Full verification pass

**Files:** none modified unless a defect is found.

- [ ] **Step 1: Full check**

```bash
npm run lint && npm test && npm run build
```
Expected: all three clean. Fix anything that is not, in its own commit.

- [ ] **Step 2: Confirm the fallback path is the current site**

With `photo_slots` empty for a school, every page must equal the pre-change site except the eight facility tiles and the sport block. Verify all three pages at 375px.

- [ ] **Step 3: Confirm the write path end to end, per school**

For each of the three schools, upload one photo, confirm it appears on the public page with its alt text, then revert it and confirm the page returns to its fallback.

- [ ] **Step 4: Confirm the guard rails**

- Saving with empty alt text is impossible (button disabled).
- A photo that cannot be compressed under 400KB is rejected with the explanatory message, and the slot keeps its previous photograph.
- Signed out, `/admin/photos` redirects to `/admin/login`.
- An anonymous visitor can read `photo_slots` but not write: in the browser console on a public page, an insert through the anon client must fail on RLS.

- [ ] **Step 5: Confirm the performance budget**

DevTools, Fast 3G, CPU 4× throttle, `/schools/alpha-high` with at least one uploaded photo. Confirm no uploaded image exceeds 400KB on the wire and scrolling holds ~60fps.

- [ ] **Step 6: Report**

Report to the user: tasks completed, the two intended visual changes, `npm run lint && npm test && npm run build` output, and anything found and fixed. Do not claim completion without pasting that command's actual output.

---

## Self-Review

**Spec coverage:**

| Spec section | Task |
|---|---|
| Data model, RLS, `PhotoSlotRow` | 1 |
| Slot registry, all 39 slots, `slotPhoto` | 2 |
| Image pipeline, 400KB ceiling, PNG transparency | 3 |
| Read path, `photos` on the bundle, outage fallback | 4 |
| Admin surface, alt text required, revert, nav swap | 5 |
| Page wiring | 6, 7, 8 |
| Decision 1 — sport two-state | 8 |
| Decision 2 — facility tiles lose stand-ins | 7, 8 (component in 7) |
| Decision 3 — `/admin/gallery` dormant | 5 (nav only; route and table untouched) |
| Decision 4 — no Alpha Girls clubs | n/a by design |
| Error handling | 3 (compress), 5 (upload/delete), 4 (outage) |
| Testing | 9, plus per-task verification |

No gaps.

**Type consistency:** `SlotPhotoMap` is defined once in Task 2 and consumed unchanged in 4, 5, 7, 8. `slotPhoto(photos, key)` takes the map, never the bundle — consistent everywhere. `FacilityTile`'s props are declared in Task 7 and used identically in Task 8. `CompressResult.ext` is `"webp" | "png"` in Task 3 and used as `staged.ext` in Task 5.

**Known deviation from spec:** the spec sketches `slotPhoto(bundle: Pick<SchoolBundle, "photos">, key)`. The plan passes the map directly, to keep `photo-slots.ts` free of any import from `alpha-content.functions.ts` and so keep 25 asset imports out of the server bundle. Recorded in Task 2.
