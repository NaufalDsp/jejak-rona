# Implementation Plan — Jejak Rona

**Versi:** 1.0  
**Tanggal:** 5 Oktober 2026  
**Dokumen acuan:** `prd.md`, `design.md`

## Tujuan dan cara kerja

Dokumen ini memecah PRD menjadi tahap kecil yang dapat diselesaikan dan ditinjau
satu per satu. Nama produk publik adalah **Jejak Rona**; niche situs tetap
keputusan terbuka D0 di PRD.

- Kerjakan satu tahap pada satu waktu. Jangan mulai tahap berikutnya sebelum
  kriteria selesai tahap saat ini terpenuhi.
- Hindari build dan deploy pada tahap fondasi. Build lokal pertama dilakukan
  setelah fondasi situs publik dan konten contoh siap; deploy dilakukan pada
  tahap rilis.
- Validasi dibuat ringan dan langsung terkait perubahan: cek skema dengan contoh
  valid/tidak valid, jalankan alur manual singkat, dan uji kebijakan akses yang
  paling berisiko. Tidak perlu suite e2e atau infrastruktur test khusus untuk
  v1.
- Buat satu commit bermakna per tahap. Bila sebuah tahap terlalu besar untuk
  satu sesi, pecah menjadi beberapa commit kecil dengan awalan Conventional
  Commits yang sama.
- Jangan masukkan rahasia ke repositori. Simpan `.env.example` hanya berisi nama
  variabel dan nilai placeholder.

## Batas arsitektur

Gunakan monorepo sederhana sesuai struktur PRD. Clean Architecture diterapkan
sebagai batas dependensi, bukan sebagai banyak lapisan abstraksi: aturan
aplikasi tidak mengimpor framework, dan adapter konkret bergantung ke kontrak
yang dipakai use case.

```text
apps/site/
  src/
    domain/          # aturan dan tipe inti yang tidak terikat framework
    application/     # use case dan port/repository interfaces
    infrastructure/  # adapter Supabase, R2, Cloudflare
    pages/           # rute Astro publik dan halaman admin
    blocks/          # komponen tampilan blok yang dapat dipakai ulang
    admin/           # aplikasi React admin
  functions/api/     # adapter HTTP tipis untuk Pages Functions
packages/
  schema/            # skema Zod dan kontrak data lintas aplikasi
  tokens/            # token desain dan font
supabase/
  migrations/
  seed.sql
```

Aturan praktis:

- `domain` berisi aturan seperti validasi hero beranda dan batas jumlah blok;
  tidak mengenal Supabase, Astro, React, atau Cloudflare.
- `application` mengorkestrasi aksi seperti menyimpan draf, menerbitkan konten,
  dan menyimpan submission melalui port.
- `infrastructure` menerapkan port menggunakan SDK atau API layanan. Kunci
  service role hanya boleh berada di adapter server/function, tidak di bundel
  admin.
- `pages`, `blocks`, dan `admin` menangani presentasi dan meneruskan aksi ke use
  case. Komponen UI tidak melakukan query database secara langsung.
- `packages/schema` dan `packages/tokens` hanya menampung hal yang benar-benar
  dipakai lintas batas. Hindari paket atau abstraksi tambahan sebelum ada
  kebutuhan konkret.
- Astro menghasilkan HTML publik saat build dari konten terbit. Supabase tidak
  dipanggil oleh browser pengunjung.

## Tahapan implementasi

### Tahap 0 — Kunci keputusan dan lingkup

**Cakupan:** catat Jejak Rona sebagai nama; konfirmasi D0, D2, D4, D5, D6, dan
D7 di PRD sebelum tahap yang bergantung padanya. Bila belum ada keputusan niche,
pertahankan blok dan konten generik v1. Tetapkan default bahasa Indonesia dan
fallback hero foto jika belum ada alasan lain.

**Selesai bila:** asumsi yang masih terbuka ditulis di PRD, akun/layanan yang
dibutuhkan diketahui, dan daftar lingkup v1 tidak bertambah tanpa revisi
dokumen.

**Cek ringan:** tinjau silang nama, kebutuhan, dan desain pada tiga dokumen;
tidak ada pemeriksaan kode.

**Commit:** `docs: record Jejak Rona product decisions`

### Tahap 1 — Kerangka repositori dan aturan kualitas

**Cakupan:** buat struktur monorepo, konfigurasi TypeScript, pengelola
paket/workspaces, aturan format/lint dasar, `.gitignore`, `.env.example`, dan
README singkat berisi prasyarat serta cara kerja lokal. Buat placeholder
Astro/React seperlunya, tetapi jangan dulu membuat alur produk.

