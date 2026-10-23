-- ============================================================
-- ALPHA SCHOOLS — INCREMENTAL migration
-- Staff can upload a replacement photo for a story still waiting for review.
-- Safe to run more than once. Paste THIS file (not alpha_schema.sql)
-- into the Supabase SQL editor.
--
-- Run BEFORE deploying the admin redesign, after
-- alpha_migration_alumni_submissions.sql (which creates the private
-- alumni-pending bucket and public.is_staff()). Order:
--   1. this file
--   2. deploy the site (npm run deploy)
--   3. alpha_migration_staff_role.sql
--
-- WHY
-- The new Stories screen lets staff change the photo on a Waiting story. That
-- photo is still private, so it goes to the alumni-pending bucket at
-- staff/<versioned name>. alpha_migration_alumni_submissions.sql only gave
-- staff read and delete there; without an insert policy the upload fails with
-- a permission error.
--
-- Uploads always use a fresh, versioned name and upsert: false, so no update
-- policy is needed: staff never overwrite a file in this bucket.
--
-- If a policy allowing this was already made by hand in the dashboard, this
-- file is harmless: it only adds (or replaces) the one policy named below.
-- ============================================================

drop policy if exists "alumni-pending staff insert" on storage.objects;
create policy "alumni-pending staff insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'alumni-pending' and public.is_staff());
