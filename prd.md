# PRD — Website Jejak Rona (CMS)

**Versi:** 1.0 **Penyusun:** Naufal **Tanggal:** 5 Oktober 2026 **Status:** Draf
untuk dieksekusi **Nama situs:** Jejak Rona **Dokumen pasangan:** `design.md`,
`implementation-plan.md`

> **Asumsi dokumen.** Nama situs ditetapkan sebagai **Jejak Rona**. Tujuan dan
> niche situs belum ditentukan, jadi PRD ini ditulis untuk **situs editorial
> berbasis CMS** (halaman merek/profil + artikel/berita) yang konten dan
> tampilannya dikelola lewat panel admin sendiri. Hal yang masih bergantung pada
> niche (bahasa, warna final, tipe konten khusus) ditandai sebagai keputusan
> terbuka di bagian 17. Strukturnya sengaja netral supaya bisa dipakai untuk
> portofolio, profil perusahaan, destinasi, komunitas, atau katalog.

---

## 1. Ringkasan

Membangun dari nol sebuah situs web dengan **CMS buatan sendiri**: pengelola
login ke panel admin, menyusun halaman dari blok-blok konten, mengunggah
foto/video, menulis artikel, lalu menekan **Publish** — dan situs publik
terbarui. Seluruhnya berjalan di **tingkat gratis** layanan hosting, tanpa
server yang harus dirawat.

Dua keputusan produk yang mengikat seluruh dokumen ini:

1. **Hero selalu berisi foto atau video.** Bukan ilustrasi, bukan gradien, bukan
   kartu fitur. CMS menolak mempublikasikan beranda yang hero-nya tidak punya
   media. Ini aturan sistem, bukan sekadar saran desain.
2. **Situs publik adalah HTML statis.** Pengunjung tidak pernah menyentuh
   database. Situs jadi cepat, tahan lonjakan trafik, dan kebal terhadap batasan
   tingkat gratis (database di-pause, kuota request). Hanya panel admin yang
   bergantung pada layanan yang hidup.

---

## 2. Masalah & tujuan

### 2.1 Masalah

- Template jadi (tema WordPress populer, builder drag-and-drop) menghasilkan
  tampilan yang mudah dikenali dan sulit disesuaikan tanpa merusaknya.
- Hosting WordPress berbayar; hosting gratisnya biasanya lambat, beriklan, atau
  dibatasi.
- Headless CMS siap pakai (Strapi, Directus) butuh server yang selalu hidup; di
  hosting gratis ia tidur atau tidak tersedia.
- Situs dengan hero foto/video penuh layar sering lambat di seluler karena video
  berat dan gambar tak dioptimalkan.

### 2.2 Tujuan

| Tujuan                       | Ukuran keberhasilan                                                           |
| ---------------------------- | ----------------------------------------------------------------------------- |
| Biaya operasional nol        | Semua layanan berjalan di tingkat gratis                                      |
| Hero yang memukau tapi cepat | LCP beranda < 2,5 detik di 4G seluler dengan hero video aktif                 |
| Editor non-teknis mandiri    | Editor bisa membuat dan menerbitkan halaman tanpa bantuan developer           |
| Tampilan tidak generik       | Setiap blok mengikuti `design.md`; tidak ada komponen bergaya template bawaan |
| Dari nol sampai deploy       | Satu orang bisa menyelesaikan v1 sampai tayang mengikuti bagian 19            |

---

## 3. Pengguna & peran

| Peran          | Siapa          | Bisa apa                                                                                    |
| -------------- | -------------- | ------------------------------------------------------------------------------------------- |
| **Pengunjung** | Publik         | Membaca situs, mengirim formulir kontak, mengatur preferensi cookie                         |
| **Editor**     | Pengisi konten | Membuat/mengubah halaman, artikel, media; menyimpan draf; publish                           |
| **Admin**      | Pemilik situs  | Semua hak Editor + kelola pengguna, pengaturan situs, navigasi, log audit, pemulihan revisi |

Pengunjung diasumsikan terbanyak dari ponsel. Editor bekerja dari laptop, tetapi
admin tetap harus bisa dipakai di tablet.

---

## 4. Metrik

