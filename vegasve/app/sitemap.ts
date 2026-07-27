import type { MetadataRoute } from "next";

const SITE_URL = "https://plataforma-apuestas.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  // Solo los juegos activos en producción (parley y caballos son "próximamente").
  const routes = ["", "/lobby", "/bingo", "/domino", "/poker"];
  return routes.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.8,
  }));
}
