import type { ChecklistStep } from "@/lib/checklist-step";
import { resolveStepDisplayText } from "@/lib/checklist-step";
import { getScoredSteps, masteryStepId } from "@/lib/scored-steps";
import { fisherYatesShuffle } from "@/lib/shuffle";

export type RecallCard = {
  id: string;
  stepId: number;
  cue: string;
  answer: string;
};

export function toRecallCards(
  steps: ChecklistStep[],
  skillSlug?: string,
  seed?: number,
): RecallCard[] {
  const cards = getScoredSteps(steps).map((step) => {
    const displayText = resolveStepDisplayText(step, { slug: skillSlug });
    const answer = step.detailedText?.trim() || displayText;
    return {
      id: masteryStepId(step),
      stepId: step.id,
      cue: `Step ${step.id}: What is the official instruction?`,
      answer,
    };
  });
  return fisherYatesShuffle(cards, seed ?? Date.now());
}

export function filterRecallCards(
  cards: RecallCard[],
  ids: Set<string>,
): RecallCard[] {
  return cards.filter((card) => ids.has(card.id));
}