| Ukuran                                                | Target v1                     |
| ----------------------------------------------------- | ----------------------------- |
| LCP beranda, 4G seluler                               | < 2,5 detik                   |
| CLS beranda                                           | < 0,05                        |
| INP                                                   | < 200 ms                      |
| JavaScript awal halaman publik (terkompresi)          | < 100 KB                      |
| Berat hero                                            | poster ≤ 250 KB, video ≤ 6 MB |
| Waktu dari Publish sampai situs terbarui              | < 4 menit                     |
| Lighthouse mobile (Performance / Accessibility / SEO) | ≥ 90 / ≥ 95 / ≥ 95            |
| Build Cloudflare Pages terpakai per bulan             | < 150 dari 500 jatah          |
| Penggunaan database                                   | < 300 MB dari 500 MB          |

---

## 5. Prinsip produk

1. **Media adalah isi, teks adalah pendamping.** Layout dirancang di sekitar
   foto dan video; teks menempel padanya, bukan sebaliknya.
2. **Setiap bidang di CMS punya alasan.** Tidak ada kolom "warna latar",
   "padding", atau "animasi" yang bisa diubah bebas. Editor memilih dari variasi
   yang sudah dirancang. Kebebasan tak terbatas adalah jalan tercepat menuju
   tampilan yang jelek.
3. **Statis di depan, dinamis di belakang.** Apa pun yang bisa dihitung saat
   build tidak dihitung saat pengunjung datang.
4. **Gagal jelas, bukan diam.** Unggahan terlalu besar, hero tanpa media, atau
   build gagal harus menghasilkan pesan yang bisa ditindaklanjuti.
5. **Hemat kuota seperti hemat uang.** Setiap fitur dinilai juga dari seberapa
   banyak ia menghabiskan jatah gratis.

---

## 6. Lingkup

### 6.1 Masuk lingkup v1

- Panel admin: login, dashboard, kelola halaman, artikel, media, navigasi,
  pengaturan situs, pengguna.
- Editor blok dengan pratinjau langsung.
- Alur draf → publish, riwayat revisi, pemulihan.
- Pipeline media: gambar (otomatis diubah ke beberapa ukuran dan WebP/AVIF) dan
  video (validasi ukuran/durasi).
- Hero media (foto atau video loop) dengan titik fokus per perangkat.
- Situs publik statis: beranda, halaman umum, daftar dan detail artikel, halaman
  kontak.
- Formulir kontak yang tersimpan dan terbaca di admin.
- Banner persetujuan cookie.
- SEO dasar: judul/deskripsi, Open Graph, sitemap, robots, data terstruktur.
- Satu bahasa (lihat D2).

### 6.2 Di luar lingkup v1

- Multi-bahasa.
- Komentar, keanggotaan, akun pengunjung.
- E-commerce dan pembayaran.
- Editor visual drag-and-drop bebas.
- Transkoding video di server (tidak ada layanan gratis yang layak; video
  dikompres sebelum diunggah).
- Penjadwalan publish otomatis.
- Alur persetujuan multi-tahap.

---

## 7. Arsitektur & stack gratis

### 7.1 Gambaran umum

```
            Editor / Admin
                  │  (React SPA di /admin)
                  ▼
   ┌──────────────────────────────┐
   │ Supabase (Free)              │   Auth + Postgres + RLS
   │  profiles, pages, posts,     │
   │  revisions, media, forms     │
   └───────┬──────────────────────┘
           │ Publish
           ▼
   Pages Function /api/publish ──► Deploy Hook ──► Build Astro
                                                      │ (baca konten published)
                                                      ▼
                                          Cloudflare Pages (HTML statis)
                                                      ▲
   Media (gambar/video) ─────────► Cloudflare R2 ─────┘ (domain media)
                                                      │
                                                  Pengunjung
```

### 7.2 Pilihan teknologi

| Lapisan         | Pilihan                                                                                | Alasan                                                                                               |
| --------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Situs publik    | **Astro** (output statis) + React hanya bila perlu                                     | HTML statis nyaris tanpa JS; React tetap dipakai di pulau interaktif (menu, pemutar video, formulir) |
| Panel admin     | **React + Vite + TypeScript** (SPA di `/admin`), TanStack Query, React Hook Form + Zod | Sesuai stack yang sudah kamu kuasai; Zod dipakai juga untuk skema blok                               |
| Auth & database | **Supabase** (Postgres + Auth + RLS)                                                   | Satu layanan gratis untuk login dan data; RLS menggantikan backend kustom                            |
| Hosting         | **Cloudflare Pages**                                                                   | Build statis, domain kustom, SSL, CDN global                                                         |
| Fungsi server   | **Pages Functions**                                                                    | Hanya untuk tiga hal: publish, tanda tangan unggahan R2, terima formulir                             |
| Media           | **Cloudflare R2**                                                                      | Penyimpanan besar tanpa biaya egress; cocok untuk video                                              |
| Analitik        | Cloudflare Web Analytics                                                               | Tanpa cookie                                                                                         |
| Repositori & CI | GitHub + GitHub Actions                                                                | Cron keepalive, backup, lint dan tipe                                                                |

