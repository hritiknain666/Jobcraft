import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://jobcraft.hritiknain666-35e.workers.dev";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/profile", "/applications", "/resume/builder", "/api/jobs/import"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
