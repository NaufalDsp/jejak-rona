import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

/**
 * Mengambil konfigurasi Supabase dari environment variables
 */
export function getSupabaseConfig(): SupabaseConfig | null {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;

  if (
    !url ||
    !anonKey ||
    url.includes("your-project") ||
    anonKey.includes("your-anon-key")
  ) {
    return null;
  }

  return { url, anonKey };
}

/**
 * Membuat client Supabase anonim untuk pembacaan konten publik (via view pages_public)
 */
export function createPublicSupabaseClient(
  config?: SupabaseConfig,
): SupabaseClient | null {
  const resolvedConfig = config ?? getSupabaseConfig();
  if (!resolvedConfig) {
    return null;
  }

  return createClient(resolvedConfig.url, resolvedConfig.anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
