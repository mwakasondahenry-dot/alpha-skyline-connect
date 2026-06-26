-- ============================================================
-- ALPHA SCHOOLS — Supabase schema (Phase 1)
-- Paste into Supabase SQL editor and run top to bottom.
-- Public site reads PUBLISHED content. Admin dashboard writes.
-- ============================================================

-- ---- 1. SCHOOLS (a table, not an enum, so staff can add/rename without a migration)
create table public.schools (
  slug        text primary key,              -- e.g. 'nursery-primary', 'alpha-high', 'alpha-girls', 'group-wide'
  name        text not null,
  campus      text,                          -- 'Mikocheni', 'Kunduchi', etc.
  accent_hex  text,                          -- per-school accent colour from the brand system
  sort_order  int  not null default 0,
  created_at  timestamptz not null default now()
);

insert into public.schools (slug, name, campus, accent_hex, sort_order) values
  ('group-wide',      'Alpha Schools',        null,         '#185FA5', 0),
  ('nursery-primary', 'Nursery & Primary',    'Main',       '#1E7FC2', 1),
  ('alpha-high',      'Alpha High',           'Mikocheni',  '#0C447C', 2),
  ('alpha-girls',     'Alpha Girls',          'Kunduchi',   '#3C3489', 3);

-- ---- 2. PROFILES (admin identity; mirrors auth.users, carries a role)
create table public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text,
  role       text not null default 'editor',  -- 'editor' or 'admin'
  created_at timestamptz not null default now()
);

-- auto-create a profile row whenever an auth user is created
create function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email));
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---- 3. CONTENT TABLES (each carries school_slug + a published flag)
create table public.news (
  id           uuid primary key default gen_random_uuid(),
  school_slug  text not null references public.schools(slug),
  title        text not null,
  body         text,
  cover_url    text,                         -- Supabase Storage public URL
  published    boolean not null default false,
  published_at timestamptz,
  author_id    uuid references public.profiles(id),
  created_at   timestamptz not null default now()
);

create table public.events (
  id           uuid primary key default gen_random_uuid(),
  school_slug  text not null references public.schools(slug),
  title        text not null,
  description  text,
  event_date   date not null,
  location     text,
  cover_url    text,
  published    boolean not null default false,
  created_at   timestamptz not null default now()
);

create table public.calendar (
  id           uuid primary key default gen_random_uuid(),
  school_slug  text not null references public.schools(slug),
  title        text not null,                -- 'Term 1 begins', 'Mid-term break'
  term_date    date not null,
  kind         text default 'term',          -- 'term' | 'holiday' | 'exam' | 'event'
  created_at   timestamptz not null default now()
);

create table public.downloads (
  id           uuid primary key default gen_random_uuid(),
  school_slug  text not null references public.schools(slug),
  title        text not null,
  file_url     text not null,                -- Supabase Storage URL
  category     text default 'general',       -- 'prospectus' | 'forms' | 'results' | 'general'
  created_at   timestamptz not null default now()
);

create table public.gallery (
  id           uuid primary key default gen_random_uuid(),
  school_slug  text not null references public.schools(slug),
  image_url    text not null,
  caption      text,
  sort_order   int not null default 0,
  created_at   timestamptz not null default now()
);

create table public.staff (
  id           uuid primary key default gen_random_uuid(),
  school_slug  text not null references public.schools(slug),
  name         text not null,
  title        text,                         -- 'Head Teacher', 'Aviation Instructor'
  photo_url    text,
  sort_order   int not null default 0,
  created_at   timestamptz not null default now()
);

create table public.pages (
  id           uuid primary key default gen_random_uuid(),
  school_slug  text not null references public.schools(slug) default 'group-wide',
  slug         text not null,                -- 'about', 'aviation', 'admission'
  title        text not null,
  body         text,
  published    boolean not null default true,
  updated_at   timestamptz not null default now(),
  unique (school_slug, slug)
);

-- helpful indexes for the public site's most common queries
create index on public.news    (school_slug, published, published_at desc);
create index on public.events  (school_slug, published, event_date);
create index on public.gallery (school_slug, sort_order);

-- ============================================================
-- 4. ROW LEVEL SECURITY
-- Public (anon) can READ published content only.
-- Authenticated staff can do everything.
-- ============================================================
alter table public.schools   enable row level security;
alter table public.profiles  enable row level security;
alter table public.news      enable row level security;
alter table public.events    enable row level security;
alter table public.calendar  enable row level security;
alter table public.downloads enable row level security;
alter table public.gallery   enable row level security;
alter table public.staff     enable row level security;
alter table public.pages     enable row level security;

-- schools: anyone can read; only authenticated can change
create policy "schools public read"  on public.schools for select using (true);
create policy "schools staff write"  on public.schools for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- profiles: a user can read/update only their own row
create policy "own profile read"   on public.profiles for select using (auth.uid() = id);
create policy "own profile update" on public.profiles for update using (auth.uid() = id);

-- reusable pattern for content tables:
-- anon sees published rows; authenticated sees + writes everything
create policy "news public read"     on public.news     for select using (published = true);
create policy "news staff all"       on public.news     for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "events public read"   on public.events   for select using (published = true);
create policy "events staff all"     on public.events   for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "calendar public read" on public.calendar for select using (true);
create policy "calendar staff all"   on public.calendar for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "downloads public read" on public.downloads for select using (true);
create policy "downloads staff all"   on public.downloads for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "gallery public read"  on public.gallery  for select using (true);
create policy "gallery staff all"    on public.gallery  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "staff public read"    on public.staff    for select using (true);
create policy "staff staff all"      on public.staff    for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "pages public read"    on public.pages    for select using (published = true);
create policy "pages staff all"      on public.pages    for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ============================================================
-- 5. STORAGE BUCKETS (run, then confirm in Storage UI)
-- One public bucket for all site media. Staff upload; world reads.
-- ============================================================
insert into storage.buckets (id, name, public) values ('media', 'media', true)
  on conflict (id) do nothing;

create policy "media public read"   on storage.objects for select
  using (bucket_id = 'media');
create policy "media staff upload"  on storage.objects for insert
  with check (bucket_id = 'media' and auth.role() = 'authenticated');
create policy "media staff update"  on storage.objects for update
  using (bucket_id = 'media' and auth.role() = 'authenticated');
create policy "media staff delete"  on storage.objects for delete
  using (bucket_id = 'media' and auth.role() = 'authenticated');
