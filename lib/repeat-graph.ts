import type { ChecklistStep } from "@/lib/checklist-step";
import { getAllSkills, getSkillBySlug, type WebSkill } from "@/lib/skills";
import type { StepSegment } from "@/lib/skill-templates";

export type RepeatOccurrence = {
  skillSlug: string;
  skillTitle: string;
  examSkillNumber: number;
  stepId: number;
  stepText: string;
  segment: StepSegment | null;
  boilerplateId: string;
};

export const FEATURED_HAND_HYGIENE_EXAMPLES = [
  { slug: "ppe-gown-gloves", stepIds: [11, 16] },
  { slug: "radial-pulse-60-seconds", stepIds: [5] },
] as const;

export function isHandHygieneToken(boilerplateId: string | undefined): boolean {
  if (!boilerplateId) {
    return false;
  }
  return (
    boilerplateId === "HAND_HYGIENE" ||
    boilerplateId.startsWith("HAND_HYGIENE")
  );
}

export function countHandHygieneSteps(
  skill: Pick<WebSkill, "steps">,
): number {
  return skill.steps.filter((step) => isHandHygieneToken(step.boilerplateId))
    .length;
}

let cachedReuse: RepeatOccurrence[] | null = null;

export function getHandHygieneReuse(): RepeatOccurrence[] {
  if (cachedReuse) {
    return cachedReuse;
  }
  const rows: RepeatOccurrence[] = [];
  for (const skill of getAllSkills()) {
    if (skill.slug === "hand-hygiene") {
      continue;
    }
    for (const step of skill.steps) {
      if (!isHandHygieneToken(step.boilerplateId)) {
        continue;
      }
      rows.push(toOccurrence(skill, step));
    }
  }
  cachedReuse = rows;
  return rows;
}

export function getHandHygieneReuseSummary(): {
  skillCount: number;
  stepCount: number;
} {
  const reuse = getHandHygieneReuse();
  return {
    skillCount: new Set(reuse.map((row) => row.skillSlug)).size,
    stepCount: reuse.length,
  };
}

export type FeaturedHandHygieneCard = {
  slug: string;
  title: string;
  examSkillNumber: number;
  occurrences: RepeatOccurrence[];
};

export function getFeaturedHandHygieneExamples(): FeaturedHandHygieneCard[] {
  const reuse = getHandHygieneReuse();
  return FEATURED_HAND_HYGIENE_EXAMPLES.map((example) => {
    const skill = getSkillBySlug(example.slug);
    const occurrences = example.stepIds.flatMap((stepId) => {
      const match = reuse.find(
        (row) => row.skillSlug === example.slug && row.stepId === stepId,
      );
      return match ? [match] : [];
    });
    return {
      slug: example.slug,
      title: skill?.title ?? example.slug,
      examSkillNumber: skill?.examSkillNumber ?? 0,
      occurrences,
    };
  });
}

function toOccurrence(skill: WebSkill, step: ChecklistStep): RepeatOccurrence {
  return {
    skillSlug: skill.slug,
    skillTitle: skill.title,
    examSkillNumber: skill.examSkillNumber,
    stepId: step.id,
    stepText: step.text,
    segment: step.segment ?? null,
    boilerplateId: step.boilerplateId ?? "HAND_HYGIENE",
  };
}
