import type { Post } from "@jejak-rona/schema";

export interface PublishedPostDto {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverMediaId?: string | null;
  coverImageUrl?: string | null;
  tags: string[];
  readingTimeMinutes: number;
  blocks: any[];
  publishedAt: string;
}

export interface PostRepositoryPort {
  /**
   * Mengambil semua artikel yang sudah berstatus terbit, terurut descending berdasarkan tanggal.
   */
  getPublishedPosts(): Promise<PublishedPostDto[]>;

  /**
   * Mengambil satu artikel terbit berdasarkan slug URL.
   */
  getPublishedBySlug(slug: string): Promise<PublishedPostDto | null>;

  /**
   * Mengambil artikel terkait berdasarkan irisan tag topik.
   */
  getRelatedPosts(
    currentSlug: string,
    tags: string[],
    limit?: number,
  ): Promise<PublishedPostDto[]>;
}
