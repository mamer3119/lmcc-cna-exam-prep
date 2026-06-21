import skillsBundle from "@/data/skills.json";

import type { ChecklistStep } from "@/components/SkillChecklist";

export type WebSkill = {
  slug: string;
  file: string;
  studyOrder: number;
  examSkillNumber: number;
  examCardLabel: string;
  title: string;
  section: string;
  rtcVideoUrl: string | null;
  rtcVideoTitle: string | null;
  prevSlug: string | null;
  nextSlug: string | null;
  storageKey: string;
  stepCount: number;
  steps: ChecklistStep[];
};

export type SkillsBundle = {
  generatedAt: string;
  skills: WebSkill[];
};

const bundle = skillsBundle as SkillsBundle;

export function getAllSkills(): WebSkill[] {
  return bundle.skills;
}

export function getSkillBySlug(slug: string): WebSkill | undefined {
  return bundle.skills.find((skill) => skill.slug === slug);
}

export function getSections(): { section: string; skills: WebSkill[] }[] {
  const order: string[] = [];
  const map = new Map<string, WebSkill[]>();

  for (const skill of bundle.skills) {
    if (!map.has(skill.section)) {
      map.set(skill.section, []);
      order.push(skill.section);
    }
    map.get(skill.section)!.push(skill);
  }

  return order.map((section) => ({
    section,
    skills: map.get(section)!,
  }));
}
