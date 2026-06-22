import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { getSkillBySlug } from "@/lib/skills";
import {
  countLearnProgressSteps,
  countScoredSteps,
  getLearnProgressSteps,
  getScoredSteps,
  isStepScored,
} from "@/lib/scored-steps";

describe("scored-steps (Phase 1 data layer)", () => {
  it("hand hygiene learn progress counts 11 main steps, not 19 with substeps", () => {
    const skill = getSkillBySlug("hand-hygiene");
    expect(skill).toBeDefined();
    expect(countLearnProgressSteps(skill!.steps)).toBe(11);
    expect(skill!.stepCount).toBe(11);

    const subStepTotal = skill!.steps.reduce(
      (sum, step) => sum + (step.subSteps?.length ?? 0),
      0,
    );
    expect(subStepTotal).toBe(8);
    expect(countLearnProgressSteps(skill!.steps) + subStepTotal).toBe(19);
  });

  it("PPE learn progress counts 16 main steps, not 22 with substeps", () => {
    const skill = getSkillBySlug("ppe-gown-gloves");
    expect(skill).toBeDefined();
    expect(countLearnProgressSteps(skill!.steps)).toBe(16);

    const subStepTotal = skill!.steps.reduce(
      (sum, step) => sum + (step.subSteps?.length ?? 0),
      0,
    );
    expect(subStepTotal).toBe(6);
    expect(countLearnProgressSteps(skill!.steps) + subStepTotal).toBe(22);
  });

  it("exam-scored steps exclude OPEN and CLOSE segments", () => {
    const hh = getSkillBySlug("hand-hygiene")!;
    expect(isStepScored(hh.steps[0])).toBe(false);
    expect(isStepScored(hh.steps[1])).toBe(true);
    expect(countScoredSteps(hh.steps)).toBe(10);

    const ppe = getSkillBySlug("ppe-gown-gloves")!;
    expect(isStepScored(ppe.steps[0])).toBe(false);
    expect(isStepScored(ppe.steps[ppe.steps.length - 1])).toBe(false);
    expect(getScoredSteps(ppe.steps).length).toBe(14);
  });

  it("SkillChecklist progress uses getLearnProgressSteps not substeps", () => {
    const src = readFileSync(
      path.join(process.cwd(), "components/SkillChecklist.tsx"),
      "utf8",
    );
    expect(src).toMatch(/getLearnProgressSteps/);
    expect(src).toMatch(/progressSteps\.length/);
    expect(src).not.toMatch(/allAriaLabels\.length/);
  });
});
