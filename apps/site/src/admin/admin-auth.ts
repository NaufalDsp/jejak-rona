import {
  createClient,
  type Session,
  type SupabaseClient,
  type User,
} from "@supabase/supabase-js";
import { mountPageEditor } from "./page-editor.js";
import { mountMediaManager } from "./media-manager.js";
import { SettingsNavManager } from "./settings-nav-manager.js";
import { ArticlesManager } from "./articles-manager.js";
import { MessagesManager } from "./messages-manager.js";

type StaffProfile = { role: "admin" | "editor"; name: string };
type StatusTone = "ok" | "warn" | "error";

function getEl<T extends HTMLElement>(id: string): T | null {
  return document.getElementById(id) as T | null;
}

const statusText = getEl<HTMLSpanElement>("status-text");
const statusDot = getEl<HTMLSpanElement>("status-dot");
const statusBanner = getEl<HTMLDivElement>("status-banner");
const authPanel = getEl<HTMLElement>("auth-panel");
const dashboard = getEl<HTMLElement>("dashboard");
const pageEditor = getEl<HTMLElement>("page-editor");
const mediaPanel = getEl<HTMLElement>("media-panel");
const settingsPanel = getEl<HTMLElement>("settings-panel");
const articlesPanel = getEl<HTMLElement>("articles-panel");
const messagesPanel = getEl<HTMLElement>("messages-panel");
const sessionMeta = getEl<HTMLSpanElement>("session-meta");
const logoutButton = getEl<HTMLButtonElement>("logout-button");
const loginForm = getEl<HTMLFormElement>("login-form");
const emailInput = getEl<HTMLInputElement>("email");
const passwordInput = getEl<HTMLInputElement>("password");
const authMessage = getEl<HTMLDivElement>("auth-message");
const profileOverview = getEl<HTMLHeadingElement>("profile-overview");
const roleBadge = getEl<HTMLSpanElement>("role-badge");

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY ?? "";
const envConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes("your-project") &&
  !supabaseAnonKey.includes("your-anon-key"),
);

function showMessage(
  element: HTMLElement | null,
  text: string,
  kind: "success" | "error" = "error",
): void {
  if (!element) return;
  element.textContent = text;
  element.classList.remove("success", "error");
  element.classList.add(kind, "visible");
}

function clearMessage(element: HTMLElement | null): void {
  if (!element) return;
  element.textContent = "";
  element.classList.remove("visible", "success", "error");
}

function setStatus(label: string, tone: StatusTone = "ok"): void {
  if (statusText) statusText.textContent = label;
  if (statusBanner)
    statusBanner.classList.toggle("status-warning", tone === "warn");
  if (statusDot) {
    statusDot.classList.remove("warning", "alert");
    if (tone === "warn") statusDot.classList.add("warning");
    if (tone === "error") statusDot.classList.add("alert");
  }
}

let isMounted = false;
let mediaManager: ReturnType<typeof mountMediaManager> | null = null;
let settingsNavManager: SettingsNavManager | null = null;
let articlesManager: ArticlesManager | null = null;
let messagesManager: MessagesManager | null = null;

function switchView(
  viewName:
    "dashboard" | "pages" | "media" | "settings" | "articles" | "messages",
): void {
  const navItems =
    document.querySelectorAll<HTMLButtonElement>("[data-admin-view]");
  navItems.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.adminView === viewName);
  });

  if (dashboard) dashboard.classList.toggle("hidden", viewName !== "dashboard");
  if (pageEditor) pageEditor.classList.toggle("hidden", viewName !== "pages");
  if (mediaPanel) {
    mediaPanel.classList.toggle("hidden", viewName !== "media");
    if (viewName === "media") {
      void mediaManager?.loadMedia(false);
    }
  }
  if (articlesPanel) {
    articlesPanel.classList.toggle("hidden", viewName !== "articles");
    if (viewName === "articles") {
      void articlesManager?.loadArticles();
    }
  }
  if (messagesPanel) {
    messagesPanel.classList.toggle("hidden", viewName !== "messages");
    if (viewName === "messages") {
      void messagesManager?.loadMessages();
    }
  }
  if (settingsPanel) {
    settingsPanel.classList.toggle("hidden", viewName !== "settings");
    if (viewName === "settings" && settingsNavManager) {
      void settingsNavManager.loadSettings();
      void settingsNavManager.loadNavItems();
    }
  }
}

