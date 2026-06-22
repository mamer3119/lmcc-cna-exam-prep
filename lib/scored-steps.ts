import type { ChecklistStep } from "@/lib/checklist-step";

/** Stable step id within a skill for mastery store keys. */
export function masteryStepId(step: ChecklistStep): string {
  return String(step.id);
}

/**
 * Exam-scored steps (drill denominator).
 * OPEN/CLOSE boilerplate rows are not scored; CORE (and Key Procedure on core segment) are.
 */
export function isStepScored(step: ChecklistStep): boolean {
  if (
    "scored" in step &&
    typeof (step as { scored?: boolean }).scored === "boolean"
  ) {
    return (step as { scored: boolean }).scored;
  }
  return step.segment === "core";
}

/** Scored main steps only — never sub-steps (Phase 1 drill + mastery counts). */
export function getScoredSteps(steps: ChecklistStep[]): ChecklistStep[] {
  return steps.filter(isStepScored);
}

/**
 * Learn-mode progress denominator: main checklist rows only, never nested sub-steps.
 * Matches skills.json stepCount (e.g. hand hygiene 11, not 19 with WHO rubs).
 */
export function getLearnProgressSteps(steps: ChecklistStep[]): ChecklistStep[] {
  return steps;
}

export function countScoredSteps(steps: ChecklistStep[]): number {
  return getScoredSteps(steps).length;
}

export function countLearnProgressSteps(steps: ChecklistStep[]): number {
  return getLearnProgressSteps(steps).length;
}
