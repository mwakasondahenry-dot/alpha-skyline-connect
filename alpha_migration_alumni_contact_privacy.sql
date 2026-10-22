-- Alpha Schools — alumni contact details stay internal
--
-- Run once in the Supabase SQL editor (Dashboard → SQL → New query), after
-- alpha_migration_alumni_submissions.sql.
--
-- Since 2026-10-22 the alumni story form collects the former student's email
-- and phone, for the alumni platform and digital network the school is
-- building. They are stored in testimonials.answers as {"email", "phone"} and
-- are an internal record: staff see them in the admin queue, the website
-- never prints them.
--
-- The site's own queries already select only the published columns. This
-- file closes the other door: the public (anon) API key, which is in every
-- visitor's browser, could read every column of a published row through the
-- "testimonials public read" policy, answers included. Column-level grants
-- replace the table-wide select, so the public key can read only what the
-- website shows. Staff (authenticated, is_staff()) and the service role are
-- unchanged and still see everything.

revoke select on public.testimonials from anon;

grant select (
  id,
  school_slug,
  author_name,
  relationship,
  quote,
  photo_url,
  sort_order,
  published,
  created_at,
  grad_year,
  company,
  city_country
) on public.testimonials to anon;

-- Check: as anon, `select answers from testimonials` must now fail with
-- "permission denied for table testimonials", while
-- `select author_name, quote from testimonials` still returns published rows.
