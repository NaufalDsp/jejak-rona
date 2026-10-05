import type { Page } from "@jejak-rona/schema";
import type { PageRepositoryPort } from "../../application/ports/page-repository.port.js";
import { SEED_PAGES, SEED_DRAFT_ONLY_PAGE } from "./seed-fixtures.js";

/**
 * FixturePageRepository
 * Implementasi in-memory PageRepositoryPort untuk:
 * - Pengujian use case tanpa network latency
 * - Local static generation saat offline
 */
export class FixturePageRepository implements PageRepositoryPort {
  private pages: Map<string, Page> = new Map();

  constructor(initialPages?: Page[]) {
    const list = initialPages ?? [...SEED_PAGES, SEED_DRAFT_ONLY_PAGE];
    for (const page of list) {
      this.pages.set(page.id, { ...page });
    }
  }

  async getPublishedBySlug(slug: string): Promise<Page | null> {
    for (const page of this.pages.values()) {
      if (page.slug === slug && page.status === "published") {
        return { ...page };
      }
    }
    return null;
  }

  async getPublishedHome(): Promise<Page | null> {
    for (const page of this.pages.values()) {
      if (page.isHome && page.status === "published") {
        return { ...page };
      }
    }
    return null;
  }

  async listPublishedPages(): Promise<Page[]> {
    const results: Page[] = [];
    for (const page of this.pages.values()) {
      if (page.status === "published") {
        results.push({ ...page });
      }
    }
    return results;
  }

  async getDraftById(id: string): Promise<Page | null> {
    const page = this.pages.get(id);
    return page ? { ...page } : null;
  }

  async saveDraft(page: Page): Promise<Page> {
    const updated: Page = {
      ...page,
      updatedAt: new Date().toISOString(),
    };
    this.pages.set(page.id, updated);
    return { ...updated };
  }

  async publishPage(
    id: string,
    snapshot: Page,
  ): Promise<{ success: boolean; publishedAt: string }> {
    const nowIso = new Date().toISOString();
    const publishedPage: Page = {
      ...snapshot,
      id,
      status: "published",
      publishedAt: nowIso,
      updatedAt: nowIso,
    };
    this.pages.set(id, publishedPage);
    return {
      success: true,
      publishedAt: nowIso,
    };
  }
}