function setupNavigation(): void {
  const navItems =
    document.querySelectorAll<HTMLButtonElement>("[data-admin-view]");
  navItems.forEach((btn) => {
    btn.addEventListener("click", () => {
      const view = btn.dataset.adminView as
        "dashboard" | "pages" | "media" | "settings" | "articles" | "messages";
      if (view) switchView(view);
    });
  });

  getEl<HTMLButtonElement>("dash-create-page-btn")?.addEventListener(
    "click",
    () => {
      switchView("pages");
      getEl<HTMLButtonElement>("create-page")?.click();
    },
  );

  getEl<HTMLButtonElement>("dash-open-media-btn")?.addEventListener(
    "click",
    () => {
      switchView("media");
    },
  );
}

function renderLoggedOut(): void {
  authPanel?.classList.remove("hidden");
  dashboard?.classList.add("hidden");
  pageEditor?.classList.add("hidden");
  mediaPanel?.classList.add("hidden");
  articlesPanel?.classList.add("hidden");
  messagesPanel?.classList.add("hidden");
  settingsPanel?.classList.add("hidden");
  logoutButton?.classList.add("hidden");
  if (sessionMeta) sessionMeta.textContent = "Belum masuk";
  if (profileOverview)
    profileOverview.textContent = "Masuk untuk mengakses dashboard admin.";
}

function renderUnauthorized(message: string): void {
  authPanel?.classList.remove("hidden");
  dashboard?.classList.add("hidden");
  pageEditor?.classList.add("hidden");
  mediaPanel?.classList.add("hidden");
  articlesPanel?.classList.add("hidden");
  messagesPanel?.classList.add("hidden");
  settingsPanel?.classList.add("hidden");
  logoutButton?.classList.remove("hidden");
  if (sessionMeta) sessionMeta.textContent = "Sesi aktif";
  showMessage(authMessage, message);
  setStatus("Akses ditolak, role tidak valid", "warn");
}

async function refreshDashboardStats(client: SupabaseClient): Promise<void> {
  try {
    const { data: pages } = await client
      .from("pages")
      .select("id, slug, title, status, is_home, updated_at");
    const { count: mediaCount } = await client
      .from("media")
      .select("id", { count: "exact", head: true });

    if (pages) {
      const published = pages.filter((p) => p.status === "published").length;
      const draft = pages.filter((p) => p.status === "draft").length;

      const pubEl = getEl("stat-published-count");
      const draftEl = getEl("stat-draft-count");
      const mediaEl = getEl("stat-media-count");
      if (pubEl) pubEl.textContent = String(published);
      if (draftEl) draftEl.textContent = String(draft);
      if (mediaEl) mediaEl.textContent = String(mediaCount ?? 0);

      const tableBody = getEl("dash-pages-table");
      if (tableBody) {
        tableBody.replaceChildren();
        if (pages.length === 0) {
          const row = document.createElement("tr");
          row.innerHTML = `<td colspan="5" class="muted" style="text-align: center; padding: 1.5rem;">Belum ada halaman.</td>`;
          tableBody.append(row);
        } else {
          for (const page of pages) {
            const tr = document.createElement("tr");
            const badgeClass =
              page.status === "published" ? "badge-published" : "badge-draft";
            const roleLabel = page.is_home ? "Beranda" : "Standar";
            tr.innerHTML = `
              <td><strong>${page.title}</strong></td>
              <td><code>/${page.slug}</code></td>
              <td><span class="badge ${page.is_home ? "badge-published" : "badge-draft"}">${roleLabel}</span></td>
              <td><span class="badge ${badgeClass}">${page.status.toUpperCase()}</span></td>
              <td style="text-align: right;">
                <button class="btn-secondary" style="font-size: 11px; padding: 2px 8px;" data-edit-page-id="${page.id}">Sunting</button>
              </td>
            `;

            tr.querySelector(
              `[data-edit-page-id="${page.id}"]`,
            )?.addEventListener("click", () => {
              switchView("pages");
              const pageBtn = document.querySelector<HTMLButtonElement>(
                `[data-page-id="${page.id}"]`,
              );
              pageBtn?.click();
            });

            tableBody.append(tr);
          }
        }
      }
    }
  } catch (err) {
    console.error("Gagal memuat statistik dashboard:", err);
  }
}

function renderDashboard(user: User, profile: StaffProfile): void {
  authPanel?.classList.add("hidden");
  dashboard?.classList.remove("hidden");
  logoutButton?.classList.remove("hidden");
  if (sessionMeta)
    sessionMeta.textContent = user.email || "Admin terautentikasi";
  if (profileOverview)
    profileOverview.textContent = `Selamat datang, ${profile.name || user.email || "admin"}.`;
  if (roleBadge) roleBadge.textContent = profile.role.toUpperCase();
  clearMessage(authMessage);
  setStatus("Admin siap");
}

