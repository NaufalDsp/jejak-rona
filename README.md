# Jejak Rona — Editorial CMS & Static Site

Situs editorial berbasis CMS dengan tampilan visual terkurasi (hero foto/video
layar penuh, tipografi Cormorant Garamond & Hanken Grotesk, HTML statis via
Astro, panel admin React SPA, dan Supabase untuk autentikasi & konten).

## Struktur Monorepo (Clean Architecture)

```text
/
├─ apps/
│  └─ site/                 # Astro (publik) + /admin (React SPA) + Pages Functions
│     ├─ src/
│     │  ├─ domain/         # Entity & aturan bisnis murni (tanpa ketergantungan framework)
│     │  ├─ application/    # Use cases, ports & repository interfaces
│     │  ├─ infrastructure/ # Implementasi adapter (Supabase, R2, Cloudflare)
│     │  ├─ blocks/         # Komponen blok tampilan (publik & preview)
│     │  ├─ pages/          # Rute publik Astro & rute /admin
│     │  └─ admin/          # React SPA panel admin
│     └─ functions/api/     # Cloudflare Pages Functions
├─ packages/
│  ├─ tokens/               # Token desain CSS & variabel tema (design.md)
│  └─ schema/               # Skema Zod & tipe bersama lintas aplikasi
├─ supabase/
│  ├─ migrations/           # Skema database Postgres & aturan RLS
│  └─ seed.sql              # Data awal Jejak Rona
├─ design.md                # Spesifikasi desain & tipografi
├─ prd.md                   # Product Requirements Document
└─ implementation-plan.md   # Panduan implementasi bertahap
```

## Prasyarat Lingkungan

- Node.js >= 20.x
- npm atau pnpm
- Akun Supabase (Tingkat Gratis)
- Akun Cloudflare Pages & R2 (Tingkat Gratis)

## Konfigurasi Lingkungan

Salin `.env.example` menjadi `.env`:

```bash
cp .env.example .env
```

Isi variabel sesuai kredensial Supabase dan Cloudflare.

### Supabase lokal

Pasang Supabase CLI dan Docker Desktop, lalu jalankan dari root repo:

```bash
npm run supabase:start
npm run supabase:status
```

CLI menerapkan `supabase/migrations` dan `supabase/seed.sql`. Salin URL lokal
dan anon key dari keluaran status ke variabel `SUPABASE_URL`,
`SUPABASE_ANON_KEY`, `PUBLIC_SUPABASE_URL`, dan `PUBLIC_SUPABASE_ANON_KEY` di
`.env`. Untuk mengulang database lokal dari awal, gunakan
`npm run supabase:reset`; perintah ini menghapus data database lokal.

Pendaftaran publik dinonaktifkan. Buat/invite user pertama lewat Supabase Studio
(Auth → Users), lalu jadikan admin dari SQL Editor setelah trigger membuat
profil:

```sql
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'email-admin-anda');
```

Jangan pernah menaruh `SUPABASE_SERVICE_ROLE_KEY` di variabel `PUBLIC_*` atau di
kode browser. Gunakan hanya di server/function tepercaya.

## Status Rilis v1.0 (Lengkap Tahap 1–10)

Sistem telah menyelesaikan seluruh cakupan Milestone M0–M6 PRD:

- [x] **Fondasi & Desain Sistem**: Token desain CSS (`packages/tokens`),
      tipografi Cormorant Garamond & Hanken Grotesk.
- [x] **Panel Redaksi (Admin)**: Editor 3-zona dense (daftar blok 240px, live
      preview 1fr, inspektur properti 340px).
- [x] **Pustaka Media & Titik Fokus**: Upload gambar/video, titik fokus
      interaktif (16:9 vs 9:16), proteksi hapus media aktif.
- [x] **Alur Penerbitan & Revisi**: Validasi pra-terbit ketat, riwayat snapshot
      revisi (maks 20), pemulihan draf, pelacak status build.
- [x] **Artikel & Arsip Editorial**: Daftar artikel (list & grid 4:5), pembacaan
      68ch, kalkulasi otomatis waktu baca, filter topik.
- [x] **Formulir Kontak**: Anti-spam honeypot, Pages Function, pembatasan laju,
      pesan masuk di admin.
- [x] **SEO & Metadata**: JSON-LD Schema (Organization & Article), Open Graph,
      Twitter Cards, Sitemap XML dinamis, Robots.txt, Halaman 404.
- [x] **Pengerasan & Keamanan**: Row Level Security (RLS) pada seluruh tabel,
      CI/CD GitHub Actions, keepalive ping, dan skrip pencadangan data.

## Skrip Operasional & Pencadangan

```bash
# Validasi Tipe & Build Statis
npm run check-types
npx --workspace=@jejak-rona/site astro check
npm --workspace=@jejak-rona/site run build

# Pencadangan Database (Windows PowerShell / Linux)
./scripts/backup-db.ps1
./scripts/backup-db.sh
```

## Dokumentasi Tambahan

- [Panduan Penggunaan Editor](docs/editor-guide.md)
- [Panduan Kesiapan Bencana & Pemulihan](docs/disaster-recovery.md)
- [Panduan Pemulihan Data Cadangan](scripts/restore-guide.md)

## Prinsip Pengembangan

1. **Clean Code & Clean Architecture:** Domain murni tidak boleh bergantung pada
   Supabase/Astro/React. Akses data dilakukan lewat antarmuka port repository.
2. **Tanpa Build di Awal:** Pengembangan dilakukan bertahap per modul dan
   kontrak data. Build lokal baru dilakukan ketika fondasi publik siap.
3. **Statis di Depan, Dinamis di Belakang:** Pengunjung publik disajikan HTML
   statis tanpa koneksi langsung ke database.
