## Goal

Add a dedicated **Facilities Gallery** so admins can upload multiple up-to-date photos for a specific facility at a specific school. Keep the existing `/admin/gallery` for activities and rename its label to "Activities Gallery" to remove ambiguity.

## Schema (new migration)

New table `facility_photos`:

```text
id            uuid PK default gen_random_uuid()
school_slug   text  not null  (FK schools.slug)
facility_id   uuid  not null  (FK facilities.id on delete cascade)
image_url     text  not null
caption       text  nullable
sort_order    int   default 0
published     bool  default true
created_at    timestamptz default now()
```

- Grants: `SELECT, INSERT, UPDATE, DELETE` to `authenticated`; `SELECT` to `anon`; `ALL` to `service_role`.
- RLS: public `SELECT` where `published = true`; authenticated full manage (mirrors `gallery`/`facilities`).
- Index on `(facility_id, sort_order)` and `(school_slug, published)`.
- Update `alpha_schema.sql` to match.

Both `school_slug` and `facility_id` are required — every photo is tied to one facility at one school.

## Data layer (`src/lib/alpha-content.functions.ts`)

- `getFacilityPhotosByFacility({ facilityId })` — published photos for a facility, ordered by `sort_order asc, created_at desc`.
- `getFacilityPhotosBySchool({ slug })` — published photos for a school joined with facility name (used by `/facilities`).
- Both use the existing publishable server client.

## Admin portal

- Rename `/admin/gallery` heading + sidebar label to **"Activities Gallery"** (table stays `gallery`).
- New route `/admin/facility-photos` titled **"Facilities Gallery"** built on `AdminCrud`:
  - Fields: school (required), facility (required — select populated from `facilities` filtered by the chosen school), image (required), caption, sort order, published.
  - The school→facility dependency needs a small extension to the CRUD form: a `dependentSelect` field kind that re-loads options from a table when another field changes. Add this generically to `admin-crud.tsx` so future modules can reuse it.
  - List columns: photo, school, facility name, caption, order, published.
- Add sidebar entry in `src/routes/admin.tsx` and a dashboard card in `src/routes/admin.index.tsx`.

## Public site

- `SchoolFacilitiesSection` (`src/components/school/facilities-section.tsx`): under each facility card, render a thumbnail strip of its `facility_photos` (lazy-loaded, horizontal scroll on overflow). Cards with no extra photos render unchanged.
- `/facilities` page: add a "Latest facility photos" rail per school grouping `facility_photos` by facility name.
- `/gallery` (activities) unchanged.

## Out of scope

- The existing single `image_url` on `facilities` stays as the card cover.
- No bulk multi-file uploader in this pass (one photo per row, same UX as today). Easy to add later.

Ready to build on approval.
