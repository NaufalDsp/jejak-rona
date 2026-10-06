import type {
  PostRepositoryPort,
  PublishedPostDto,
} from "../../application/ports/post-repository.port.js";
import { resolvePostCover } from "../../lib/image-resolver.js";

export const FIXTURE_POSTS: PublishedPostDto[] = [
  {
    id: "c1111111-1111-4000-8000-000000000001",
    slug: "ritme-hening-danau-toba",
    title: "Ritme Hening Danau Toba: Refleksi di Atas Kaldera",
    excerpt:
      "Menatap riak air purba yang memeluk Pulau Samosir saat fajar menyingsing dalam kesunyian yang khidmat.",
    tags: ["Perjalanan", "Nusantara", "Fotografi"],
    readingTimeMinutes: 3,
    coverImageUrl: resolvePostCover("ritme-hening-danau-toba"),
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
    coverImageUrl: resolvePostCover("jejak-tenun-ikat-sumba"),
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
    coverImageUrl: resolvePostCover("harmoni-mbaru-niang-wae-rebo"),
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
  {
    id: "c4444444-4444-4000-8000-000000000004",
    slug: "jejak-pinisi-bulukumba",
    title: "Jejak Pinisi Bulukumba: Ketangguhan Layar Penjaga Samudra",
    excerpt:
      "Menelusuri dentang pasak kayu ulin di pesisir Tanah Beru, tempat para panrita lopi merakit kapal layar legendaris tanpa cetak biru tertulis.",
    tags: ["Maritim", "Kriya", "Tradisi"],
    readingTimeMinutes: 4,
    coverImageUrl: resolvePostCover("jejak-pinisi-bulukumba"),
    publishedAt: "2026-10-06T08:00:00Z",
    blocks: [
      {
        id: "blk-pinisi-1",
        type: "rich_text",
        heading: "Kearifan Tanpa Cetak Biru di Tanah Beru",
        content:
          "Di bawah naungan galangan terbuka tepi pantai Tanah Beru, aroma serutan kayu besi dan kayu ulin memenuhi udara hangat pesisir Sulawesi Selatan.\n\nPara panrita lopi—sang maestro pembuat kapal—tidak pernah menggunakan gambar teknik di atas kertas. Rancangan lambung Pinisi yang anggun namun kokoh tersimpan rapi dalam ingatan turun-temurun, diwariskan melalui rasa, pandangan mata, dan bisikan doa laut.",
      },
      {
        id: "blk-pinisi-2",
        type: "rich_text",
        heading: "Menjaga Kedaulatan Bahari Nusantara",
        content:
          "Setiap pasak kayu yang dipukul bukan sekadar menyatukan papan, melainkan mengikat janji para pelaut Bugis-Makassar untuk senantiasa menghormati samudra sebagai ruang hidup yang menghidupkan, bukan yang menaklukkan.",
      },
    ],
  },
  {
    id: "c5555555-5555-4000-8000-000000000005",
    slug: "harmoni-terasering-jatiluwih",
    title: "Harmoni Terasering Jatiluwih: Filosofi Subak dan Aliran Air Abadi",
    excerpt:
      "Menyusuri undakan sawah zamrud di kaki Gunung Batukaru, tempat kearifan Tri Hita Karana diwujudkan dalam pembagian air yang adil dan hening.",
    tags: ["Lanskap", "Budaya", "Nusantara"],
    readingTimeMinutes: 4,
    coverImageUrl: resolvePostCover("harmoni-terasering-jatiluwih"),
    publishedAt: "2026-10-06T09:30:00Z",
    blocks: [
      {
        id: "blk-jatiluwih-1",
        type: "rich_text",
        heading: "Undakan Zamrud di Bawah Bayang Batukaru",
        content:
          "Kabut tipis berarak lambat menyelimuti lereng Gunung Batukaru, menyingkap undakan terasering sawah Jatiluwih yang membentang bak tangga raksasa berwarna zamrud.\n\nDi sini, ritme kehidupan mengalir seirama dengan gemercik air di parit-parit kecil. Setiap jengkal tanah ditata bukan demi efisiensi semata, melainkan penghormatan mendalam pada Dewi Sri dan keseimbangan mikrokosmos alam.",
      },
      {
        id: "blk-jatiluwih-2",
        type: "rich_text",
        heading: "Subak: Demokrasi Air yang Bernyawa",
        content:
          "Sistem irigasi Subak yang telah bertahan lebih dari seribu tahun adalah bukti nyata bahwa tata kelola lingkungan yang adil lahir dari musyawarah dan spiritualitas, bukan persaingan. Di Jatiluwih, air adalah anugerah suci yang mengikat persaudaraan antarpetani.",
      },
    ],
  },
];

export class FixturePostRepository implements PostRepositoryPort {
  async getPublishedPosts(): Promise<PublishedPostDto[]> {
    return [...FIXTURE_POSTS].sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );
  }

  async getPublishedBySlug(slug: string): Promise<PublishedPostDto | null> {
    const post = FIXTURE_POSTS.find((p) => p.slug === slug);
    return post || null;
  }

  async getRelatedPosts(
    currentSlug: string,
    tags: string[],
    limit: number = 2,
  ): Promise<PublishedPostDto[]> {
    const others = FIXTURE_POSTS.filter((p) => p.slug !== currentSlug);

    const scored = others.map((post) => {
      const common = post.tags.filter((t) => tags.includes(t)).length;
      return { post, score: common };
    });

    scored.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return (
        new Date(b.post.publishedAt).getTime() -
        new Date(a.post.publishedAt).getTime()
      );
    });

    return scored.slice(0, limit).map((s) => s.post);
  }
}
