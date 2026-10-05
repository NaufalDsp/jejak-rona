import type { Page } from "@jejak-rona/schema";

/**
 * Port Repositori Halaman (Clean Architecture)
 * Mendefinisikan kontrak akses data yang akan diimplementasikan oleh adapter Supabase di infrastruktur.
 */
export interface PageRepositoryPort {
  /**
   * Mengambil halaman terbit berdasarkan slug (digunakan saat build Astro)
   */
  getPublishedBySlug(slug: string): Promise<Page | null>;

  /**
   * Mengambil halaman beranda yang sudah terbit
   */
  getPublishedHome(): Promise<Page | null>;

  /**
   * Mendaftar seluruh halaman terbit untuk sitemap dan navigasi
   */
  listPublishedPages(): Promise<Page[]>;

  /**
   * Mengambil draf halaman untuk panel admin / editor
   */
  getDraftById(id: string): Promise<Page | null>;

  /**
   * Menyimpan perubahan draf halaman dari editor
   */
  saveDraft(page: Page): Promise<Page>;

  /**
   * Menyalin snapshot draf ke status published dan mencatat riwayat revisi
   */
  publishPage(
    id: string,
    snapshot: Page,
  ): Promise<{ success: boolean; publishedAt: string }>;
}
