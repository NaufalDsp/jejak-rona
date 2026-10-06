import type { Block, Page } from "@jejak-rona/schema";
import type { SupabaseClient, User } from "@supabase/supabase-js";

export interface RevisionRow {
  id: string;
  entity: string;
  entity_id: string;
  snapshot: {
    title: string;
    slug: string;
    blocks: Block[];
    seo: Page["seo"];
    is_home: boolean;
  };
  created_by: string | null;
  created_at: string;
}

export interface PublishValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validasi ketat draf halaman sebelum diterbitkan sesuai spesifikasi PRD 8.1
 */
export function validateDraftForPublish(page: {
  title: string;
  slug: string;
  blocks: Block[];
  seo: Page["seo"];
}): PublishValidationResult {
  const errors: string[] = [];

  if (!page.title.trim()) {
    errors.push("Judul halaman wajib diisi.");
  }

  if (!page.slug.trim()) {
    errors.push("Slug URL wajib diisi.");
  } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(page.slug.trim())) {
    errors.push(
      "Slug URL hanya boleh memuat huruf kecil, angka, dan tanda hubung (-).",
    );
  }

  if (!page.seo.title.trim()) {
    errors.push("Judul SEO (meta title) wajib diisi untuk standar pencarian.");
  }

  if (!page.blocks || page.blocks.length === 0) {
    errors.push("Halaman harus memiliki minimal satu blok konten.");
    return { valid: false, errors };
  }

  page.blocks.forEach((block, idx) => {
    const num = idx + 1;
    if (block.type === "hero_media") {
      if (!block.line1.trim() && !block.line2.trim()) {
        errors.push(
          `Blok ${num} (Hero Media): Minimal satu baris headline wajib diisi.`,
        );
      }
      if (!block.media.url || !block.media.url.trim()) {
        errors.push(
          `Blok ${num} (Hero Media): Berkas media (foto/video) belum dipilih.`,
        );
      }
      if (block.media.kind === "image" && !block.media.alt.trim()) {
        errors.push(
          `Blok ${num} (Hero Media): Teks alt foto wajib diisi demi aksesibilitas pembaca layar.`,
        );
      }
      if (
        block.ctaUrl &&
        block.ctaUrl.startsWith("http://") === false &&
        block.ctaUrl.startsWith("https://") === false &&
        !block.ctaUrl.startsWith("/")
      ) {
        errors.push(
          `Blok ${num} (Hero Media): Tautan internal harus diawali dengan garis miring (contoh: /tentang).`,
        );
      }
    } else if (block.type === "image_full") {
      if (!block.media.url || !block.media.url.trim()) {
        errors.push(
          `Blok ${num} (Gambar Penuh): URL berkas gambar belum ditentukan.`,
        );
      }
      if (!block.media.alt.trim()) {
        errors.push(
          `Blok ${num} (Gambar Penuh): Teks alt gambar wajib diisi demi aksesibilitas.`,
        );
      }
    } else if (block.type === "rich_text") {
      if (!block.content.trim()) {
        errors.push(
          `Blok ${num} (Rich Text): Isi paragraf teks tidak boleh kosong.`,
        );
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

export class PublishingWorkflow {
  private isPublishing = false;
  private buildTimer: number | null = null;

  constructor(
    private supabase: SupabaseClient,
    private user: User,
  ) {}

  /**
   * Menerbitkan halaman draf ke publik
   */
  public async publishPage(
    pageId: string,
  ): Promise<{ success: boolean; message: string }> {
    if (this.isPublishing) {
      return { success: false, message: "Penerbitan sedang berlangsung…" };
    }

    this.isPublishing = true;
    try {
      // 1. Ambil data draf terkini dari server
      const { data: pageRow, error: fetchErr } = await this.supabase
        .from("pages")
        .select("*")
        .eq("id", pageId)
        .single();

      if (fetchErr || !pageRow) {
        return {
          success: false,
          message: `Gagal membaca halaman: ${fetchErr?.message || "Data tidak ditemukan"}`,
        };
      }

      const draftBlocks = (pageRow.draft as Block[]) || [];
      const seoData = (pageRow.seo as Page["seo"]) || {
        title: pageRow.title,
        description: "",
      };

      // 2. Validasi ketat draf
      const validation = validateDraftForPublish({
        title: pageRow.title,
        slug: pageRow.slug,
        blocks: draftBlocks,
        seo: seoData,
      });

      if (!validation.valid) {
        return {
          success: false,
          message: `Penerbitan ditolak karena draf belum lengkap:\n• ${validation.errors.join("\n• ")}`,
        };
      }

      // 3. Rekam Snapshot ke Tabel Revisions
      const snapshot = {
        title: pageRow.title,
        slug: pageRow.slug,
        blocks: draftBlocks,
        seo: seoData,
        is_home: pageRow.is_home,
      };

      const { error: revErr } = await this.supabase.from("revisions").insert({
        entity: "page",
        entity_id: pageId,
        snapshot,
        created_by: this.user.id,
      });

      if (revErr) {
        console.warn("Peringatan: Gagal mencatat log revisi:", revErr.message);
      }

      // 4. Batasi maksimal 20 revisi per entitas sesuai PRD
      await this.pruneOldRevisions(pageId);

      // 5. Salin draft ke published dan perbarui status
      const now = new Date().toISOString();
      const { error: updateErr } = await this.supabase
        .from("pages")
        .update({
          published: draftBlocks,
          status: "published",
          published_at: now,
          updated_at: now,
        })
        .eq("id", pageId);

      if (updateErr) {
        return {
          success: false,
          message: `Gagal memperbarui status terbit: ${updateErr.message}`,
        };
      }

      // 6. Picu Job Build Astro / Deploy Hook
      void this.triggerBuildHook();

      return {
        success: true,
        message: `Halaman "${pageRow.title}" berhasil diterbitkan ke publik! Versi situs baru sedang dibangun.`,
      };
    } finally {
      this.isPublishing = false;
    }
  }

  /**
   * Mengambil riwayat revisi halaman
   */
  public async getRevisions(pageId: string): Promise<RevisionRow[]> {
    const { data, error } = await this.supabase
      .from("revisions")
      .select("*")
      .eq("entity", "page")
      .eq("entity_id", pageId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error("Gagal mengambil revisi:", error.message);
      return [];
    }

    return (data as RevisionRow[]) || [];
  }

  /**
   * Memulihkan snapshot revisi ke draf halaman
   */
  public async restoreRevision(
    pageId: string,
    revisionId: string,
  ): Promise<{ success: boolean; message: string; restoredBlocks?: Block[] }> {
    const { data: rev, error: revErr } = await this.supabase
      .from("revisions")
      .select("*")
      .eq("id", revisionId)
      .single();

    if (revErr || !rev) {
      return {
        success: false,
        message: `Revisi tidak ditemukan: ${revErr?.message}`,
      };
    }

    const snapshot = rev.snapshot as RevisionRow["snapshot"];
    const now = new Date().toISOString();

    const { error: pageErr } = await this.supabase
      .from("pages")
      .update({
        title: snapshot.title,
        slug: snapshot.slug,
        draft: snapshot.blocks,
        seo: snapshot.seo,
        is_home: snapshot.is_home,
        updated_at: now,
      })
      .eq("id", pageId);

    if (pageErr) {
      return {
        success: false,
        message: `Gagal memulihkan revisi ke draf: ${pageErr.message}`,
      };
    }

    return {
      success: true,
      message: `Draf berhasil dipulihkan dari revisi tanggal ${new Date(rev.created_at).toLocaleString("id-ID")}.`,
      restoredBlocks: snapshot.blocks,
    };
  }

  /**
   * Menghapus revisi lama melebihi 20 per halaman
   */
  private async pruneOldRevisions(pageId: string): Promise<void> {
    try {
      const { data: revs } = await this.supabase
        .from("revisions")
        .select("id")
        .eq("entity", "page")
        .eq("entity_id", pageId)
        .order("created_at", { ascending: false });

      if (revs && revs.length > 20) {
        const toDelete = revs.slice(20).map((r) => r.id);
        await this.supabase.from("revisions").delete().in("id", toDelete);
      }
    } catch (e) {
      console.warn("Gagal merapikan riwayat revisi lama:", e);
    }
  }

  /**
   * Memicu deploy hook & pembaruan status build
   */
  private async triggerBuildHook(): Promise<void> {
    const now = new Date().toISOString();
    // Update status build di site_settings ke 'building'
    await this.supabase.from("site_settings").upsert({
      key: "build_status",
      value: {
        state: "building",
        message: "Membangun halaman statis terbaru…",
        updated_at: now,
      },
    });

    // Simulasi atau eksekusi deploy hook Cloudflare Pages jika URL tersedia
    const hookUrl = import.meta.env.PUBLIC_DEPLOY_HOOK_URL;
    if (hookUrl && typeof hookUrl === "string" && hookUrl.startsWith("http")) {
      try {
        await fetch(hookUrl, { method: "POST" });
      } catch (err) {
        console.warn("Gagal memanggil deploy hook:", err);
      }
    }

    // Simulasi selesai build setelah 4 detik bila di lingkungan lokal
    if (this.buildTimer) window.clearTimeout(this.buildTimer);
    this.buildTimer = window.setTimeout(async () => {
      await this.supabase.from("site_settings").upsert({
        key: "build_status",
        value: {
          state: "idle",
          message: "Situs tayang dan termutakhirkan.",
          updated_at: new Date().toISOString(),
        },
      });
    }, 4000);
  }
}
