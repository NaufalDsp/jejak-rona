import type { SupabaseClient } from "@supabase/supabase-js";

export interface NavItemRow {
  id: string;
  label: string;
  target_type: "page" | "url";
  target_id: string | null;
  url: string | null;
  position: number;
  parent_id: string | null;
}

export interface GeneralSettings {
  site_name: string;
  wordmark: string;
  tagline: string;
  description: string;
  footer_text: string;
  cookie_banner_text: string;
}

export interface SocialSettings {
  instagram: string;
  twitter: string;
  youtube: string;
}

export class SettingsNavManager {
  private navItems: NavItemRow[] = [];

  constructor(private supabase: SupabaseClient) {}

  public init(): void {
    this.bindSettingsEvents();
    this.bindNavEvents();
  }

  /**
   * Muat semua pengaturan situs
   */
  public async loadSettings(): Promise<void> {
    const { data, error } = await this.supabase
      .from("site_settings")
      .select("*");

    if (error) {
      console.error("Gagal membaca pengaturan situs:", error.message);
      return;
    }

    if (data) {
      for (const row of data) {
        if (row.key === "general") {
          const val = row.value as Partial<GeneralSettings>;
          this.setInputValue("setting-site-name", val.site_name || "");
          this.setInputValue("setting-wordmark", val.wordmark || "");
          this.setInputValue("setting-tagline", val.tagline || "");
          this.setInputValue("setting-description", val.description || "");
          this.setInputValue("setting-footer", val.footer_text || "");
          this.setInputValue("setting-cookie", val.cookie_banner_text || "");
        } else if (row.key === "socials") {
          const val = row.value as Partial<SocialSettings>;
          this.setInputValue("setting-instagram", val.instagram || "");
          this.setInputValue("setting-twitter", val.twitter || "");
          this.setInputValue("setting-youtube", val.youtube || "");
        }
      }
    }
  }

  /**
   * Simpan pengaturan situs
   */
  public async saveSettings(): Promise<{ success: boolean; message: string }> {
    const generalData: GeneralSettings = {
      site_name: this.getInputValue("setting-site-name"),
      wordmark: this.getInputValue("setting-wordmark"),
      tagline: this.getInputValue("setting-tagline"),
      description: this.getInputValue("setting-description"),
      footer_text: this.getInputValue("setting-footer"),
      cookie_banner_text: this.getInputValue("setting-cookie"),
    };

    const socialData: SocialSettings = {
      instagram: this.getInputValue("setting-instagram"),
      twitter: this.getInputValue("setting-twitter"),
      youtube: this.getInputValue("setting-youtube"),
    };

    const { error: err1 } = await this.supabase
      .from("site_settings")
      .upsert({
        key: "general",
        value: generalData,
        updated_at: new Date().toISOString(),
      });

    const { error: err2 } = await this.supabase
      .from("site_settings")
      .upsert({
        key: "socials",
        value: socialData,
        updated_at: new Date().toISOString(),
      });

    if (err1 || err2) {
      return {
        success: false,
        message: `Gagal menyimpan pengaturan: ${err1?.message || err2?.message}`,
      };
    }

    return {
      success: true,
      message: "Pengaturan umum situs berhasil disimpan!",
    };
  }

  /**
   * Muat menu navigasi
   */
  public async loadNavItems(): Promise<void> {
    const { data, error } = await this.supabase
      .from("nav_items")
      .select("*")
      .order("position", { ascending: true });

    if (error) {
      console.error("Gagal memuat item navigasi:", error.message);
      return;
    }

    this.navItems = (data as NavItemRow[]) || [];
    this.renderNavTable();
  }

