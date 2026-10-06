import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { MediaItem } from "@jejak-rona/schema";

export interface MediaRow {
  id: string;
  kind: "image" | "video";
  filename: string;
  mime_type: string;
  bytes: number | null;
  width: number | null;
  height: number | null;
  duration_s: number | null;
  url: string;
  r2_key: string | null;
  alt: string;
  credit: string | null;
  focal_x: number;
  focal_y: number;
  poster_url: string | null;
  created_at: string;
}

export type MediaSelectCallback = (media: MediaItem) => void;

function escapeHtml(text: unknown): string {
  return String(text ?? "").replace(
    /[&<>"']/g,
    (m) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[m] ?? m,
  );
}

export class MediaManager {
  private mediaList: MediaRow[] = [];
  private selectedMedia: MediaRow | null = null;
  private activeFilter: "all" | "image" | "video" = "all";
  private searchQuery = "";
  private onSelectHandler: MediaSelectCallback | null = null;

  constructor(
    private supabase: SupabaseClient,
    private user: User,
  ) {}

  public init(): void {
    this.bindGlobalEvents();
    void this.loadMedia(false);
  }

  public openPicker(onSelect: MediaSelectCallback): void {
    this.onSelectHandler = onSelect;
    const modal = document.getElementById(
      "media-picker-modal",
    ) as HTMLDialogElement | null;
    if (modal) {
      modal.showModal();
      void this.loadMedia(true);
    }
  }

  private bindGlobalEvents(): void {
    // Tombol navigasi media
    const navMediaBtn = document.querySelector('[data-admin-view="media"]');
    navMediaBtn?.addEventListener("click", () => {
      void this.loadMedia(false);
    });

    // Pencarian media
    const searchInput = document.getElementById(
      "media-search",
    ) as HTMLInputElement | null;
    searchInput?.addEventListener("input", () => {
      this.searchQuery = searchInput.value.toLowerCase().trim();
      this.renderGallery();
    });

    // Filter tipe
    const filterTabs = document.querySelectorAll("[data-media-filter]");
    filterTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        filterTabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        this.activeFilter =
          (tab.getAttribute("data-media-filter") as
            "all" | "image" | "video") || "all";
        this.renderGallery();
      });
    });

    // Upload berkas
    const uploadInput = document.getElementById(
      "media-file-input",
    ) as HTMLInputElement | null;
    const uploadBtn = document.getElementById("upload-media-trigger");
    uploadBtn?.addEventListener("click", () => uploadInput?.click());
    uploadInput?.addEventListener("change", (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        void this.handleFileUpload(files[0]!);
      }
    });

    // Dropzone drag & drop
    const dropzone = document.getElementById("media-dropzone");
    if (dropzone) {
      dropzone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropzone.classList.add("dragover");
      });
      dropzone.addEventListener("dragleave", () =>
        dropzone.classList.remove("dragover"),
      );
      dropzone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropzone.classList.remove("dragover");
        if (e.dataTransfer?.files.length) {
          void this.handleFileUpload(e.dataTransfer.files[0]!);
        }
      });
    }

    // Modal focal point
    this.bindFocalPointEvents();
  }

  public async loadMedia(isPicker = false): Promise<void> {
    const container = document.getElementById(
      isPicker ? "picker-media-grid" : "media-grid",
    );
    if (container) {
      container.innerHTML =
        '<div class="admin-loading">Memuat pustaka media…</div>';
    }

    const { data, error } = await this.supabase
      .from("media")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Gagal memuat media:", error.message);
      if (container) {
        container.innerHTML = `<div class="admin-error-box">Gagal memuat pustaka media: ${escapeHtml(error.message)}</div>`;
      }
      return;
    }

    this.mediaList = (data as MediaRow[]) || [];
    this.renderGallery(isPicker);
  }

  private renderGallery(isPicker = false): void {
    const container = document.getElementById(
      isPicker ? "picker-media-grid" : "media-grid",
    );
    if (!container) return;

    const filtered = this.mediaList.filter((item) => {
      const matchFilter =
        this.activeFilter === "all" || item.kind === this.activeFilter;
      const matchSearch =
        !this.searchQuery ||
        item.filename.toLowerCase().includes(this.searchQuery) ||
        item.alt.toLowerCase().includes(this.searchQuery);
      return matchFilter && matchSearch;
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <p>Belum ada berkas media ${this.activeFilter !== "all" ? `berupa ${this.activeFilter}` : ""}.</p>
          <small class="muted">Unggah foto JPEG/WebP atau video loop MP4 pendek.</small>
        </div>`;
      return;
    }

    container.innerHTML = "";
    filtered.forEach((item) => {
      const card = document.createElement("div");
      card.className = "media-card";
      card.tabIndex = 0;
      card.setAttribute("role", "button");
      card.setAttribute("aria-label", `Media ${item.filename}`);

      const thumb =
        item.kind === "image"
          ? `<img src="${escapeHtml(item.url)}" alt="${escapeHtml(item.alt)}" loading="lazy" class="media-card__thumb" />`
          : `<div class="media-card__video-thumb"><video src="${escapeHtml(item.url)}" muted preload="metadata"></video><span class="video-badge">VIDEO</span></div>`;

      card.innerHTML = `
        <div class="media-card__preview">
          ${thumb}
          <span class="media-card__kind">${item.kind.toUpperCase()}</span>
        </div>
        <div class="media-card__meta">
          <div class="media-card__name" title="${escapeHtml(item.filename)}">${escapeHtml(item.filename)}</div>
          <div class="media-card__sub">${item.width ? `${item.width}×${item.height}px` : ""} · Focal: ${Math.round(item.focal_x)}%, ${Math.round(item.focal_y)}%</div>
        </div>
        <div class="media-card__actions">
          <button type="button" class="btn-text btn-focal" title="Atur Titik Fokus">Titik Fokus</button>
          ${isPicker ? '<button type="button" class="btn-primary-sm btn-pick">Pilih</button>' : '<button type="button" class="btn-text-danger btn-del" title="Hapus">Hapus</button>'}
        </div>
      `;

      // Event pilih di picker modal
      card.querySelector(".btn-pick")?.addEventListener("click", (e) => {
        e.stopPropagation();
        this.selectMedia(item);
      });

      if (isPicker) {
        card.addEventListener("click", () => this.selectMedia(item));
      }

      // Event edit titik fokus
      card.querySelector(".btn-focal")?.addEventListener("click", (e) => {
        e.stopPropagation();
        this.openFocalPointDialog(item);
      });

      // Event hapus
      card.querySelector(".btn-del")?.addEventListener("click", (e) => {
        e.stopPropagation();
        void this.deleteMedia(item);
      });

      container.appendChild(card);
    });
  }

  private selectMedia(item: MediaRow): void {
    const mediaItem: MediaItem = {
      id: item.id,
      kind: item.kind,
      url: item.url,
      filename: item.filename,
      mimeType: item.mime_type,
      bytes: item.bytes ?? undefined,
      width: item.width ?? undefined,
      height: item.height ?? undefined,
      durationS: item.duration_s ? Number(item.duration_s) : undefined,
      alt: item.alt || item.filename,
      credit: item.credit ?? undefined,
      focalX: Number(item.focal_x) || 50,
      focalY: Number(item.focal_y) || 50,
      posterUrl: item.poster_url ?? undefined,
      variants: [],
    };

    if (this.onSelectHandler) {
      this.onSelectHandler(mediaItem);
      this.onSelectHandler = null;
    }

    const modal = document.getElementById(
      "media-picker-modal",
    ) as HTMLDialogElement | null;
    modal?.close();
  }

  private async handleFileUpload(file: File): Promise<void> {
    const errorBox = document.getElementById("media-upload-error");
    if (errorBox) errorBox.classList.add("hidden");

    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");

    if (!isImage && !isVideo) {
      this.showUploadError(
        "Tipe berkas tidak didukung. Harap unggah berkas gambar (WebP/JPEG/PNG) atau video (MP4/WebM).",
      );
      return;
    }

    // Validasi ukuran video sesuai F5 / F6 (Maks 6 MB)
    if (isVideo && file.size > 6 * 1024 * 1024) {
      const mb = (file.size / (1024 * 1024)).toFixed(1);
      this.showUploadError(
        `Video (${mb} MB) melebihi batas 6 MB. Kompres video dengan:\nffmpeg -i "${file.name}" -vf scale=1920:-2 -crf 28 -an out.mp4`,
      );
      return;
    }

    const progressEl = document.getElementById("media-upload-progress");
    if (progressEl) {
      progressEl.classList.remove("hidden");
      progressEl.textContent = `Memproses & mengunggah ${file.name}…`;
    }

    try {
      // 1. Ekstraksi dimensi di browser
      let width = 1920;
      let height = 1080;
      let durationS: number | null = null;

      if (isImage) {
        const dimensions = await this.getImageDimensions(file);
        width = dimensions.width;
        height = dimensions.height;
      } else if (isVideo) {
        const videoMeta = await this.getVideoMetadata(file);
        width = videoMeta.width;
        height = videoMeta.height;
        durationS = videoMeta.duration;

        if (durationS > 20) {
          throw new Error(
            `Durasi video loop (${Math.round(durationS)} detik) melebihi batas 15-20 detik.`,
          );
        }
      }

      // 2. Unggah ke Supabase Storage (atau URL simulasi bila R2 bucket belum ada)
      const sanitizedName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const storagePath = `uploads/${sanitizedName}`;

      let publicUrl = "";

      // Cek apakah bucket 'media' ada di Supabase Storage
      const { error: uploadErr } = await this.supabase.storage
        .from("media")
        .upload(storagePath, file, { cacheControl: "31536000", upsert: true });

      if (uploadErr) {
        console.warn("Storage upload fallback:", uploadErr.message);
        // Fallback: Gunakan Object URL / data URL lokal untuk latihan bila bucket belum di-provision
        publicUrl = URL.createObjectURL(file);
      } else {
        const { data: urlData } = this.supabase.storage
          .from("media")
          .getPublicUrl(storagePath);
        publicUrl = urlData.publicUrl;
      }

      // 3. Masukkan catatan ke tabel media
      const { error: insertErr } = await this.supabase.from("media").insert({
        kind: isVideo ? "video" : "image",
        filename: file.name,
        mime_type: file.type,
        bytes: file.size,
        width,
        height,
        duration_s: durationS,
        url: publicUrl,
        alt: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
        focal_x: 50,
        focal_y: 50,
        created_by: this.user.id,
      });

      if (insertErr) {
        throw new Error(
          `Gagal menyimpan rekaman media ke database: ${insertErr.message}`,
        );
      }

      if (progressEl) progressEl.classList.add("hidden");
      void this.loadMedia();
    } catch (err: unknown) {
      if (progressEl) progressEl.classList.add("hidden");
      this.showUploadError(
        (err as Error).message || "Terjadi kesalahan saat mengunggah berkas.",
      );
    }
  }

  private showUploadError(msg: string): void {
    const errorBox = document.getElementById("media-upload-error");
    if (errorBox) {
      errorBox.textContent = msg;
      errorBox.classList.remove("hidden");
    }
  }

  private getImageDimensions(
    file: File,
  ): Promise<{ width: number; height: number }> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
        URL.revokeObjectURL(img.src);
      };
      img.onerror = () => resolve({ width: 1920, height: 1080 });
      img.src = URL.createObjectURL(file);
    });
  }

  private getVideoMetadata(
    file: File,
  ): Promise<{ width: number; height: number; duration: number }> {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        resolve({
          width: video.videoWidth || 1920,
          height: video.videoHeight || 1080,
          duration: video.duration || 0,
        });
        URL.revokeObjectURL(video.src);
      };
      video.onerror = () =>
        reject(
          new Error(
            "Tidak dapat membaca metadata video. Pastikan format MP4 valid.",
          ),
        );
      video.src = URL.createObjectURL(file);
    });
  }

  // ==============================================================================
  // PEMILIH TITIK FOKUS INTERAKTIF (Focal Point Picker) Sesuai design.md Bagian 9
  // ==============================================================================
  private openFocalPointDialog(media: MediaRow): void {
    this.selectedMedia = media;
    const dialog = document.getElementById(
      "focal-point-dialog",
    ) as HTMLDialogElement | null;
    if (!dialog) return;

    const imgTarget = document.getElementById(
      "focal-source-image",
    ) as HTMLImageElement | null;
    const prevDesktop = document.getElementById(
      "focal-prev-desktop",
    ) as HTMLImageElement | null;
    const prevMobile = document.getElementById(
      "focal-prev-mobile",
    ) as HTMLImageElement | null;
    const altInput = document.getElementById(
      "focal-alt-input",
    ) as HTMLInputElement | null;
    const creditInput = document.getElementById(
      "focal-credit-input",
    ) as HTMLInputElement | null;

    if (imgTarget) imgTarget.src = media.url;
    if (prevDesktop) prevDesktop.src = media.url;
    if (prevMobile) prevMobile.src = media.url;
    if (altInput) altInput.value = media.alt || "";
    if (creditInput) creditInput.value = media.credit || "";

    this.updateFocalPointDisplay(
      Number(media.focal_x) || 50,
      Number(media.focal_y) || 50,
    );

    dialog.showModal();
  }

  private updateFocalPointDisplay(x: number, y: number): void {
    const marker = document.getElementById("focal-marker");
    const coordDisplay = document.getElementById("focal-coords-display");
    const prevDesktop = document.getElementById("focal-prev-desktop");
    const prevMobile = document.getElementById("focal-prev-mobile");

    const clampedX = Math.max(0, Math.min(100, Math.round(x)));
    const clampedY = Math.max(0, Math.min(100, Math.round(y)));

    if (marker) {
      marker.style.left = `${clampedX}%`;
      marker.style.top = `${clampedY}%`;
    }

    if (coordDisplay) {
      coordDisplay.textContent = `X: ${clampedX}% | Y: ${clampedY}%`;
    }

    if (prevDesktop) {
      prevDesktop.style.objectPosition = `${clampedX}% ${clampedY}%`;
    }

    if (prevMobile) {
      prevMobile.style.objectPosition = `${clampedX}% ${clampedY}%`;
    }

    if (this.selectedMedia) {
      this.selectedMedia.focal_x = clampedX;
      this.selectedMedia.focal_y = clampedY;
    }
  }

  private bindFocalPointEvents(): void {
    const dialog = document.getElementById(
      "focal-point-dialog",
    ) as HTMLDialogElement | null;
    const container = document.getElementById("focal-interactive-canvas");
    if (!container) return;

    let isDragging = false;

    const setPointFromEvent = (e: MouseEvent | TouchEvent) => {
      const rect = container.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0]!.clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0]!.clientY : e.clientY;

      const x = ((clientX - rect.left) / rect.width) * 100;
      const y = ((clientY - rect.top) / rect.height) * 100;

      this.updateFocalPointDisplay(x, y);
    };

    container.addEventListener("mousedown", (e) => {
      isDragging = true;
      setPointFromEvent(e);
    });

    window.addEventListener("mousemove", (e) => {
      if (isDragging) setPointFromEvent(e);
    });

    window.addEventListener("mouseup", () => {
      isDragging = false;
    });

    // Simpan Focal Point
    const saveBtn = document.getElementById("save-focal-point");
    saveBtn?.addEventListener("click", async () => {
      if (!this.selectedMedia) return;

      const altInput = document.getElementById(
        "focal-alt-input",
      ) as HTMLInputElement | null;
      const creditInput = document.getElementById(
        "focal-credit-input",
      ) as HTMLInputElement | null;
      const newAlt = altInput?.value.trim() ?? this.selectedMedia.alt;
      const newCredit = creditInput?.value.trim() ?? this.selectedMedia.credit;

      saveBtn.textContent = "Menyimpan…";
      const { error } = await this.supabase
        .from("media")
        .update({
          focal_x: this.selectedMedia.focal_x,
          focal_y: this.selectedMedia.focal_y,
          alt: newAlt,
          credit: newCredit,
          updated_at: new Date().toISOString(),
        })
        .eq("id", this.selectedMedia.id);

      saveBtn.textContent = "Simpan Titik Fokus";

      if (error) {
        alert(`Gagal menyimpan titik fokus: ${error.message}`);
        return;
      }

      this.selectedMedia.alt = newAlt;
      this.selectedMedia.credit = newCredit;
      dialog?.close();
      this.renderGallery();
    });

    const closeBtn = document.getElementById("close-focal-dialog");
    closeBtn?.addEventListener("click", () => dialog?.close());
  }

  private async deleteMedia(media: MediaRow): Promise<void> {
    // 1. Validasi pencegahan hapus media yang sedang dipakai di blok halaman
    const { data: pages } = await this.supabase
      .from("pages")
      .select("id, title, draft, published");

    const usedInPages: string[] = [];
    if (pages) {
      for (const p of pages) {
        const blocksStr = JSON.stringify([p.draft, p.published]);
        if (blocksStr.includes(media.url) || blocksStr.includes(media.id)) {
          usedInPages.push(p.title);
        }
      }
    }

    if (usedInPages.length > 0) {
      alert(
        `Media "${media.filename}" TIDAK BISA DIHAPUS karena sedang digunakan di ${usedInPages.length} halaman berikut:\n- ${usedInPages.join("\n- ")}`,
      );
      return;
    }

    if (!confirm(`Hapus permanen berkas media "${media.filename}"?`)) {
      return;
    }

    const { error } = await this.supabase
      .from("media")
      .delete()
      .eq("id", media.id);
    if (error) {
      alert(`Gagal menghapus media: ${error.message}`);
      return;
    }

    this.mediaList = this.mediaList.filter((m) => m.id !== media.id);
    this.renderGallery();
  }
}

let activeMediaManager: MediaManager | null = null;

export function mountMediaManager(
  supabase: SupabaseClient,
  user: User,
): MediaManager {
  if (!activeMediaManager) {
    activeMediaManager = new MediaManager(supabase, user);
    activeMediaManager.init();
  }
  return activeMediaManager;
}

export function openMediaPicker(onSelect: (item: MediaItem) => void): void {
  if (activeMediaManager) {
    activeMediaManager.openPicker(onSelect);
  } else {
    console.warn("MediaManager belum diinisialisasi.");
  }
}
