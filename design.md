# DESIGN — Website Jejak Rona

**Versi:** 1.0 **Tanggal:** 5 Oktober 2026 **Nama situs:** Jejak Rona **Dokumen
pasangan:** `prd.md`, `implementation-plan.md`

> **Cara membaca dokumen ini.** Ini bukan moodboard, melainkan spesifikasi yang
> bisa langsung diterjemahkan ke token CSS dan komponen. Arah visualnya diambil
> dari screenshot referensi yang kamu berikan: hero layar penuh berisi
> foto/video, headline serif huruf kapital berbobot tipis yang bertingkat, teks
> pendamping kecil, tombol putih persegi, dan kartu cookie mungil. Yang diambil
> adalah **prinsip dan struktur**-nya; wordmark dan foto dari situs referensi
> tidak dipakai. Nama situs adalah **Jejak Rona**. Warna final dan tipe konten
> khusus masih dapat disesuaikan setelah keputusan D0 di `prd.md` (niche situs);
> nilai di bawah adalah default yang bisa diganti lewat token.

---

## 1. Arah visual

**Satu kalimat:** foto yang berbicara, tipografi yang tenang, antarmuka yang
nyaris tak terlihat.

Kesan yang dikejar: majalah perjalanan atau katalog pameran, bukan landing page
SaaS. Setiap layar punya satu hal yang menjadi pusat perhatian, dan hal itu
hampir selalu sebuah foto atau video.

### 1.1 Yang dipelajari dari referensi

| Pengamatan                                                                                  | Diterjemahkan menjadi                                                  |
| ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Media memenuhi seluruh layar pertama, tanpa bingkai atau kartu                              | Hero `100svh`, media menjadi latar edge-to-edge                        |
| Headline ukuran sangat besar, huruf kapital, serif bobot tipis                              | Display serif uppercase, bobot 300, ukuran ±9vw di desktop             |
| Dua baris headline **tidak sejajar**: baris kedua bergeser ke kanan dan menimpa subjek foto | Komposisi bertingkat (stagger) sebagai ciri khas hero                  |
| Teks pendamping kecil, diletakkan di kolom kanan-bawah, bukan di bawah headline             | Subteks dan CTA berada di posisi independen, sejajar dengan sumbu lain |
| Wordmark kecil di tengah atas, tindakan di kiri dan kanan ("Play Video", "MENU")            | Header tiga zona yang transparan di atas hero                          |
| Tombol putih solid, hampir persegi, panah dalam kotak terpisah                              | Tombol padat tanpa bayangan, radius 2px                                |
| Cookie banner berupa kartu putih kecil di sudut kiri bawah                                  | Banner tidak menutupi hero; ukuran dan posisi dijaga                   |
| Hampir tidak ada warna antarmuka; semua warna datang dari foto                              | Palet antarmuka netral dan hangat, aksen sangat hemat                  |

### 1.2 Yang sengaja dihindari

Ini daftar larangan, dan setiap butir berlaku sebagai kriteria tolak saat review
desain.

- Gradien ungu–biru, atau gradien mesh apa pun sebagai latar.
- Hero berisi ilustrasi, bentuk abstrak, atau mockup perangkat. Hero **hanya**
  foto atau video.
- Tiga kartu sejajar berikon di bawah hero ("Cepat · Aman · Mudah").
- Kartu dengan `rounded-2xl`, bayangan lembut, dan border tipis yang seragam di
  mana-mana.
- Glassmorphism dan efek blur di atas elemen antarmuka.
- Emoji atau ikon bulat berwarna sebagai pengganti gambar.
- Teks tengah-tengah bertajuk "Selamat Datang di…".
- Pil/badge kecil di mana-mana; angka statistik besar di tengah.
- Foto stok yang jelas stok (jabat tangan, laptop di meja kayu putih, orang
  tertawa pada salad).
- Animasi masuk pada setiap elemen saat digulir.
- Dua keluarga huruf yang sama-sama dekoratif.

---

## 2. Warna

Antarmuka dibuat dari netral hangat. Foto membawa warna; antarmuka tidak
berebut.

### 2.1 Token inti

