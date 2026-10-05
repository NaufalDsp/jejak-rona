import { z } from "zod";
import { MediaItemSchema } from "../media.js";

export const ImageFullVariantSchema = z.enum(["full", "inset"], {
  errorMap: () => ({
    message:
      'Varian image_full harus "full" (penuh) atau "inset" (dalam-margin).',
  }),
});
export type ImageFullVariant = z.infer<typeof ImageFullVariantSchema>;

export const ImageFullBlockSchema = z
  .object({
    id: z.string().min(1, { message: "ID blok image_full wajib diisi." }),
    type: z.literal("image_full"),
    variant: ImageFullVariantSchema.default("full"),
    media: MediaItemSchema,
    caption: z.string().optional().or(z.literal("")),
  })
  .refine(
    (data) => {
      // Alt teks wajib diisi untuk image_full sesuai PRD section 10
      return data.media.alt && data.media.alt.trim().length > 0;
    },
    {
      message: "Teks alt pada gambar penuh wajib diisi untuk aksesibilitas.",
      path: ["media", "alt"],
    },
  );

export type ImageFullBlock = z.infer<typeof ImageFullBlockSchema>;
