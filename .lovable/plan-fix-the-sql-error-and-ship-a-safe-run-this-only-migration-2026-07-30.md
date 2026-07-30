# Fix the SQL error and ship a safe "run this only" migration

## What the error means

`ERROR: 42P07: relation "schools" already exists` means the whole of `alpha_schema.sql` was pasted into the Supabase SQL editor. That file is the full history of the database from day one, and your project already has those tables. Postgres stops at the very first `create table public.schools (...)` because it is already there. Nothing was applied — the run aborted on line one of the script body.

You do not need to run the whole file again. You only need the newest block: the hero slides and testimonials tables, plus the `urgent` column on news.

## What to do

Add a new file at the project root, `alpha_migration_hero_testimonials.sql`, containing only the incremental changes, written so it is safe to run more than once:

- `alter table public.news add column if not exists urgent boolean not null default false;`
- `create table if not exists public.hero_slides (...)` with its index, grants (`anon` select; `authenticated` full; `service_role` all), RLS enabled, and public-read / staff-all policies each guarded so a re-run does not error.
- `create table if not exists public.testimonials (...)` with the same index, grants, RLS and policy treatment.

Policies are the other re-run trap: `create policy` has no `if not exists`, so each policy gets a `drop policy if exists ... ;` immediately before it. Every statement in the new file is then safe to paste repeatedly.

## Also update the reference file

`alpha_schema.sql` stays as the full-history reference, but gets a short header comment at the top warning that it is a historical record and must not be re-run against an existing database — incremental blocks are what you paste.

## Technical notes

- Column list for `hero_slides` and `testimonials` is taken verbatim from section 8 of `alpha_schema.sql`, so the hand-written types in `src/integrations/alpha-supabase/types.ts` and the admin CRUD screens already match. No app code changes are needed.
- No app-code or UI changes in this step; this is purely the SQL you paste into your Supabase SQL editor.
- After you run it, the Hero slides and Testimonials admin screens and the `/testimonials` page will read and write successfully.
