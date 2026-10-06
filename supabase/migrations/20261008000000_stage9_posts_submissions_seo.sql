-- ==============================================================================
-- Migrasi Tahap 9: Artikel (Posts), Submissions Formulir Kontak, & SEO
-- ==============================================================================

-- 1. TABEL POSTS (Artikel Editorial Terstruktur)
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text,
  cover_media_id uuid references public.media(id) on delete set null,
  tags text[] not null default '{}',
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  draft jsonb not null default '{"blocks": []}'::jsonb,
  published jsonb,
  reading_time_minutes integer not null default 1,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists posts_slug_idx on public.posts (slug);
create index if not exists posts_status_idx on public.posts (status);
create index if not exists posts_published_at_idx on public.posts (published_at desc);
create index if not exists posts_tags_idx on public.posts using gin (tags);

alter table public.posts enable row level security;

-- Publik hanya bisa membaca artikel yang sudah terbit
drop policy if exists "posts_public_read" on public.posts;
create policy "posts_public_read" on public.posts
  for select using (status = 'published');

-- Staf bisa membaca, membuat, dan mengubah semua artikel
drop policy if exists "posts_staff_manage" on public.posts;
create policy "posts_staff_manage" on public.posts
  for all to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- 2. TABEL SUBMISSIONS (Pesan dari Formulir Kontak Publik)
create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  read_at timestamptz,
  ip_hash text,
  created_at timestamptz not null default now()
);

create index if not exists submissions_created_at_idx on public.submissions (created_at desc);
create index if not exists submissions_read_at_idx on public.submissions (read_at);

alter table public.submissions enable row level security;

-- Publik (termasuk anon) bisa mengirim formulir kontak
drop policy if exists "submissions_anon_insert" on public.submissions;
create policy "submissions_anon_insert" on public.submissions
  for insert to anon, authenticated
  with check (
    length(trim(name)) >= 2 and
    length(trim(email)) >= 5 and
    length(trim(message)) >= 10 and
    length(trim(message)) <= 3000
  );

-- Staf bisa membaca dan mengelola kiriman kontak
drop policy if exists "submissions_staff_manage" on public.submissions;
create policy "submissions_staff_manage" on public.submissions
  for all to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- 3. BENIH AWAL CONTOH ARTIKEL EDITORIAL NUSANTARA
insert into public.posts (
  id,
  slug,
  title,
  excerpt,
  tags,
  status,
  draft,
  published,
  reading_time_minutes,
  published_at
)
values
  (
    'c1111111-1111-4000-8000-000000000001',
    'ritme-hening-danau-toba',
    'Ritme Hening Danau Toba: Refleksi di Atas Kaldera',
    'Menatap riak air purba yang memeluk Pulau Samosir saat fajar menyingsing dalam kesunyian yang khidmat.',
    array['Perjalanan', 'Nusantara', 'Fotografi'],
    'published',
    '{
      "blocks": [
        {
          "id": "blk-toba-1",
          "type": "rich_text",
          "heading": "Keheningan di Balik Kabut Kaldera",
          "content": "Kabut perlahan tersibak di atas permukaan air kaldera purba Danau Toba, memperlihatkan siluet perahu nelayan yang meluncur tanpa suara.\n\nDanau Toba menyimpan ritme yang berbeda dari tempat lain di Nusantara. Kedalaman airnya bukan sekadar bentang alam vulkanik, melainkan ruang jeda dari riuh keseharian yang menuntut kita untuk sejenak berhenti dan mendengar ritme alam."
        },
        {
          "id": "blk-toba-2",
          "type": "rich_text",
          "heading": "Gradasi Warna di Tepian Holbung",
          "content": "Dari sudut Desa Simanindo hingga bentangan bukit Holbung, setiap rona cahaya fajar menghadirkan gradasi biru toska dan pantulan emas yang mengikat rasa takjub dalam keheningan yang utuh."
        }
      ]
    }'::jsonb,
    '{
      "blocks": [
        {
          "id": "blk-toba-1",
          "type": "rich_text",
          "heading": "Keheningan di Balik Kabut Kaldera",
          "content": "Kabut perlahan tersibak di atas permukaan air kaldera purba Danau Toba, memperlihatkan siluet perahu nelayan yang meluncur tanpa suara.\n\nDanau Toba menyimpan ritme yang berbeda dari tempat lain di Nusantara. Kedalaman airnya bukan sekadar bentang alam vulkanik, melainkan ruang jeda dari riuh keseharian yang menuntut kita untuk sejenak berhenti dan mendengar ritme alam."
        },
        {
          "id": "blk-toba-2",
          "type": "rich_text",
          "heading": "Gradasi Warna di Tepian Holbung",
          "content": "Dari sudut Desa Simanindo hingga bentangan bukit Holbung, setiap rona cahaya fajar menghadirkan gradasi biru toska dan pantulan emas yang mengikat rasa takjub dalam keheningan yang utuh."
        }
      ]
    }'::jsonb,
    3,
    now() - interval '2 days'
  ),
  (
    'c2222222-2222-4000-8000-000000000002',
    'jejak-tenun-ikat-sumba',
    'Jejak Tenun Ikat Sumba: Benang Tradisi dan Cerita Leluhur',
    'Di balik motif kuda dan kura-kura, tersemat simbol status, doa perlindungan, dan ketelatenan pewarna alami tarum serta mengkudu.',
    array['Budaya', 'Kriya', 'Tradisi'],
    'published',
    '{
      "blocks": [
        {
          "id": "blk-sumba-1",
          "type": "rich_text",
          "heading": "Aroma Alami di Beranda Prailiu",
          "content": "Aroma daun nila dan kulit akar mengkudu menguar lembut dari beranda rumah panggung kayu di Prailiu, Sumba Timur.\n\nSetiap helai kain tenun ikat yang lahir dari tangan perempuan Sumba adalah narasi panjang tentang ketabahan hidup. Membutuhkan waktu berbulan-bulan hingga bertahun-tahun untuk menyelesaikan selembar kain hinggi atau lau."
        },
        {
          "id": "blk-sumba-2",
          "type": "rich_text",
          "heading": "Mengikat Ingatan Leluhur",
          "content": "Menenun bukan sekadar merangkai benang lungsi dan pakan, melainkan mengikat ingatan para leluhur agar tetap hidup dan bermakna di tengah perubahan zaman."
        }
      ]
    }'::jsonb,
    '{
      "blocks": [
        {
          "id": "blk-sumba-1",
          "type": "rich_text",
          "heading": "Aroma Alami di Beranda Prailiu",
          "content": "Aroma daun nila dan kulit akar mengkudu menguar lembut dari beranda rumah panggung kayu di Prailiu, Sumba Timur.\n\nSetiap helai kain tenun ikat yang lahir dari tangan perempuan Sumba adalah narasi panjang tentang ketabahan hidup. Membutuhkan waktu berbulan-bulan hingga bertahun-tahun untuk menyelesaikan selembar kain hinggi atau lau."
        },
        {
          "id": "blk-sumba-2",
          "type": "rich_text",
          "heading": "Mengikat Ingatan Leluhur",
          "content": "Menenun bukan sekadar merangkai benang lungsi dan pakan, melainkan mengikat ingatan para leluhur agar tetap hidup dan bermakna di tengah perubahan zaman."
        }
      ]
    }'::jsonb,
    4,
    now() - interval '1 day'
  )
on conflict (slug) do nothing;
