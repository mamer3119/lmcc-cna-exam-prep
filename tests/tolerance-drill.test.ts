import { describe, expect, it } from "vitest";

import { getSkillBySlug } from "@/lib/skills";
import {
  checkToleranceAnswer,
  getToleranceSteps,
  toToleranceCards,
} from "@/lib/tolerance-drill";

describe("tolerance drill logic", () => {
  const hh = getSkillBySlug("hand-hygiene")!;

  it("finds failRule steps on hand hygiene", () => {
    const toleranceSteps = getToleranceSteps(hh.steps);
    expect(toleranceSteps.length).toBeGreaterThan(0);
    expect(toleranceSteps.some((s) => s.id === 5)).toBe(true);
  });

  it("builds MCQ cards with correct answer in options", () => {
    const cards = toToleranceCards(hh.steps, hh.slug);
    expect(cards.length).toBeGreaterThan(0);
    for (const card of cards) {
      expect(card.options).toContain(card.correctAnswer);
      expect(card.options.length).toBeGreaterThanOrEqual(3);
      expect(card.prompt.length).toBeGreaterThan(5);
    }
  });

  it("checkToleranceAnswer matches exact failRule string", () => {
    const cards = toToleranceCards(hh.steps, hh.slug);
    const first = cards[0]!;
    expect(checkToleranceAnswer(first, first.correctAnswer)).toBe(true);
    expect(checkToleranceAnswer(first, "wrong answer")).toBe(false);
  });
});
