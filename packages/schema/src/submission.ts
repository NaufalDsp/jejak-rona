import { z } from "zod";

export const ContactSubmissionSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Nama pengirim minimal 2 karakter." })
    .max(100, { message: "Nama pengirim maksimal 100 karakter." }),
  email: z
    .string()
    .email({ message: "Alamat email tidak valid." })
    .max(120, { message: "Email maksimal 120 karakter." }),
  message: z
    .string()
    .min(10, { message: "Pesan minimal 10 karakter." })
    .max(3000, { message: "Pesan maksimal 3000 karakter." }),
  /**
   * Bidang honeypot anti-spam tersembunyi.
   * Harus kosong. Jika diisi oleh bot, permintaan langsung ditolak.
   */
  website: z
    .string()
    .max(0, { message: "Spam terdeteksi." })
    .optional()
    .or(z.literal("")),
});

export type ContactSubmission = z.infer<typeof ContactSubmissionSchema>;
