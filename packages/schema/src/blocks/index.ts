import { z } from "zod";
import { HeroMediaBlockSchema, type HeroMediaBlock } from "./hero-media.js";
import { RichTextBlockSchema, type RichTextBlock } from "./rich-text.js";
import { ImageFullBlockSchema, type ImageFullBlock } from "./image-full.js";

export * from "./hero-media.js";
export * from "./rich-text.js";
export * from "./image-full.js";

export const BlockSchema = z.union([
  HeroMediaBlockSchema,
  RichTextBlockSchema,
  ImageFullBlockSchema,
]);

export type Block = z.infer<typeof BlockSchema>;
export type BlockType = "hero_media" | "rich_text" | "image_full";
