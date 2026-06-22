import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { getSkillBySlug } from "@/lib/skills";
import {
  resolveStepDetailedText,
  resolveStepSubSteps,
} from "@/lib/skill-step-meta";

const ROOT = process.cwd();

function readProjectFile(relativePath: string): string {
  return readFileSync(path.join(ROOT, relativePath), "utf8");
}

describe("skill-checklist hydration (P0 accessors → UI)", () => {
  it("GLOVE_REMOVE step 9 in urinary output has tag sub-steps without raw subSteps", () => {
    const skill = getSkillBySlug("urinary-output-measurement");
    const step9 = skill?.steps.find((s) => s.id === 9);
    expect(step9?.boilerplateId).toBe("GLOVE_REMOVE");
    expect(step9?.subSteps).toBeUndefined();

    const subSteps = resolveStepSubSteps(step9!);
    expect(subSteps).toHaveLength(2);
    expect(subSteps?.[0]).toMatch(/grasp outside/i);
  });

  it("manual blood pressure step 7 has detailedText for rubric tooltip", () => {
    const skill = getSkillBySlug("manual-blood-pressure");
    const step7 = skill?.steps.find((s) => s.id === 7);
    const detailed = resolveStepDetailedText(step7!);
    expect(detailed).toBeTruthy();
    expect(detailed!.length).toBeGreaterThan(step7!.text.length);
  });

  it("SkillChecklist uses resolveStepSubSteps and resolveStepClinicalNote", () => {
    const src = readProjectFile("components/SkillChecklist.tsx");
    expect(src).toMatch(/resolveStepSubSteps/);
    expect(src).toMatch(/resolveStepClinicalNote/);
    expect(src).toMatch(/StepClinicalNote/);
    expect(src).toMatch(/useInstructorViewContext/);
    expect(src).toMatch(/useMasteryStore/);
    expect(src).toMatch(/getLearnProgressSteps/);
    expect(src).toMatch(/resolveStepDetailedText/);
    expect(src).toMatch(/skill-step-official-wording/);
    expect(src).not.toMatch(/Full rubric/);
    expect(src).toMatch(/resolveChecklistDisplay/);
    expect(src).toMatch(/skill-step-substeps/);
    expect(src).not.toMatch(/step\.subSteps\?\.forEach/);
    expect(src).not.toMatch(/step\.note &&/);
  });

  it("SkillPageClient renders studentFocus via surface config", () => {
    const src = readProjectFile("components/SkillPageClient.tsx");
    expect(src).toMatch(/StudentFocusBanner/);
    expect(src).toMatch(/resolveSkillPageSurfaceConfig/);
    expect(src).toMatch(/surface\.showStudentFocus/);
  });
});
