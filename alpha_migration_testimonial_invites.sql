-- ============================================================
-- ALPHA SCHOOLS — INCREMENTAL migration
-- Alumni testimonial invites: personal links + general link wizard.
-- Requires alpha_migration_alumni_submissions.sql (is_staff, testimonials
-- consent columns, alumni-pending bucket, claim_submission_slot).
-- Safe to run more than once. Paste into the Supabase SQL editor.
--
-- Re-running this file recreates the old 12-argument submit_invited_story
-- (alumni-only). Run alpha_migration_parent_invites.sql again afterwards to
-- restore the parent-aware version.
--
-- Section 4 narrows anon's SELECT on public.testimonials to public columns.
-- alpha_schema.sql and alpha_migration_hero_testimonials.sql both grant
-- table-wide anon SELECT on that table, so if either is re-run after this
-- file, re-run this file again afterwards to restore the column narrowing.
-- ============================================================


-- ---- 1. Invites
--
-- One row per invited alumnus. The link code itself is never stored in the
-- clear: token_hash (SHA-256) finds the row when a link is opened, and
-- token_cipher (AES-GCM, key held only by the server) lets staff re-share the
-- same link. Neither is useful without the server's INVITE_LINK_KEY.
create table if not exists public.testimonial_invites (
  id             uuid primary key default gen_random_uuid(),
  full_name      text not null check (char_length(full_name) between 1 and 120),
  phone          text not null unique check (phone ~ '^\+[0-9]{8,15}$'),
  email          text check (email is null or char_length(email) <= 254),
  school_slug    text references public.schools(slug),
  grad_year      int  check (grad_year is null or (grad_year between 1960 and (extract(year from now())::int + 1))),
  token_hash     text not null unique,
  token_cipher   text not null,
  status         text not null default 'pending'
                 check (status in ('pending', 'opened', 'submitted')),
  expires_at     timestamptz not null,
  opened_at      timestamptz,
  submitted_at   timestamptz,
  last_shared_at timestamptz,
  created_by     uuid references auth.users(id) on delete set null,
  created_at     timestamptz not null default now()
);

create index if not exists testimonial_invites_created_idx
  on public.testimonial_invites (created_at desc);

-- No insert grant for anyone but the service role: creating an invite needs
-- the encryption key, which only the server function holds.
revoke all on public.testimonial_invites from anon;
revoke insert on public.testimonial_invites from authenticated;
grant select, update, delete on public.testimonial_invites to authenticated;
grant all on public.testimonial_invites to service_role;

alter table public.testimonial_invites enable row level security;

drop policy if exists "invites staff read" on public.testimonial_invites;
create policy "invites staff read" on public.testimonial_invites
  for select to authenticated using (public.is_staff());

drop policy if exists "invites staff update" on public.testimonial_invites;
create policy "invites staff update" on public.testimonial_invites
  for update to authenticated
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists "invites staff delete" on public.testimonial_invites;
create policy "invites staff delete" on public.testimonial_invites
  for delete to authenticated using (public.is_staff());


-- ---- 2. Testimonials: link back to the invite, story answers, place
alter table public.testimonials
  add column if not exists invite_id    uuid references public.testimonial_invites(id) on delete set null,
  add column if not exists answers      jsonb,
  add column if not exists city_country text;

-- Belt and braces for "one story per invite", beside the row lock below.
create unique index if not exists testimonials_invite_uniq
  on public.testimonials (invite_id) where invite_id is not null;


-- ---- 3. Atomic invited submission
--
-- Locks the invite, checks it, inserts the unpublished story and marks the
-- invite submitted in one transaction, so a double-tapped Submit yields one
-- story. Returns 'ok', 'invalid' (unknown or expired) or 'submitted'.
create or replace function public.submit_invited_story(
  p_token_hash         text,
  p_author_name        text,
  p_school_slug        text,
  p_grad_year          int,
  p_relationship       text,
  p_company            text,
  p_city_country       text,
  p_answers            jsonb,
  p_quote              text,
  p_pending_photo_path text,
  p_consent_text       text,
  p_submitted_ip       inet
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite public.testimonial_invites%rowtype;
begin
  select * into v_invite
    from public.testimonial_invites
    where token_hash = p_token_hash
    for update;

  if not found or v_invite.expires_at < now() then
    return 'invalid';
  end if;
  if v_invite.status = 'submitted' then
    return 'submitted';
  end if;

  insert into public.testimonials (
    school_slug, author_name, relationship, company, city_country,
    grad_year, quote, answers, photo_url, pending_photo_path,
    published, consent_at, consent_text, submitted_ip, sort_order, invite_id
  ) values (
    p_school_slug, p_author_name, p_relationship, p_company, p_city_country,
    p_grad_year, p_quote, p_answers, null, p_pending_photo_path,
    false, now(), p_consent_text, p_submitted_ip, 0, v_invite.id
  );

  update public.testimonial_invites
    set status = 'submitted', submitted_at = now()
    where id = v_invite.id;

  return 'ok';
end;
$$;

revoke all on function public.submit_invited_story(text, text, text, int, text, text, text, jsonb, text, text, text, inet)
  from public, anon, authenticated;
grant execute on function public.submit_invited_story(text, text, text, int, text, text, text, jsonb, text, text, text, inet)
  to service_role;


-- ---- 4. Anon SELECT narrowed to public columns
--
-- alpha_migration_alumni_submissions.sql section 3 (and, before it,
-- alpha_schema.sql / alpha_migration_hero_testimonials.sql) grant anon
-- table-wide SELECT on public.testimonials, relying only on the RLS policy
-- "published = true" as a gate. RLS filters ROWS, not COLUMNS — it does not
-- stop a column being read on a row it lets through. The anon key ships to
-- every browser, so once a story is approved anyone can already call
-- GET /rest/v1/testimonials?select=answers,city_country,invite_id,submitted_ip&published=eq.true
-- and read an alumnus's free-text prompt answers, city/country and the IP
-- address that submitted the story.
--
-- The fix is a column-level grant covering exactly what the anon-key readers
-- need. Both readers of this table on the anon key (getTestimonials and
-- getAlumniStories, src/lib/alpha-content.functions.ts, via serverClient()
-- using ALPHA_SUPABASE_ANON_KEY_SERVER) select only:
--   id, author_name, relationship, quote, photo_url, school_slug, grad_year, company
-- and filter/order on: published, sort_order (grad_year is already selected).
-- Nothing else reads testimonials on the anon key (the admin queue and story
-- wizard use the authenticated role and the service role respectively — see
-- alumni-pending.tsx's useAdminAuth() client and alumni.functions.ts's
-- serviceClient()). So the grant below is the union of those two lists, and
-- deliberately excludes answers, city_country, invite_id, submitted_ip,
-- consent_at, consent_text and pending_photo_path.
--
-- authenticated and service_role keep their existing table-wide grants
-- unchanged (the admin panel reads/writes through authenticated, gated by
-- the "testimonials staff all" RLS policy using is_staff(); server functions
-- use service_role, which bypasses RLS and column grants entirely).
--
-- Re-running alpha_schema.sql or alpha_migration_hero_testimonials.sql
-- re-grants table-wide anon SELECT and undoes this narrowing — always run
-- this file again after either of those.
revoke select on public.testimonials from anon;
grant select (
  id, author_name, relationship, quote, photo_url, school_slug,
  grad_year, company, published, sort_order
) on public.testimonials to anon;
