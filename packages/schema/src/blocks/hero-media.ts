import { z } from "zod";
import { MediaItemSchema } from "../media.js";

export const HeroVariantSchema = z.enum(["staggered", "left"], {
  errorMap: () => ({
    message: 'Varian hero harus "staggered" (bertingkat) atau "left" (kiri).',
  }),
});
export type HeroVariant = z.infer<typeof HeroVariantSchema>;

export const ScrimStrengthSchema = z.enum(["light", "medium", "heavy"], {
  errorMap: () => ({
    message:
      'Kekuatan scrim harus "light" (ringan), "medium" (sedang), atau "heavy" (kuat).',
  }),
});
export type ScrimStrength = z.infer<typeof ScrimStrengthSchema>;

export const FocalPointCoordSchema = z.object({
  x: z
    .number()
    .min(0, "Nilai X titik fokus minimal 0")
    .max(100, "Nilai X titik fokus maksimal 100"),
  y: z
    .number()
    .min(0, "Nilai Y titik fokus minimal 0")
    .max(100, "Nilai Y titik fokus maksimal 100"),
});
export type FocalPointCoord = z.infer<typeof FocalPointCoordSchema>;

export const HeroMediaBlockSchema = z
  .object({
    id: z.string().min(1, { message: "ID blok hero wajib diisi." }),
    type: z.literal("hero_media"),
    variant: HeroVariantSchema.default("staggered"),
    line1: z
      .string()
      .min(1, { message: "Headline baris 1 wajib diisi." })
      .max(18, { message: "Headline baris 1 maksimal 18 karakter." }),
    line2: z
      .string()
      .min(1, { message: "Headline baris 2 wajib diisi." })
      .max(18, { message: "Headline baris 2 maksimal 18 karakter." }),
    subtext: z
      .string()
      .max(140, { message: "Subteks hero maksimal 140 karakter." })
      .default(""),
    ctaLabel: z.string().optional().or(z.literal("")),
    ctaUrl: z.string().optional().or(z.literal("")),
    media: MediaItemSchema,
    poster: z
      .string()
      .url({ message: "URL poster tidak valid." })
      .optional()
      .or(z.literal("")),
    mobileMedia: MediaItemSchema.optional(),
    focalPoint: z
      .object({
        desktop: FocalPointCoordSchema.default({ x: 50, y: 50 }),
        mobile: FocalPointCoordSchema.default({ x: 50, y: 50 }),
      })
      .default({
        desktop: { x: 50, y: 50 },
        mobile: { x: 50, y: 50 },
      }),
    scrimStrength: ScrimStrengthSchema.default("medium"),
    fullVideoUrl: z
      .string()
      .url({ message: "URL video penuh tidak valid." })
      .optional()
      .or(z.literal("")),
  })
  .refine(
    (data) => {
      // Jika media berupa video, poster wajib ada (baik di media.posterUrl atau field poster)
      if (data.media && data.media.kind === "video") {
        const hasPoster =
          (data.poster && data.poster.trim().length > 0) ||
          (data.media.posterUrl && data.media.posterUrl.trim().length > 0);
        return hasPoster;
      }
      return true;
    },
    {
      message: "Video hero wajib memiliki poster gambar untuk LCP awal.",
      path: ["poster"],
    },
  );

export type HeroMediaBlock = z.infer<typeof HeroMediaBlockSchema>;
