import { describe, expect, it } from "vitest";

import {
  getExamScorecard,
  getExamScorecardsForSkill,
  shouldShowInlineExamScorecard,
  skillHasExamScorecards,
  skillHasExamNumbersSummary,
} from "@/lib/exam-scorecard";

const SCORECARD_SLUGS = [
  "manual-blood-pressure",
  "radial-pulse-60-seconds",
  "respirations-60-seconds",
  "weight-ambulatory-client",
  "urinary-output-measurement",
] as const;

describe("exam-scorecard", () => {
  it("defines 15 entries total across 6 measurement / technique slugs", () => {
    const slugs = [
      "hand-hygiene",
      "manual-blood-pressure",
      "radial-pulse-60-seconds",
      "respirations-60-seconds",
      "weight-ambulatory-client",
      "urinary-output-measurement",
    ] as const;
    const all = slugs.flatMap((slug) => getExamScorecardsForSkill(slug));
    expect(all).toHaveLength(15);
    expect(new Set(all.map((e) => `${e.slug}:${e.stepId}`)).size).toBe(15);
  });

  it("returns BP step 14 tolerance with systolic and diastolic detail", () => {
    const entry = getExamScorecard("manual-blood-pressure", 14);
    expect(entry).toBeDefined();
    expect(entry?.kind).toBe("tolerance");
    expect(entry?.value).toMatch(/±8\s*mmHg/i);
    expect(entry?.detail).toMatch(/systolic/i);
    expect(entry?.detail).toMatch(/diastolic/i);
    expect(entry?.ariaLabel).toMatch(/exam scoring/i);
  });

  it("returns distinct deflate rate scorecards for BP steps 8 and 9", () => {
    const step8 = getExamScorecard("manual-blood-pressure", 8);
    const step9 = getExamScorecard("manual-blood-pressure", 9);
    expect(step8).toBeDefined();
    expect(step9).toBeDefined();
    expect(step8?.value).toMatch(/2–3|2-3/);
    expect(step9?.value).toMatch(/2 mm Hg\/second/i);
    expect(step8?.value).not.toBe(step9?.value);
    expect(step8?.detail).toMatch(/systolic/i);
    expect(step9?.detail).toMatch(/diastolic/i);
  });

  it("maps documentation steps per R3 table", () => {
    expect(getExamScorecard("radial-pulse-60-seconds", 6)?.value).toMatch(/±4/);
    expect(getExamScorecard("respirations-60-seconds", 5)?.value).toMatch(/±4/);
    expect(getExamScorecard("weight-ambulatory-client", 12)?.value).toMatch(
      /±2 lb/,
    );
    expect(getExamScorecard("weight-ambulatory-client", 12)?.value).toMatch(
      /0\.9 kg/,
    );
    expect(getExamScorecard("urinary-output-measurement", 10)?.value).toMatch(
      /±25 mL/,
    );
  });

  it("lists hand-hygiene technique scorecards on steps 5–11", () => {
    const hh = getExamScorecardsForSkill("hand-hygiene");
    expect(hh.map((e) => e.stepId)).toEqual([5, 6, 7, 8, 9, 10, 11]);
    expect(getExamScorecard("hand-hygiene", 11)?.eyebrow).toBe("Safety");
  });

  it("lists scorecards in step order for a skill", () => {
    const bp = getExamScorecardsForSkill("manual-blood-pressure");
    expect(bp.map((e) => e.stepId)).toEqual([7, 8, 9, 14]);
  });

  it("reports skillHasExamScorecards only for seeded slugs", () => {
    const seeded = ["hand-hygiene", ...SCORECARD_SLUGS] as const;
    for (const slug of seeded) {
      expect(skillHasExamScorecards(slug)).toBe(true);
    }
    expect(skillHasExamScorecards("mouth-care")).toBe(false);
    expect(getExamScorecard("mouth-care", 1)).toBeUndefined();
  });

  it("reports skillHasExamNumbersSummary for BP and hand hygiene", () => {
    expect(skillHasExamNumbersSummary("manual-blood-pressure")).toBe(true);
    expect(skillHasExamNumbersSummary("hand-hygiene")).toBe(true);
    expect(skillHasExamNumbersSummary("mouth-care")).toBe(false);
  });

  it("suppresses inline scorecards in study mode and on summary-card skills", () => {
    const bpStep7 = getExamScorecard("manual-blood-pressure", 7)!;
    const pulseStep6 = getExamScorecard("radial-pulse-60-seconds", 6)!;

    expect(skillHasExamNumbersSummary("manual-blood-pressure")).toBe(true);

    expect(
      shouldShowInlineExamScorecard(bpStep7, {
        isQuiz: false,
        showMainText: true,
        slug: "manual-blood-pressure",
      }),
    ).toBe(false);

    expect(
      shouldShowInlineExamScorecard(bpStep7, {
        isQuiz: true,
        showMainText: false,
        slug: "manual-blood-pressure",
      }),
    ).toBe(false);

    expect(
      shouldShowInlineExamScorecard(pulseStep6, {
        isQuiz: false,
        showMainText: true,
        slug: "radial-pulse-60-seconds",
      }),
    ).toBe(false);

    expect(
      shouldShowInlineExamScorecard(pulseStep6, {
        isQuiz: true,
        showMainText: false,
        slug: "radial-pulse-60-seconds",
      }),
    ).toBe(true);
  });
});
