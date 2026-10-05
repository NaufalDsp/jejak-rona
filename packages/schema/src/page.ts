import { z } from "zod";
import { SeoSchema } from "./seo.js";
import { BlockSchema } from "./blocks/index.js";

export const PageStatusSchema = z.enum(["draft", "published", "archived"], {
  errorMap: () => ({
    message: 'Status halaman harus "draft", "published", atau "archived".',
  }),
});
export type PageStatus = z.infer<typeof PageStatusSchema>;

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const PageSchema = z.object({
  id: z.string().min(1, { message: "ID halaman wajib diisi." }),
  slug: z
    .string()
    .min(1, { message: "Slug halaman wajib diisi." })
    .max(100, { message: "Slug maksimal 100 karakter." })
    .regex(slugRegex, {
      message:
        "Slug hanya boleh menggunakan huruf kecil, angka, dan tanda hubung (-).",
    }),
  title: z
    .string()
    .min(1, { message: "Judul halaman wajib diisi." })
    .max(120, { message: "Judul maksimal 120 karakter." }),
  status: PageStatusSchema.default("draft"),
  isHome: z.boolean().default(false),
  seo: SeoSchema,
  blocks: z.array(BlockSchema).default([]),
  updatedBy: z.string().optional(),
  updatedAt: z.string().or(z.date()).optional(),
  publishedAt: z.string().or(z.date()).optional().nullable(),
});

export type Page = z.infer<typeof PageSchema>;

/**
 * Aturan Validasi Khusus Publikasi Halaman (Domain Rule)
 * Memastikan aturan sistem:
 * 1. Halaman beranda (isHome = true) WAJIB memiliki blok hero_media pertama yang berisi media valid.
 * 2. Halaman tidak boleh kosong (minimal 1 blok).
 */
export function validatePageForPublish(page: Page): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!page.blocks || page.blocks.length === 0) {
    errors.push(
      "Halaman tidak dapat dipublikasikan karena belum memiliki blok konten.",
    );
  }

  if (page.isHome) {
    const heroBlock = page.blocks?.find((b) => b.type === "hero_media");

    if (!heroBlock) {
      errors.push(
        'Beranda wajib memiliki blok "hero_media" sebagai pembuka visual.',
      );
    } else if (
      !heroBlock.media ||
      !heroBlock.media.url ||
      heroBlock.media.url.trim().length === 0
    ) {
      errors.push(
        "Hero beranda wajib memiliki media foto atau video yang valid. Publikasi ditolak.",
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