| Token         | Hex       | Peran                                       |
| ------------- | --------- | ------------------------------------------- |
| `--ink-950`   | `#12110D` | Latar gelap utama, teks pada latar terang   |
| `--ink-900`   | `#1B1A15` | Permukaan gelap kedua                       |
| `--ink-700`   | `#3A382F` | Garis dan batas pada latar gelap            |
| `--bone-50`   | `#F6F1E9` | Latar terang utama; warna teks di atas foto |
| `--bone-100`  | `#ECE5D9` | Permukaan terang kedua                      |
| `--bone-300`  | `#CFC7B8` | Garis dan batas pada latar terang           |
| `--stone-500` | `#7C766A` | Teks tersier (hanya ≥ 16px)                 |
| `--stone-700` | `#4D493F` | Teks sekunder pada latar terang             |
| `--moss-700`  | `#3D4A36` | Aksen hijau lumut, dipakai tenang           |
| `--ember-600` | `#B5522B` | Aksen hangat: tautan aktif, penanda, fokus  |
| `--paper-0`   | `#FFFFFF` | Tombol putih dan kartu cookie               |

### 2.2 Pasangan kontras yang sudah diperiksa

| Pasangan                              | Rasio     | Status                            |
| ------------------------------------- | --------- | --------------------------------- |
| `bone-50` di atas `ink-950`           | ±16 : 1   | AAA                               |
| `ink-950` di atas `bone-50`           | ±16 : 1   | AAA                               |
| `stone-700` di atas `bone-50`         | ±8 : 1    | AAA                               |
| `ember-600` di atas `bone-50`         | ±4,7 : 1  | AA untuk teks biasa               |
| `bone-50` di atas foto + scrim sedang | ≥ 4,5 : 1 | Dipaksakan oleh scrim (lihat 5.3) |

> Rasio dihitung perkiraan; **verifikasi dengan alat kontras** setelah warna
> final dipilih.

### 2.3 Aturan pemakaian

- **Latar bergantian, bukan bergradasi.** Bagian situs berganti antara `bone-50`
  dan `ink-950` secara tegas. Tidak ada peralihan halus di antaranya.
- **`ember-600` dibatasi** pada tautan, fokus, dan satu penanda per layar. Bukan
  untuk tombol utama.
- **`moss-700`** hanya untuk bagian bertema gelap hijau (mis. blok kutipan di
  atas foto) dan elemen status.
- **Tombol utama selalu putih (`paper-0`) di atas foto dan `ink-950` di atas
  latar terang.**

### 2.4 Mode gelap

Situs punya dua "suasana" per bagian, bukan sakelar tema global. Pengunjung
tidak diberi tombol ganti tema; yang mengikuti `prefers-color-scheme` hanya
footer dan halaman artikel (latar `ink-950`, teks `bone-50`). Panel admin
mengikuti sistem dan punya sakelar sendiri.

---

## 3. Tipografi

Dua keluarga, peran dipisah tegas.

| Peran                                | Keluarga                                                   | Bobot         | Catatan                                 |
| ------------------------------------ | ---------------------------------------------------------- | ------------- | --------------------------------------- |
| Display (headline hero, judul besar) | **Cormorant Garamond**                                     | 300, 400      | Huruf kapital, `letter-spacing: 0.01em` |
| Teks, antarmuka, tombol              | **Hanken Grotesk**                                         | 400, 500, 600 | Netral dan jernih di ukuran kecil       |
| Angka dan metadata (opsional)        | Hanken Grotesk dengan `font-variant-numeric: tabular-nums` | —             | Tidak perlu keluarga ketiga             |

> Cormorant dipilih karena kontras tinggi dan bobot tipisnya mendekati karakter
> headline di referensi, dan gratis. Bila setelah dicoba bentuknya terasa
> terlalu klasik atau terlalu sempit untuk judul panjang, **kandidat pengganti:
> `Fraunces` (bobot 300, opsi optical size rendah), `Gloock`, atau
> `Instrument Serif`**. Uji dengan judul asli sebelum dikunci. Semua font
> di-_self-host_, di-subset Latin, dengan `font-display: swap`.

### 3.1 Skala

