import {
  PageSchema,
  validatePageForPublish,
  type Page,
} from "@jejak-rona/schema";
import { checkHomeHeroMediaRule } from "../../domain/rules/hero-publish.rule.js";
import type { PageRepositoryPort } from "../ports/page-repository.port.js";
import type { DeployHookPort } from "../ports/deploy-hook.port.js";

export interface PublishPageResult {
  success: boolean;
  errors?: string[];
  publishedAt?: string;
  buildStatus?: {
    queued: boolean;
    message: string;
  };
}

/**
 * Use Case: Menerbitkan Halaman (Publish Page)
 * 1. Memvalidasi skema data draf
 * 2. Menjalankan aturan domain (mis. hero beranda wajib bermedia)
 * 3. Menyimpan snapshot ke repository
 * 4. Meminta pemicuan deploy hook dengan aturan rate limit
 */
export class PublishPageUseCase {
  constructor(
    private readonly pageRepository: PageRepositoryPort,
    private readonly deployHook: DeployHookPort,
  ) {}

  async execute(pageId: string): Promise<PublishPageResult> {
    const draft = await this.pageRepository.getDraftById(pageId);
    if (!draft) {
      return {
        success: false,
        errors: [`Halaman dengan ID "${pageId}" tidak ditemukan.`],
      };
    }

    // 1. Validasi struktur skema
    const parseResult = PageSchema.safeParse(draft);
    if (!parseResult.success) {
      const issueMessages = parseResult.error.issues.map(
        (issue) => `${issue.path.join(".")}: ${issue.message}`,
      );
      return {
        success: false,
        errors: issueMessages,
      };
    }

    const validatedPage: Page = parseResult.data;

    // 2. Validasi aturan domain konten publikasi
    const contentValidation = validatePageForPublish(validatedPage);
    if (!contentValidation.isValid) {
      return {
        success: false,
        errors: contentValidation.errors,
      };
    }

    // 3. Aturan khusus hero beranda
    const heroRuleResult = checkHomeHeroMediaRule(validatedPage);
    if (!heroRuleResult.passed) {
      return {
        success: false,
        errors: [heroRuleResult.message],
      };
    }

    // 4. Salin ke published melalui repository
    const nowIso = new Date().toISOString();
    const publishedSnapshot: Page = {
      ...validatedPage,
      status: "published",
      publishedAt: nowIso,
      updatedAt: nowIso,
    };

    const publishRecord = await this.pageRepository.publishPage(
      pageId,
      publishedSnapshot,
    );

    // 5. Memicu deploy hook Cloudflare Pages
    const buildResponse = await this.deployHook.triggerBuild(
      `Publish page: ${validatedPage.title} (${pageId})`,
    );

    return {
      success: true,
      publishedAt: publishRecord.publishedAt,
      buildStatus: {
        queued: buildResponse.queued,
        message: buildResponse.message,
      },
    };
  }
}
