import type { Page } from "@jejak-rona/schema";
import type { PageRepositoryPort } from "../ports/page-repository.port.js";

export class GetPublishedPageUseCase {
  constructor(private readonly pageRepo: PageRepositoryPort) {}

  async executeBySlug(slug: string): Promise<Page | null> {
    return this.pageRepo.getPublishedBySlug(slug);
  }

  async executeHome(): Promise<Page | null> {
    return this.pageRepo.getPublishedHome();
  }

  async listAll(): Promise<Page[]> {
    return this.pageRepo.listPublishedPages();
  }
}
