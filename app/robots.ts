import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fit-os.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/profile", "/settings", "/diet", "/workout", "/progress", "/analytics"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
