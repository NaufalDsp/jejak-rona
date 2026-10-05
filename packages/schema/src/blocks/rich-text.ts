import { z } from "zod";

export const RichTextBlockSchema = z.object({
  id: z.string().min(1, { message: "ID blok rich_text wajib diisi." }),
  type: z.literal("rich_text"),
  heading: z.string().optional().or(z.literal("")),
  content: z.string().min(1, { message: "Isi teks tidak boleh kosong." }),
});

export type RichTextBlock = z.infer<typeof RichTextBlockSchema>;
