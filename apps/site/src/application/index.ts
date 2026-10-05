/**
 * Application Layer — Jejak Rona
 *
 * Mengorkestrasi aliran data, use cases, serta antarmuka (ports/repository interfaces).
 * Bergantung pada Domain, namun tidak mengikat diri pada database spesifik.
 */

export interface PageRepositoryPort {
  getPublishedBySlug(slug: string): Promise<unknown | null>;
  listPublished(): Promise<unknown[]>;
}
