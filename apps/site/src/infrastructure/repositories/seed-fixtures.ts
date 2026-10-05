import type { Page } from "@jejak-rona/schema";

/**
 * Fixture Data Statis Jejak Rona
 * Cerminan dari data di supabase/seed.sql untuk keperluan:
 * 1. Offline local development (tanpa harus terkoneksi ke Supabase langsung)
 * 2. Fallback tangguh jika database gratis sedang paused
 * 3. Unit pengujian ringan
 */
export const SEED_PAGES: Page[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    slug: "beranda",
    title: "Beranda Jejak Rona",
    status: "published",
    isHome: true,
    seo: {
      title: "Jejak Rona — Majalah Visual & Editorial",
      description:
        "Menelusuri keindahan visual nusantara dengan ritme tenang dan terkurasi.",
      noIndex: false,
    },
    blocks: [
      {
        id: "hero-home",
        type: "hero_media",
        variant: "staggered",
        line1: "JEJAK PERJALANAN",
        line2: "DI ANTARA RONA",
        subtext:
          "Menelusuri keindahan visual nusantara dengan pendekatan tenang dan terkurasi.",
        ctaLabel: "Tentang Jejak Rona",
        ctaUrl: "/tentang",
        scrimStrength: "medium",
        focalPoint: {
          desktop: { x: 50, y: 45 },
          mobile: { x: 50, y: 40 },
        },
        media: {
          id: "media-hero-home",
          kind: "image",
          url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=80",
          filename: "hero-landscape.webp",
          mimeType: "image/webp",
          width: 1920,
          height: 1080,
          alt: "Hamparan lembah berkabut di bawah langit pagi yang tenang",
          credit: "Unsplash (Unsplash License)",
          focalX: 50,
          focalY: 45,
          variants: [],
        },
      },
      {
        id: "rt-editorial",
        type: "rich_text",
        heading: "Catatan Redaksi",
        content:
          "<p>Jejak Rona lahir dari keinginan untuk memperlambat ritme visual. Setiap foto dan rekaman gerak diberi ruang bernapas penuh, sementara teks menjadi teman tenang yang menuntun pemaknaan.</p>",
      },
      {
        id: "img-full-home",
        type: "image_full",
        variant: "full",
        caption: "Keseimbangan antara material alami dan ruang hening.",
        media: {
          id: "media-full-1",
          kind: "image",
          url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=2560&q=80",
          filename: "forest-quiet.webp",
          mimeType: "image/webp",
          width: 2560,
          height: 1440,
          alt: "Hutan berkabut lebat dengan cahaya menembus pepohonan",
          credit: "Unsplash (Unsplash License)",
          focalX: 50,
          focalY: 50,
          variants: [],
        },
      },
    ],
    publishedAt: "2026-10-05T00:00:00.000Z",
    updatedAt: "2026-10-05T00:00:00.000Z",
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    slug: "tentang",
    title: "Tentang Jejak Rona",
    status: "published",
    isHome: false,
    seo: {
      title: "Tentang Jejak Rona — Prinsip Redaksi",
      description:
        "Filosofi visual, tipografi, dan pendekatan kami terhadap cerita editorial.",
      noIndex: false,
    },
    blocks: [
      {
        id: "rt-about-1",
        type: "rich_text",
        heading: "Filosofi Redaksi",
        content:
          "<p>Kami percaya bahwa foto yang baik tidak memerlukan teriakan warna atau tata letak yang penuh sesak. Jejak Rona mendedikasikan setiap halamannya untuk kejelasan, rasa hormat pada subjek foto, dan keterbacaan yang nyaman.</p>",
      },
    ],
    publishedAt: "2026-10-05T00:00:00.000Z",
    updatedAt: "2026-10-05T00:00:00.000Z",
  },
];

/**
 * Halaman Draf Khusus (Hanya ada di memory draf, TIDAK BOLEH muncul di publik)
 */
export const SEED_DRAFT_ONLY_PAGE: Page = {
  id: "33333333-3333-3333-3333-333333333333",
  slug: "rencana-edisi-khusus",
  title: "Rencana Edisi Khusus (Draf Internal)",
  status: "draft",
  isHome: false,
  seo: {
    title: "Draf Rahasia Internal",
    description: "Belum boleh terbit.",
    noIndex: true,
  },
  blocks: [
    {
      id: "rt-secret",
      type: "rich_text",
      heading: "Catatan Draf Belum Terbit",
      content:
        "<p>Ini adalah konten yang hanya boleh terlihat di panel editor dan tersembunyi dari publik.</p>",
    },
  ],
  publishedAt: null,
  updatedAt: "2026-10-05T00:00:00.000Z",
};