  /**
   * Render tabel navigasi
   */
  private renderNavTable(): void {
    const tbody = document.getElementById("nav-items-table-body");
    if (!tbody) return;

    tbody.replaceChildren();

    if (this.navItems.length === 0) {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td colspan="5" class="muted" style="text-align: center; padding: 1.5rem;">Belum ada tautan navigasi. Tambahkan tautan baru di bawah.</td>`;
      tbody.append(tr);
      return;
    }

    this.navItems.forEach((item, index) => {
      const tr = document.createElement("tr");
      const targetLabel =
        item.target_type === "page" ? "Halaman Internal" : "URL Eksternal";
      tr.innerHTML = `
        <td><strong>${item.label}</strong></td>
        <td><code>${item.url || "-"}</code></td>
        <td><span class="badge ${item.target_type === "page" ? "badge-published" : "badge-draft"}">${targetLabel}</span></td>
        <td>
          <button class="btn-text" data-move-nav="up" data-nav-id="${item.id}" ${index === 0 ? "disabled" : ""}>↑</button>
          <button class="btn-text" data-move-nav="down" data-nav-id="${item.id}" ${index === this.navItems.length - 1 ? "disabled" : ""}>↓</button>
        </td>
        <td style="text-align: right;">
          <button class="btn-text-danger" data-delete-nav="${item.id}">Hapus</button>
        </td>
      `;

      tr.querySelector(`[data-move-nav="up"]`)?.addEventListener(
        "click",
        () => void this.moveNavItem(index, -1),
      );
      tr.querySelector(`[data-move-nav="down"]`)?.addEventListener(
        "click",
        () => void this.moveNavItem(index, 1),
      );
      tr.querySelector(`[data-delete-nav="${item.id}"]`)?.addEventListener(
        "click",
        () => void this.deleteNavItem(item.id),
      );

      tbody.append(tr);
    });
  }

  /**
   * Pindahkan urutan navigasi
   */
  private async moveNavItem(index: number, delta: number): Promise<void> {
    const targetIdx = index + delta;
    if (targetIdx < 0 || targetIdx >= this.navItems.length) return;

    const currentItem = this.navItems[index]!;
    const swapItem = this.navItems[targetIdx]!;

    const tempPos = currentItem.position;
    currentItem.position = swapItem.position;
    swapItem.position = tempPos;

    this.navItems.sort((a, b) => a.position - b.position);
    this.renderNavTable();

    await this.supabase
      .from("nav_items")
      .update({ position: currentItem.position })
      .eq("id", currentItem.id);
    await this.supabase
      .from("nav_items")
      .update({ position: swapItem.position })
      .eq("id", swapItem.id);
  }

  /**
   * Tambah item navigasi baru
   */
  public async addNavItem(
    label: string,
    url: string,
    targetType: "page" | "url",
  ): Promise<{ success: boolean; message: string }> {
    if (!label.trim()) {
      return { success: false, message: "Label navigasi wajib diisi." };
    }
    if (!url.trim()) {
      return { success: false, message: "URL tujuan wajib diisi." };
    }

    const nextPosition = this.navItems.length;
    const { data, error } = await this.supabase
      .from("nav_items")
      .insert({
        label: label.trim(),
        url: url.trim(),
        target_type: targetType,
        position: nextPosition,
      })
      .select()
      .single();

    if (error || !data) {
      return {
        success: false,
        message: `Gagal menambahkan menu: ${error?.message}`,
      };
    }

    this.navItems.push(data as NavItemRow);
    this.renderNavTable();
    return { success: true, message: "Menu navigasi berhasil ditambahkan!" };
  }

  /**
   * Hapus item navigasi
   */
  private async deleteNavItem(id: string): Promise<void> {
    if (!confirm("Hapus tautan navigasi ini dari menu situs?")) return;

    const { error } = await this.supabase
      .from("nav_items")
      .delete()
      .eq("id", id);
    if (error) {
      alert(`Gagal menghapus: ${error.message}`);
      return;
    }

    this.navItems = this.navItems.filter((i) => i.id !== id);
    this.renderNavTable();
  }

  private bindSettingsEvents(): void {
    const form = document.getElementById(
      "settings-form",
    ) as HTMLFormElement | null;
    form?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const statusEl = document.getElementById("settings-status-message");
      if (statusEl) {
        statusEl.textContent = "Menyimpan pengaturan…";
        statusEl.className = "badge badge-draft";
      }

      const res = await this.saveSettings();
      if (statusEl) {
        statusEl.textContent = res.message;
        statusEl.className = res.success
          ? "badge badge-published"
          : "admin-error-box";
      }
    });
  }

  private bindNavEvents(): void {
    const addBtn = document.getElementById("add-nav-item-btn");
    addBtn?.addEventListener("click", async () => {
      const labelInput = document.getElementById(
        "new-nav-label",
      ) as HTMLInputElement | null;
      const urlInput = document.getElementById(
        "new-nav-url",
      ) as HTMLInputElement | null;
      const typeSelect = document.getElementById(
        "new-nav-type",
      ) as HTMLSelectElement | null;

      const label = labelInput?.value || "";
      const url = urlInput?.value || "";
      const targetType = (typeSelect?.value as "page" | "url") || "page";

      const res = await this.addNavItem(label, url, targetType);
      if (!res.success) {
        alert(res.message);
      } else {
        if (labelInput) labelInput.value = "";
        if (urlInput) urlInput.value = "";
      }
    });
  }

  private getInputValue(id: string): string {
    const el = document.getElementById(id) as
      HTMLInputElement | HTMLTextAreaElement | null;
    return el?.value.trim() || "";
  }

  private setInputValue(id: string, val: string): void {
    const el = document.getElementById(id) as
      HTMLInputElement | HTMLTextAreaElement | null;
    if (el) el.value = val;
  }
}
