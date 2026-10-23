-- Alpha Schools — "staff only" checks the profile's role
--
-- Run once in the Supabase SQL editor (Dashboard → SQL → New query), after
-- alpha_migration_alumni_submissions.sql and alpha_migration_testimonial_invites.sql.
-- Run PART A first, on its own, and read the result. Only then run PART B.
--
-- WHY
-- is_staff() currently returns true for any account that has a row in
-- public.profiles. Every auth user gets one from the on_auth_user_created
-- trigger, so "has a profile" is the same as "has an account". Sign-ups are
-- disabled on the project (verified 2026-10-23), so today that is only the
-- people the school added by hand. This file is defence in depth: if sign-ups
-- were ever switched on by mistake, a stranger's account would still not count
-- as staff, because profiles.role defaults to 'editor' but is only trusted
-- here when it is 'editor' or 'admin'.
--
-- WHAT IT CHANGES
-- 1. public.is_staff() now requires profiles.role in ('editor','admin').
--    Everything that already calls is_staff() is tightened with it, with no
--    further edits: the testimonials "staff all" policy, the alumni-pending
--    storage bucket policies (pending photos), and the testimonial_invites
--    policies.
-- 2. The contact_messages staff read / update / delete policies stop using
--    auth.role() = 'authenticated' and use is_staff() instead.
--    (The anonymous insert policy is untouched: the contact form still works.)
-- Other tables (news, events, gallery, ...) still use auth.role() =
-- 'authenticated' and are NOT changed here.
--
-- DANGER: a staff account whose role is not 'editor' or 'admin' (null, if the
-- live column was ever made nullable, a typo, or any other value) loses
-- access to the testimonials queue, pending photos, invites and enquiries the
-- moment PART B runs. That is why PART A exists.
--
-- Safe to run more than once.
--
-- ROLLBACK (restores the old is_staff() body; the contact_messages policies
-- can be put back by re-running the four lines in alpha_schema.sql ~235-240):
--
--   create or replace function public.is_staff()
--   returns boolean language sql stable security definer set search_path = public
--   as $$ select exists (select 1 from public.profiles where id = auth.uid()); $$;
--
--   drop policy if exists "contact staff read"   on public.contact_messages;
--   drop policy if exists "contact staff update" on public.contact_messages;
--   drop policy if exists "contact staff delete" on public.contact_messages;
--   create policy "contact staff read"   on public.contact_messages for select
--     using (auth.role() = 'authenticated');
--   create policy "contact staff update" on public.contact_messages for update
--     using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
--   create policy "contact staff delete" on public.contact_messages for delete
--     using (auth.role() = 'authenticated');


-- ============================================================
-- PART A — read-only check. Run this alone first.
--
-- Every staff account must show role 'editor' or 'admin' before you run
-- PART B. If any real staff member shows anything else (or is missing from
-- the list), STOP and fix their role first, e.g.
--   update public.profiles set role = 'editor' where id = '<their id>';
-- ============================================================

-- Accounts with no profile row show role null (they will NOT count as staff).
select u.id, u.email, p.role
from auth.users u
left join public.profiles p on p.id = u.id
order by u.email;


-- ============================================================
-- PART B — the change. Run only after PART A looks right.
-- ============================================================

-- Backstop: pasting the whole file cannot lock anyone out. Aborts here if any
-- profile has a role other than editor/admin.
do $$ begin
  if exists (
    select 1 from public.profiles
    where role is null or role not in ('editor', 'admin')
  ) then
    raise exception 'Part A: every staff profile needs role editor or admin first';
  end if;
end $$;

-- Same attributes as the existing definition: SQL, stable, security definer
-- (so a caller can ask about themselves without read access to all profiles),
-- fixed search_path.
create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('editor', 'admin')
  );
$$;

revoke all on function public.is_staff() from public;
grant execute on function public.is_staff() to authenticated, service_role;

-- contact_messages: staff-only means is_staff(), not "any signed-in session".
drop policy if exists "contact staff read"   on public.contact_messages;
drop policy if exists "contact staff update" on public.contact_messages;
drop policy if exists "contact staff delete" on public.contact_messages;

create policy "contact staff read"   on public.contact_messages for select
  using (public.is_staff());
create policy "contact staff update" on public.contact_messages for update
  using (public.is_staff()) with check (public.is_staff());
create policy "contact staff delete" on public.contact_messages for delete
  using (public.is_staff());
