import type { APIRoute } from "astro";
import { getPublishedPosts } from "../lib/site-data";

export const GET: APIRoute = async ({ site }) => {
  const baseUrl = site
    ? site.toString().replace(/\/$/, "")
    : "http://localhost:4321";
  const posts = await getPublishedPosts();

  interface SitemapItem {
    url: string;
    lastmod?: string;
    priority: string;
    changefreq: string;
  }

  const staticPages: SitemapItem[] = [
    { url: `${baseUrl}/`, priority: "1.0", changefreq: "daily" },
    { url: `${baseUrl}/tentang`, priority: "0.8", changefreq: "weekly" },
    { url: `${baseUrl}/artikel`, priority: "0.9", changefreq: "daily" },
    { url: `${baseUrl}/kontak`, priority: "0.7", changefreq: "monthly" },
  ];

  const postPages: SitemapItem[] = posts.map((post) => ({
    url: `${baseUrl}/artikel/${post.slug}`,
    lastmod: post.publishedAt
      ? new Date(post.publishedAt).toISOString().split("T")[0]
      : undefined,
    priority: "0.8",
    changefreq: "monthly",
  }));

  const allUrls: SitemapItem[] = [...staticPages, ...postPages];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (item) => `  <url>
    <loc>${item.url}</loc>
    ${item.lastmod ? `<lastmod>${item.lastmod}</lastmod>` : ""}
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>`.trim();

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
