import type { SupabaseClient } from "@supabase/supabase-js";
import type { Page } from "@jejak-rona/schema";
import type { PageRepositoryPort } from "../../application/ports/page-repository.port.js";
import { createPublicSupabaseClient } from "./supabase-client.js";
import { FixturePageRepository } from "../repositories/fixture-page.repository.js";

export interface PublicPageViewRow {
  id: string;
  slug: string;
  title: string;
  published: unknown;
  seo: unknown;
  is_home: boolean;
  published_at: string | null;
}

/**
 * SupabasePageRepository
 * Implementasi konkret PageRepositoryPort menggunakan Supabase Postgres.
 * Membaca data publik HANYA dari view `pages_public` sesuai PRD Bagian 9.
 */
export class SupabasePageRepository implements PageRepositoryPort {
  private fallbackRepo: FixturePageRepository;

  constructor(private client?: SupabaseClient | null) {
    this.fallbackRepo = new FixturePageRepository();
    if (client === undefined) {
      this.client = createPublicSupabaseClient();
    }
  }

  private mapRowToPage(row: PublicPageViewRow): Page {
    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      status: "published",
      isHome: row.is_home,
      seo: (row.seo as Page["seo"]) || { title: row.title, description: "" },
      blocks: Array.isArray(row.published)
        ? (row.published as Page["blocks"])
        : [],
      publishedAt: row.published_at,
    };
  }

  async getPublishedBySlug(slug: string): Promise<Page | null> {
    if (!this.client) {
      return this.fallbackRepo.getPublishedBySlug(slug);
    }

    try {
      const { data, error } = await this.client
        .from("pages_public")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (error || !data) {
        return this.fallbackRepo.getPublishedBySlug(slug);
      }

      return this.mapRowToPage(data as PublicPageViewRow);
    } catch {
      return this.fallbackRepo.getPublishedBySlug(slug);
    }
  }

  async getPublishedHome(): Promise<Page | null> {
    if (!this.client) {
      return this.fallbackRepo.getPublishedHome();
    }

    try {
      const { data, error } = await this.client
        .from("pages_public")
        .select("*")
        .eq("is_home", true)
        .maybeSingle();

      if (error || !data) {
        return this.fallbackRepo.getPublishedHome();
      }

      return this.mapRowToPage(data as PublicPageViewRow);
    } catch {
      return this.fallbackRepo.getPublishedHome();
    }
  }

  async listPublishedPages(): Promise<Page[]> {
    if (!this.client) {
      return this.fallbackRepo.listPublishedPages();
    }

    try {
      const { data, error } = await this.client
        .from("pages_public")
        .select("*")
        .order("is_home", { ascending: false });

      if (error || !data) {
        return this.fallbackRepo.listPublishedPages();
      }

      return (data as PublicPageViewRow[]).map((row) => this.mapRowToPage(row));
    } catch {
      return this.fallbackRepo.listPublishedPages();
    }
  }

  async getDraftById(id: string): Promise<Page | null> {
    // Pengambilan draft membutuhkan sesi staff (dilayani di panel admin/Pages Function)
    return this.fallbackRepo.getDraftById(id);
  }

  async saveDraft(page: Page): Promise<Page> {
    return this.fallbackRepo.saveDraft(page);
  }

  async publishPage(
    id: string,
    snapshot: Page,
  ): Promise<{ success: boolean; publishedAt: string }> {
    return this.fallbackRepo.publishPage(id, snapshot);
  }
}
