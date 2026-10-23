-- Alpha Schools — explicit story states for the admin redesign
--
-- Run once in the Supabase SQL editor (Dashboard → SQL → New query), after
-- alpha_migration_alumni_contact_privacy.sql. Safe to run again.
--
-- Staff reason about a story as Waiting / Live / Hidden / Declined instead of
-- the old published boolean. This adds testimonials.status plus the columns
-- that go with it, backfills existing rows, and installs a trigger that keeps
-- published = (status = 'live'). The public site queries and the
-- "testimonials public read" policy still filter on published = true, so they
-- keep working unchanged, and the old admin keeps working too: flipping
-- published there moves status in step.

-- 1. Columns. status is added nullable first so the backfill can run, then
--    tightened below.
alter table public.testimonials add column if not exists status text;
alter table public.testimonials add column if not exists decline_reason text;
alter table public.testimonials add column if not exists featured boolean not null default false;
alter table public.testimonials add column if not exists featured_order int;
alter table public.testimonials add column if not exists decided_at timestamptz;
alter table public.testimonials
  add column if not exists decided_by uuid references auth.users(id) on delete set null;

-- 2. Backfill. Only rows without a status are touched, so a re-run never
--    overwrites a decision staff have made since.
update public.testimonials
set status = case
  when published then 'live'
  when consent_at is not null then 'waiting'
  else 'hidden'
end
where status is null;

alter table public.testimonials alter column status set default 'waiting';
alter table public.testimonials alter column status set not null;

alter table public.testimonials drop constraint if exists testimonials_status_check;
alter table public.testimonials
  add constraint testimonials_status_check
  check (status in ('waiting', 'live', 'hidden', 'declined'));

-- 3. Keep published and status in step. Whichever one a write changes wins;
--    if both change, status wins.
create or replace function public.testimonials_sync_published()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    -- status has a column default of 'waiting', so an insert that only sets
    -- published = true arrives here as ('waiting', true): treat it as live.
    if new.status is null or (new.status = 'waiting' and new.published) then
      new.status := case when new.published then 'live' else 'waiting' end;
    end if;
    new.published := (new.status = 'live');
  elsif new.status is distinct from old.status then
    new.published := (new.status = 'live');
  elsif new.published is distinct from old.published then
    new.status := case when new.published then 'live' else 'hidden' end;
  end if;
  return new;
end;
$$;

drop trigger if exists testimonials_sync_published on public.testimonials;
create trigger testimonials_sync_published
  before insert or update on public.testimonials
  for each row execute function public.testimonials_sync_published();

-- 4. The staff queue filters by status and sorts by age.
create index if not exists testimonials_status_idx
  on public.testimonials (status, created_at);

-- 5. alpha_migration_alumni_contact_privacy.sql limited the public (anon) key
--    to named columns, so the new ones the site reads must be granted.
grant select (featured, featured_order) on public.testimonials to anon;

-- Check (run after the above):
--   select status, count(*) from public.testimonials group by status;
--   -- live must equal the old count of published = true rows; waiting plus
--   -- hidden must equal the old count of published = false rows.
--   select published, count(*) from public.testimonials group by published;
--   -- then, as a trigger test (delete the row afterwards):
--   insert into public.testimonials (author_name, quote, published, consent_at)
--     values ('Check', 'Check', false, now()) returning status, published;
--   -- must return status = 'waiting', published = false.
--   insert into public.testimonials (author_name, quote, published)
--     values ('Check', 'Check', true) returning status, published;
--   -- must return status = 'live', published = true.
--   delete from public.testimonials where author_name = 'Check' and quote = 'Check';
