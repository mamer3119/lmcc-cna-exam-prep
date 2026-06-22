import { describe, expect, it } from "vitest";

import { getCurriculumMeta } from "@/data/skillCurriculum";
import { resolveStepDisplayText } from "@/lib/checklist-step";
import { buildSkillsXlsmPayload } from "@/lib/export-skills-xlsm";
import { getAllSkills } from "@/lib/skills";
import {
  resolveStepClinicalNote,
  resolveStepCriticalCategory,
  resolveStepDetailedText,
  resolveStepExamScorecardRaw,
  resolveStepPhaseWord,
  resolveStepSubSteps,
  resolveStepTagCategory,
} from "@/lib/skill-step-meta";

/**
 * Export mapper (lib/export-skills-xlsm.ts) and UI accessors must agree.
 * Locks parity without spawning the CLI.
 */
describe("export hydration parity — buildSkillsXlsmPayload vs accessors", () => {
  const payload = buildSkillsXlsmPayload();
  const skills = getAllSkills();

  it("exports all 22 skills with studentFocus", () => {
    expect(payload.skills).toHaveLength(22);
    for (const skill of payload.skills) {
      expect(skill.studentFocus).toBeTruthy();
    }
  });

  it("payload step fields match direct accessor outputs", () => {
    for (const skill of skills) {
      const exported = payload.skills.find((s) => s.slug === skill.slug);
      expect(exported).toBeDefined();
      const meta = getCurriculumMeta(skill.slug);

      for (const step of skill.steps) {
        const row = exported!.steps.find((s) => s.id === step.id);
        expect(row).toBeDefined();

        const displayText = resolveStepDisplayText(step, { slug: skill.slug });
        expect(row!.text).toBe(displayText);
        expect(row!.detailedTagText).toBe(resolveStepDetailedText(step) ?? "");
        expect(row!.tagCategoryLabel).toBe(resolveStepTagCategory(step) ?? "");
        expect(row!.note).toBe(resolveStepClinicalNote(step) ?? "");
        expect(row!.subSteps).toEqual(resolveStepSubSteps(step) ?? []);
        expect(row!.criticalCategory).toBe(
          resolveStepCriticalCategory(step, displayText) ?? "",
        );
        expect(row!.examScorecard).toBe(
          resolveStepExamScorecardRaw(step) ?? "",
        );
        if (meta) {
          expect(row!.phaseWord).toBe(resolveStepPhaseWord(step, meta));
        }
      }
    }
  });

  it("GLOVE_REMOVE steps without raw subSteps export 2 hydrated sub-steps", () => {
    const gloveRows = payload.skills.flatMap((skill) =>
      skill.steps
        .filter(
          (step) =>
            step.boilerplateId === "GLOVE_REMOVE" && step.subSteps.length === 2,
        )
        .map((step) => ({ slug: skill.slug, step })),
    );
    expect(gloveRows.length).toBeGreaterThan(0);
    for (const { step } of gloveRows) {
      expect(step.subSteps[0]).toMatch(/grasp outside/i);
    }
  });

  it("manual blood pressure step 14 exports ±8 scorecard and detailed rubric", () => {
    const bp = payload.skills.find((s) => s.slug === "manual-blood-pressure");
    const step14 = bp?.steps.find((s) => s.id === 14);
    expect(step14?.examScorecard).toMatch(/±8/i);
    expect(step14?.detailedTagText.length).toBeGreaterThan(0);
  });
});
