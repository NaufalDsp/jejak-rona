/**
 * messages-manager.ts
 * Pengelola kiriman formulir kontak publik (submissions) di panel admin (Tahap 9).
 * Menampilkan pesan masuk, penanda sudah dibaca (read_at), dan fitur hapus pesan.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export interface ContactSubmissionRecord {
  id: string;
  name: string;
  email: string;
  message: string;
  read_at?: string | null;
  created_at: string;
}

export class MessagesManager {
  private messages: ContactSubmissionRecord[] = [];
  private listContainer: HTMLElement | null = null;
  private unreadBadge: HTMLElement | null = null;

  constructor(private supabase: SupabaseClient) {
    this.listContainer = document.getElementById("messages-list");
    this.unreadBadge = document.getElementById("messages-unread-badge");
  }

  public async loadMessages(): Promise<void> {
    if (!this.listContainer) return;
    this.listContainer.innerHTML = `<div style="padding: 2rem; text-align: center; color: var(--sand-600);">Memuat pesan masuk…</div>`;

    try {
      const { data, error } = await this.supabase
        .from("submissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        this.listContainer.innerHTML = `
          <div style="padding: 2rem; text-align: center; color: var(--sand-600);">
            Tabel <code>submissions</code> belum aktif di Supabase. Jalankan migrasi SQL Tahap 9.
          </div>`;
        return;
      }

      this.messages = (data as ContactSubmissionRecord[]) || [];
      this.render();
    } catch (err: any) {
      this.listContainer.innerHTML = `<div style="padding: 2rem; text-align: center; color: var(--ember-600);">Galat: ${err?.message}</div>`;
    }
  }

  private render(): void {
    if (!this.listContainer) return;

    const unreadCount = this.messages.filter((m) => !m.read_at).length;
    if (this.unreadBadge) {
      this.unreadBadge.textContent = unreadCount > 0 ? String(unreadCount) : "";
      this.unreadBadge.style.display = unreadCount > 0 ? "inline-flex" : "none";
    }

    if (this.messages.length === 0) {
      this.listContainer.innerHTML = `
        <div style="padding: 3rem; text-align: center; color: var(--sand-600);">
          Belum ada pesan masuk dari pengunjung situs.
        </div>`;
      return;
    }

    this.listContainer.innerHTML = this.messages
      .map((msg) => {
        const isUnread = !msg.read_at;
        const timeFormatted = new Date(msg.created_at).toLocaleDateString(
          "id-ID",
          {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          },
        );

        return `
          <div class="message-card ${isUnread ? "message-card--unread" : ""}" data-id="${msg.id}" style="
            padding: 1.25rem 1.5rem;
            border-bottom: 1px solid var(--sand-200);
            background: ${isUnread ? "rgba(184, 61, 27, 0.03)" : "transparent"};
            transition: background-color 0.15s ease;
          ">
            <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.5rem;">
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                ${isUnread ? `<span style="width: 8px; height: 8px; border-radius: 50%; background: var(--ember-600); display: inline-block;"></span>` : ""}
                <strong style="color: var(--ink-950); font-size: 14px;">${msg.name}</strong>
                <a href="mailto:${msg.email}" style="color: var(--sand-600); font-size: 13px; text-decoration: underline;">${msg.email}</a>
              </div>
              <time style="font-size: 11px; color: var(--sand-500); font-variant-numeric: tabular-nums;">${timeFormatted}</time>
            </div>
            <p style="margin: 0 0 0.85rem; font-size: 13px; line-height: 1.6; color: var(--ink-800); white-space: pre-wrap;">${msg.message}</p>
            <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
              ${
                isUnread
                  ? `<button class="btn btn-secondary mark-read-btn" data-id="${msg.id}" style="padding: 2px 8px; font-size: 11px;">Tandai Dibaca</button>`
                  : `<span style="font-size: 11px; color: var(--sand-500); align-self: center;">Sudah dibaca</span>`
              }
              <button class="btn btn-danger delete-msg-btn" data-id="${msg.id}" style="padding: 2px 8px; font-size: 11px;">Hapus</button>
            </div>
          </div>
        `;
      })
      .join("");

    this.listContainer
      .querySelectorAll<HTMLButtonElement>(".mark-read-btn")
      .forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.dataset.id;
          if (id) void this.markAsRead(id);
        });
      });

    this.listContainer
      .querySelectorAll<HTMLButtonElement>(".delete-msg-btn")
      .forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.dataset.id;
          if (id) void this.deleteMessage(id);
        });
      });
  }

  private async markAsRead(id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from("submissions")
        .update({ read_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
      await this.loadMessages();
    } catch (err: any) {
      alert(`Gagal menandai pesan: ${err?.message}`);
    }
  }

  private async deleteMessage(id: string): Promise<void> {
    if (!confirm("Hapus pesan masuk ini?")) return;

    try {
      const { error } = await this.supabase
        .from("submissions")
        .delete()
        .eq("id", id);
      if (error) throw error;
      await this.loadMessages();
    } catch (err: any) {
      alert(`Gagal menghapus pesan: ${err?.message}`);
    }
  }
}
