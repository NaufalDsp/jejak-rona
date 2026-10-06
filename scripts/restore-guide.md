# Panduan Pemulihan Data (Disaster Recovery & Restore) — Jejak Rona

Dokumen ini menjelaskan prosedur verifikasi dan pemulihan data dari berkas
cadangan (_backup JSON_) ke Supabase.

---

## 1. Lokasi Berkas Cadangan

Berkas hasil eksekusi `./scripts/backup-db.ps1` atau `./scripts/backup-db.sh`
tersimpan di:

```
backups/
  └── backup_YYYYMMDD_HHMMSS/
      ├── pages.json
      ├── posts.json
      ├── media.json
      ├── revisions.json
      ├── site_settings.json
      ├── nav_items.json
      └── submissions.json
```

---

## 2. Cara Pemulihan Cepat (Melalui Supabase SQL Editor / REST)

### Opsi A: Memulihkan Melalui Node.js Script

Untuk mengembalikan data dari file `backup_*.json` ke tabel Supabase baru atau
yang mengalami kehilangan data:

```bash
# Jalankan script import data cadangan
node -e '
const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function restoreTable(name, path) {
  if (!fs.existsSync(path)) return;
  const rows = JSON.parse(fs.readFileSync(path, "utf-8"));
  console.log(`Memulihkan ${rows.length} data ke ${name}...`);
  for (const row of rows) {
    await supabase.from(name).upsert(row);
  }
}

async function run() {
  const dir = process.argv[1];
  await restoreTable("site_settings", `${dir}/site_settings.json`);
  await restoreTable("media", `${dir}/media.json`);
  await restoreTable("pages", `${dir}/pages.json`);
  await restoreTable("posts", `${dir}/posts.json`);
  await restoreTable("nav_items", `${dir}/nav_items.json`);
  console.log("Pemulihan selesai.");
}
run();
' ./backups/backup_TERAKHIR
```

### Opsi B: Memulihkan Draf dari Riwayat Revisi Panel Admin

Jika kesalahan suntingan terjadi pada halaman tertentu, Anda tidak perlu
memulihkan seluruh database:

1. Masuk ke Panel Admin `/admin`.
2. Buka halaman yang dimaksud di Editor Blok.
3. Klik tombol **"📜 Riwayat Revisi"** di pojok kanan atas.
4. Pilih snapshot terbit terdahulu, lalu klik **"Pulihkan ke Draf"**.
5. Draf akan kembali ke keadaan semula untuk ditinjau dan diterbitkan ulang.
