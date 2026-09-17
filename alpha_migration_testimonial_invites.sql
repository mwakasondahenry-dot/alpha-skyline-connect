-- ============================================================
-- ALPHA SCHOOLS — INCREMENTAL migration
-- Alumni testimonial invites: personal links + general link wizard.
-- Requires alpha_migration_alumni_submissions.sql (is_staff, testimonials
-- consent columns, alumni-pending bucket, claim_submission_slot).
-- Safe to run more than once. Paste into the Supabase SQL editor.
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