> Backend Python tidak dipakai di v1 karena hosting gratis yang menjalankan
> proses Python selalu hidup hampir tidak ada (yang ada akan tidur). Lihat D1
> bila kamu tetap ingin Python.

### 7.3 Batas tingkat gratis yang menentukan desain

Dicek lewat pencarian pada 5 Oktober 2026. Angka seperti ini berubah, jadi **cek
ulang di dashboard masing-masing sebelum mulai**.

| Layanan                                | Batas yang relevan                                                                                                                                                                            | Dampak ke desain                                                                                            |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Supabase Free                          | 2 proyek, database 500 MB, egress 5 GB/bulan, 50.000 MAU, **proyek di-pause setelah sekitar seminggu tanpa aktivitas**. Kuota file storage dilaporkan berbeda antar sumber (500 MB atau 1 GB) | Situs publik tidak membaca database saat runtime; media tidak disimpan di Supabase Storage; perlu keepalive |
| Cloudflare Pages                       | 500 build/bulan, 1 build bersamaan, timeout build 20 menit, 20.000 file per versi                                                                                                             | Publish digabung dan dibatasi lajunya                                                                       |
| Workers Free (dipakai Pages Functions) | 100.000 request/hari, 10 ms CPU per invocation                                                                                                                                                | Fungsi sangat ringan; tidak ada pemrosesan gambar di server                                                 |
| Cloudflare R2                          | 10 GB penyimpanan, 1 juta operasi tulis dan 10 juta operasi baca per bulan, egress gratis                                                                                                     | Cukup untuk puluhan video loop pendek. Aktivasi R2 bisa meminta metode pembayaran terdaftar (lihat D4)      |

### 7.4 Strategi menghadapi batas

- **Database di-pause.** Situs publik statis sehingga tidak terpengaruh. Untuk
  admin, GitHub Actions menjalankan kueri ringan tiap 3 hari. Bila tetap
  ter-pause, admin menampilkan layar "database sedang bangun" dengan tombol coba
  lagi.
- **Jatah build.** Draf tidak memicu build. Publish dibatasi: minimal 3 menit
  antar build; beberapa Publish dalam jendela itu digabung jadi satu. Dashboard
  menampilkan "build terpakai bulan ini: X / 500".
- **Egress.** Media lewat R2, bukan Supabase. Egress Supabase hanya untuk lalu
  lintas admin.
- **Ukuran database.** Tidak ada biner di Postgres. Revisi dibatasi 20 terakhir
  per entitas.

---

## 8. Alur data utama

### 8.1 Menyunting dan menerbitkan

1. Editor membuka halaman → konten diambil dari kolom `draft`.
2. Setiap perubahan disimpan otomatis ke `draft` (diredam 2 detik).
3. Editor menekan **Publish** → Pages Function `/api/publish` memeriksa token
   sesi dan peran.
4. Fungsi memvalidasi isi: hero berisi media, bidang wajib terisi, tautan
   internal valid.
5. Bila lolos: `draft` disalin ke `published`, satu baris `revisions` ditulis,
   lalu build dipicu lewat deploy hook (dengan aturan laju).
6. Astro membaca semua konten `published` saat build dan menghasilkan HTML.
7. Admin menampilkan status build: antre → membangun → tayang / gagal.

### 8.2 Pratinjau

Rute `/admin/preview/:id` merender halaman dari `draft` memakai komponen blok
yang sama dengan situs publik, sehingga yang dilihat editor identik dengan hasil
akhir.

---

## 9. Model data

