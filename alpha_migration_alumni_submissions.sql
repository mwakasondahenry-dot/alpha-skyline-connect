-- ============================================================
-- ALPHA SCHOOLS — INCREMENTAL migration
-- Alumni submission flow: /alumni/submit -> moderation -> /alumni
-- Safe to run more than once. Paste THIS file (not alpha_schema.sql)
-- into the Supabase SQL editor.
--
-- Reuses public.testimonials. published = false is the approval gate,
-- exactly as it already is for staff-entered quotes.
-- ============================================================


-- ---- 1. is_staff()
--
-- Every existing policy in this project spells the staff check as
-- auth.role() = 'authenticated'. That is true for ANY authenticated session,
-- including a self-signed-up account, so it is not by itself a staff test.
-- is_staff() narrows it to "has a row in public.profiles", which is created
-- by the on_auth_user_created trigger for real accounts.
--
-- SECURITY DEFINER because the caller must be able to answer the question
-- about themselves without being granted read access to every profile.
-- CREATE OR REPLACE so this is a no-op if a version already exists.
create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid());
$$;

revoke all on function public.is_staff() from public;
grant execute on function public.is_staff() to authenticated, service_role;


-- ---- 2. Columns for the alumni form
--
-- Fields that map onto existing columns and gained nothing from new ones:
--   full name     -> author_name
--   current role  -> relationship   (free text; was 'Parent, Form 3')
--   message       -> quote
--   photo         -> photo_url      (set only on approval; see 5)
--
-- grad_year doubles as the alumni discriminator. It is required on the form
-- and never set on a parent quote, so "grad_year is not null" identifies an
-- alumni entry without a redundant kind column. The homepage previously
-- guessed this by regex-matching /alumn/i against relationship, which now
-- holds a job title and would have silently mis-sorted every submission.
alter table public.testimonials
  add column if not exists grad_year          int,
  add column if not exists company            text,
  -- Consent record. A tick-box nobody recorded proves nothing, and the
  -- wording will change over time, so the exact text agreed to is stored
  -- alongside the timestamp rather than referenced by version number.
  add column if not exists consent_at         timestamptz,
  add column if not exists consent_text       text,
  -- Object path inside the PRIVATE alumni-pending bucket, held only while a
  -- submission awaits moderation. Cleared when the file is copied to media
  -- on approval, or deleted on rejection.
  add column if not exists pending_photo_path text,
  add column if not exists submitted_ip       inet;

-- A graduating year that is not a plausible year is a bug or an attack.
-- 1960 predates the school by decades; the upper bound leaves room for a
-- current student submitting on the way out.
alter table public.testimonials drop constraint if exists testimonials_grad_year_range;
alter table public.testimonials add constraint testimonials_grad_year_range
  check (grad_year is null or (grad_year between 1960 and (extract(year from now())::int + 1)));

-- Anything carrying a consent record must carry the text that was consented to.
alter table public.testimonials drop constraint if exists testimonials_consent_pair;
alter table public.testimonials add constraint testimonials_consent_pair
  check ((consent_at is null) = (consent_text is null));

-- The moderation queue is read newest-first and is expected to stay small.
create index if not exists testimonials_pending_idx
  on public.testimonials (created_at desc) where published = false;

-- The public alumni page reads approved alumni entries only.
create index if not exists testimonials_alumni_idx
  on public.testimonials (sort_order, created_at desc)
  where published = true and grad_year is not null;