**Selesai bila:** direktori mengikuti struktur yang disepakati, rahasia
terabaikan oleh Git, dan perintah instalasi/developer dicatat. Belum perlu
menjalankan `astro build`, menyiapkan layanan cloud, atau deploy.

**Cek ringan:** tinjau struktur dan `git status`; pastikan tidak ada file
rahasia atau artefak hasil build yang masuk.

**Commit:** `chore: scaffold Jejak Rona workspace`

### Tahap 2 — Kontrak konten dan aturan domain

**Cakupan:** mulai `packages/schema` dengan skema Zod untuk `hero_media`,
`rich_text`, `image_full`, status halaman, dan metadata SEO minimum. Tambahkan
tipe inti dan aturan domain kecil, termasuk hero wajib bermedia untuk beranda.
Definisikan port repository yang diperlukan, tanpa implementasi Supabase.

**Selesai bila:** data blok punya satu kontrak yang bisa digunakan admin,
fungsi, dan situs publik; pesan validasi menjelaskan field yang perlu
diperbaiki.

**Cek ringan:** jalankan satu contoh `safeParse` valid dan satu invalid untuk
tiap aturan penting. Jangan menambah test harness besar hanya untuk ini.

**Commit:** `feat(schema): define page and block contracts`

### Tahap 3 — Database, akses, dan adapter data awal

**Cakupan:** buat migrasi Supabase untuk profil, halaman, revisi, dan pengaturan
minimum; aktifkan RLS; sediakan view publik yang hanya membuka konten terbit;
tambahkan seed contoh Jejak Rona. Implementasikan adapter server untuk membaca
halaman terbit dan use case baca yang digunakan Astro.

**Selesai bila:** migrasi dapat diterapkan di proyek pengembangan, seed tidak
mengandung konten referensi berhak cipta, dan pembacaan publik hanya melewati
view/kontrak publik.

**Cek ringan:** verifikasi satu halaman contoh dapat dibaca lewat view publik;
cek manual bahwa anon tidak membaca draf dan akun tanpa role tidak dapat
menulis. Jangan mengandalkan UI admin untuk membuktikan RLS.

**Commit:** `feat(data): add published content schema and RLS`

### Tahap 4 — Situs publik dan sistem desain

**Cakupan:** implementasikan token desain/font, layout publik, header/menu
dasar, footer, beranda dan halaman umum Astro. Gunakan fixture lokal terlebih
dahulu bila adapter konten belum siap. Bangun blok `hero_media`, `rich_text`,
dan `image_full`; terapkan responsivitas, fokus keyboard, alt, poster hero, dan
`prefers-reduced-motion` sesuai `design.md`.

**Selesai bila:** halaman publik tampil dengan konten contoh, hero memakai media
nyata/lokal yang berizin, blok tersusun benar di desktop dan seluler, serta
tidak bergantung pada JavaScript untuk isi pokok.

**Cek ringan:** buka halaman di browser pada lebar ponsel dan desktop; uji
navigasi keyboard dan reduced motion. Build lokal pertama boleh dilakukan
setelah tahap ini untuk menemukan kesalahan integrasi dasar, tetapi belum perlu
deploy.

**Commit:** `feat(site): build Jejak Rona public foundation`

### Tahap 5 — Autentikasi dan kerangka admin

**Cakupan:** buat rute `/admin`, login/logout/reset kata sandi melalui Supabase
Auth, pemeriksaan sesi, shell admin padat, dashboard sederhana, serta adapter
admin untuk halaman. Pastikan pemeriksaan peran dilakukan pada function/RLS,
bukan hanya dengan menyembunyikan kontrol di UI.

**Selesai bila:** admin dapat masuk, pengguna tanpa sesi diarahkan ke login, dan
pengguna tanpa role tidak bisa membaca atau mengubah data melalui permintaan
langsung.

**Cek ringan:** satu alur manual admin masuk/keluar dan satu percobaan akses
dengan sesi anon/tanpa role.

**Commit:** `feat(admin): add authentication and dashboard shell`

### Tahap 6 — Editor halaman dan draf

**Cakupan:** daftar halaman; buat/ubah/duplikat/hapus; editor blok dengan
tambah, hapus, duplikat, urutkan via tombol dan keyboard; form mengikuti skema
bersama; autosave dengan indikator status; pratinjau memakai komponen publik dan
sumber `draft`.

**Selesai bila:** editor dapat membuat halaman dari nol, menyimpan draf, memuat
ulang tanpa kehilangan simpanan, dan melihat preview tanpa mengubah konten
terbit.

**Cek ringan:** buat satu halaman berisi tiga tipe blok, ubah urutan, refresh,
lalu cocokkan preview dengan komponen publik. Cek validasi hero tanpa media.

**Commit:** `feat(editor): add draft page block editor`

