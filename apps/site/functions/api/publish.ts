/**
 * Cloudflare Pages Function: POST /api/publish
 *
 * Menerima permintaan publikasi halaman dari panel admin.
 * Memvalidasi token Supabase, memastikan aturan hero/konten terpenuhi,
 * menyalin draft ke published, dan memicu webhook deploy.
 */

export interface PublishRequestPayload {
  pageId: string;
}

export interface PublishResponsePayload {
  success: boolean;
  message: string;
  buildQueuedAt?: string;
}
