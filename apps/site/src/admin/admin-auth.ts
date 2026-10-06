import {
  createClient,
  type Session,
  type SupabaseClient,
  type User,
} from "@supabase/supabase-js";
import { mountPageEditor } from "./page-editor.js";

type StaffProfile = { role: "admin" | "editor"; name: string };
type StatusTone = "ok" | "warn" | "error";

function requiredElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Elemen admin #${id} tidak ditemukan.`);
  return element as T;
}

const statusText = requiredElement<HTMLSpanElement>("status-text");
const statusDot = requiredElement<HTMLSpanElement>("status-dot");
const statusBanner = requiredElement<HTMLDivElement>("status-banner");
const authPanel = requiredElement<HTMLElement>("auth-panel");
const dashboard = requiredElement<HTMLElement>("dashboard");
const sessionMeta = requiredElement<HTMLSpanElement>("session-meta");
const logoutButton = requiredElement<HTMLButtonElement>("logout-button");
const loginForm = requiredElement<HTMLFormElement>("login-form");
const emailInput = requiredElement<HTMLInputElement>("email");
const passwordInput = requiredElement<HTMLInputElement>("password");
const authMessage = requiredElement<HTMLDivElement>("auth-message");
const accessMessage = requiredElement<HTMLDivElement>("access-message");
const profileOverview =
  requiredElement<HTMLParagraphElement>("profile-overview");
const roleBadge = requiredElement<HTMLSpanElement>("role-badge");
const siteUrl = requiredElement<HTMLSpanElement>("site-url");

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY ?? "";
const envConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes("your-project") &&
  !supabaseAnonKey.includes("your-anon-key"),
);

function showMessage(
  element: HTMLElement,
  text: string,
  kind: "success" | "error" = "error",
): void {
  element.textContent = text;
  element.classList.remove("success", "error");
  element.classList.add(kind, "visible");
}

function clearMessage(element: HTMLElement): void {
  element.textContent = "";
  element.classList.remove("visible", "success", "error");
}

function setStatus(label: string, tone: StatusTone = "ok"): void {
  statusText.textContent = label;
  statusBanner.classList.toggle("status-warning", tone === "warn");
  statusDot.classList.remove("warning", "alert");
  if (tone === "warn") statusDot.classList.add("warning");
  if (tone === "error") statusDot.classList.add("alert");
}

function renderLoggedOut(): void {
  authPanel.classList.remove("hidden");
  dashboard.classList.add("hidden");
  logoutButton.classList.add("hidden");
  sessionMeta.textContent = "Belum masuk";
  profileOverview.textContent = "Masuk untuk mengakses dashboard admin.";
  clearMessage(accessMessage);
}

function renderUnauthorized(message: string): void {
  authPanel.classList.remove("hidden");
  dashboard.classList.add("hidden");
  logoutButton.classList.remove("hidden");
  sessionMeta.textContent = "Sesi aktif";
  showMessage(authMessage, message);
  setStatus("Akses ditolak, role tidak valid", "warn");
}

function renderDashboard(user: User, profile: StaffProfile): void {
  authPanel.classList.add("hidden");
  dashboard.classList.remove("hidden");
  logoutButton.classList.remove("hidden");
  sessionMeta.textContent = user.email || "Admin terautentikasi";
  profileOverview.textContent = `Selamat datang, ${profile.name || user.email || "admin"}.`;
  roleBadge.textContent = profile.role;
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
  mountPageEditor(supabase, session.user);
}

async function handleLogin(event: SubmitEvent): Promise<void> {
  event.preventDefault();
  const email = emailInput.value.trim();
  const password = passwordInput.value;

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
  const email = emailInput.value.trim();
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

loginForm.addEventListener("submit", (event) => void handleLogin(event));
requiredElement<HTMLButtonElement>("reset-password").addEventListener(
  "click",
  () => void handleReset(),
);
logoutButton.addEventListener("click", () => void handleLogout());
siteUrl.textContent = window.location.origin;

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
