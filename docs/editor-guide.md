# Panduan Penggunaan Editor Editorial — Jejak Rona CMS

Selamat datang di ruang kerja redaksi **Jejak Rona**. CMS ini dirancang sebagai
alat editorial yang tenang, presisi, dan terfokus pada kualitas visual
Nusantara.

---

## 1. Masuk ke Panel Redaksi

- Akses `/admin` melalui peramban web.
- Masukkan surel dan kata sandi staf yang telah terdaftar.
- Panel redaksi terdiri atas: **Dashboard**, **Halaman**, **Artikel**, **Pesan
  Masuk**, **Media**, dan **Pengaturan**.

---

## 2. Menulis & Menyunting Halaman (Editor 3 Zona)

Saat membuka menu **Halaman**:

1. **Zona Kiri (Daftar Blok)**: Menampilkan urutan vertikal blok konten. Anda
   dapat menambah blok baru (`hero_media`, `rich_text`, `image_full`), mengubah
   urutan (`↑` / `↓`), atau menghapus blok.
2. **Zona Tengah (Pratinjau Langsung)**: Menampilkan hasil render tampilan
   visual dalam skala nyata tanpa perlu membuka tab baru.
3. **Zona Kanan (Inspektur Properti)**: Panel pengisian teks, pilihan media, dan
   pengaturan varian blok aktif.
4. **Penyimpanan Draf Otomatis**: Setiap perubahan teks disimpan sebagai draf
   lokal/cloud tanpa langsung mengubah situs publik.

---

## 3. Menulis & Menerbitkan Artikel (`/artikel`)

1. Buka menu **Artikel** di bilah sisi.
2. Klik **"+ Tulis Artikel Baru"**.
3. Isi:
   - **Judul Artikel**: Judul yang mencerminkan esensi cerita.
   - **Slug URL**: Otomatis dibuat dari judul (huruf kecil dan tanda hubung).
   - **Ringkasan (Excerpt)**: Maksimal 160 karakter untuk pratinjau hasil
     pencarian dan media sosial.
   - **Tag Topik**: Dipisahkan koma (contoh: _Perjalanan, Budaya, Fotografi_).
   - **Isi Narasi**: Teks cerita editorial yang akan dibaca dalam ritme tenang.
4. Estimasi waktu baca akan otomatis dihitung oleh sistem.
5. Klik **"🚀 Terbitkan Artikel"** untuk memublikasikannya ke arsip situs.

---

## 4. Pustaka Media & Penentuan Titik Fokus (_Focal Point_)

Kualitas foto adalah jiwa dari Jejak Rona:

- **Unggah Media**: Format yang didukung meliputi WebP, JPEG, PNG, dan klip
  video MP4 pendek (maks 6 MB).
- **Aksesibilitas (Wajib)**: Setiap foto harus memiliki **Teks Alt** deskriptif
  dan **Kredit Fotografer**.
- **Titik Fokus Interaktif**:
  - Klik berkas media lalu pilih **"Titik Fokus"**.
  - Geser lingkaran target ke wajah atau subjek utama foto.
  - Periksa pratinjau **Desktop (16:9)** dan **Ponsel (9:16)** untuk memastikan
    subjek tidak terpotong saat layar menyempit.
- **Keamanan Hapus Media**: Berkas media yang sedang digunakan pada halaman atau
  artikel aktif dilindungi dan tidak dapat dihapus sembarangan.

---

## 5. Menerbitkan Halaman & Riwayat Revisi

- Klik **"🚀 Terbitkan Halaman"** pada bilah atas editor halaman.
- Sistem akan memvalidasi draf (memastikan kelengkapan media hero, teks alt, dan
  minimal 1 blok).
- Setiap publikasi otomatis mencatat snapshot ke tabel **Revisi** (maksimal 20
  riwayat tersimpan).
- Jika ingin membatalkan perubahan atau kembali ke versi lama:
  - Klik **"📜 Riwayat Revisi"**.
  - Pilih tanggal versi yang diinginkan, lalu klik **"Pulihkan ke Draf"**. Draf
    akan kembali ke kondisi tersebut untuk disunting kembali sebelum
    diterbitkan.

---

## 6. Pesan Masuk dari Pembaca

- Kiriman dari formulir kontak `/kontak` masuk ke menu **Pesan Masuk**.
- Pesan baru ditandai dengan titik aksen oranye (_unread_).
- Setelah membaca pesan, klik **"Tandai Dibaca"** atau **"Hapus"**.
