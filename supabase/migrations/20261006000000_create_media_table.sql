-- Migrasi Tahap 7: Tabel Media & Titik Fokus
-- Versi: 1.1 (6 Oktober 2026)

create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('image', 'video')),
  filename text not null,
  mime_type text not null,
  bytes bigint,
  width integer,
  height integer,
  duration_s numeric,
  url text not null,
  r2_key text,
  alt text not null default '',
  credit text,
  focal_x numeric not null default 50 check (focal_x >= 0 and focal_x <= 100),
  focal_y numeric not null default 50 check (focal_y >= 0 and focal_y <= 100),
  poster_url text,
  variants jsonb not null default '[]'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists media_kind_idx on public.media (kind);
create index if not exists media_created_at_idx on public.media (created_at desc);

-- Aktifkan RLS
alter table public.media enable row level security;

-- Kebijakan Akses:
-- 1. Baca media terbuka untuk publik dan staff (agar gambar publik dapat diakses)
create policy "media_public_read" on public.media
  for select
  using (true);

-- 2. Kelola media (upload, update, delete) hanya untuk staff
create policy "media_staff_manage" on public.media
  for all to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- Isi data awal media (dari media yang sudah dipakai di beranda & tentang)
insert into public.media (
  id, kind, filename, mime_type, width, height, url, alt, credit, focal_x, focal_y
) values
  (
    'a1111111-1111-1111-1111-111111111111',
    'image',
    'hero-landscape.webp',
    'image/webp',
    1920,
    1080,
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=80',
    'Hamparan lembah berkabut di bawah langit pagi yang tenang',
    'Unsplash (Unsplash License)',
    50,
    45
  ),
  (
    'a2222222-2222-2222-2222-222222222222',
    'image',
    'forest-quiet.webp',
    'image/webp',
    2560,
    1440,
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=2560&q=80',
    'Hutan berkabut lebat dengan cahaya menembus pepohonan',
    'Unsplash (Unsplash License)',
    50,
    50
  ),
  (
    'a3333333-3333-3333-3333-333333333333',
    'image',
    'about-landscape.webp',
    'image/webp',
    1920,
    1080,
    'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1920&q=80',
    'Pegunungan dan danau yang tenang di bawah cahaya pagi',
    'Unsplash (Unsplash License)',
    50,
    45
  )
on conflict (id) do nothing;

-- 3. Konfigurasi Bucket Storage Supabase untuk upload langsung
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

-- Policy storage media
create policy "media_storage_public_read" on storage.objects
  for select
  using (bucket_id = 'media');

create policy "media_storage_staff_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'media' and public.is_staff());

create policy "media_storage_staff_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'media' and public.is_staff());

