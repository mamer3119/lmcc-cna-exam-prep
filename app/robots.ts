import type { MetadataRoute } from "next";

export const dynamic = "force-static";
import { SITE_ORIGIN } from "@/lib/seo";
import { canonicalPath } from "@/lib/paths";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${SITE_ORIGIN}${canonicalPath("/sitemap.xml")}`,
  };
}