| Token            | Ukuran                           | Line-height | Pemakaian                 |
| ---------------- | -------------------------------- | ----------- | ------------------------- |
| `--text-hero`    | `clamp(2.75rem, 9vw, 10.5rem)`   | 0.92        | Headline hero             |
| `--text-display` | `clamp(2.25rem, 5.5vw, 5rem)`    | 1.0         | Judul bagian besar        |
| `--text-h2`      | `clamp(1.75rem, 3.2vw, 2.75rem)` | 1.1         | Judul sub-bagian          |
| `--text-h3`      | `1.375rem`                       | 1.25        | Judul kartu dan artikel   |
| `--text-lead`    | `clamp(1.125rem, 1.6vw, 1.5rem)` | 1.35        | Subteks hero, pengantar   |
| `--text-body`    | `1.0625rem` (17px)               | 1.7         | Isi artikel               |
| `--text-ui`      | `0.9375rem` (15px)               | 1.4         | Tombol, label, menu       |
| `--text-small`   | `0.8125rem` (13px)               | 1.4         | Keterangan foto, metadata |

### 3.2 Aturan

- Lebar baca isi artikel maksimum **68 karakter** (`max-width: 68ch`).
- Headline hero selalu huruf kapital via CSS (`text-transform: uppercase`),
  bukan diketik kapital di CMS, agar tetap terbaca oleh pembaca layar dan bisa
  diubah kelak.
- Judul tidak pernah diberi `font-weight` di atas 400 pada keluarga display.
- Tidak ada teks rata-justify. Tidak ada teks miring untuk paragraf panjang.
- Keterangan foto memakai `--text-small`, `stone-700`, huruf biasa; tidak
  berhuruf kapital semua.

---

## 4. Tata letak & ruang

### 4.1 Grid dan wadah

| Elemen               | Nilai                                                  |
| -------------------- | ------------------------------------------------------ |
| Lebar maksimum wadah | `1440px`, tepi hero tetap penuh layar                  |
| Kolom                | 12 di desktop, 8 di tablet, 4 di seluler               |
| Gutter               | 24px desktop, 16px seluler                             |
| Margin sisi          | `clamp(1rem, 4vw, 4rem)`                               |
| Satuan ruang dasar   | 4px; skala: 4, 8, 12, 16, 24, 32, 48, 64, 96, 144, 200 |

### 4.2 Ritme vertikal

- Jarak antar bagian: `clamp(96px, 14vw, 200px)`. Ruang kosong adalah bagian
  dari desain, bukan pemborosan.
- Dalam bagian: jarak antar elemen mengikuti skala di atas; jangan membuat angka
  baru.
- Setiap bagian punya **satu titik fokus**. Bila ada dua kandidat, pisahkan
  menjadi dua bagian.

### 4.3 Breakpoint

`480` · `768` · `1024` · `1280` · `1600`. Pendekatan seluler dahulu; desktop
menambah, bukan kebalikannya.

### 4.4 Radius dan bayangan

- Radius: tombol dan kartu cookie `2px`, media `0` (foto persegi tajam), dialog
  `4px`. Tidak ada radius di atas 4px kecuali elemen berbentuk lingkaran
  sungguhan (tombol jeda).
- Bayangan: **tidak dipakai**. Kedalaman dinyatakan lewat kontras latar dan
  garis `1px`.

---

## 5. Hero — spesifikasi lengkap

Hero adalah halaman rumah dari seluruh situs. Aturan di bawah mengikat blok
`hero_media` di `prd.md`.

### 5.1 Anatomi (desktop ≥ 1024px)

```
┌──────────────────────────────────────────────────────────────┐
│ [Putar video]            WORDMARK                     MENU   │  header, transparan
│                                                              │
│                                                              │
│   HEADLINE BARIS 1                                           │  kiri, ~15% dari atas
│                          HEADLINE BARIS 2                    │  bergeser kanan ±22%
│                                                              │
│                                                              │
│                         Subteks, 2–3 baris,                  │  kolom ±50–76% lebar
│                         maks 34 karakter per baris           │
│                         [ Label CTA ] [→]                    │
│ [kartu cookie]                                               │
└──────────────────────────────────────────────────────────────┘
        media penuh layar di belakang seluruhnya
```

- **Tinggi:** `100svh`, minimum 560px, maksimum 1100px pada layar sangat tinggi.
- **Headline:** dua baris. Baris 1 mulai di margin kiri; baris 2 dimulai di
  sekitar 22% lebar wadah. Keduanya menimpa media; tidak ada kotak di
  belakangnya.
- **Subteks dan CTA:** berada di bawah, kolom mulai ±50% lebar, **tidak**
  menempel pada headline. Jarak vertikal dari headline minimal sama dengan
  tinggi satu baris headline.
