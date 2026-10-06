import type {
  PostRepositoryPort,
  PublishedPostDto,
} from "../ports/post-repository.port.js";

export class GetPostBySlugUseCase {
  constructor(private readonly postRepo: PostRepositoryPort) {}

  async execute(slug: string): Promise<PublishedPostDto | null> {
    return this.postRepo.getPublishedBySlug(slug);
  }

  async getRelated(
    slug: string,
    tags: string[],
    limit: number = 2,
  ): Promise<PublishedPostDto[]> {
    return this.postRepo.getRelatedPosts(slug, tags, limit);
  }
}
