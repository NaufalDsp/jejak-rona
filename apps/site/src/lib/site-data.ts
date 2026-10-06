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

export interface PublishedPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverMediaId?: string | null;
  coverImageUrl?: string | null;
  tags: string[];
  readingTimeMinutes: number;
  blocks: any[];
  publishedAt: string;
}

export function resolvePostCover(
  slug: string,
  explicitCover?: string | null,
): string {
  // Jika ada cover kustom yang valid dan bukan placeholder lawas yang tidak relevan
  if (
    explicitCover &&
    !explicitCover.includes("photo-1578632767115") &&
    !explicitCover.includes("photo-1544717305")
  ) {
    return explicitCover;
  }

  // Foto kurasi otentik berlisensi bebas berdasarkan konteks wilayah & topik narasi
  const normalized = (slug || "").toLowerCase();
  if (normalized.includes("toba")) {
    return "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4f/Danau_Toba_pagi_hari.jpg/1280px-Danau_Toba_pagi_hari.jpg";
  }
  if (
    normalized.includes("sumba") ||
    normalized.includes("tenun") ||
    normalized.includes("ikat")
  ) {
    return "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c7/Tenun_Ikat_Sumba.jpg/1280px-Tenun_Ikat_Sumba.jpg";
  }
  if (
    normalized.includes("wae") ||
    normalized.includes("rebo") ||
    normalized.includes("niang") ||
    normalized.includes("flores")
  ) {
    return "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/14/Wae_Rebo_village%2C_Flores_Island%2C_Indonesia%2C_20250824_0753_3029.jpg/1280px-Wae_Rebo_village%2C_Flores_Island%2C_Indonesia%2C_20250824_0753_3029.jpg";
  }

  // Default: Pemandangan alam Nusantara otentik
  return "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/71/Hutan_Gunung_Leuser_Aceh.jpg/1280px-Hutan_Gunung_Leuser_Aceh.jpg";
}

const fallbackPosts: PublishedPost[] = [
  {
    id: "c1111111-1111-4000-8000-000000000001",
    slug: "ritme-hening-danau-toba",
    title: "Ritme Hening Danau Toba: Refleksi di Atas Kaldera",
    excerpt:
      "Menatap riak air purba yang memeluk Pulau Samosir saat fajar menyingsing dalam kesunyian yang khidmat.",
    tags: ["Perjalanan", "Nusantara", "Fotografi"],
    readingTimeMinutes: 3,
    coverImageUrl:
      "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4f/Danau_Toba_pagi_hari.jpg/1280px-Danau_Toba_pagi_hari.jpg",
    publishedAt: "2026-10-04T05:30:00Z",
    blocks: [
      {
        id: "blk-toba-1",
        type: "rich_text",
        heading: "Keheningan di Balik Kabut Kaldera",
        content:
          "Kabut perlahan tersibak di atas permukaan air kaldera purba Danau Toba, memperlihatkan siluet perahu nelayan yang meluncur tanpa suara.\n\nDanau Toba menyimpan ritme yang berbeda dari tempat lain di Nusantara. Kedalaman airnya bukan sekadar bentang alam vulkanik, melainkan ruang jeda dari riuh keseharian yang menuntut kita untuk sejenak berhenti dan mendengar ritme alam.",
      },
      {
        id: "blk-toba-2",
        type: "rich_text",
        heading: "Gradasi Warna di Tepian Holbung",
        content:
          "Dari sudut Desa Simanindo hingga bentangan bukit Holbung, setiap rona cahaya fajar menghadirkan gradasi biru toska dan pantulan emas yang mengikat rasa takjub dalam keheningan yang utuh.",
      },
    ],
  },
  {
    id: "c2222222-2222-4000-8000-000000000002",
    slug: "jejak-tenun-ikat-sumba",
    title: "Jejak Tenun Ikat Sumba: Benang Tradisi dan Cerita Leluhur",
    excerpt:
      "Di balik motif kuda dan kura-kura, tersemat simbol status, doa perlindungan, dan ketelatenan pewarna alami tarum serta mengkudu.",
    tags: ["Budaya", "Kriya", "Tradisi"],
    readingTimeMinutes: 4,
    coverImageUrl:
      "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c7/Tenun_Ikat_Sumba.jpg/1280px-Tenun_Ikat_Sumba.jpg",
    publishedAt: "2026-10-05T08:15:00Z",
    blocks: [
      {
        id: "blk-sumba-1",
        type: "rich_text",
        heading: "Aroma Alami di Beranda Prailiu",
        content:
          "Aroma daun nila dan kulit akar mengkudu menguar lembut dari beranda rumah panggung kayu di Prailiu, Sumba Timur.\n\nSetiap helai kain tenun ikat yang lahir dari tangan perempuan Sumba adalah narasi panjang tentang ketabahan hidup. Membutuhkan waktu berbulan-bulan hingga bertahun-tahun untuk menyelesaikan selembar kain hinggi atau lau.",
      },
      {
        id: "blk-sumba-2",
        type: "rich_text",
        heading: "Mengikat Ingatan Leluhur",
        content:
          "Menenun bukan sekadar merangkai benang lungsi dan pakan, melainkan mengikat ingatan para leluhur agar tetap hidup dan bermakna di tengah perubahan zaman.",
      },
    ],
  },
  {
    id: "c3333333-3333-4000-8000-000000000003",
    slug: "harmoni-mbaru-niang-wae-rebo",
    title:
      "Harmoni Mbaru Niang Wae Rebo: Geometri Kerucut di Balik Kabut Flores",
    excerpt:
      "Menyentuh struktur arsitektur vernakular tujuh rumah utama di lembah terpencil Manggarai yang hidup berdampingan dengan awan.",
    tags: ["Arsitektur", "Nusantara", "Tradisi"],
    readingTimeMinutes: 5,
    coverImageUrl:
      "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/14/Wae_Rebo_village%2C_Flores_Island%2C_Indonesia%2C_20250824_0753_3029.jpg/1280px-Wae_Rebo_village%2C_Flores_Island%2C_Indonesia%2C_20250824_0753_3029.jpg",
    publishedAt: "2026-10-06T06:00:00Z",
    blocks: [
      {
        id: "blk-waerebo-1",
        type: "rich_text",
        heading: "Tujuh Kerucut di Balik Punggung Pegunungan",
        content:
          "Di lembah sunyi Manggarai Barat, tujuh rumah kerucut Mbaru Niang berdiri melingkar mengelilingi altar batu compang. Struktur bambu dan atap ijuk lontar ini telah bertahan melintasi generasi sebagai wujud arsitektur yang menyatu sempurna dengan iklim pegunungan tropis.",
      },
      {
        id: "blk-waerebo-2",
        type: "rich_text",
        heading: "Filosofi Ruang Vertikal",
        content:
          "Lima tingkatan lantai di dalam Mbaru Niang bukan sekadar rancangan fungsional, melainkan cerminan kosmologi masyarakat Wae Rebo yang menempatkan kehidupan manusia di antara bumi dan langit.",
      },
    ],
  },
];

