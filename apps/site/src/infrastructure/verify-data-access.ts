/**
 * Cek Ringan Akses Data & Isolasi Draf — Jejak Rona (Tahap 3)
 *
 * Memverifikasi:
 * 1. Data seed valid terhadap PageSchema Zod.
 * 2. Repository mengembalikan beranda dan halaman terbit.
 * 3. Halaman draf ('rencana-edisi-khusus') TIDAK DAPAT diakses lewat jalur publik.
 */

import { PageSchema } from "@jejak-rona/schema";
import {
  SEED_PAGES,
  SEED_DRAFT_ONLY_PAGE,
} from "./repositories/seed-fixtures.js";
import { FixturePageRepository } from "./repositories/fixture-page.repository.js";
import { SupabasePageRepository } from "./supabase/supabase-page.repository.js";
import { GetPublishedPageUseCase } from "../application/use-cases/get-published-page.use-case.js";

let passed = 0;
let total = 0;

function assert(condition: boolean, msg: string) {
  total++;
  if (condition) {
    passed++;
    console.log(`[PASS] ${msg}`);
  } else {
    console.error(`[FAIL] ${msg}`);
    process.exitCode = 1;
  }
}

console.log(
  "--- Memulai Verifikasi Data Access & RLS Contract (Tahap 3) ---\n",
);

// 1. Validasi skema Zod untuk seluruh data seed
for (const seedPage of SEED_PAGES) {
  const result = PageSchema.safeParse(seedPage);
  assert(
    result.success,
    `Seed page "${seedPage.slug}" lolos validasi PageSchema`,
  );
}

const draftResult = PageSchema.safeParse(SEED_DRAFT_ONLY_PAGE);
assert(
  draftResult.success,
  'Seed draft page "rencana-edisi-khusus" lolos validasi PageSchema',
);

// 2. Uji FixturePageRepository & Use Case
const fixtureRepo = new FixturePageRepository();
const useCase = new GetPublishedPageUseCase(fixtureRepo);

async function runTests() {
  // Uji Home
  const home = await useCase.executeHome();
  assert(
    home !== null && home.isHome === true,
    "getPublishedHome() mengembalikan halaman beranda",
  );
  assert(
    home?.blocks.some((b) => b.type === "hero_media"),
    "Beranda terbit memiliki blok hero_media",
  );

  // Uji Halaman Publik Biasa
  const tentang = await useCase.executeBySlug("tentang");
  assert(
    tentang !== null && tentang.slug === "tentang",
    'getPublishedBySlug("tentang") mengembalikan halaman tentang',
  );

  // Uji Isolasi Draf (Krusial: Draf tidak boleh bocor ke publik)
  const secretDraft = await useCase.executeBySlug("rencana-edisi-khusus");
  assert(
    secretDraft === null,
    'ISOLASI DRAF: getPublishedBySlug("rencana-edisi-khusus") mengembalikan null (draf aman dari publik)',
  );

  // Uji List Published Pages
  const publishedList = await useCase.listAll();
  assert(
    publishedList.length === 2 &&
      !publishedList.some((p) => p.status !== "published"),
    'listAll() hanya mengembalikan halaman dengan status "published"',
  );

  // 3. Uji SupabasePageRepository (dengan fallback teruji saat offline/unconfigured)
  const supabaseRepo = new SupabasePageRepository(null);
  const homeFromSupabaseRepo = await supabaseRepo.getPublishedHome();
  assert(
    homeFromSupabaseRepo !== null && homeFromSupabaseRepo.slug === "beranda",
    "SupabasePageRepository beroperasi dengan fallback tangguh saat kredensial cloud belum aktif",
  );

  console.log(
    `\nHasil: ${passed}/${total} pengujian data access & isolasi draf berhasil lolos.\n`,
  );
}

runTests().catch((err) => {
  console.error("Terjadi kesalahan:", err);
  process.exit(1);
});
