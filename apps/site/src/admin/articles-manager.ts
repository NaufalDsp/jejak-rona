/**
 * articles-manager.ts
 * Pengelola artikel editorial Jejak Rona di panel admin (Tahap 9).
 * Menangani daftar artikel, pembuatan, pengeditan metadata (judul, slug, excerpt, tags),
 * kalkulasi otomatis waktu baca, dan penerbitan ke Supabase.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  calculateReadingTimeMinutes,
  validatePostForPublish,
} from "@jejak-rona/schema";

export interface ArticleRecord {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  tags: string[];
  status: "draft" | "published" | "archived";
  reading_time_minutes: number;
  draft: { blocks: any[] };
  published?: { blocks: any[] } | null;
  published_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export class ArticlesManager {
  private articles: ArticleRecord[] = [];
  private activeArticleId: string | null = null;

  private tableBody: HTMLElement | null = null;
  private editorModal: HTMLDialogElement | null = null;
  private form: HTMLFormElement | null = null;

  constructor(private supabase: SupabaseClient) {
    this.tableBody = document.getElementById("articles-table-body");
    this.editorModal = document.getElementById(
      "article-editor-dialog",
    ) as HTMLDialogElement | null;
    this.form = document.getElementById(
      "article-form",
    ) as HTMLFormElement | null;

    this.bindEvents();
  }

  private bindEvents(): void {
    const createBtn = document.getElementById("create-article-btn");
    createBtn?.addEventListener("click", () => this.openEditor(null));

    const closeBtn = document.getElementById("close-article-dialog-btn");
    closeBtn?.addEventListener("click", () => this.editorModal?.close());

    this.form?.addEventListener("submit", (e) => {
      e.preventDefault();
      void this.saveArticle();
    });

    const titleInput = document.getElementById(
      "article-title-input",
    ) as HTMLInputElement | null;
    const slugInput = document.getElementById(
      "article-slug-input",
    ) as HTMLInputElement | null;

    // Otomatis buat slug dari judul saat artikel baru
    titleInput?.addEventListener("input", () => {
      if (!this.activeArticleId && slugInput) {
        slugInput.value = this.slugify(titleInput.value);
      }
    });

    // Tombol Publish Artikel
    const publishBtn = document.getElementById("publish-article-btn");
    publishBtn?.addEventListener("click", () => {
      void this.publishActiveArticle();
    });
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  public async loadArticles(): Promise<void> {
    if (!this.tableBody) return;
    this.tableBody.innerHTML = `<tr><td colspan="6" style="padding: 1.5rem; text-align: center; color: var(--sand-600);">Memuat arsip artikel…</td></tr>`;

    try {
      const { data, error } = await this.supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        // Jika tabel belum dieksekusi di Cloud, beri instruksi ramah
        this.tableBody.innerHTML = `
          <tr>
            <td colspan="6" style="padding: 1.5rem; text-align: center; color: var(--sand-600);">
              Tabel <code>posts</code> belum aktif di Supabase. Jalankan migrasi SQL Tahap 9.
            </td>
          </tr>`;
        return;
      }

      this.articles = (data as ArticleRecord[]) || [];
      this.renderTable();
    } catch (err: any) {
      this.tableBody.innerHTML = `<tr><td colspan="6" style="padding: 1.5rem; text-align: center; color: var(--ember-600);">Galat: ${err?.message}</td></tr>`;
    }
  }

  private renderTable(): void {
    if (!this.tableBody) return;

    if (this.articles.length === 0) {
      this.tableBody.innerHTML = `
        <tr>
          <td colspan="6" style="padding: 2rem; text-align: center; color: var(--sand-600);">
            Belum ada artikel. Klik "Tulis Artikel Baru" untuk memulai narasi pertama.
          </td>
        </tr>`;
      return;
    }

    this.tableBody.innerHTML = this.articles
      .map((art) => {
        const statusBadge =
          art.status === "published"
            ? `<span style="background: rgba(46, 125, 50, 0.15); color: #2e7d32; padding: 2px 8px; border-radius: 2px; font-size: 11px; font-weight: 600;">Terbit</span>`
            : `<span style="background: rgba(184, 61, 27, 0.1); color: var(--ember-600); padding: 2px 8px; border-radius: 2px; font-size: 11px; font-weight: 600;">Draf</span>`;

        const dateFormatted = art.published_at
          ? new Date(art.published_at).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "-";

        const tagsList = (art.tags || []).slice(0, 2).join(", ") || "-";

        return `
          <tr style="border-bottom: 1px solid var(--sand-200); transition: background-color 0.15s ease;">
            <td style="padding: 0.85rem 1rem; font-weight: 500; color: var(--ink-950);">
              <a href="#" class="edit-article-link" data-id="${art.id}" style="color: inherit; text-decoration: none;">
                ${art.title}
              </a>
              <div style="font-size: 11px; color: var(--sand-500); font-family: monospace;">/${art.slug}</div>
            </td>
            <td style="padding: 0.85rem 1rem;">${statusBadge}</td>
            <td style="padding: 0.85rem 1rem; font-size: 12px; color: var(--ink-700);">${tagsList}</td>
            <td style="padding: 0.85rem 1rem; font-size: 12px; color: var(--sand-600);">${art.reading_time_minutes || 1} mnt</td>
            <td style="padding: 0.85rem 1rem; font-size: 12px; color: var(--sand-600);">${dateFormatted}</td>
            <td style="padding: 0.85rem 1rem; text-align: right;">
              <button class="btn btn-secondary edit-article-btn" data-id="${art.id}" style="padding: 3px 8px; font-size: 11px;">Sunting</button>
              <button class="btn btn-danger delete-article-btn" data-id="${art.id}" style="padding: 3px 8px; font-size: 11px; margin-left: 4px;">Hapus</button>
            </td>
          </tr>
        `;
      })
      .join("");

    this.tableBody
      .querySelectorAll<HTMLButtonElement>(
        ".edit-article-btn, .edit-article-link",
      )
      .forEach((el) => {
        el.addEventListener("click", (e) => {
          e.preventDefault();
          const id = el.dataset.id;
          if (id) this.openEditor(id);
        });
      });

    this.tableBody
      .querySelectorAll<HTMLButtonElement>(".delete-article-btn")
      .forEach((el) => {
        el.addEventListener("click", () => {
          const id = el.dataset.id;
          if (id) void this.deleteArticle(id);
        });
      });
  }

  public openEditor(articleId: string | null): void {
    this.activeArticleId = articleId;
    if (!this.form || !this.editorModal) return;

    this.form.reset();
    const modalTitle = document.getElementById("article-dialog-title");
    const publishBtn = document.getElementById("publish-article-btn");
    const readingTimeBadge = document.getElementById(
      "article-reading-time-badge",
    );

    if (articleId) {
      const art = this.articles.find((a) => a.id === articleId);
      if (!art) return;

      if (modalTitle) modalTitle.textContent = "Sunting Artikel";
      if (publishBtn) publishBtn.style.display = "inline-flex";

      (
        document.getElementById("article-title-input") as HTMLInputElement
      ).value = art.title;
      (
        document.getElementById("article-slug-input") as HTMLInputElement
      ).value = art.slug;
      (
        document.getElementById("article-excerpt-input") as HTMLTextAreaElement
      ).value = art.excerpt || "";
      (
        document.getElementById("article-tags-input") as HTMLInputElement
      ).value = (art.tags || []).join(", ");

      const firstBlock = art.draft?.blocks?.[0];
      const content = firstBlock?.content || "";
      (
        document.getElementById("article-content-input") as HTMLTextAreaElement
      ).value = content;

      if (readingTimeBadge) {
        readingTimeBadge.textContent = `${art.reading_time_minutes || 1} menit baca`;
      }
    } else {
      if (modalTitle) modalTitle.textContent = "Tulis Artikel Baru";
      if (publishBtn) publishBtn.style.display = "none";
      if (readingTimeBadge) readingTimeBadge.textContent = "1 menit baca";
    }

    this.editorModal.showModal();
  }

  private async saveArticle(): Promise<void> {
    const title = (
      document.getElementById("article-title-input") as HTMLInputElement
    ).value.trim();
    const slug = (
      document.getElementById("article-slug-input") as HTMLInputElement
    ).value.trim();
    const excerpt = (
      document.getElementById("article-excerpt-input") as HTMLTextAreaElement
    ).value.trim();
    const tagsRaw = (
      document.getElementById("article-tags-input") as HTMLInputElement
    ).value;
    const content = (
      document.getElementById("article-content-input") as HTMLTextAreaElement
    ).value.trim();

    if (!title || !slug) {
      alert("Judul dan slug artikel wajib diisi.");
      return;
    }

    const tags = tagsRaw
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const blocks = [
      {
        id: `blk-art-${Date.now()}`,
        type: "rich_text",
        heading: "",
        content: content || "Catatan narasi...",
      },
    ];

    const readingTime = calculateReadingTimeMinutes(blocks as any);

    try {
      if (this.activeArticleId) {
        const { error } = await this.supabase
          .from("posts")
          .update({
            title,
            slug,
            excerpt,
            tags,
            reading_time_minutes: readingTime,
            draft: { blocks },
            updated_at: new Date().toISOString(),
          })
          .eq("id", this.activeArticleId);

        if (error) throw error;
      } else {
        const { error } = await this.supabase.from("posts").insert({
          title,
          slug,
          excerpt,
          tags,
          status: "draft",
          reading_time_minutes: readingTime,
          draft: { blocks },
          published: null,
        });

        if (error) throw error;
      }

      this.editorModal?.close();
      await this.loadArticles();
    } catch (err: any) {
      alert(`Gagal menyimpan artikel: ${err?.message}`);
    }
  }

  private async publishActiveArticle(): Promise<void> {
    if (!this.activeArticleId) return;
    const art = this.articles.find((a) => a.id === this.activeArticleId);
    if (!art) return;

    const validation = validatePostForPublish({
      title: art.title,
      slug: art.slug,
      blocks: art.draft?.blocks as any,
    });

    if (!validation.isValid) {
      alert(`Validasi publish gagal:\n- ${validation.errors.join("\n- ")}`);
      return;
    }

    try {
      const { error } = await this.supabase
        .from("posts")
        .update({
          status: "published",
          published: art.draft,
          published_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", this.activeArticleId);

      if (error) throw error;

      alert(`Artikel "${art.title}" berhasil diterbitkan ke situs publik.`);
      this.editorModal?.close();
      await this.loadArticles();
    } catch (err: any) {
      alert(`Gagal menerbitkan artikel: ${err?.message}`);
    }
  }

  private async deleteArticle(id: string): Promise<void> {
    const art = this.articles.find((a) => a.id === id);
    if (
      !confirm(
        `Hapus artikel "${art?.title || id}"? Tindakan ini tidak dapat dibatalkan.`,
      )
    ) {
      return;
    }

    try {
      const { error } = await this.supabase.from("posts").delete().eq("id", id);
      if (error) throw error;
      await this.loadArticles();
    } catch (err: any) {
      alert(`Gagal menghapus artikel: ${err?.message}`);
    }
  }
}
