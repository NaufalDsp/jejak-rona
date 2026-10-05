-- Migrasi Awal: Skema Jejak Rona (Auth, Pages, Revisions, Settings & RLS)
-- Versi: 1.0 (5 Oktober 2026)

create extension if not exists "uuid-ossp";

-- ==============================================================================
-- 1. TABEL PROFILES (Pengguna Terverifikasi & Peran)
-- ==============================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  role text not null check (role in ('admin', 'editor')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ==============================================================================
-- 2. TABEL PAGES (Konten Halaman, Draft & Published Blocks)
-- ==============================================================================
create table if not exists public.pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  draft jsonb not null default '[]'::jsonb,
  published jsonb,
  seo jsonb not null default '{}'::jsonb,
  is_home boolean not null default false,
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

-- Tepat satu halaman yang boleh bertanda is_home = true
create unique index if not exists pages_unique_home_idx on public.pages (is_home) where (is_home = true);
create index if not exists pages_status_idx on public.pages (status);
create index if not exists pages_slug_idx on public.pages (slug);

-- ==============================================================================
-- 3. TABEL REVISIONS (Riwayat Snapshot Publikasi)
-- ==============================================================================
create table if not exists public.revisions (
  id uuid primary key default gen_random_uuid(),
  entity text not null check (entity in ('page', 'post', 'site_setting')),
  entity_id uuid not null,
  snapshot jsonb not null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists revisions_entity_idx on public.revisions (entity, entity_id);

-- ==============================================================================
-- 4. TABEL SITE_SETTINGS (Konfigurasi Global Situs)
-- ==============================================================================
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- ==============================================================================
-- 5. VIEW PUBLIK (pages_public)
-- Kunci anon hanya membaca view ini, TIDAK membaca tabel pages langsung.
-- Kolom "draft" terisolasi sepenuhnya dari publik.
-- ==============================================================================
create or replace view public.pages_public as
  select
    id,
    slug,
    title,
    published,
    seo,
    is_home,
    published_at
  from public.pages
  where status = 'published' and published is not null;

-- ==============================================================================
-- 6. KEBIJAKAN AKSES KEAMANAN (Row Level Security / RLS)
-- ==============================================================================

-- Fungsi bantu untuk memeriksa status staff (admin atau editor)
create or replace function public.is_staff()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'editor')
  );
$$;

-- Aktifkan RLS
alter table public.profiles enable row level security;
alter table public.pages enable row level security;
alter table public.revisions enable row level security;
alter table public.site_settings enable row level security;

-- Kebijakan Profiles
create policy "profiles_read_own" on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_staff());

create policy "profiles_admin_manage" on public.profiles
  for all to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Kebijakan Pages (Hanya staff yang bisa membaca tabel mentah dan draft)
create policy "pages_staff_all" on public.pages
  for all to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- Kebijakan Revisions (Hanya staff)
create policy "revisions_staff_all" on public.revisions
  for all to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- Kebijakan Site Settings
create policy "site_settings_public_read" on public.site_settings
  for select to public
  using (true);

create policy "site_settings_staff_write" on public.site_settings
  for all to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- Hak akses view publik
grant select on public.pages_public to anon, authenticated;