-- ---- 3. Grants and RLS on testimonials
--
-- DELIBERATELY NOT GRANTED: insert to anon.
--
-- The brief asked for "anonymous may INSERT only". That was the right shape
-- while the submit path ran on the anon key. It no longer does: submissions
-- are written by a server function holding the service role, which is what
-- makes the MIME check, the 5 MB cap, the filename randomisation and the IP
-- rate limit unavoidable rather than advisory. Granting anon INSERT on top of
-- that would reopen every one of those as a bypass — anyone holding the anon
-- key, which ships to every browser, could write rows directly.
--
-- anon SELECT is left in place. It is already restricted to published = true
-- by the policy below, so a pending submission is invisible to the public;
-- revoking it entirely would break the live testimonials page, which reads
-- through the anon key. anon has never been granted UPDATE or DELETE.
revoke insert, update, delete on public.testimonials from anon;
grant select on public.testimonials to anon;
grant select, insert, update, delete on public.testimonials to authenticated;
grant all on public.testimonials to service_role;

alter table public.testimonials enable row level security;

-- Unchanged in behaviour, restated so this file is self-contained.
drop policy if exists "testimonials public read" on public.testimonials;
create policy "testimonials public read" on public.testimonials
  for select using (published = true);

-- Narrowed from auth.role() = 'authenticated' to is_staff().
drop policy if exists "testimonials staff all" on public.testimonials;
create policy "testimonials staff all" on public.testimonials
  for all using (public.is_staff()) with check (public.is_staff());


-- ---- 4. IP rate limit
--
-- A link-only form is public the moment anyone forwards it. The limit lives
-- in the database rather than in process memory because the site deploys to
-- Cloudflare Workers, where an isolate is short-lived and per-instance — an
-- in-memory counter there resets constantly and limits nothing.
create table if not exists public.submission_rate_limit (
  bucket_key   text        not null,
  window_start timestamptz not null,
  hits         int         not null default 0,
  primary key (bucket_key, window_start)
);

-- No grants to anon or authenticated: only the service role touches this,
-- through the function below.
revoke all on public.submission_rate_limit from anon, authenticated;
grant all on public.submission_rate_limit to service_role;
alter table public.submission_rate_limit enable row level security;

-- Atomic claim: increments the window's counter and reports whether the
-- caller is still under the limit. Doing this as one INSERT ... ON CONFLICT
-- rather than a read-then-write closes the race where two concurrent
-- submissions both read a count under the limit and both proceed.
create or replace function public.claim_submission_slot(
  p_key      text,
  p_limit    int      default 5,
  p_window   interval default '1 hour'
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_window timestamptz := date_trunc('hour', now() at time zone 'utc') at time zone 'utc';
  v_hits   int;
begin
  insert into public.submission_rate_limit (bucket_key, window_start, hits)
  values (p_key, v_window, 1)
  on conflict (bucket_key, window_start)
    do update set hits = public.submission_rate_limit.hits + 1
  returning hits into v_hits;

  -- Opportunistic cleanup so the table cannot grow without bound. Cheap:
  -- the delete is indexed by the primary key's leading column and only runs
  -- on the first request of a window.
  if v_hits = 1 then
    delete from public.submission_rate_limit
      where window_start < now() - (p_window * 24);
  end if;

  return v_hits <= p_limit;
end;
$$;

revoke all on function public.claim_submission_slot(text, int, interval) from public, anon, authenticated;
grant execute on function public.claim_submission_slot(text, int, interval) to service_role;


-- ---- 5. Private bucket for unmoderated photos
--
-- An unmoderated public URL on a school website is unacceptable, so nothing
-- a stranger uploads is ever reachable from the internet. Files land here,
-- private, and are copied into the public 'media' bucket only when a member
-- of staff approves the submission. Rejection deletes them.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'alumni-pending',
  'alumni-pending',
  false,
  5242880,                                                   -- 5 MB, enforced again server-side
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
  set public             = false,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- No anon policy of any kind on this bucket. The service role bypasses RLS,
-- so the server function can write; nobody else can reach it at all.
drop policy if exists "alumni-pending staff read"   on storage.objects;
create policy "alumni-pending staff read" on storage.objects
  for select to authenticated
  using (bucket_id = 'alumni-pending' and public.is_staff());

drop policy if exists "alumni-pending staff delete" on storage.objects;
create policy "alumni-pending staff delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'alumni-pending' and public.is_staff());
