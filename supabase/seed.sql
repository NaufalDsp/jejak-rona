-- Seed Data Awal Jejak Rona
-- Data contoh yang memenuhi skema Zod dan tidak mengandung konten berhak cipta luar.

-- ==============================================================================
-- 1. Pengaturan Situs Global
-- ==============================================================================
insert into public.site_settings (key, value)
values
  ('general', '{
    "siteName": "Jejak Rona",
    "wordmark": "JEJAK RONA",
    "description": "Majalah visual dan editorial terkurasi. Menghadirkan narasi tenang melalui fotografi jujur dan tipografi berbobot.",
    "footerText": "© 2026 Jejak Rona. Hak cipta dilindungi.",
    "cookieBannerText": "Kami menggunakan penyimpanan lokal untuk mengingat preferensi Anda demi pengalaman membaca yang nyaman."
  }'::jsonb)
on conflict (key) do update set value = excluded.value;

-- ==============================================================================
-- 2. Halaman Beranda (Status: Published, is_home = true)
-- ==============================================================================
insert into public.pages (
  id,
  slug,
  title,
  status,
  is_home,
  seo,
  draft,
  published,
  published_at
)
values (
  '11111111-1111-1111-1111-111111111111',
  'beranda',
  'Beranda Jejak Rona',
  'published',
  true,
  '{
    "title": "Jejak Rona — Majalah Visual & Editorial",
    "description": "Menelusuri keindahan visual nusantara dengan ritme tenang dan terkurasi.",
    "noIndex": false
  }'::jsonb,
  '[
    {
      "id": "hero-home",
      "type": "hero_media",
      "variant": "staggered",
      "line1": "JEJAK PERJALANAN",
      "line2": "DI ANTARA RONA",
      "subtext": "Menelusuri keindahan visual nusantara dengan pendekatan tenang dan terkurasi.",
      "ctaLabel": "Tentang Jejak Rona",
      "ctaUrl": "/tentang",
      "scrimStrength": "medium",
      "focalPoint": {
        "desktop": { "x": 50, "y": 45 },
        "mobile": { "x": 50, "y": 40 }
      },
      "media": {
        "id": "media-hero-home",
        "kind": "image",
        "url": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=80",
        "filename": "hero-landscape.webp",
        "mimeType": "image/webp",
        "width": 1920,
        "height": 1080,
        "alt": "Hamparan lembah berkabut di bawah langit pagi yang tenang",
        "credit": "Unsplash (Unsplash License)",
        "focalX": 50,
        "focalY": 45
      }
    },
    {
      "id": "rt-editorial",
      "type": "rich_text",
      "heading": "Catatan Redaksi",
      "content": "<p>Jejak Rona lahir dari keinginan untuk memperlambat ritme visual. Setiap foto dan rekaman gerak diberi ruang bernapas penuh, sementara teks menjadi teman tenang yang menuntun pemaknaan.</p>"
    },
    {
      "id": "img-full-home",
      "type": "image_full",
      "variant": "full",
      "caption": "",
      "media": {
        "id": "media-full-1",
        "kind": "image",
        "url": "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=2560&q=80",
        "filename": "forest-quiet.webp",
        "mimeType": "image/webp",
        "width": 2560,
        "height": 1440,
        "alt": "Hutan berkabut lebat dengan cahaya menembus pepohonan",
        "credit": ""
      }
    }
  ]'::jsonb,
  '[
    {
      "id": "hero-home",
      "type": "hero_media",
      "variant": "staggered",
      "line1": "JEJAK PERJALANAN",
      "line2": "DI ANTARA RONA",
      "subtext": "Menelusuri keindahan visual nusantara dengan pendekatan tenang dan terkurasi.",
      "ctaLabel": "Tentang Jejak Rona",
      "ctaUrl": "/tentang",
      "scrimStrength": "medium",
      "focalPoint": {
        "desktop": { "x": 50, "y": 45 },
        "mobile": { "x": 50, "y": 40 }
      },
      "media": {
        "id": "media-hero-home",
        "kind": "image",
        "url": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=80",
        "filename": "hero-landscape.webp",
        "mimeType": "image/webp",
        "width": 1920,
        "height": 1080,
        "alt": "Hamparan lembah berkabut di bawah langit pagi yang tenang",
        "credit": "Unsplash (Unsplash License)",
        "focalX": 50,
        "focalY": 45
      }
    },
    {
      "id": "rt-editorial",
      "type": "rich_text",
      "heading": "Catatan Redaksi",
      "content": "<p>Jejak Rona lahir dari keinginan untuk memperlambat ritme visual. Setiap foto dan rekaman gerak diberi ruang bernapas penuh, sementara teks menjadi teman tenang yang menuntun pemaknaan.</p>"
    },
    {
      "id": "img-full-home",
      "type": "image_full",
      "variant": "full",
      "caption": "",
      "media": {
        "id": "media-full-1",
        "kind": "image",
        "url": "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=2560&q=80",
        "filename": "forest-quiet.webp",
        "mimeType": "image/webp",
        "width": 2560,
        "height": 1440,
        "alt": "Hutan berkabut lebat dengan cahaya menembus pepohonan",
        "credit": ""
      }
    }
  ]'::jsonb,
  now()
)
on conflict (slug) do nothing;

