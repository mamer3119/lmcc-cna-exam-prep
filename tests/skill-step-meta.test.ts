import { describe, expect, it } from "vitest";

import { getCurriculumMeta } from "@/data/skillCurriculum";
import { getSkillBySlug } from "@/lib/skills";
import {
  pickBoilerplateTag,
  resolveStepCriticalCategory,
  resolveStepDetailedText,
  resolveStepExamScorecardRaw,
  resolveStepPhaseWord,
  resolveStepSubSteps,
} from "@/lib/skill-step-meta";
import { parseExamScorecardString } from "@/lib/exam-scorecard";

describe("skill-step-meta accessors", () => {
  it("picks HAND_HYGIENE open vs close variants from boilerplate-tags.json", () => {
    const open = pickBoilerplateTag("HAND_HYGIENE", "open");
    const close = pickBoilerplateTag("HAND_HYGIENE", "close");
    expect(open?.whyRule).toMatch(/first/i);
    expect(close?.whyRule).toMatch(/last/i);
    expect(close?.phaseWord).toBe("Record");
  });

  it("prefers step.detailedText over boilerplate tag fallback", () => {
    const bp = getSkillBySlug("manual-blood-pressure");
    const step7 = bp?.steps.find((s) => s.id === 7);
    expect(step7?.detailedText).toBeTruthy();
    expect(resolveStepDetailedText(step7!)).toBe(step7?.detailedText);
  });

  it("uses step.criticalCategory before regex fallback", () => {
    const bath = getSkillBySlug("modified-bed-bath");
    const step2 = bath?.steps.find((s) => s.id === 2);
    expect(step2?.criticalCategory).toBe("privacy");
    expect(resolveStepCriticalCategory(step2!, step2?.text ?? "")).toBe(
      "privacy",
    );
  });

  it("resolveStepPhaseWord prefers step.phaseWord over curriculum table", () => {
    const meta = getCurriculumMeta("manual-blood-pressure")!;
    const bp = getSkillBySlug("manual-blood-pressure");
    const step7 = bp?.steps.find((s) => s.id === 7)!;
    expect(resolveStepPhaseWord(step7, meta)).toBe("Measure");
  });

  it("builds exam scorecards from skills.json examScorecard strings", () => {
    const bp = getSkillBySlug("manual-blood-pressure");
    const step14 = bp?.steps.find((s) => s.id === 14)!;
    const raw = resolveStepExamScorecardRaw(step14);
    expect(raw).toContain("Exam tolerance");
    const parsed = parseExamScorecardString(raw!, "manual-blood-pressure", 14);
    expect(parsed.kind).toBe("tolerance");
    expect(parsed.value).toMatch(/±8\s*mmHg/i);
  });

  it("hydrates GLOVE_REMOVE sub_steps from boilerplate_tags.json", () => {
    const tag = pickBoilerplateTag("GLOVE_REMOVE", "core");
    expect(tag?.subSteps).toHaveLength(2);
    expect(tag?.subSteps?.[0]).toMatch(/grasp outside/i);

    const synthetic = {
      id: 1,
      text: "Remove the gloves, turning them inside out.",
      segment: "core" as const,
      boilerplateId: "GLOVE_REMOVE",
    };
    expect(resolveStepSubSteps(synthetic)).toEqual(tag?.subSteps);
  });
});
