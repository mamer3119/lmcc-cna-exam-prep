import type { Metadata } from "next";
import type { WebSkill } from "@/lib/skills";
import { canonicalPath } from "@/lib/paths";

export const SITE_ORIGIN =
  process.env.NEXT_PUBLIC_SITE_ORIGIN ?? "https://mamer3119.github.io";

export const SITE_NAME = "LMCC CNA Skills Navigator";

export function homeMetadata(): Metadata {
  const title = "LMCC CNA Skills Exam Prep | Navigator";
  const description =
    "Practice the 22 official California CNA skills for the state exam — free for Lotus Medical Career College students.";
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

export function graduatesMetadata(): Metadata {
  const title = "LMCC CNA Graduate Study Guide | Navigator";
  const description =
    "Continue practicing the 22 official California CNA skills after graduation.";
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

export function studyMethodMetadata(): Metadata {
  const title = "How to Study the 22 CNA Skills | LMCC Navigator";
  const description =
    "Learn the memory-palace study method: the sandwich, FLAME, and confusion pairs.";
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