| Tabel           | Kolom penting                                                                                                                                                      | Catatan                                                                            |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| `profiles`      | id (= auth.users.id), name, role (`admin`/`editor`), created_at                                                                                                    | Peran dibaca RLS                                                                   |
| `pages`         | id, slug, title, status, draft (jsonb), published (jsonb), seo (jsonb), is_home, updated_by, updated_at, published_at                                              | `draft`/`published` berisi daftar blok berurutan                                   |
| `posts`         | id, slug, title, excerpt, cover_media_id, tags (text[]), status, draft, published, published_at, updated_at                                                        | Isi artikel berupa blok teks terstruktur                                           |
| `media`         | id, kind (`image`/`video`), r2_key, filename, mime, bytes, width, height, duration_s, alt, credit, focal_x, focal_y, variants (jsonb), poster_media_id, created_by | `variants` memuat ukuran dan format yang tersedia                                  |
| `nav_items`     | id, label, target_type (`page`/`url`), target_id, url, position, parent_id                                                                                         | Maksimal dua tingkat                                                               |
| `site_settings` | key, value (jsonb)                                                                                                                                                 | Nama situs, wordmark, deskripsi default, tautan sosial, footer, teks banner cookie |
| `revisions`     | id, entity, entity_id, snapshot (jsonb), created_by, created_at                                                                                                    | Dibatasi 20 per entitas                                                            |
| `submissions`   | id, name, email, message, created_at, read_at, ip_hash                                                                                                             | Dari formulir kontak                                                               |
| `audit_log`     | id, actor, action, entity, entity_id, created_at                                                                                                                   | Tidak bisa diubah dari klien                                                       |

```sql
alter table pages enable row level security;

-- Build statis (kunci anon) hanya boleh membaca yang sudah terbit,
-- lewat view yang hanya mengekspos kolom "published"
create view pages_public as
  select id, slug, title, published, seo, is_home, published_at
  from pages where status = 'published';

create policy "pages_staff_all" on pages
  for all to authenticated
  using (exists (select 1 from profiles p
                 where p.id = auth.uid() and p.role in ('admin','editor')))
  with check (exists (select 1 from profiles p
                 where p.id = auth.uid() and p.role in ('admin','editor')));
```

> Kolom `draft` tidak boleh terbaca oleh anon. Karena itu build membaca view
> `pages_public`, bukan tabel mentah.

---

## 10. Pustaka blok

Setiap blok punya skema Zod, varian terbatas, dan satu komponen. Editor memilih
varian, bukan nilai CSS.

| Blok             | Bidang                                                                                                                                                                          | Varian                  | Aturan                                                                          |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- | ------------------------------------------------------------------------------- |
| **`hero_media`** | baris_1, baris_2, subteks, label_cta, tautan_cta, media (foto/video), poster, media_seluler (opsional), titik_fokus (desktop & seluler), kekuatan_scrim, video_penuh (opsional) | `bertingkat`, `kiri`    | **Media wajib.** Baris 1 dan 2 maks 18 karakter masing-masing; subteks maks 140 |
| `text_split`     | judul, isi, media, sisi_media                                                                                                                                                   | `kiri`, `kanan`         | Media wajib; rasio dipilih dari 3:2, 4:5, 1:1                                   |
| `image_full`     | media, keterangan                                                                                                                                                               | `penuh`, `dalam-margin` | Alt wajib                                                                       |
| `gallery`        | 3–9 media                                                                                                                                                                       | `rapat`, `berjenjang`   | Satu tampilan besar saat diklik                                                 |
| `quote`          | kutipan, sumber, media_latar (opsional)                                                                                                                                         | `polos`, `di-atas-foto` | Maks 220 karakter                                                               |
| `video_embed`    | url atau media, poster, judul                                                                                                                                                   | —                       | Tidak memuat pihak ketiga sebelum diklik                                        |
| `rich_text`      | heading, paragraf, daftar, tautan                                                                                                                                               | —                       | Lebar baca maksimum 68 karakter                                                 |
| `cta_band`       | judul, label, tautan, media_latar                                                                                                                                               | —                       | Maks satu per halaman                                                           |
| `post_list`      | jumlah (3–6), filter tag                                                                                                                                                        | `daftar`, `grid`        | Dibangun saat build                                                             |
| `contact_form`   | judul, teks_pengantar                                                                                                                                                           | —                       | Satu per situs                                                                  |

**Aturan lintas blok:** tidak ada blok kartu tiga-kolom berikon, tidak ada blok
statistik angka besar di tengah, tidak ada blok "fitur kami". Pustaka ini
sengaja tidak menyediakan pola-pola itu.

---

## 11. Spesifikasi fitur

### F1 — Autentikasi & peran — _M2_

- Login email + kata sandi lewat Supabase Auth; pendaftaran publik
  dinonaktifkan, admin mengundang pengguna.
- Rute `/admin/*` mengalihkan ke login bila tidak ada sesi; fungsi server
  memeriksa ulang peran, bukan percaya klien.
- Pemulihan kata sandi lewat email.
- **Diterima bila:** pengguna tanpa peran tidak bisa membaca atau menulis data
  apa pun, termasuk lewat panggilan API langsung.

