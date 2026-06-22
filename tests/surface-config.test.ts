import { describe, expect, it } from "vitest";

import {
  SURFACE_CONFIGS,
  resolveSkillPageSurfaceConfig,
  resolveSurfaceDisplay,
} from "@/lib/skill-surface-config";

describe("skill surface config", () => {
  it("skillPageStudy enables full enrichment and segment organizer", () => {
    const display = resolveSurfaceDisplay("skillPageStudy");
    expect(display.detailedText).toBe(true);
    expect(display.segmentBadges).toBe(true);
    expect(display.examScorecards).toBe(true);
    expect(SURFACE_CONFIGS.skillPageStudy.showSegmentOrganizer).toBe(true);
    expect(SURFACE_CONFIGS.skillPageStudy.showModeToggle).toBe(true);
  });

  it("skillPageQuiz keeps exam scorecards when segments off (R7)", () => {
    const display = resolveSurfaceDisplay("skillPageQuiz");
    expect(display.segmentBadges).toBe(false);
    expect(display.phaseWordBadge).toBe(false);
    expect(display.detailedText).toBe(false);
    expect(display.examScorecards).toBe(true);
  });

  it("resolveSkillPageSurfaceConfig maps study and quiz modes", () => {
    expect(resolveSkillPageSurfaceConfig("study").display.preset).toBe(
      "studyFull",
    );
    expect(resolveSkillPageSurfaceConfig("quiz").display.preset).toBe("quiz");
  });

  it("examSim matches quiz chrome but omits organizer and mode toggle", () => {
    const cfg = SURFACE_CONFIGS.examSim;
    expect(cfg.showSegmentOrganizer).toBe(false);
    expect(cfg.showModeToggle).toBe(false);
    expect(resolveSurfaceDisplay("examSim").examScorecards).toBe(true);
  });
});
