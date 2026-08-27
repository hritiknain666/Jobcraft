import type { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://jobcraft.hritiknain666-35e.workers.dev";

export default function robots(): MetadataRoute.Robots {
  const temporaryHost = new URL(SITE_URL).hostname.endsWith(".workers.dev");

  if (temporaryHost) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/auth/"],
    },
    sitemap: `${SITE_URL.replace(/\/$/, "")}/sitemap.xml`,
  };
}
