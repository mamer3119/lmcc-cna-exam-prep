import type { ChecklistStep } from "@/lib/checklist-step";
import { isStepCritical } from "@/lib/skill-step-meta";
import { resolveStepDisplayText } from "@/lib/checklist-step";
import { getScoredSteps, masteryStepId } from "@/lib/scored-steps";
import { fisherYatesShuffle } from "@/lib/shuffle";

export type SequenceDrillStep = {
  id: string;
  stepId: number;
  title: string;
  critical: boolean;
  coachingHint?: string;
};

export type SequenceCheckResult = {
  correctCount: number;
  misplacedIds: string[];
  allCorrect: boolean;
};

export function toSequenceDrillSteps(
  steps: ChecklistStep[],
  skillSlug?: string,
): SequenceDrillStep[] {
  return getScoredSteps(steps).map((step) => {
    const displayText = resolveStepDisplayText(step, { slug: skillSlug });
    return {
      id: masteryStepId(step),
      stepId: step.id,
      title: displayText,
      critical: isStepCritical(step, displayText),
      coachingHint: step.examScorecard ?? step.note,
    };
  });
}

export function canonicalSequenceIds(steps: ChecklistStep[]): string[] {
  return getScoredSteps(steps).map((step) => masteryStepId(step));
}

export function checkSequenceOrder(
  studentOrder: string[],
  canonicalOrder: string[],
): SequenceCheckResult {
  const misplacedIds: string[] = [];
  let correctCount = 0;

  for (let i = 0; i < canonicalOrder.length; i += 1) {
    const expected = canonicalOrder[i]!;
    const actual = studentOrder[i];
    if (actual === expected) {
      correctCount += 1;
    } else if (actual) {
      misplacedIds.push(actual);
    }
  }

  return {
    correctCount,
    misplacedIds: [...new Set(misplacedIds)],
    allCorrect: correctCount === canonicalOrder.length,
  };
}

/** Lock correct positions; reshuffle only misplaced step ids into wrong slots. */
export function reshuffleMisplacedOnly(
  studentOrder: string[],
  canonicalOrder: string[],
  seed: number,
): { order: string[]; lockedIds: Set<string> } {
  const lockedIds = new Set<string>();
  const wrongIndices: number[] = [];
  const wrongIds: string[] = [];

  for (let i = 0; i < canonicalOrder.length; i += 1) {
    if (studentOrder[i] === canonicalOrder[i]) {
      lockedIds.add(studentOrder[i]!);
    } else {
      wrongIndices.push(i);
      wrongIds.push(studentOrder[i] ?? canonicalOrder[i]!);
    }
  }

  const shuffled = fisherYatesShuffle(wrongIds, seed);
  const order = [...studentOrder];
  wrongIndices.forEach((idx, i) => {
    order[idx] = shuffled[i]!;
  });

  return { order, lockedIds };
}

export function initShuffledOrder(
  canonicalOrder: string[],
  seed: number = Date.now(),
): string[] {
  return fisherYatesShuffle(canonicalOrder, seed);
}
