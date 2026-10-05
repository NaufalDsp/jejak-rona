/**
 * Cek Ringan Kontrak & Aturan Domain — Jejak Rona (Tahap 2)
 * Memverifikasi safeParse valid vs invalid tanpa memerlukan framework testing yang rumit.
 */

import {
  HeroMediaBlockSchema,
  ImageFullBlockSchema,
  RichTextBlockSchema,
  PageSchema,
  validatePageForPublish,
  type Page,
} from "./index.js";

let passedChecks = 0;
let totalChecks = 0;

function assert(condition: boolean, description: string) {
  totalChecks++;
  if (condition) {
    passedChecks++;
    console.log(`[PASS] ${description}`);
  } else {
    console.error(`[FAIL] ${description}`);
    process.exitCode = 1;
  }
}

console.log("--- Memulai Verifikasi Kontrak Skema Jejak Rona ---\n");

// 1. Uji Blok Hero Media — Kasus Valid
const validHero = HeroMediaBlockSchema.safeParse({
  id: "hero-1",
  type: "hero_media",
  variant: "staggered",
  line1: "JEJAK PERJALANAN",
  line2: "DI ANTARA RONA",
  subtext:
    "Menelusuri keindahan visual editorial nusantara dengan pendekatan tenang dan terkurasi.",
  ctaLabel: "Jelajahi",
  ctaUrl: "/tentang",
  media: {
    id: "media-1",
    kind: "image",
    url: "https://media.jejakrona.com/sample.webp",
    filename: "sample.webp",
    mimeType: "image/webp",
    alt: "Pemandangan alam terbuka dengan cahaya pagi hangat",
  },
});
assert(validHero.success, "HeroMediaBlock valid berhasil di-parse");

// 2. Uji Blok Hero Media — Kasus Invalid (Headline melebihi 18 karakter)
const invalidHeadlineHero = HeroMediaBlockSchema.safeParse({
  id: "hero-2",
  type: "hero_media",
  line1: "INI HEADLINE YANG TERLALU PANJANG LEBIH DARI 18",
  line2: "BARIS KEDUA",
  media: {
    id: "media-2",
    kind: "image",
    url: "https://media.jejakrona.com/sample.webp",
    filename: "sample.webp",
    mimeType: "image/webp",
    alt: "Foto",
  },
});
assert(
  !invalidHeadlineHero.success &&
    invalidHeadlineHero.error.issues.some((i) =>
      i.message.includes("maksimal 18 karakter"),
    ),
  "HeroMediaBlock dengan headline > 18 karakter ditolak dengan pesan yang tepat",
);

// 3. Uji Blok Hero Media — Kasus Video Tanpa Poster
const invalidVideoHero = HeroMediaBlockSchema.safeParse({
  id: "hero-3",
  type: "hero_media",
  line1: "SUASANA ALAM",
  line2: "HENING SENJA",
  media: {
    id: "media-3",
    kind: "video",
    url: "https://media.jejakrona.com/loop.mp4",
    filename: "loop.mp4",
    mimeType: "video/mp4",
    alt: "Video hening senja",
  },
});
assert(
  !invalidVideoHero.success &&
    invalidVideoHero.error.issues.some((i) =>
      i.message.includes("wajib memiliki poster"),
    ),
  "HeroMediaBlock video tanpa poster ditolak untuk melindungi LCP",
);

// 4. Uji Blok Image Full — Kasus Alt Teks Kosong (Wajib Alt untuk Aksesibilitas)
const invalidImageAlt = ImageFullBlockSchema.safeParse({
  id: "img-1",
  type: "image_full",
  variant: "full",
  media: {
    id: "media-4",
    kind: "image",
    url: "https://media.jejakrona.com/full.webp",
    filename: "full.webp",
    mimeType: "image/webp",
    alt: "", // Kosong!
  },
});
assert(
  !invalidImageAlt.success &&
    invalidImageAlt.error.issues.some((i) =>
      i.message.includes("alt pada gambar penuh wajib"),
    ),
  "ImageFullBlock tanpa alt teks ditolak untuk aksesibilitas",
);

// 5. Uji Blok Rich Text — Kasus Valid
const validRichText = RichTextBlockSchema.safeParse({
  id: "rt-1",
  type: "rich_text",
  heading: "Catatan Redaksi",
  content:
    "<p>Ruang pandang yang dihadirkan melalui cerita-cerita pilihan.</p>",
});
assert(validRichText.success, "RichTextBlock valid berhasil di-parse");

// 6. Uji Aturan Domain: Beranda Wajib Memiliki Hero Berisi Media
const validHomePage: Page = {
  id: "page-home",
  slug: "beranda",
  title: "Beranda Jejak Rona",
  status: "draft",
  isHome: true,
  seo: {
    title: "Jejak Rona — Majalah Visual Editorial",
    description: "Dokumentasi visual dan cerita pilihan bernuansa tenang.",
    noIndex: false,
  },
  blocks: [validHero.data!],
};
const homeCheckValid = validatePageForPublish(validHomePage);
assert(
  homeCheckValid.isValid,
  "Beranda dengan hero bermedia lolos validasi publikasi",
);

const invalidHomeNoHero: Page = {
  ...validHomePage,
  blocks: [validRichText.data!], // Hanya rich text, tanpa hero!
};
const homeCheckNoHero = validatePageForPublish(invalidHomeNoHero);
assert(
  !homeCheckNoHero.isValid &&
    homeCheckNoHero.errors.some((err) =>
      err.includes('wajib memiliki blok "hero_media"'),
    ),
  "Beranda tanpa hero_media ditolak publikasi sesuai aturan produk PRD Bagian 1",
);

console.log(
  `\nHasil: ${passedChecks}/${totalChecks} pengujian kontrak berhasil lolos.\n`,
);
