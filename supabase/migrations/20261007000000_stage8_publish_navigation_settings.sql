-- ==============================================================================
-- Migrasi Tahap 8: Navigasi, Pengaturan Situs, dan Kebijakan Revisi
-- ==============================================================================

-- 1. TABEL NAV_ITEMS (Navigasi Publik Maksimal Dua Tingkat)
create table if not exists public.nav_items (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  target_type text not null check (target_type in ('page', 'url')),
  target_id uuid references public.pages(id) on delete set null,
  url text,
  position integer not null default 0,
  parent_id uuid references public.nav_items(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists nav_items_position_idx on public.nav_items (position);
create index if not exists nav_items_parent_idx on public.nav_items (parent_id);

-- RLS untuk nav_items
alter table public.nav_items enable row level security;

-- Publik bisa membaca menu navigasi
drop policy if exists "nav_items_public_read" on public.nav_items;
create policy "nav_items_public_read" on public.nav_items
  for select using (true);

-- Staff bisa mengelola menu navigasi
drop policy if exists "nav_items_staff_manage" on public.nav_items;
create policy "nav_items_staff_manage" on public.nav_items
  for all to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- RLS untuk site_settings
alter table public.site_settings enable row level security;

-- Publik bisa membaca pengaturan situs umum
drop policy if exists "site_settings_public_read" on public.site_settings;
create policy "site_settings_public_read" on public.site_settings
  for select using (true);

-- Staff bisa mengubah pengaturan situs
drop policy if exists "site_settings_staff_manage" on public.site_settings;
create policy "site_settings_staff_manage" on public.site_settings
  for all to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- RLS untuk revisions
alter table public.revisions enable row level security;

-- Hanya staff yang bisa membaca dan membuat revisi
drop policy if exists "revisions_staff_read" on public.revisions;
create policy "revisions_staff_read" on public.revisions
  for select to authenticated
  using (public.is_staff());

drop policy if exists "revisions_staff_insert" on public.revisions;
create policy "revisions_staff_insert" on public.revisions
  for insert to authenticated
  with check (public.is_staff());

-- 2. BENIH AWAL PENGATURAN SITUS
insert into public.site_settings (key, value)
values
  ('general', jsonb_build_object(
    'site_name', 'Jejak Rona',
    'wordmark', 'JEJAK RONA',
    'tagline', 'Majalah Visual & Editorial Nusantara',
    'description', 'Menelusuri keindahan visual nusantara dengan ritme tenang dan terkurasi.',
    'footer_text', '© 2026 Jejak Rona. Foto yang berbicara. Cerita yang tinggal.',
    'cookie_banner_text', 'Situs ini menggunakan preferensi penyimpanan minimal tanpa pelacak invasif.'
  )),
  ('socials', jsonb_build_object(
    'instagram', 'https://instagram.com/jejakrona',
    'twitter', 'https://twitter.com/jejakrona',
    'youtube', ''
  )),
  ('build_status', jsonb_build_object(
    'state', 'idle',
    'message', 'Situs statis siap tayang.',
    'updated_at', now()
  ))
on conflict (key) do nothing;

-- 3. BENIH AWAL MENU NAVIGASI (Gunakan target_type = 'url' agar mandiri dan tidak melanggar foreign key)
insert into public.nav_items (id, label, target_type, target_id, url, position)
values
  ('b1111111-1111-1111-1111-111111111111', 'Beranda', 'url', null, '/', 0),
  ('b2222222-2222-2222-2222-222222222222', 'Tentang', 'url', null, '/tentang', 1)
on conflict (id) do nothing;
