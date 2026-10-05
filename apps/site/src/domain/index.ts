/**
 * Domain Layer — Jejak Rona
 *
 * Berisi entitas bisnis murni dan aturan validasi domain.
 * TIDAK boleh memiliki ketergantungan pada Supabase, Astro, React, atau framework lain.
 */

export interface DomainEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}