- **Header:** tiga zona. Kiri: tombol "Putar video" (hanya bila video penuh
  diisi). Tengah: wordmark. Kanan: "MENU". Header transparan; tidak ada garis
  atau latar.

### 5.2 Seluler (< 768px)

- Headline rata kiri; baris 2 dengan indentasi `12vw`.
- Ukuran `--text-hero` jatuh ke batas bawah `2.75rem`, dan baris yang terlalu
  panjang diizinkan membungkus menjadi dua baris tambahan (maksimal empat baris
  total).
- Subteks dan CTA ditumpuk di kiri bawah, dengan margin bawah mempertimbangkan
  `env(safe-area-inset-bottom)`.
- Kartu cookie tampil sebagai lembar pendek di dasar layar dan menghilang
  setelah dipilih; tidak boleh menutupi lebih dari 30% tinggi layar.
- Media memakai `media_seluler` bila tersedia; bila tidak, `object-position`
  dari titik fokus seluler.

### 5.3 Media dan keterbacaan

| Aspek            | Aturan                                                                                                                                             |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Jenis            | Foto atau video loop. **Tidak boleh kosong.**                                                                                                      |
| Foto             | Lebar ≥ 1920px; AVIF/WebP; `srcset` 640/1280/1920/2560                                                                                             |
| Video            | MP4 H.264, 6–15 detik, tanpa suara, ≤ 6 MB, ≤ 1920×1080, loop mulus                                                                                |
| Pemilihan konten | Subjek utama (wajah, hewan, bangunan) tidak boleh berada di area teks headline lebih dari sebagian; gunakan titik fokus                            |
| Scrim            | Gradien hitam hangat (`ink-950`) dari bawah ke atas dan sedikit dari atas ke bawah; **ringan** 20%, **sedang** 35%, **kuat** 50% opasitas maksimum |
| Kontras          | Teks `bone-50` di atas foto harus ≥ 4,5:1 di titik terburuk; admin memperingatkan bila tidak                                                       |
| Poster           | Wajib untuk video; tampil dulu dan menjadi elemen LCP                                                                                              |

### 5.4 Gerak

- Video berjalan pelan dan tanpa suara; tidak ada _zoom_ atau _parallax_
  tambahan di atasnya.
- Headline muncul dengan **pengungkapan masker per baris** (translateY dari 100%
  ke 0 di dalam pembungkus `overflow: hidden`), 700ms, kurva
  `cubic-bezier(.2,.7,.2,1)`, jeda 120ms antar baris. Terjadi **sekali** saat
  halaman dimuat.
- Subteks dan CTA memudar masuk 400ms setelah baris kedua.
- Tombol jeda (lingkaran 44px, kanan bawah) selalu ada selama video berputar.
- `prefers-reduced-motion`: tanpa video otomatis (hanya poster), tanpa animasi
  masuk; teks langsung tampil.
- `Save-Data` atau koneksi lambat: hanya poster.

### 5.5 Dialog video penuh

- Dibuka dari "Putar video". Latar `ink-950` 92%, video terpusat mengikuti rasio
  aslinya, tombol tutup di kanan atas (44px), `Esc` menutup, fokus dikunci di
  dalam dialog lalu dikembalikan ke pemicu.
- Video penuh **tidak dimuat** sebelum dialog dibuka.

---

## 6. Komponen

### 6.1 Header & menu

- Transparan di atas hero; saat digulir melewati hero, header menjadi bilah
  `ink-950` setinggi 64px dengan wordmark di tengah dan "MENU" di kanan, dan
  tersembunyi saat menggulir ke bawah lalu muncul saat menggulir ke atas.
- "MENU" membuka **lembar penuh layar** berlatar `ink-950`: tautan utama dalam
  `--text-display` (serif, bobot 300), tautan sekunder dan kontak di kolom kecil
  di sisi. Tidak ada daftar tarik-turun.
- Tautan menu: jarak antar baris besar, garis bawah `1px` hanya saat
  fokus/hover; tanpa animasi geser.

### 6.2 Tombol

