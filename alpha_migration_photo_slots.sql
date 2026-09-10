-- ============================================================
-- PHOTO SLOTS — one row per named photo position on a school page.
--
-- The positions themselves are declared in src/lib/photo-slots.ts,
-- because a position is a layout fact. The photograph in it is a
-- content fact and lives here.
--
-- A row exists only when staff have deliberately replaced a photo,
-- so existence IS publication and there is no `published` column.
-- Reverting a slot to its built-in default is a DELETE.
--
-- Run this in the Supabase SQL editor for the Alpha project.
-- Safe to run more than once.
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

drop policy if exists "photo_slots public read" on public.photo_slots;
create policy "photo_slots public read" on public.photo_slots for select using (true);

drop policy if exists "photo_slots staff all" on public.photo_slots;
create policy "photo_slots staff all"   on public.photo_slots for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
