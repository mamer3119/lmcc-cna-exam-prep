import type { ChecklistStep } from "@/lib/checklist-step";
import { resolveStepDisplayText } from "@/lib/checklist-step";
import {
  resolveStepCoachingNote,
  resolveStepFailRule,
} from "@/lib/learn-mode-display";
import { getScoredSteps, masteryStepId } from "@/lib/scored-steps";
import { fisherYatesShuffle } from "@/lib/shuffle";

export type ToleranceCard = {
  id: string;
  stepId: number;
  prompt: string;
  correctAnswer: string;
  options: string[];
  officialText: string;
  whyItFails?: string;
};

function buildPrompt(step: ChecklistStep, displayText: string): string {
  const failRule = resolveStepFailRule(step);
  if (/sec|second|×|repeat|±|mmHg|beats|breaths|°/i.test(failRule ?? "")) {
    if (/lather|wash|scrub|rub/i.test(displayText)) {
      return "How long must you lather?";
    }
    if (/±|tolerance|beats|breaths|pulse|respir/i.test(failRule ?? "")) {
      return `What is the exam tolerance for this step?`;
    }
    if (/mmHg|inflate|cuff|pressure/i.test(displayText + (failRule ?? ""))) {
      return "What is the required measurement or tolerance?";
    }
    return `What is the required standard for: ${displayText}?`;
  }
  return `What must you demonstrate for: ${displayText}?`;
}

function extractNumericTokens(failRule: string): number[] {
  const matches = failRule.match(/\d+(?:\.\d+)?/g);
  return matches ? matches.map(Number) : [];
}

function formatDistractor(base: number, delta: number, unit: string): string {
  const value = Math.max(1, base + delta);
  return `${value}${unit}`;
}

function buildOptions(correct: string, failRule: string): string[] {
  const nums = extractNumericTokens(failRule);
  const unitMatch = failRule.match(
    /(sec(?:onds?)?|s|×|mmHg|beats|breaths|°F|°C|%)/i,
  );
  const unit = unitMatch?.[1] ?? "";

  const distractors = new Set<string>();
  if (nums.length > 0) {
    const base = nums[0]!;
    for (const delta of [-5, -2, 2, 5, 10, 15]) {
      if (correct.includes("±")) {
        distractors.add(
          `±${Math.max(1, base + delta)} ${correct.replace(/^±\d+\s*/, "").trim()}`,
        );
      } else if (correct.includes("×") || correct.includes("repeat")) {
        distractors.add(
          `repeat full sequence ≥${Math.max(1, base + (delta > 0 ? 1 : -1))}×`,
        );
      } else if (/sec|second/i.test(correct)) {
        distractors.add(`≥${formatDistractor(base, delta, unit || " sec")}`);
      } else {
        distractors.add(formatDistractor(base, delta, unit ? ` ${unit}` : ""));
      }
    }
  } else {
    distractors.add("No minimum time required");
    distractors.add("At evaluator's discretion");
    distractors.add("Once through the sequence");
  }

  distractors.delete(correct);
  const picked = fisherYatesShuffle([...distractors], 7).slice(0, 2);
  return fisherYatesShuffle(
    [correct, ...picked, "Skip — not scored on timing"],
    11,
  );
}

export function getToleranceSteps(steps: ChecklistStep[]): ChecklistStep[] {
  return getScoredSteps(steps).filter((step) => resolveStepFailRule(step));
}

export function toToleranceCards(
  steps: ChecklistStep[],
  skillSlug?: string,
): ToleranceCard[] {
  return getToleranceSteps(steps).map((step) => {
    const displayText = resolveStepDisplayText(step, { slug: skillSlug });
    const failRule = resolveStepFailRule(step)!;
    const coaching = resolveStepCoachingNote(step, step.note);
    const officialText = step.detailedText?.trim() || displayText;
    const correctAnswer = failRule;
    return {
      id: masteryStepId(step),
      stepId: step.id,
      prompt: buildPrompt(step, displayText),
      correctAnswer,
      options: buildOptions(correctAnswer, failRule),
      officialText,
      whyItFails: coaching ?? step.examScorecard ?? step.note,
    };
  });
}

export function checkToleranceAnswer(
  card: ToleranceCard,
  selected: string,
): boolean {
  return selected.trim() === card.correctAnswer.trim();
}
