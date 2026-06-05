import type { MetadataRoute } from "next";

const SITE_URL = "https://plataforma-apuestas.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // áreas privadas / operativas fuera del índice
      disallow: ["/admin", "/profile"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
