-- ============================================================
-- ALPHA SCHOOLS — INCREMENTAL migration
-- Hero slides + Testimonials + news.urgent
-- Safe to run more than once. Paste THIS file (not alpha_schema.sql)
-- into the Supabase SQL editor.
-- ============================================================

-- ---- 1. Urgent announcements flag on news
alter table public.news add column if not exists urgent boolean not null default false;

-- ---- 2. HERO SLIDES
create table if not exists public.hero_slides (
  id           uuid primary key default gen_random_uuid(),
  page_key     text not null,              -- 'home' | 'nursery-primary' | 'alpha-high' | 'alpha-girls' | 'aviation' | 'about' | 'admission'
  image_url    text not null,
  alt_text     text,
  caption      text,
  sort_order   int  not null default 0,
  published    boolean not null default true,
  created_at   timestamptz not null default now()
);
create index if not exists hero_slides_page_idx on public.hero_slides (page_key, sort_order);

grant select on public.hero_slides to anon;
grant select, insert, update, delete on public.hero_slides to authenticated;
grant all on public.hero_slides to service_role;

alter table public.hero_slides enable row level security;

drop policy if exists "hero_slides public read" on public.hero_slides;
create policy "hero_slides public read" on public.hero_slides for select using (published = true);

drop policy if exists "hero_slides staff all" on public.hero_slides;
create policy "hero_slides staff all"   on public.hero_slides for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ---- 3. TESTIMONIALS
create table if not exists public.testimonials (
  id            uuid primary key default gen_random_uuid(),
  school_slug   text references public.schools(slug),
  author_name   text not null,
  relationship  text,                      -- e.g. 'Parent, Form 3'
  quote         text not null,
  photo_url     text,
  sort_order    int  not null default 0,
  published     boolean not null default true,
  created_at    timestamptz not null default now()
);
create index if not exists testimonials_order_idx on public.testimonials (sort_order, created_at desc);

grant select on public.testimonials to anon;
grant select, insert, update, delete on public.testimonials to authenticated;
grant all on public.testimonials to service_role;

alter table public.testimonials enable row level security;

drop policy if exists "testimonials public read" on public.testimonials;
create policy "testimonials public read" on public.testimonials for select using (published = true);

drop policy if exists "testimonials staff all" on public.testimonials;
create policy "testimonials staff all"   on public.testimonials for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
