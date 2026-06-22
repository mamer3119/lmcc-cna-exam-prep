import { describe, expect, it } from "vitest";

import {
  CHECKLIST_DISPLAY_PRESETS,
  resolveChecklistDisplay,
} from "@/lib/checklist-display";

describe("checklist display presets", () => {
  it("studyFull enables all enrichment except rendersAsEmoji", () => {
    const d = CHECKLIST_DISPLAY_PRESETS.studyFull;
    expect(d.subSteps).toBe(true);
    expect(d.detailedText).toBe(true);
    expect(d.tagCategory).toBe(true);
    expect(d.rendersAsEmoji).toBe(false);
  });

  it("quiz disables rubric and segment chrome but keeps scorecards", () => {
    const d = CHECKLIST_DISPLAY_PRESETS.quiz;
    expect(d.detailedText).toBe(false);
    expect(d.segmentBadges).toBe(false);
    expect(d.examScorecards).toBe(true);
  });

  it("resolveChecklistDisplay maps legacy showSegmentBadges off → phaseWordBadge off", () => {
    const d = resolveChecklistDisplay({
      mode: "study",
      showSegmentBadges: false,
    });
    expect(d.segmentBadges).toBe(false);
    expect(d.phaseWordBadge).toBe(false);
    expect(d.detailedText).toBe(true);
  });

  it("resolveChecklistDisplay applies overrides on top of preset", () => {
    const d = resolveChecklistDisplay({
      preset: "quiz",
      overrides: { tagCategory: true },
    });
    expect(d.tagCategory).toBe(true);
    expect(d.detailedText).toBe(false);
  });
});
