import skillsBundle from "@/data/skills.json";

import type { ChecklistStep } from "@/lib/checklist-step";

export type WebSkill = {
  slug: string;
  file: string;
  studyOrder: number;
  examSkillNumber: number;
  examCardLabel: string;
  title: string;
  section: string;
  pedagogicalReason: string;
  rtcVideoUrl: string | null;
  rtcVideoTitle: string | null;
  prevSlug: string | null;
  nextSlug: string | null;
  storageKey: string;
  stepCount: number;
  steps: ChecklistStep[];
};

export type SectionMeta = {
  title: string;
  rationale: string;
};

export type SkillsBundle = {
  generatedAt: string;
  pathwayTagline: string;
  sections: SectionMeta[];
  skills: WebSkill[];
};

const bundle = skillsBundle as SkillsBundle;

export function getPathwayTagline(): string {
  return bundle.pathwayTagline;
}

export function getSectionMeta(): SectionMeta[] {
  return bundle.sections;
}

export function getAllSkills(): WebSkill[] {
  return [...bundle.skills].sort((a, b) => a.studyOrder - b.studyOrder);
}

export function getSkillBySlug(slug: string): WebSkill | undefined {
  return bundle.skills.find((skill) => skill.slug === slug);
}

export function getSections(): {
  section: string;
  sectionIndex: number;
  rationale: string;
  skills: WebSkill[];
}[] {
  const sectionMeta = new Map(
    bundle.sections.map((entry, index) => [
      entry.title,
      { ...entry, sectionIndex: index + 1 },
    ]),
  );

  const grouped = new Map<string, WebSkill[]>();

  for (const skill of getAllSkills()) {
    if (!grouped.has(skill.section)) {
      grouped.set(skill.section, []);
    }
    grouped.get(skill.section)!.push(skill);
  }

  return bundle.sections.map((entry, index) => ({
    section: entry.title,
    sectionIndex: index + 1,
    rationale: entry.rationale,
    skills: grouped.get(entry.title) ?? [],
  }));
}
