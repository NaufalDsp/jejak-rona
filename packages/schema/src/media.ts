import { z } from "zod";

export const MediaKindSchema = z.enum(["image", "video"], {
  errorMap: () => ({
    message: 'Jenis media harus berupa "image" atau "video".',
  }),
});
export type MediaKind = z.infer<typeof MediaKindSchema>;

export const MediaVariantSchema = z.object({
  format: z.enum(["avif", "webp", "jpeg", "png", "mp4", "webm"]),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  url: z.string().url({ message: "URL varian media tidak valid." }),
  bytes: z.number().int().nonnegative().optional(),
});
export type MediaVariant = z.infer<typeof MediaVariantSchema>;

export const MediaItemSchema = z.object({
  id: z.string().min(1, { message: "ID media wajib diisi." }),
  kind: MediaKindSchema,
  url: z.string().url({ message: "URL media harus valid." }),
  r2Key: z.string().optional(),
  filename: z.string().min(1, { message: "Nama file media wajib diisi." }),
  mimeType: z.string().min(1, { message: "MIME type media wajib diisi." }),
  bytes: z.number().int().positive().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  durationS: z.number().positive().optional(),
  alt: z.string().default(""),
  credit: z.string().optional(),
  focalX: z.number().min(0).max(100).default(50),
  focalY: z.number().min(0).max(100).default(50),
  variants: z.array(MediaVariantSchema).default([]),
  posterUrl: z.string().url().optional(),
});
export type MediaItem = z.infer<typeof MediaItemSchema>;
