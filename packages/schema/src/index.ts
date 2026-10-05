/**
 * @jejak-rona/schema
 * Titik ekspor skema kontrak data untuk halaman, blok, media, dan aturan domain.
 * Implementasi lengkap disiapkan pada Tahap 2.
 */

export interface SchemaModuleStatus {
  initialized: boolean;
  version: string;
}

export const schemaStatus: SchemaModuleStatus = {
  initialized: true,
  version: "0.1.0",
};