| Varian                   | Rupa                                                                                               | Pemakaian                       |
| ------------------------ | -------------------------------------------------------------------------------------------------- | ------------------------------- |
| **Utama di atas foto**   | Latar `paper-0`, teks `ink-950`, radius 2px, tinggi 44px, padding horizontal 14px, `--text-ui` 500 | CTA hero                        |
| **Utama di atas terang** | Latar `ink-950`, teks `bone-50`                                                                    | CTA bagian terang               |
| **Panah**                | Kotak 44×44 terpisah di samping tombol, jarak 6px, berisi panah `→` tipis                          | Pelengkap CTA                   |
| **Teks**                 | Tanpa latar, garis bawah 1px, offset 4px                                                           | Tautan sekunder                 |
| **Hantu**                | Garis 1px `bone-50`, tanpa latar                                                                   | Di atas foto, tindakan sekunder |

Hover: balik warna (putih ↔ gelap) dalam 160ms; tanpa bayangan, tanpa
pergeseran. Fokus: kontur 2px `ember-600` dengan offset 3px.

### 6.3 Kartu cookie

- Kiri bawah, jarak 20px dari tepi; lebar maksimum 450px; latar `paper-0`,
  radius 2px, teks `ink-950` 15px.
- Isi: satu paragraf pendek dengan tautan kebijakan; garis pemisah `1px`; baris
  tombol — "Pengaturan" (hantu gelap) di kiri, "Tolak semua" dan "Terima semua"
  di kanan. "Terima semua" mendapat latar `bone-100`; keduanya sama besar dan
  sama jelas (tidak ada pola gelap).
- Muncul dengan memudar 300ms; menghilang permanen setelah dipilih.

### 6.4 Bagian teks + media (`text_split`)

- Dua kolom asimetris: media 7 kolom, teks 4 kolom, dengan satu kolom kosong di
  antaranya. Sisi bisa dibalik.
- Teks: judul `--text-h2` serif, isi `--text-body`, satu tautan teks. Tidak ada
  tombol penuh di sini.
- Media persegi tajam, dengan keterangan `--text-small` tepat di bawah dan rata
  kiri.

### 6.5 Gambar penuh (`image_full`)

- Gambar selebar layar dengan tinggi mengikuti rasio asli, tanpa batas atas.
  Keterangan di bawah, kolom 2–6.
- Dipasang bergantian dengan bagian teks untuk memberi jeda visual.

### 6.6 Galeri (`gallery`)

- `rapat`: grid mosaik dengan celah 8px, rasio campuran (3:2, 4:5, 1:1) yang
  ditentukan oleh data media, bukan acak.
- `berjenjang`: kolom bergeser vertikal 48px bergantian.
- Klik membuka tampilan tunggal besar dengan panah dan `Esc`; tanpa carousel
  otomatis.

### 6.7 Kutipan (`quote`)

- `polos`: serif bobot 300, `--text-display`, rata kiri, sumber `--text-small`
  di bawah, tanpa tanda kutip dekoratif besar.
- `di-atas-foto`: latar foto penuh dengan scrim kuat, kutipan di dalam kolom
  3–9.

### 6.8 Daftar artikel (`post_list`)

- `daftar`: baris panjang — tanggal kecil di kiri, judul serif `--text-h3` di
  tengah, tag di kanan; gambar sampul muncul di sisi saat hover (desktop),
  selalu tampil kecil di seluler.
- `grid`: dua kolom, gambar sampul rasio 4:5, judul dan ringkasan di bawah.
  **Bukan kartu** — tanpa kotak, tanpa border, tanpa bayangan.

### 6.9 Halaman artikel

- Kepala: judul `--text-display`, tanggal dan waktu baca `--text-small`, gambar
  sampul penuh lebar di bawahnya.
- Isi dalam kolom `68ch`, gambar di dalam isi boleh melebar ke kolom 2–11.
- Akhir artikel: dua artikel terkait dalam gaya `daftar`, lalu footer.

### 6.10 Formulir kontak

- Garis bawah `1px` sebagai bidang (tanpa kotak), label di atas dalam
  `--text-small`, tombol utama gelap.
- Pesan galat berada di bawah bidang, teks `ember-600`, dengan ikon teks (`!`)
  sebagai tambahan warna.
- Keadaan berhasil mengganti formulir dengan satu kalimat dan satu tautan
  kembali; tidak ada konfeti atau animasi centang.

### 6.11 Footer

- Latar `ink-950`. Wordmark di kiri, kolom tautan di tengah, alamat dan kontak
  di kanan. Tautan "Preferensi cookie" selalu ada.
- Tidak ada ikon sosial berwarna; tautan sosial berupa teks.

