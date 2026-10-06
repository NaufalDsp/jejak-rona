import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ site }) => {
  const baseUrl = site
    ? site.toString().replace(/\/$/, "")
    : "http://localhost:4321";

  const robots = `
User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

Sitemap: ${baseUrl}/sitemap.xml
`.trim();

  return new Response(robots, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
};
