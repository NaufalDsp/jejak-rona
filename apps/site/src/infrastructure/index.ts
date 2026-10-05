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
