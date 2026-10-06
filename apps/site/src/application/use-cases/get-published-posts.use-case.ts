import type {
  PostRepositoryPort,
  PublishedPostDto,
} from "../ports/post-repository.port.js";

export class GetPublishedPostsUseCase {
  constructor(private readonly postRepo: PostRepositoryPort) {}

  async execute(): Promise<PublishedPostDto[]> {
    return this.postRepo.getPublishedPosts();
  }

  async getAllTags(): Promise<string[]> {
    const posts = await this.postRepo.getPublishedPosts();
    const tagsSet = new Set<string>();

    for (const post of posts) {
      if (Array.isArray(post.tags)) {
        for (const tag of post.tags) {
          if (tag && typeof tag === "string" && tag.trim()) {
            tagsSet.add(tag.trim());
          }
        }
      }
    }

    return Array.from(tagsSet).sort();
  }
}
