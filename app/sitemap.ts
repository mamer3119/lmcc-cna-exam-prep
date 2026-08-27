import type { MetadataRoute } from "next";

export const dynamic = "force-static";
import { getAllSkills } from "@/lib/skills";
import { SITE_ORIGIN } from "@/lib/seo";
import { canonicalPath } from "@/lib/paths";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_ORIGIN}${canonicalPath("/")}`, priority: 1.0 },
    { url: `${SITE_ORIGIN}${canonicalPath("/skills/")}`, priority: 0.9 },
    { url: `${SITE_ORIGIN}${canonicalPath("/for-graduates/")}`, priority: 0.8 },
    { url: `${SITE_ORIGIN}${canonicalPath("/study-method/")}`, priority: 0.8 },
  ];

  const skillPages = getAllSkills().map((skill) => ({
    url: `${SITE_ORIGIN}${canonicalPath(`/skills/${skill.slug}/`)}`,
    priority: 0.8,
  }));

  return [...staticPages, ...skillPages];
}