### F2 — Dashboard — _M2_

- Halaman draf vs terbit, 5 perubahan terakhir, formulir belum dibaca, status
  build terakhir, build terpakai bulan ini, perkiraan database terpakai.
- Tanpa grafik dekoratif; hanya angka yang bisa ditindaklanjuti.

### F3 — Kelola halaman — _M2_

- Daftar dengan status (draf / terbit / terbit dengan perubahan belum
  diterbitkan), pencarian, filter.
- Buat, duplikat, ubah slug (peringatan bila ada tautan masuk), hapus
  (konfirmasi ketik nama).
- Tepat satu halaman bertanda beranda.

### F4 — Editor blok — _M2_

- Tambah blok dari pustaka, urutkan dengan seret atau tombol naik/turun (wajib
  bisa lewat papan ketik), duplikat, hapus.
- Panel samping hanya menampilkan bidang milik blok yang dipilih, dengan
  validasi langsung.
- Pratinjau di sisi kanan memakai komponen asli, dengan sakelar ponsel / tablet
  / desktop.
- Simpan otomatis ke draf, dengan penanda tersimpan / menyimpan / gagal.
- Undo/redo sampai 30 langkah dalam sesi.

### F5 — Hero media — _M1 (publik), M2 (editor)_

- **Foto:** dibuatkan varian lebar 640/1280/1920/2560 dalam AVIF dan WebP, plus
  placeholder blur kecil.
- **Video loop:** MP4 H.264 (wajib), WebM (opsional); tanpa suara; maks 6 MB,
  6–15 detik, maks 1920×1080; poster dari bingkai pilihan atau unggahan
  terpisah.
- **Video penuh (opsional):** tombol "Putar video" membuka dialog berisi video
  penuh (berkas R2 atau YouTube/Vimeo). Tidak dimuat sebelum diklik.
- **Titik fokus:** editor mengklik titik penting pada foto; dipakai sebagai
  `object-position` terpisah untuk desktop dan seluler agar subjek tidak
  terpotong.
- **Media seluler (opsional):** rasio potret berbeda untuk layar sempit.
- **Scrim:** tiga tingkat (ringan / sedang / kuat). Admin memperingatkan bila
  kontras teks di titik terburuk < 4,5:1.
- **Perilaku pemutaran:** poster tampil lebih dulu dan menjadi elemen LCP
  (`preload`, `fetchpriority="high"`); video mulai setelah halaman interaktif;
  dihentikan bila `prefers-reduced-motion`, `Save-Data`, atau koneksi lambat;
  tombol jeda selalu tersedia.
- **Validasi publish:** beranda tanpa media hero tidak bisa diterbitkan, dan
  pesannya menyebut persis apa yang kurang.

### F6 — Pustaka media — _M3_

- Unggah seret-lepas, banyak berkas sekaligus, dengan bilah kemajuan per berkas.
- Gambar diproses **di peramban** sebelum unggah (ubah ukuran, konversi, hitung
  dimensi), karena fungsi gratis tidak boleh memproses gambar. Alt wajib sebelum
  gambar bisa dipakai di blok.
- Video: peramban memeriksa ukuran, durasi, dimensi; berkas yang melebihi batas
  ditolak dengan saran kompresi spesifik (mis. perintah ffmpeg).
- Unggah ke R2 lewat URL bertanda tangan dari Pages Function (berlaku 5 menit;
  batas ukuran dan tipe dipaksakan).
- Grid dengan filter jenis, pencarian nama/alt, dan penanda "dipakai di N
  tempat".
- Menghapus media yang sedang dipakai diblokir, dan pesan menyebut di mana ia
  dipakai.

### F7 — Artikel — _M5_

- Daftar, buat, ubah, hapus; slug otomatis dari judul dan bisa diedit.
- Isi artikel berupa blok teks terstruktur (judul, paragraf, kutipan, gambar,
  daftar, tautan), bukan HTML mentah.
- Gambar sampul wajib; ringkasan maks 160 karakter dipakai sebagai deskripsi
  meta default.
- Tag bebas; halaman tag dibangun saat build. Estimasi waktu baca dihitung
  otomatis.

### F8 — Navigasi & pengaturan situs — _M4_

- Menu utama maksimal dua tingkat, bisa diurutkan, menaut ke halaman atau URL.
- Pengaturan: nama situs, wordmark, deskripsi default, gambar Open Graph
  default, tautan sosial, footer, teks banner cookie.

### F9 — Publish, status build, revisi — _M4_

