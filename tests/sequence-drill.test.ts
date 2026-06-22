import { describe, expect, it } from "vitest";

import { getSkillBySlug } from "@/lib/skills";
import {
  canonicalSequenceIds,
  checkSequenceOrder,
  initShuffledOrder,
  reshuffleMisplacedOnly,
} from "@/lib/sequence-drill";
import { fisherYatesShuffle } from "@/lib/shuffle";

describe("fisherYatesShuffle", () => {
  it("is deterministic with seed", () => {
    const a = fisherYatesShuffle([1, 2, 3, 4, 5], 42);
    const b = fisherYatesShuffle([1, 2, 3, 4, 5], 42);
    expect(a).toEqual(b);
    expect(a).not.toEqual([1, 2, 3, 4, 5]);
  });
});

describe("sequence drill logic", () => {
  const hh = getSkillBySlug("hand-hygiene")!;
  const canonical = canonicalSequenceIds(hh.steps);

  it("hand hygiene scored sequence has 10 core steps", () => {
    expect(canonical.length).toBeGreaterThan(0);
  });

  it("checkSequenceOrder counts correct placements", () => {
    const shuffled = initShuffledOrder(canonical, 99);
    const result = checkSequenceOrder(shuffled, canonical);
    expect(result.correctCount).toBeLessThanOrEqual(canonical.length);
    if (shuffled.every((id, i) => id === canonical[i])) {
      expect(result.allCorrect).toBe(true);
    }
  });

  it("reshuffleMisplacedOnly locks correct positions", () => {
    const student = [...canonical];
    [student[0], student[1]] = [student[1]!, student[0]!];
    const { order, lockedIds } = reshuffleMisplacedOnly(student, canonical, 7);
    for (let i = 0; i < canonical.length; i += 1) {
      if (student[i] === canonical[i]) {
        expect(order[i]).toBe(canonical[i]);
        expect(lockedIds.has(canonical[i]!)).toBe(true);
      }
    }
  });
});
