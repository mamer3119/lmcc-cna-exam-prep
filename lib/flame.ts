import type { ChecklistStep } from "@/lib/checklist-step";
import {
  getTemplateByRtcId,
  type TemplateDefinition,
} from "@/lib/skill-templates";

export type FlameLetter = "F" | "L" | "A" | "M" | "E";

export const FLAME_ORDER: FlameLetter[] = ["F", "L", "A", "M", "E"];

export const FLAME_MEANINGS: Record<FlameLetter, string> = {
  F: "First steps right",
  L: "Loop infection control",
  A: "Action: the procedure middle",
  M: "Must-safety checks",
  E: "End: call light, bed low, final hand wash",
};

export type FlameContext = {
  slug: string;
  stepIndex: number;
  totalSteps: number;
};

const MUST_SAFETY_PATTERN =
  /water temp|check water|60 sec|60 seconds|brake|lock|wipe front|verify diet|diet card|hold catheter|catheter bag|block patient/i;

const GLOVE_OR_HYGIENE_PATTERN = /glove|hand_hygiene/i;

export function getFlameLetter(
  step: ChecklistStep,
  context: FlameContext,
): FlameLetter | null {
  const segment = step.segment;
  if (segment === "open") return "F";
  if (segment === "close") return "E";

  if (
    context.slug === "hand-hygiene" &&
    context.stepIndex === context.totalSteps - 1
  ) {
    return "E";
  }

  const text = `${step.text} ${step.detailedText ?? ""}`.toLowerCase();

  if (step.criticalCategory || MUST_SAFETY_PATTERN.test(text)) {
    return "M";
  }

  const boilerplate = (step.boilerplateId ?? "").toLowerCase();
  if (GLOVE_OR_HYGIENE_PATTERN.test(boilerplate)) {
    return "L";
  }

  return "A";
}

export function collectFlameLetters(
  steps: ChecklistStep[],
  context: Omit<FlameContext, "stepIndex">,
): Set<FlameLetter> {
  const letters = new Set<FlameLetter>();
  for (const step of steps) {
    const letter = getFlameLetter(step, {
      ...context,
      stepIndex: step.id - 1,
    });
    if (letter) letters.add(letter);
  }
  return letters;
}

export function getTemplateForSkill(
  examSkillNumber: number,
): TemplateDefinition | undefined {
  return getTemplateByRtcId(examSkillNumber);
}

export function getTemplateStrip(skill: {
  examSkillNumber: number;
  title: string;
  steps: ChecklistStep[];
}): {
  template: TemplateDefinition | undefined;
  openCount: number;
  coreCount: number;
  closeCount: number;
} {
  const template = getTemplateForSkill(skill.examSkillNumber);
  const openCount = skill.steps.filter((s) => s.segment === "open").length;
  const coreCount = skill.steps.filter((s) => s.segment === "core").length;
  const closeCount = skill.steps.filter((s) => s.segment === "close").length;
  return { template, openCount, coreCount, closeCount };
}
