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
      "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1600&q=80",
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
      "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1600&q=80",
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
      coverImageUrl: null,
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