- Tombol **Publish** per halaman/artikel dan **Publish semua** untuk perubahan
  tertunda.
- Penggabungan: beberapa Publish dalam 3 menit memicu satu build; admin
  menampilkan hitung mundur.
- Status build: antre / membangun / tayang / gagal, dengan ringkasan log bila
  gagal.
- Riwayat revisi per halaman: tanggal, penulis, bandingkan dengan versi
  sekarang, **pulihkan ke draf** (bukan langsung terbit).
- Bila build gagal, versi sebelumnya tetap tayang (perilaku bawaan Pages) dan
  admin memberi tahu.

### F10 — Formulir kontak — _M5_

- Dikirim ke Pages Function → disimpan ke `submissions` → tampil di admin dengan
  penanda baca/belum.
- Anti-spam: bidang jebakan tersembunyi, batas 3 kiriman per IP per jam,
  validasi panjang; tanpa CAPTCHA pihak ketiga di v1.
- Notifikasi email adalah tambahan opsional (D6).

### F11 — SEO & berbagi — _M5_

- Judul dan deskripsi per halaman/artikel dengan penghitung karakter dan
  pratinjau hasil pencarian.
- Open Graph memakai gambar hero/sampul; bila tidak ada, gambar default situs.
- `sitemap.xml`, `robots.txt`, URL kanonis, data terstruktur `Organization` dan
  `Article`.
- Halaman 404 yang dirancang sesuai `design.md`.

### F12 — Persetujuan cookie — _M1_

- Kartu kecil di kiri bawah dengan tiga tindakan: Pengaturan, Tolak semua,
  Terima semua.
- Tidak ada skrip non-esensial berjalan sebelum persetujuan. Karena analitik
  yang dipakai tanpa cookie, banner ini untuk pihak ketiga yang mungkin
  ditambahkan (mis. pemutar YouTube).
- Pilihan tersimpan di `localStorage` dan bisa diubah lewat tautan di footer.

---

## 12. Fungsi server (Pages Functions)

| Jalur                   | Fungsi                                                                            | Autentikasi            |
| ----------------------- | --------------------------------------------------------------------------------- | ---------------------- |
| `POST /api/publish`     | Validasi, salin draf → terbit, tulis revisi, picu deploy hook dengan penggabungan | Token Supabase + peran |
| `POST /api/media/sign`  | Beri URL unggah R2 bertanda tangan (tipe dan ukuran dipaksakan)                   | Token Supabase + peran |
| `DELETE /api/media/:id` | Hapus berkas R2 dan baris `media` bila tidak dipakai                              | Token Supabase + peran |
| `POST /api/contact`     | Terima formulir, saring, simpan                                                   | Publik, dibatasi laju  |
| `GET /api/build-status` | Status build terakhir                                                             | Token Supabase + peran |

Semua rahasia (kunci R2, service role Supabase, deploy hook, token API
Cloudflare) hanya ada sebagai variabel lingkungan di Cloudflare — tidak pernah
di repositori atau kode klien.

---

## 13. Pipeline media

```
Pilih berkas
  ├─ Gambar → di peramban: baca dimensi → buat 4 varian (AVIF/WebP) + placeholder blur
  │            → minta URL bertanda tangan → unggah semua varian ke R2
  │            → tulis baris media (variants, width, height)
  └─ Video  → validasi (ukuran, durasi, dimensi, tipe)
               → bila lolos: unggah MP4 (+WebM) ke R2, siapkan poster
               → tulis baris media (duration_s, poster_media_id)
```

Kunci R2: `media/{yyyy}/{mm}/{id}/{varian}.{ext}`, tidak pernah dipakai ulang,
dengan `Cache-Control: public, max-age=31536000, immutable`. Domain media kustom
dipasang di depan bucket.

---

## 14. Kebutuhan non-fungsional

### 14.1 Performa

- Poster hero adalah satu-satunya sumber daya kritis; di-`preload` dengan ukuran
  sesuai `srcset`.
- Video tidak boleh memblokir LCP; dimulai setelah halaman interaktif.
- Font di-_self-host_, subset Latin, `font-display: swap`, maksimal dua
  keluarga.
- Semua gambar punya `width` dan `height` atau `aspect-ratio` untuk mencegah
  pergeseran tata letak.
- JavaScript publik hanya untuk: menu, pemutar video penuh, banner cookie,
  formulir kontak, kontrol jeda hero.

### 14.2 Aksesibilitas

- Kontras teks minimum WCAG AA, termasuk teks di atas hero (diperiksa terhadap
  scrim).
