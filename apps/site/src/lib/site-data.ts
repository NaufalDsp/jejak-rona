import { createClient } from "@supabase/supabase-js";

export interface NavLink {
  label: string;
  url: string;
  order: string;
}

export interface SiteMeta {
  siteName: string;
  wordmark: string;
  tagline: string;
  description: string;
  footerText: string;
  cookieBannerText: string;
}

const defaultNav: NavLink[] = [
  { label: "Beranda", url: "/", order: "01" },
  { label: "Tentang", url: "/tentang", order: "02" },
];

const defaultMeta: SiteMeta = {
  siteName: "Jejak Rona",
  wordmark: "JEJAK RONA",
  tagline: "JURNAL VISUAL INDONESIA",
  description:
    "Menelusuri keindahan visual nusantara dengan ritme tenang dan terkurasi.",
  footerText: "Foto yang berbicara.\nCerita yang tinggal.",
  cookieBannerText:
    "Pilihan cookie tersimpan di perangkat ini. Tidak ada analitik pihak ketiga.",
};

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

export async function getSiteNav(): Promise<NavLink[]> {
  if (
    !supabaseUrl ||
    !supabaseAnonKey ||
    supabaseUrl.includes("your-project")
  ) {
    return defaultNav;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data, error } = await supabase
      .from("nav_items")
      .select("label, url, position")
      .order("position", { ascending: true });

    if (error || !data || data.length === 0) {
      return defaultNav;
    }

    return data.map((item, idx) => ({
      label: item.label,
      url: item.url || "#",
      order: String(idx + 1).padStart(2, "0"),
    }));
  } catch {
    return defaultNav;
  }
}

export async function getSiteSettings(): Promise<SiteMeta> {
  if (
    !supabaseUrl ||
    !supabaseAnonKey ||
    supabaseUrl.includes("your-project")
  ) {
    return defaultMeta;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data, error } = await supabase
      .from("site_settings")
      .select("key, value");

    if (error || !data) {
      return defaultMeta;
    }

    const gen = data.find((d) => d.key === "general")?.value as
      Record<string, string> | undefined;
    if (!gen) return defaultMeta;

    return {
      siteName: gen.site_name || defaultMeta.siteName,
      wordmark: gen.wordmark || defaultMeta.wordmark,
      tagline: gen.tagline || defaultMeta.tagline,
      description: gen.description || defaultMeta.description,
      footerText: gen.footer_text || defaultMeta.footerText,
      cookieBannerText: gen.cookie_banner_text || defaultMeta.cookieBannerText,
    };
  } catch {
    return defaultMeta;
  }
}
