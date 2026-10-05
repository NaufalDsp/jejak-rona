import { z } from "zod";

export const SeoSchema = z.object({
  title: z
    .string()
    .min(1, { message: "Judul SEO tidak boleh kosong." })
    .max(70, { message: "Judul SEO maksimal 70 karakter." }),
  description: z
    .string()
    .max(160, { message: "Deskripsi SEO maksimal 160 karakter." })
    .default(""),
  ogImageUrl: z
    .string()
    .url({ message: "URL gambar Open Graph tidak valid." })
    .optional()
    .or(z.literal("")),
  canonicalUrl: z
    .string()
    .url({ message: "URL canonical tidak valid." })
    .optional()
    .or(z.literal("")),
  noIndex: z.boolean().default(false),
});

export type SeoMetadata = z.infer<typeof SeoSchema>;
