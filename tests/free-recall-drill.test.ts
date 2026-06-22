import { describe, expect, it } from "vitest";

import { getSkillBySlug } from "@/lib/skills";
import { countScoredSteps } from "@/lib/scored-steps";
import { filterRecallCards, toRecallCards } from "@/lib/free-recall-drill";

describe("free recall drill logic", () => {
  const hh = getSkillBySlug("hand-hygiene")!;

  it("recall deck matches scored step count", () => {
    const cards = toRecallCards(hh.steps, hh.slug, 42);
    expect(cards.length).toBe(countScoredSteps(hh.steps));
  });

  it("filterRecallCards returns missed subset only", () => {
    const cards = toRecallCards(hh.steps, hh.slug, 1);
    const missed = new Set([cards[0]!.id, cards[2]!.id]);
    const subset = filterRecallCards(cards, missed);
    expect(subset).toHaveLength(2);
    expect(subset.every((c) => missed.has(c.id))).toBe(true);
  });
});