### Tahap 7 — Media dan titik fokus

**Cakupan:** migrasi tabel media; adapter tanda tangan unggahan R2; validasi
otorisasi/tipe/ukuran di server; pemrosesan gambar di browser; unggahan video
tanpa transkoding; pustaka media, alt/kredit/lisensi, poster, fokus
desktop/seluler, dan pencegahan hapus media yang sedang dipakai.

**Selesai bila:** media dapat diunggah dan dipilih dari editor; file yang
melanggar batas ditolak dengan pesan jelas; media aktif tidak dapat dihapus;
varian gambar menghasilkan URL yang dapat dipakai blok.

**Cek ringan:** unggah satu gambar dan satu video uji yang berizin; coba satu
file di atas batas; pastikan R2 key tidak membocorkan rahasia dan alt wajib
untuk gambar informatif.

**Commit:** `feat(media): add R2 uploads and media library`

### Tahap 8 — Publish, revisi, navigasi, dan pengaturan

**Cakupan:** use case publish yang memvalidasi draf, menyalin snapshot ke
`published`, mencatat revisi, dan meminta build melalui deploy hook dengan
penggabungan/laju minimum. Tambahkan status build, pemulihan revisi ke draf,
navigasi, dan pengaturan dasar. Astro mengambil data terbit hanya pada waktu
build.

**Selesai bila:** draf tidak terlihat publik; publish yang lolos menghasilkan
snapshot terbit dan job build; publish gagal tidak mengganti versi situs yang
sedang tayang; revisi dapat dipulihkan sebagai draf.

**Cek ringan:** jalankan satu publish valid dan satu invalid (mis. hero kosong),
tinjau catatan revisi, lalu pulihkan revisi. Simulasikan kegagalan hook tanpa
menghapus konten terbit saat ini.

**Commit:** `feat(publish): add publishing workflow and revisions`

### Tahap 9 — Artikel, kontak, dan SEO

**Cakupan:** daftar/detail artikel, tag, estimasi waktu baca, sampul, formulir
kontak melalui Pages Function, pembatasan laju dan honeypot, submission di
admin, metadata SEO, Open Graph, canonical, sitemap, robots, data terstruktur,
dan halaman 404.

**Selesai bila:** artikel terbit masuk ke output statis; formulir valid
tersimpan dan spam sederhana ditolak; metadata halaman serta sitemap mengikuti
konten terbit.

**Cek ringan:** buat satu artikel, kirim formulir valid dan invalid, lalu
periksa metadata dan sitemap di halaman hasil.

**Commit:** `feat(content): add articles contact form and SEO`

### Tahap 10 — Pengerasan, backup, dan rilis

**Cakupan:** review keamanan RLS dan rahasia; cek aksesibilitas
keyboard/kontras/reduced motion; konfigurasi keepalive dan backup; Cloudflare
Pages, variabel lingkungan, domain, Analytics; dokumentasi editor dan panduan
pemulihan.

**Selesai bila:** checklist F1–F12 PRD yang termasuk v1 selesai, situs tayang
dengan konten statis, alur publish memperbarui situs, dan ada bukti backup dapat
dipulihkan.

**Cek ringan:** smoke test beranda, satu halaman, satu artikel, admin login,
publish, formulir kontak, serta satu uji RLS. Lighthouse cukup sebagai
pemeriksaan rilis, bukan gerbang untuk setiap commit.

**Commit:** `chore(release): harden and deploy Jejak Rona`

## Peta terhadap roadmap PRD

| Tahap plan | Milestone PRD utama          |
| ---------- | ---------------------------- |
| 0–1        | Persiapan M0                 |
| 2–3        | M0, fondasi kontrak dan data |
| 4          | M1                           |
| 5–6        | M2                           |
| 7          | M3                           |
| 8          | M4                           |
| 9          | M5                           |
| 10         | M6                           |

Kriteria penerimaan deploy yang tercantum pada M0 PRD (Astro membaca data
Supabase dan tayang di `pages.dev`) tetap berlaku, tetapi diverifikasi setelah
aplikasi publik siap pada Tahap 10. Dengan begitu, fondasi dikerjakan lebih awal
tanpa memaksa build atau deploy di awal.

## Batas selesai v1

- Tidak menambah multi-bahasa, e-commerce, komentar, penjadwalan, atau tipe blok
  di luar lingkup PRD.
- Tidak memproses/transkode media di server.
- Tidak menaruh akses database langsung di komponen UI.
- Tidak mengejar coverage angka tertentu; utamakan aturan domain dan batas
  keamanan yang berisiko.
- Jangan deploy sebelum tahap rilis; jangan menahan pekerjaan fondasi demi angka
  Lighthouse yang hanya relevan setelah halaman dan media nyata tersedia.