export async function getPublishedPosts(): Promise<PublishedPost[]> {
  if (
    !supabaseUrl ||
    !supabaseAnonKey ||
    supabaseUrl.includes("your-project")
  ) {
    return fallbackPosts;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data, error } = await supabase
      .from("posts")
      .select(
        "id, slug, title, excerpt, cover_media_id, tags, reading_time_minutes, published, published_at",
      )
      .eq("status", "published")
      .order("published_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return fallbackPosts;
    }

    return data.map((item) => ({
      id: item.id,
      slug: item.slug,
      title: item.title,
      excerpt: item.excerpt || "",
      coverMediaId: item.cover_media_id,
      coverImageUrl: resolvePostCover(item.slug, null),
      tags: item.tags || [],
      readingTimeMinutes: item.reading_time_minutes || 1,
      blocks: item.published?.blocks || [],
      publishedAt: item.published_at || new Date().toISOString(),
    }));
  } catch {
    return fallbackPosts;
  }
}

export async function getPostBySlug(
  slug: string,
): Promise<PublishedPost | null> {
  const posts = await getPublishedPosts();
  return posts.find((p) => p.slug === slug) || null;
}

export async function getRelatedPosts(
  currentSlug: string,
  tags: string[],
  limit: number = 2,
): Promise<PublishedPost[]> {
  const posts = await getPublishedPosts();
  const others = posts.filter((p) => p.slug !== currentSlug);

  // Cari yang memiliki tag beririsan terlebih dahulu
  const sorted = others.sort((a, b) => {
    const commonA = a.tags.filter((t) => tags.includes(t)).length;
    const commonB = b.tags.filter((t) => tags.includes(t)).length;
    return commonB - commonA;
  });

  return sorted.slice(0, limit);
}

export async function getAllPostTags(): Promise<string[]> {
  const posts = await getPublishedPosts();
  const tagSet = new Set<string>();
  for (const post of posts) {
    for (const tag of post.tags) {
      tagSet.add(tag);
    }
  }
  return Array.from(tagSet);
}
