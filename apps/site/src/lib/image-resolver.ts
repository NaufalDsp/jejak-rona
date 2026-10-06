/**
 * Image Resolver Utility (Domain Presentation Helper)
 *
 * Memetakan artikel dan bentang visual Nusantara ke foto-foto kurasi otentik
 * berlisensi bebas (Wikimedia Commons) sesuai konteks geografis dan kultural,
 * mencegah munculnya visual placeholder yang tidak relevan.
 */

export function resolvePostCover(
  slug: string,
  explicitCover?: string | null,
): string {
  // Jika pengguna menyetel gambar kustom yang valid dan bukan placeholder acak
  if (
    explicitCover &&
    !explicitCover.includes("photo-1578632767115") &&
    !explicitCover.includes("photo-1544717305")
  ) {
    return explicitCover;
  }

  const normalized = (slug || "").toLowerCase();

  // 1. Danau Toba & Tanah Batak, Sumatera Utara
  if (normalized.includes("toba") || normalized.includes("samosir")) {
    return "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4f/Danau_Toba_pagi_hari.jpg/1280px-Danau_Toba_pagi_hari.jpg";
  }

  // 2. Tenun Ikat Tradisional Sumba, NTT
  if (
    normalized.includes("sumba") ||
    normalized.includes("tenun") ||
    normalized.includes("ikat")
  ) {
    return "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c7/Tenun_Ikat_Sumba.jpg/1280px-Tenun_Ikat_Sumba.jpg";
  }

  // 3. Desa Adat Wae Rebo & Mbaru Niang, Flores
  if (
    normalized.includes("wae") ||
    normalized.includes("rebo") ||
    normalized.includes("niang") ||
    normalized.includes("flores")
  ) {
    return "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/14/Wae_Rebo_village%2C_Flores_Island%2C_Indonesia%2C_20250824_0753_3029.jpg/1280px-Wae_Rebo_village%2C_Flores_Island%2C_Indonesia%2C_20250824_0753_3029.jpg";
  }

  // 4. Kapal Layar Pinisi & Panrita Lopi, Bulukumba, Sulawesi Selatan
  if (
    normalized.includes("pinisi") ||
    normalized.includes("bulukumba") ||
    normalized.includes("kapal")
  ) {
    return "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/52/Kapal_Pinisi.jpg/1280px-Kapal_Pinisi.jpg";
  }

  // 5. Terasering Jatiluwih & Tradisi Subak, Bali
  if (
    normalized.includes("jatiluwih") ||
    normalized.includes("subak") ||
    normalized.includes("sawah")
  ) {
    return "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/88/Jatiluwih_rice_terraces.jpg/1280px-Jatiluwih_rice_terraces.jpg";
  }

  // Standar: Lanskap Hutan Tropis Leuser, Sumatera
  return "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/71/Hutan_Gunung_Leuser_Aceh.jpg/1280px-Hutan_Gunung_Leuser_Aceh.jpg";
}
