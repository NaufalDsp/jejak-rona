import type { Page, HeroMediaBlock } from "@jejak-rona/schema";

export interface DomainValidationResult {
  passed: boolean;
  code: string;
  message: string;
}

/**
 * Aturan Bisnis Domain: Hero Beranda Wajib Berisi Media
 * Sesuai prinsip produk Jejak Rona (PRD Bagian 1 & 5).
 */
export function checkHomeHeroMediaRule(page: Page): DomainValidationResult {
  if (!page.isHome) {
    return {
      passed: true,
      code: "NOT_HOME_PAGE",
      message: "Halaman bukan beranda; aturan hero wajib tidak mengikat.",
    };
  }

  const heroBlock = page.blocks.find(
    (block): block is HeroMediaBlock => block.type === "hero_media",
  );

  if (!heroBlock) {
    return {
      passed: false,
      code: "HERO_BLOCK_MISSING",
      message:
        'Beranda wajib memiliki blok "hero_media" sebagai pembuka visual.',
    };
  }

  if (
    !heroBlock.media ||
    !heroBlock.media.url ||
    heroBlock.media.url.trim().length === 0
  ) {
    return {
      passed: false,
      code: "HERO_MEDIA_EMPTY",
      message:
        "Hero beranda menolak publikasi: media foto atau video belum diisi.",
    };
  }

  return {
    passed: true,
    code: "HERO_VALID",
    message: "Hero beranda memenuhi aturan media.",
  };
}
