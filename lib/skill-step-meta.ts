/**
 * Single accessor layer for checklist step enrichment.
 * Runtime source of truth: data/skills.json (steps) + data/boilerplate-tags.json (tag fallbacks).
 */
import boilerplateTagsBundle from "@/data/boilerplate-tags.json";

import type { CurriculumSkillMeta } from "@/data/skillCurriculum";
import type { ChecklistStep } from "@/lib/checklist-step";
import { getStepPhaseLabel } from "@/lib/step-phase";
import type { StepSegment } from "@/lib/skill-templates";
import {
  getCriticalStepCategory,
  type CriticalStepCategory,
} from "@/lib/critical-steps";

export type BoilerplateTagEntry = {
  tagKey: string | null;
  boilerplateId: string;
  rendersAs: string | null;
  whyRule: string | null;
  stepTextCue: string | null;
  detailedText: string | null;
  tagCategory: string | null;
  phaseWord: string | null;
  clinicalNote: string | null;
  subSteps: string[] | null;
  criticalCategory: string | null;
  examScorecard: string | null;
};

const tagsByBoilerplateId = (
  boilerplateTagsBundle as {
    tagsByBoilerplateId: Record<string, BoilerplateTagEntry[]>;
  }
).tagsByBoilerplateId;

/** Pick variant when one boilerplateId has open/core/close rows in the xlsx. */
export function pickBoilerplateTag(
  boilerplateId: string | undefined,
  segment?: StepSegment,
): BoilerplateTagEntry | undefined {
  if (!boilerplateId) {
    return undefined;
  }
  const variants = tagsByBoilerplateId[boilerplateId];
  if (!variants?.length) {
    return undefined;
  }
  if (variants.length === 1) {
    return variants[0];
  }

  const why = (v: BoilerplateTagEntry) => v.whyRule?.toLowerCase() ?? "";

  if (boilerplateId === "HAND_HYGIENE") {
    if (segment === "open") {
      return variants.find((v) => why(v).includes("first")) ?? variants[0];
    }
    if (segment === "close") {
      return variants.find((v) => why(v).includes("last")) ?? variants.at(-1);
    }
    return variants.find((v) => why(v).includes("middle")) ?? variants[1];
  }

  if (boilerplateId === "WATER_CHECK") {
    if (segment === "open") {
      return variants.find((v) => why(v).includes("open phase")) ?? variants[0];
    }
    return (
      variants.find((v) => why(v).includes("core phase")) ?? variants.at(-1)
    );
  }

  if (boilerplateId === "CALL_LIGHT") {
    if (segment === "close") {
      return variants.find((v) => why(v).includes("closing")) ?? variants[0];
    }
    if (segment === "core") {
      return variants.find((v) => why(v).includes("mid-skill")) ?? variants[1];
    }
  }

  return variants[0];
}

function coalesce(
  ...values: (string | null | undefined)[]
): string | undefined {
  for (const v of values) {
    const t = v?.trim();
    if (t) {
      return t;
    }
  }
  return undefined;
}

export function resolveStepDetailedText(
  step: ChecklistStep,
): string | undefined {
  const tag = pickBoilerplateTag(step.boilerplateId, step.segment);
  return coalesce(step.detailedText, tag?.detailedText);
}

export function resolveStepTagCategory(
  step: ChecklistStep,
): string | undefined {
  const tag = pickBoilerplateTag(step.boilerplateId, step.segment);
  return coalesce(step.tagCategory, tag?.tagCategory);
}

export function resolveStepClinicalNote(
  step: ChecklistStep,
): string | undefined {
  const tag = pickBoilerplateTag(step.boilerplateId, step.segment);
  return coalesce(step.note, tag?.clinicalNote);
}

/** step.subSteps wins; tag sub_steps from boilerplate_tags.json is fallback */
export function resolveStepSubSteps(step: ChecklistStep): string[] | undefined {
  if (step.subSteps?.length) {
    return step.subSteps;
  }
  const tag = pickBoilerplateTag(step.boilerplateId, step.segment);
  return tag?.subSteps?.length ? tag.subSteps : undefined;
}

export function resolveStepRendersAs(step: ChecklistStep): string | undefined {
  const tag = pickBoilerplateTag(step.boilerplateId, step.segment);
  return tag?.rendersAs ?? undefined;
}

export function resolveStepCriticalCategory(
  step: ChecklistStep,
  displayText?: string,
): CriticalStepCategory | null {
  const fromStep = step.criticalCategory?.trim();
  if (fromStep) {
    return fromStep as CriticalStepCategory;
  }
  const tag = pickBoilerplateTag(step.boilerplateId, step.segment);
  if (tag?.criticalCategory) {
    return tag.criticalCategory as CriticalStepCategory;
  }
  if (displayText) {
    return getCriticalStepCategory(displayText);
  }
  return null;
}

export function isStepCritical(
  step: ChecklistStep,
  displayText?: string,
): boolean {
  return resolveStepCriticalCategory(step, displayText) !== null;
}

export function criticalStepBadgeLabelForStep(
  step: ChecklistStep,
  displayText?: string,
): string | null {
  return isStepCritical(step, displayText) ? "⚠️ Critical" : null;
}

export function resolveStepPhaseWord(
  step: ChecklistStep,
  meta: CurriculumSkillMeta,
): string {
  const raw = step.phaseWord?.trim();
  if (raw && raw !== "(skill-context)") {
    return raw;
  }
  const tag = pickBoilerplateTag(step.boilerplateId, step.segment);
  const fromTag = tag?.phaseWord?.trim();
  if (fromTag && fromTag !== "(skill-context)") {
    return fromTag;
  }
  return getStepPhaseLabel(step, meta);
}

export function resolveStepExamScorecardRaw(
  step: ChecklistStep,
): string | undefined {
  const tag = pickBoilerplateTag(step.boilerplateId, step.segment);
  return coalesce(step.examScorecard, tag?.examScorecard);
}