### 6.12 Halaman 404

- Satu foto penuh layar dari pustaka media (dipilih admin di pengaturan),
  headline serif "Halaman tidak ditemukan" dalam gaya hero, satu tombol kembali
  ke beranda.

---

## 7. Citra & arahan foto

Karena situs ini bergantung pada foto, kualitas foto bukan detail kecil.

- **Pencahayaan nyata dan sudut yang jujur.** Hindari foto yang terlalu diolah,
  saturasi berlebihan, dan HDR agresif.
- **Komposisi dengan ruang.** Untuk foto hero, sisakan area lapang di mana
  headline akan berada; subjek tidak boleh tepat di tengah kecuali dimaksudkan.
- **Orang:** tidak berpose menghadap kamera sambil tersenyum bila bukan bagian
  dari cerita.
- **Konsistensi:** seluruh foto situs berbagi karakter warna (hangat/dingin,
  kontras) yang sama; bila perlu, satu pengaturan penyuntingan dipakai ulang.
- **Rasio:** hero 16:9 (desktop) dan 4:5 atau 9:16 (seluler); isi konten 3:2,
  4:5, 1:1.
- **Alt teks:** menjelaskan apa yang terlihat dan relevansinya, bukan "gambar
  dari…". Untuk foto dekoratif, alt kosong yang disengaja.
- **Kredit dan lisensi:** diisi untuk setiap foto/video; ditampilkan di
  keterangan bila lisensinya mensyaratkan.
- **Video loop:** pilih gerakan lambat dan tak berujung (rumput tertiup angin,
  air, awan, langkah hewan); hindari potongan cepat dan gerak kamera tajam.

---

## 8. Gerak (di luar hero)

| Elemen                  | Perilaku                                                                    |
| ----------------------- | --------------------------------------------------------------------------- |
| Gambar saat masuk layar | Memudar 400ms, tanpa geser; **hanya** untuk gambar di bawah lipatan pertama |
| Bagian teks             | Tidak beranimasi                                                            |
| Tautan menu             | Perubahan warna 160ms                                                       |
| Lembar menu             | Meluncur dari atas 450ms (`ease-out`), isi memudar setelahnya               |
| Galeri                  | Pergantian gambar memudar 250ms                                             |

Aturan umum: satu jenis animasi masuk di seluruh situs; durasi 160–700ms; tidak
ada animasi yang berulang tanpa henti selain video hero; seluruhnya dimatikan
oleh `prefers-reduced-motion`.

---

## 9. Panel admin

Admin memakai token yang sama tetapi dengan karakter berbeda: padat, jelas, dan
netral. Ia adalah alat kerja, bukan etalase.

- **Tipografi:** hanya Hanken Grotesk; tanpa serif. Ukuran dasar 14–15px.
- **Warna:** latar `bone-50` (terang) atau `ink-950` (gelap) mengikuti sistem;
  panel `paper-0` atau `ink-900`; aksen hanya `ember-600` untuk fokus dan
  penanda status "perlu tindakan".
- **Struktur:** navigasi samping sempit (ikon + teks), daftar dan tabel sebagai
  tampilan utama. Tidak ada kartu berwarna di dashboard.
- **Dashboard:** angka sederhana dengan label jelas dan tautan ke tindakan.
  Tanpa grafik hias.
- **Editor blok:** tiga zona — daftar blok di kiri, pratinjau di tengah, panel
  bidang di kanan. Pratinjau memakai komponen publik apa adanya.
- **Status build:** satu baris di bilah atas: titik status
  (netral/oranye/hijau/merah) + teks ("Membangun… 1 mnt"). Jangan hanya
  mengandalkan warna.
- **Keadaan kosong:** satu kalimat dan satu tindakan konkret.
- **Galat:** menyebut apa yang salah dan apa yang bisa dilakukan, mis. "Video
  14,2 MB melebihi batas 6 MB. Kompres dengan:
  `ffmpeg -i in.mp4 -vf scale=1920:-2 -crf 28 out.mp4`."
- **Pemilih titik fokus:** gambar dengan penanda lingkaran yang bisa diseret,
  dua pratinjau (desktop dan seluler) yang berubah langsung.

---

## 10. Aksesibilitas desain

- Kontras diperiksa pada kondisi terburuk, termasuk teks di atas foto dan di
  atas frame pertama video.
