/**
 * Infrastructure Layer — Jejak Rona
 *
 * Implementasi konkret untuk port/repository interfaces:
 * - Supabase adapter (Postgres, Auth, RLS)
 * - Cloudflare R2 storage adapter
 * - Cloudflare Pages deploy hook trigger
 */

export interface InfrastructureConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

export * from "./supabase/supabase-client.js";
export * from "./supabase/supabase-page.repository.js";
export * from "./repositories/seed-fixtures.js";
export * from "./repositories/fixture-page.repository.js";
