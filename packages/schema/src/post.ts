import { z } from "zod";
import { BlockSchema, type Block } from "./blocks/index.js";
import { SeoSchema } from "./seo.js";

export const PostStatusSchema = z.enum(["draft", "published", "archived"], {
  errorMap: () => ({
    message: 'Status artikel harus "draft", "published", atau "archived".',
  }),
});
export type PostStatus = z.infer<typeof PostStatusSchema>;

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const PostSchema = z.object({
  id: z.string().min(1, { message: "ID artikel wajib diisi." }),
  slug: z
    .string()
    .min(1, { message: "Slug artikel wajib diisi." })
    .max(120, { message: "Slug maksimal 120 karakter." })
    .regex(slugRegex, {
      message:
        "Slug hanya boleh berupa huruf kecil, angka, dan tanda hubung (-).",
    }),
  title: z
    .string()
    .min(1, { message: "Judul artikel wajib diisi." })
    .max(160, { message: "Judul maksimal 160 karakter." }),
  excerpt: z
    .string()
    .max(200, { message: "Ringkasan artikel maksimal 200 karakter." })
    .default(""),
  coverMediaId: z.string().nullable().optional(),
  tags: z.array(z.string()).default([]),
  status: PostStatusSchema.default("draft"),
  readingTimeMinutes: z.number().int().min(1).default(1),
  blocks: z.array(BlockSchema).default([]),
  seo: SeoSchema.optional(),
  publishedAt: z.string().or(z.date()).optional().nullable(),
  createdAt: z.string().or(z.date()).optional(),
  updatedAt: z.string().or(z.date()).optional(),
});

export type Post = z.infer<typeof PostSchema>;

/**
 * Menghitung perkiraan waktu baca berdasarkan kata dalam seluruh blok teks
 * Standar membaca tenang editorial nusantara: ~180-200 kata/menit.
 */
export function calculateReadingTimeMinutes(blocks: Block[]): number {
  if (!blocks || blocks.length === 0) return 1;

  let totalWords = 0;
  for (const block of blocks) {
    if (block.type === "rich_text") {
      const text = `${block.heading || ""} ${block.content || ""}`;
      totalWords += text.trim().split(/\s+/).filter(Boolean).length;
    }
  }

  const minutes = Math.ceil(totalWords / 180);
  return Math.max(1, minutes);
}

/**
 * Validasi artikel sebelum diterbitkan
 */
export function validatePostForPublish(post: Partial<Post>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!post.title || post.title.trim().length === 0) {
    errors.push("Judul artikel tidak boleh kosong.");
  }

  if (!post.slug || !slugRegex.test(post.slug)) {
    errors.push(
      "Slug artikel wajib diisi dan hanya menggunakan huruf kecil, angka, serta tanda hubung (-).",
    );
  }

  const blocks = (post.blocks || []) as Block[];
  if (blocks.length === 0) {
    errors.push(
      "Artikel tidak dapat diterbitkan karena belum memiliki blok konten.",
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