-- ==============================================================================
-- 3. Halaman Umum: Tentang (Status: Published)
-- ==============================================================================
insert into public.pages (
  id,
  slug,
  title,
  status,
  is_home,
  seo,
  draft,
  published,
  published_at
)
values (
  '22222222-2222-2222-2222-222222222222',
  'tentang',
  'Tentang Jejak Rona',
  'published',
  false,
  '{
    "title": "Tentang Jejak Rona — Prinsip Redaksi",
    "description": "Filosofi visual, tipografi, dan pendekatan kami terhadap cerita editorial.",
    "noIndex": false
  }'::jsonb,
  '[
    {
      "id": "hero-about",
      "type": "hero_media",
      "variant": "left",
      "line1": "TENTANG",
      "line2": "JEJAK RONA",
      "subtext": "Ruang bagi foto yang jujur dan cerita yang bertahan.",
      "scrimStrength": "medium",
      "focalPoint": { "desktop": { "x": 50, "y": 45 }, "mobile": { "x": 50, "y": 45 } },
      "media": {
        "id": "media-hero-about",
        "kind": "image",
        "url": "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1920&q=80",
        "filename": "about-landscape.webp",
        "mimeType": "image/webp",
        "width": 1920,
        "height": 1080,
        "alt": "Pegunungan dan danau yang tenang di bawah cahaya pagi",
        "credit": "Unsplash (Unsplash License)",
        "focalX": 50,
        "focalY": 45
      }
    },
    {
      "id": "rt-about-1",
      "type": "rich_text",
      "heading": "Filosofi Redaksi",
      "content": "<p>Kami percaya bahwa foto yang baik tidak memerlukan teriakan warna atau tata letak yang penuh sesak. Jejak Rona mendedikasikan setiap halamannya untuk kejelasan, rasa hormat pada subjek foto, dan keterbacaan yang nyaman.</p>"
    }
  ]'::jsonb,
  '[
    {
      "id": "hero-about",
      "type": "hero_media",
      "variant": "left",
      "line1": "TENTANG",
      "line2": "JEJAK RONA",
      "subtext": "Ruang bagi foto yang jujur dan cerita yang bertahan.",
      "scrimStrength": "medium",
      "focalPoint": { "desktop": { "x": 50, "y": 45 }, "mobile": { "x": 50, "y": 45 } },
      "media": {
        "id": "media-hero-about",
        "kind": "image",
        "url": "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1920&q=80",
        "filename": "about-landscape.webp",
        "mimeType": "image/webp",
        "width": 1920,
        "height": 1080,
        "alt": "Pegunungan dan danau yang tenang di bawah cahaya pagi",
        "credit": "Unsplash (Unsplash License)",
        "focalX": 50,
        "focalY": 45
      }
    },
    {
      "id": "rt-about-1",
      "type": "rich_text",
      "heading": "Filosofi Redaksi",
      "content": "<p>Kami percaya bahwa foto yang baik tidak memerlukan teriakan warna atau tata letak yang penuh sesak. Jejak Rona mendedikasikan setiap halamannya untuk kejelasan, rasa hormat pada subjek foto, dan keterbacaan yang nyaman.</p>"
    }
  ]'::jsonb,
  now()
)
on conflict (slug) do nothing;

-- ==============================================================================
-- 4. Halaman Khusus Draf (Status: Draft, published = null)
-- Halaman ini BUKTI ISOLASI: TIDAK BOLEH muncul di view pages_public
-- ==============================================================================
insert into public.pages (
  id,
  slug,
  title,
  status,
  is_home,
  seo,
  draft,
  published,
  published_at
)
values (
  '33333333-3333-3333-3333-333333333333',
  'rencana-edisi-khusus',
  'Rencana Edisi Khusus (Draf Internal)',
  'draft',
  false,
  '{
    "title": "Draf Rahasia Internal",
    "description": "Belum boleh terbit.",
    "noIndex": true
  }'::jsonb,
  '[
    {
      "id": "rt-secret",
      "type": "rich_text",
      "heading": "Catatan Draf Belum Terbit",
      "content": "<p>Ini adalah konten yang hanya boleh terlihat di panel editor dan tersembunyi dari publik.</p>"
    }
  ]'::jsonb,
  null,
  null
)
on conflict (slug) do nothing;