const supabase: SupabaseClient | null = envConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

async function watchBuildStatus(client: SupabaseClient): Promise<void> {
  const check = async () => {
    try {
      const { data } = await client
        .from("site_settings")
        .select("value")
        .eq("key", "build_status")
        .maybeSingle();

      if (data?.value) {
        const val = data.value as { state: string; message: string };
        if (val.state === "building") {
          setStatus(val.message || "Membangun situs statis…", "warn");
        } else if (val.state === "failed") {
          setStatus("Build situs gagal", "error");
        } else {
          setStatus("Situs tayang (Astro)", "ok");
        }
      }
    } catch {
      // Abaikan jika jaringan offline
    }
  };

  void check();
  window.setInterval(() => void check(), 6000);
}

async function ensureRole(session: Session | null): Promise<void> {
  if (!session?.user || !supabase) {
    renderLoggedOut();
    return;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("role, name")
    .eq("id", session.user.id)
    .maybeSingle();

  if (error) {
    renderUnauthorized(
      "Gagal memeriksa role di tabel profiles. Periksa RLS dan migrasi database.",
    );
    return;
  }

  const profile = data as StaffProfile | null;
  if (!profile || !["admin", "editor"].includes(profile.role)) {
    renderUnauthorized(
      "Akses ditolak: pengguna belum terdaftar sebagai admin/editor di tabel profiles.",
    );
    return;
  }

  renderDashboard(session.user, profile);

  if (!isMounted) {
    isMounted = true;
    setupNavigation();
    mountPageEditor(supabase, session.user);
    mediaManager = mountMediaManager(supabase, session.user);
    articlesManager = new ArticlesManager(supabase);
    messagesManager = new MessagesManager(supabase);
    settingsNavManager = new SettingsNavManager(supabase);
    settingsNavManager.init();
    void refreshDashboardStats(supabase);
    void watchBuildStatus(supabase);
  }
}

async function handleLogin(event: SubmitEvent): Promise<void> {
  event.preventDefault();
  const email = emailInput?.value.trim() ?? "";
  const password = passwordInput?.value ?? "";

  if (!supabase) {
    showMessage(
      authMessage,
      "Isi PUBLIC_SUPABASE_URL dan PUBLIC_SUPABASE_ANON_KEY di .env untuk mengaktifkan login.",
    );
    return;
  }
  if (!email || !password) {
    showMessage(authMessage, "Email dan kata sandi wajib diisi.");
    return;
  }

  setStatus("Memproses login…", "warn");
  clearMessage(authMessage);
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    setStatus("Login gagal", "error");
    showMessage(
      authMessage,
      error.message || "Login gagal. Cek kredensial Anda.",
    );
    return;
  }
  await ensureRole(data.session);
}

async function handleReset(): Promise<void> {
  const email = emailInput?.value.trim() ?? "";
  if (!supabase) {
    showMessage(
      authMessage,
      "Isi konfigurasi Supabase di .env terlebih dahulu.",
    );
    return;
  }
  if (!email) {
    showMessage(
      authMessage,
      "Masukkan email untuk mengirim tautan reset kata sandi.",
    );
    return;
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/admin`,
  });
  if (error) {
    showMessage(authMessage, error.message);
    return;
  }

  setStatus("Tautan reset dikirim");
  showMessage(
    authMessage,
    "Tautan reset kata sandi telah dikirim ke email Anda.",
    "success",
  );
}

async function handleLogout(): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) {
    showMessage(authMessage, error.message);
    return;
  }
  renderLoggedOut();
  setStatus("Sesi admin selesai");
}

loginForm?.addEventListener("submit", (event) => void handleLogin(event));
getEl<HTMLButtonElement>("reset-password")?.addEventListener(
  "click",
  () => void handleReset(),
);
logoutButton?.addEventListener("click", () => void handleLogout());

if (!envConfigured) {
  setStatus("Konfigurasi Supabase belum siap", "warn");
  renderLoggedOut();
  showMessage(
    authMessage,
    "Isi PUBLIC_SUPABASE_URL dan PUBLIC_SUPABASE_ANON_KEY di .env untuk mengaktifkan login.",
  );
} else if (supabase) {
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_OUT") {
      renderLoggedOut();
      setStatus("Belum masuk");
    } else if (session) {
      window.setTimeout(() => void ensureRole(session), 0);
    }
  });

  void supabase.auth.getSession().then(({ data }) => ensureRole(data.session));
}
