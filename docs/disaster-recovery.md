# Panduan Kesiapan Bencana & Pemulihan (Disaster Recovery) — Jejak Rona

Dokumen ini adalah standar operasional darurat bagi tim teknis Jejak Rona untuk
menangani insiden data, rotasi kunci keamanan, atau kegagalan infrastruktur.

---

## 1. Topologi Infrastruktur

- **Frontend & Static Delivery**: Cloudflare Pages (Astro SSG output,
  zero-maintenance runtime).
- **Database & Otentikasi**: Supabase Cloud (PostgreSQL 15+, Row Level Security,
  Auth).
- **Penyimpanan Objek Media**: Cloudflare R2 / Supabase Storage.

---

## 2. Prosedur Pencadangan Rutin

Pencadangan dijalankan otomatis atau manual sebelum perubahan besar:

```powershell
# Di Windows PowerShell:
.\scripts\backup-db.ps1

# Di Linux / Mac:
./scripts/backup-db.sh
```

Cadangan berisi dump JSON dari seluruh entitas (`pages`, `posts`, `media`,
`revisions`, `site_settings`, `nav_items`, `submissions`).

---

## 3. Menjaga Database Supabase dari "Pause" (Keepalive)

- Workflow `.github/workflows/supabase-keepalive.yml` telah dipasang untuk
  mengirim ping REST API berkala setiap 5 hari.
- Pastikan Secrets `PUBLIC_SUPABASE_URL` dan `PUBLIC_SUPABASE_ANON_KEY` diset
  pada tab Settings > Secrets and variables > Actions di GitHub repositori.

---

## 4. Prosedur Rotasi Kunci & Token Keamanan (Security Key Rotation)

Jika kunci atau token terindikasi bocor:

1. **Supabase API Keys**:
   - Buka Supabase Dashboard > Project Settings > API.
   - Klik **"Generate new JWT Secret"** (ini akan merevoke semua token JWT
     lama).
   - Perbarui `PUBLIC_SUPABASE_ANON_KEY` dan `SUPABASE_SERVICE_ROLE_KEY` pada
     repositori dan Cloudflare Pages Environment Variables.
2. **Deploy Hook Webhook**:
   - Buka Cloudflare Pages > Settings > Builds & deployments > Deploy hooks.
   - Hapus hook lama dan buat yang baru, lalu perbarui nilai
     `PUBLIC_DEPLOY_HOOK_URL`.
3. **Memicu Ulang Build Bersih**:
   - Jalankan `npx --workspace=@jejak-rona/site astro build` atau picu deploy
     manual di Cloudflare Pages.