- Gerak otomatis lebih dari 5 detik wajib punya tombol jeda.
- `prefers-reduced-motion` mematikan video otomatis, parallax, dan animasi
  pengungkapan.
- Seluruh admin dan situs bisa dioperasikan dengan papan ketik; cincin fokus
  terlihat.
- Alt wajib untuk gambar informatif; gambar dekoratif ditandai eksplisit.
- Sasaran sentuh minimal 44×44 px.

### 14.3 Keamanan

- RLS aktif di semua tabel; diuji dengan pengguna tanpa peran.
- CSP ketat; sumber media hanya dari domain situs dan domain media.
- Batas tipe dan ukuran unggahan dipaksakan di tanda tangan URL, bukan hanya di
  klien.
- Pembatasan laju pada login (bawaan Supabase) dan `/api/contact`.
- Input teks kaya dibersihkan; tidak ada HTML mentah dari editor yang dirender.
- Pencadangan: ekspor SQL mingguan lewat GitHub Actions, disimpan 8 minggu,
  karena tingkat gratis tidak menjamin cadangan.

### 14.4 Keandalan

- Bila Supabase tidak tersedia, situs publik tetap tayang penuh.
- Bila build gagal, versi sebelumnya tetap tayang.
- Bila R2 tidak tersedia, poster dan teks tetap tampil; hanya video yang absen.

---

## 15. Risiko

| Risiko                                              | Dampak                        | Mitigasi                                                                              |
| --------------------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------- |
| Database gratis di-pause                            | Admin tidak bisa dipakai      | Keepalive terjadwal, layar pemulihan, situs publik tetap statis                       |
| Jatah build 500/bulan habis                         | Publish tertahan              | Penggabungan + batas laju, penghitung di dashboard, draf tidak memicu build           |
| Video hero membengkakkan beban halaman              | LCP buruk, data seluler boros | Batas 6 MB, poster sebagai LCP, mati pada Save-Data/gerak-dikurangi                   |
| R2 meminta metode pembayaran                        | Hambatan akses                | Fallback: foto saja di Supabase Storage atau berkas di repositori (D4)                |
| Batas gratis berubah                                | Arsitektur perlu disesuaikan  | Akses layanan lewat lapisan tipis (`lib/storage`, `lib/db`) agar mudah diganti        |
| Editor mengunggah foto berat atau beresolusi rendah | Tampilan jelek, situs lambat  | Dimensi minimum hero ≥ 1920 px lebar, pemrosesan otomatis, peringatan sebelum publish |
| Hak cipta foto/video yang diunggah                  | Risiko hukum                  | Kolom kredit/lisensi wajib di media; panduan pemakaian untuk editor                   |
| Lingkup melebar                                     | v1 tak selesai                | Roadmap per tonggak dengan kriteria selesai                                           |

---

## 16. Struktur repositori

```
/
├─ apps/
│  └─ site/                 # Astro (publik) + /admin (React SPA)
│     ├─ src/pages/         # rute publik
│     ├─ src/blocks/        # komponen blok (publik & pratinjau)
│     ├─ src/admin/         # SPA admin
│     └─ functions/api/     # Pages Functions
├─ packages/
│  ├─ schema/               # skema Zod blok & tipe bersama
│  └─ tokens/               # token desain (dari design.md)
├─ supabase/
│  ├─ migrations/           # SQL: tabel, view, RLS
│  └─ seed.sql
├─ .github/workflows/       # keepalive, backup, CI
├─ design.md
└─ prd.md
```

