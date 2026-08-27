import type { Metadata } from "next";
import type { WebSkill } from "@/lib/skills";
import { canonicalPath } from "@/lib/paths";

type School = {
  slug: string;
  codes: string[];
  name: string;
};

export const SITE_ORIGIN =
  process.env.NEXT_PUBLIC_SITE_ORIGIN ?? "https://mamer3119.github.io";

export const SITE_NAME = "LMCC CNA Skills Navigator";

export function homeMetadata(): Metadata {
  const title = "Free California CNA Skills Exam Prep | LMCC Navigator";
  const description =
    "Practice the 22 official California CNA skills, find your school, and prepare for the state exam — free for all California CNA graduates.";
  const url = `${SITE_ORIGIN}${canonicalPath("/")}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: url,
    },
  };
}

export function skillsListMetadata(): Metadata {
  const title = "22 California CNA Skills | LMCC Navigator";
  const description =
    "All 22 official California CNA skills with step-by-step checklists and exam context.";
  const url = `${SITE_ORIGIN}${canonicalPath("/skills/")}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
    },
    alternates: {
      canonical: url,
    },
  };
}

export function skillMetadata(skill: WebSkill): Metadata {
  const title = `${skill.title} — California CNA Skill ${skill.examSkillNumber}`;
  const description = `${skill.examCardLabel}. ${skill.stepCount} official checklist steps for the California CNA state exam.`;
  const url = `${SITE_ORIGIN}${canonicalPath(`/skills/${skill.slug}/`)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "article",
    },
    alternates: {
      canonical: url,
    },
  };
}

export function schoolsListMetadata(): Metadata {
  const title = "California CNA Training Programs | LMCC Navigator";
  const description =
    "Search California CNA training programs and testing centers mapped to the Golden West College Regional Testing Center (GWC RTC) portal.";
  const url = `${SITE_ORIGIN}${canonicalPath("/schools/")}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
    },
    alternates: {
      canonical: url,
    },
  };
}

export function schoolMetadata(school: School): Metadata {
  const title = `${school.name} | California CNA Program | LMCC Navigator`;
  const description = `GWC RTC testing codes: ${school.codes.join(", ")}. Verify registration details with the official testing portal.`;
  const url = `${SITE_ORIGIN}${canonicalPath(`/schools/${school.slug}/`)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "article",
    },
    alternates: {
      canonical: url,
    },
  };
}

export function studyMethodMetadata(): Metadata {
  const title = "How to Study the 22 CNA Skills | LMCC Navigator";
  const description =
    "Learn the memory-palace study method: the sandwich, FLAME, and how Skill 1 repeats.";
  const url = `${SITE_ORIGIN}${canonicalPath("/study-method/")}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
    },
    alternates: {
      canonical: url,
    },
  };
}

export function graduatesMetadata(): Metadata {
  const title = "CNA Graduate Study Guide | LMCC Navigator";
  const description =
    "Find your California CNA school and start practicing the 22 official skills for the state exam.";
  const url = `${SITE_ORIGIN}${canonicalPath("/for-graduates/")}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
    },
    alternates: {
      canonical: url,
    },
  };
}

export function jsonLdWebSite(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: `${SITE_ORIGIN}${canonicalPath("/")}`,
  };
}

export function jsonLdOrganization(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Lotus Medical Career College",
    url: "https://www.lmccpomona.com",
  };
}

export function jsonLdItemList(
  items: { name: string; url: string }[],
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: item.url,
    })),
  };
}

export function jsonLdLearningResource(skill: WebSkill): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: skill.title,
    description: `${skill.examCardLabel}. ${skill.stepCount} official checklist steps.`,
    educationalUse: "California CNA state exam preparation",
    url: `${SITE_ORIGIN}${canonicalPath(`/skills/${skill.slug}/`)}`,
  };
}

export function jsonLdWebPage(
  title: string,
  description: string,
  path: string,
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url: `${SITE_ORIGIN}${canonicalPath(path)}`,
  };
}
