import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://jobcraft.hritiknain666-35e.workers.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/jobs", "/resume", "/career-assistant"];
  return routes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "/jobs" ? "daily" : "weekly",
    priority: route === "" ? 1 : route === "/jobs" ? 0.9 : 0.7,
  }));
}
