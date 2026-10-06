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

## Prinsip Pengembangan

1. **Clean Code & Clean Architecture:** Domain murni tidak boleh bergantung pada
   Supabase/Astro/React. Akses data dilakukan lewat antarmuka port repository.
2. **Tanpa Build di Awal:** Pengembangan dilakukan bertahap per modul dan
   kontrak data. Build lokal baru dilakukan ketika fondasi publik siap.
3. **Statis di Depan, Dinamis di Belakang:** Pengunjung publik disajikan HTML
   statis tanpa koneksi langsung ke database.
