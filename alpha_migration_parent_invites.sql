-- ============================================================
-- ALPHA SCHOOLS — INCREMENTAL migration
-- Parent testimonial invites: invites gain an audience.
-- Requires alpha_migration_testimonial_invites.sql. Run this file AFTER it
-- (and again after any re-run of it). Safe to run more than once.
-- ============================================================


-- ---- 1. Audience
--
-- Existing invites were all for alumni, so the default fills them in.
alter table public.testimonial_invites
  add column if not exists audience text not null default 'alumni';

alter table public.testimonial_invites
  drop constraint if exists testimonial_invites_audience_check;
alter table public.testimonial_invites
  add constraint testimonial_invites_audience_check
  check (audience in ('alumni', 'parent'));


-- ---- 2. One invite per phone per audience
--
-- A parent can also be a former student, so the same number may appear once
-- in each list. The inline unique on phone from the earlier migration is
-- named testimonial_invites_phone_key by Postgres.
alter table public.testimonial_invites
  drop constraint if exists testimonial_invites_phone_key;
alter table public.testimonial_invites
  drop constraint if exists testimonial_invites_audience_phone_key;
alter table public.testimonial_invites
  add constraint testimonial_invites_audience_phone_key unique (audience, phone);


-- ---- 3. Audience-aware invited submission
--
-- Same behaviour as before, plus: an invite for one audience cannot be used
-- to submit the other audience's form. The 12-argument version is dropped so
-- no caller can reach the unchecked path.
drop function if exists public.submit_invited_story(
  text, text, text, int, text, text, text, jsonb, text, text, text, inet
);

create or replace function public.submit_invited_story(
  p_token_hash         text,
  p_audience           text,
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

  if not found
     or v_invite.expires_at < now()
     or v_invite.audience is distinct from p_audience then
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

revoke all on function public.submit_invited_story(
  text, text, text, text, int, text, text, text, jsonb, text, text, text, inet
) from public, anon, authenticated;
grant execute on function public.submit_invited_story(
  text, text, text, text, int, text, text, text, jsonb, text, text, text, inet
) to service_role;


-- ---- 4. Public sort date for testimonials
--
-- The homepage and the school pages show the newest approved parent quotes
-- first. created_at is not sensitive, so the anon column grant from
-- alpha_migration_testimonial_invites.sql is widened by this one column.
-- Column grants add to each other, so this is safe to run again.
grant select (created_at) on public.testimonials to anon;
