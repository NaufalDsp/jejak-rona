import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  PostRepositoryPort,
  PublishedPostDto,
} from "../../application/ports/post-repository.port.js";
import { FixturePostRepository } from "../repositories/fixture-post.repository.js";
import { createPublicSupabaseClient } from "./supabase-client.js";
import { resolvePostCover } from "../../lib/image-resolver.js";

export class SupabasePostRepository implements PostRepositoryPort {
  private fallbackRepo: FixturePostRepository;

  constructor(private client?: SupabaseClient | null) {
    this.fallbackRepo = new FixturePostRepository();
    if (client === undefined) {
      this.client = createPublicSupabaseClient();
    }
  }

  async getPublishedPosts(): Promise<PublishedPostDto[]> {
    if (!this.client) {
      return this.fallbackRepo.getPublishedPosts();
    }

    try {
      const { data, error } = await this.client
        .from("posts")
        .select(
          "id, slug, title, excerpt, cover_media_id, tags, reading_time_minutes, published, published_at",
        )
        .eq("status", "published")
        .order("published_at", { ascending: false });

      if (error || !data || data.length === 0) {
        return this.fallbackRepo.getPublishedPosts();
      }

      const remotePosts: PublishedPostDto[] = data.map((item) => ({
        id: item.id,
        slug: item.slug,
        title: item.title,
        excerpt: item.excerpt || "",
        coverMediaId: item.cover_media_id,
        coverImageUrl: resolvePostCover(item.slug, null),
        tags: item.tags || [],
        readingTimeMinutes: item.reading_time_minutes || 1,
        blocks: item.published?.blocks || [],
        publishedAt: item.published_at || new Date().toISOString(),
      }));

      // Lengkapi dengan fallback posts jika ada narasi otentik yang belum tersinkronisasi
      const fallbackList = await this.fallbackRepo.getPublishedPosts();
      const existingSlugs = new Set(remotePosts.map((p) => p.slug));
      const combined = [...remotePosts];

      for (const fb of fallbackList) {
        if (!existingSlugs.has(fb.slug)) {
          combined.push(fb);
        }
      }

      return combined.sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
      );
    } catch {
      return this.fallbackRepo.getPublishedPosts();
    }
  }

  async getPublishedBySlug(slug: string): Promise<PublishedPostDto | null> {
    const all = await this.getPublishedPosts();
    return all.find((p) => p.slug === slug) || null;
  }

  async getRelatedPosts(
    currentSlug: string,
    tags: string[],
    limit: number = 2,
  ): Promise<PublishedPostDto[]> {
    const all = await this.getPublishedPosts();
    const others = all.filter((p) => p.slug !== currentSlug);

    const scored = others.map((post) => {
      const common = post.tags.filter((t) => tags.includes(t)).length;
      return { post, score: common };
    });

    scored.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return (
        new Date(b.post.publishedAt).getTime() -
        new Date(a.post.publishedAt).getTime()
      );
    });

    return scored.slice(0, limit).map((s) => s.post);
  }
}