- Semua tindakan punya keadaan fokus yang terlihat (kontur 2px `ember-600`,
  offset 3px).
- Sasaran sentuh minimal 44×44px; jarak antar sasaran minimal 8px.
- Informasi tidak disampaikan hanya lewat warna.
- Urutan fokus mengikuti urutan visual; dialog menjebak fokus dan
  mengembalikannya.
- Tautan "Lewati ke konten" muncul pertama saat Tab ditekan.
- Video hero tidak punya trek audio dan punya tombol jeda; dialog video penuh
  menyediakan teks atau transkrip bila videonya berisi narasi.
- Teks tidak pernah lebih kecil dari 13px; isi artikel 17px.

---

## 11. Token CSS (acuan implementasi)

```css
:root {
  /* warna */
  --ink-950: #12110d;
  --ink-900: #1b1a15;
  --ink-700: #3a382f;
  --bone-50: #f6f1e9;
  --bone-100: #ece5d9;
  --bone-300: #cfc7b8;
  --stone-500: #7c766a;
  --stone-700: #4d493f;
  --moss-700: #3d4a36;
  --ember-600: #b5522b;
  --paper-0: #ffffff;

  /* tipografi */
  --font-display: "Cormorant Garamond", Georgia, "Times New Roman", serif;
  --font-ui: "Hanken Grotesk", "Helvetica Neue", Arial, sans-serif;
  --text-hero: clamp(2.75rem, 9vw, 10.5rem);
  --text-display: clamp(2.25rem, 5.5vw, 5rem);
  --text-h2: clamp(1.75rem, 3.2vw, 2.75rem);
  --text-h3: 1.375rem;
  --text-lead: clamp(1.125rem, 1.6vw, 1.5rem);
  --text-body: 1.0625rem;
  --text-ui: 0.9375rem;
  --text-small: 0.8125rem;

  /* ruang */
  --gutter: clamp(16px, 2vw, 24px);
  --margin-x: clamp(1rem, 4vw, 4rem);
  --section-y: clamp(96px, 14vw, 200px);

  /* bentuk */
  --radius-ui: 2px;
  --radius-dialog: 4px;
  --radius-media: 0;

  /* gerak */
  --ease-out: cubic-bezier(0.2, 0.7, 0.2, 1);
  --dur-fast: 160ms;
  --dur-base: 400ms;
  --dur-slow: 700ms;
}

.section--light {
  background: var(--bone-50);
  color: var(--ink-950);
}
.section--dark {
  background: var(--ink-950);
  color: var(--bone-50);
}

.hero-headline {
  font-family: var(--font-display);
  font-weight: 300;
  font-size: var(--text-hero);
  line-height: 0.92;
  text-transform: uppercase;
  letter-spacing: 0.01em;
}
.hero-headline .line--2 {
  margin-left: 22%;
}
@media (max-width: 767px) {
  .hero-headline .line--2 {
    margin-left: 12vw;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation: none !important;
    transition: none !important;
  }
}
```

---

## 12. Daftar periksa tinjauan desain

Setiap halaman baru lolos peninjauan hanya bila semua butir ini terpenuhi.

- [ ] Layar pertama berisi foto atau video — bukan warna, gradien, atau
      ilustrasi.
- [ ] Hanya satu titik fokus di setiap bagian.
- [ ] Tidak ada pola dari daftar larangan di bagian 1.2.
- [ ] Hanya dua keluarga huruf, dengan peran yang jelas.
- [ ] Tidak ada bayangan, radius > 4px, atau blur pada elemen antarmuka.
- [ ] Kontras teks di atas media ≥ 4,5:1 pada kondisi terburuk.
- [ ] `prefers-reduced-motion` diuji dan layar tetap utuh.
- [ ] Seluler diuji di perangkat nyata, termasuk poster hero dengan koneksi
      lambat.
- [ ] Foto-foto dalam satu halaman punya karakter warna yang konsisten.
- [ ] Setiap gambar punya alt yang bermakna atau ditandai dekoratif dengan
      sengaja.
- [ ] Tidak ada teks "lorem ipsum", foto placeholder, atau salinan generik
      tersisa.

---

_DESIGN v1.0 — dokumen hidup. Setelah D0 (niche situs) ditentukan, perbarui
bagian 2 (warna), 3 (font), dan 7 (arahan foto) sesuai karakter situs._