Variabel lingkungan (nilai disimpan di Cloudflare/GitHub Secrets):
`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
`R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`,
`MEDIA_PUBLIC_URL`, `DEPLOY_HOOK_URL`, `CF_API_TOKEN`, `CF_PROJECT_NAME`.

---

## 17. Keputusan terbuka

| #   | Pertanyaan                                                                                    | Rekomendasi                                                                                                                  | Dibutuhkan sebelum |
| --- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| D0  | **Apa tujuan dan niche situs ini?** (profil, destinasi, portofolio, komunitas, katalog)       | Belum diputuskan; nama situs Jejak Rona sudah ditetapkan. Niche menentukan palet final dan tipe konten khusus                | M0                 |
| D1  | Astro/React + Supabase, atau tetap ingin backend Python?                                      | Astro/React + Supabase. Python hanya bila ada kebutuhan yang tak bisa dipenuhi Supabase dan siap menerima layanan yang tidur | M0                 |
| D2  | Bahasa: Indonesia, Inggris, atau dwibahasa?                                                   | Satu bahasa di v1; skema menyiapkan kolom `locale`                                                                           | M1                 |
| D3  | Domain: `pages.dev` dulu atau langsung domain sendiri?                                        | Mulai dari `pages.dev`, pasang domain sendiri di M6                                                                          | M6                 |
| D4  | Bersedia mendaftarkan metode pembayaran untuk mengaktifkan R2 (tanpa tagihan di bawah kuota)? | Ya bila bersedia; bila tidak, hero berupa foto dengan Supabase Storage                                                       | M3                 |
| D5  | Hero beranda: foto diam, video loop, atau keduanya?                                           | Video loop pendek dengan poster; foto sebagai cadangan otomatis                                                              | M1                 |
| D6  | Notifikasi email untuk formulir kontak?                                                       | Tunda setelah v1; dashboard cukup                                                                                            | M5                 |
| D7  | Satu admin atau beberapa editor sejak awal?                                                   | Mulai satu admin; peran editor tersedia tapi belum dipakai                                                                   | M2                 |

---

## 18. Roadmap & definisi selesai

**M0 — Fondasi.** Akun Supabase, Cloudflare, GitHub; repositori; migrasi awal;
RLS; keepalive. _Selesai bila:_ `astro build` membaca satu baris contoh dari
Supabase dan menayangkannya di `pages.dev`.

**M1 — Situs publik & hero.** Token desain, tata letak dasar, header/menu,
footer, blok `hero_media`, `rich_text`, `image_full`, banner cookie, beranda dan
satu halaman umum dari data seed. _Selesai bila:_ beranda dengan hero video
memenuhi anggaran performa bagian 4 di ponsel nyata.

**M2 — Admin inti.** Login, peran, dashboard, daftar halaman, editor blok,
pratinjau, simpan otomatis. _Selesai bila:_ editor membuat halaman baru dari nol
dan pratinjaunya identik dengan situs.

**M3 — Media.** Pipeline unggah R2, pustaka media, pemrosesan gambar di
peramban, validasi video, titik fokus. _Selesai bila:_ hero diganti dari admin
tanpa menyentuh kode, dan foto 6 MB menjadi poster ≤ 250 KB.

**M4 — Publish & revisi.** Alur draf → terbit, penggabungan build, status build,
revisi, navigasi, pengaturan situs. _Selesai bila:_ Publish memperbarui situs
dalam < 4 menit dan revisi bisa dipulihkan.

**M5 — Artikel, formulir, SEO.** Artikel, tag, formulir kontak, sitemap, Open
Graph, data terstruktur, 404. _Selesai bila:_ Lighthouse mobile memenuhi target
untuk beranda, satu halaman, dan satu artikel.

**M6 — Pengerasan & tayang.** Uji RLS, uji papan ketik, kontras hero,
pencadangan, domain kustom, dokumentasi editor satu halaman. _Selesai bila:_
semua kriteria F1–F12 tercentang dan checklist bagian 19 lengkap.

---

## 19. Dari nol sampai deploy — checklist

**Persiapan**

- [ ] Buat akun GitHub, Supabase, Cloudflare
- [ ] Putuskan D0 (niche) dan D4 (R2)
- [ ] Buat repositori dengan struktur bagian 16

**Supabase**

- [ ] Buat proyek; simpan URL dan kunci anon
- [ ] Jalankan migrasi tabel, view `*_public`, kebijakan RLS
- [ ] Matikan pendaftaran publik; buat akun admin pertama dan baris `profiles`
- [ ] Pasang GitHub Action keepalive

**Cloudflare**

- [ ] Buat bucket R2, domain media, kunci API
- [ ] Hubungkan repositori ke Pages; set perintah build dan variabel lingkungan
- [ ] Buat deploy hook dan simpan sebagai `DEPLOY_HOOK_URL`
- [ ] Aktifkan Web Analytics

**Sebelum tayang**

- [ ] Uji RLS dengan pengguna tanpa peran
- [ ] Uji hero di ponsel nyata dengan koneksi lambat
- [ ] Uji `prefers-reduced-motion` dan Save-Data
- [ ] Jalankan Lighthouse mobile pada beranda
- [ ] Pasang domain kustom dan paksa HTTPS
- [ ] Ekspor cadangan pertama dan coba pulihkan

---

_PRD v1.0 — dokumen hidup. Tutup keputusan di bagian 17 satu per satu dan catat
tanggalnya._
