/**
 * Blocks UI Registry — Jejak Rona
 *
 * Komponen blok konten visual yang dipakai bersama oleh situs publik statis (Astro)
 * dan pratinjau live di panel admin (React).
 */

export const supportedBlocks = [
  "hero_media",
  "rich_text",
  "image_full",
] as const;

export type SupportedBlockType = (typeof supportedBlocks)[number];
