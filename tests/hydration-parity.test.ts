import { describe, expect, it } from "vitest";

import { getCurriculumMeta } from "@/data/skillCurriculum";
import { resolveStepDisplayText } from "@/lib/checklist-step";
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
 * Export mapper (lib/export-skills-xlsm.ts) and UI must read the same accessor
 * outputs. This test locks the contract without running the .mjs script.
 */
describe("hydration parity — skills.json + boilerplate-tags via skill-step-meta", () => {
  const skills = getAllSkills();

  it("all 22 skills expose studentFocus string when synced from master DB", () => {
    for (const skill of skills) {
      expect(skill.studentFocus).toBeTruthy();
    }
  });

  it("every step resolves display text and segment without throwing", () => {
    for (const skill of skills) {
      const meta = getCurriculumMeta(skill.slug);
      for (const step of skill.steps) {
        const displayText = resolveStepDisplayText(step, { slug: skill.slug });
        expect(displayText.length).toBeGreaterThan(0);
        resolveStepDetailedText(step);
        resolveStepTagCategory(step);
        resolveStepClinicalNote(step);
        resolveStepSubSteps(step);
        resolveStepCriticalCategory(step, displayText);
        resolveStepExamScorecardRaw(step);
        if (meta) {
          expect(resolveStepPhaseWord(step, meta).length).toBeGreaterThan(0);
        }
      }
    }
  });

  it("GLOVE_REMOVE steps without raw subSteps hydrate 2 tag sub-steps", () => {
    const gloveSteps = skills.flatMap((skill) =>
      skill.steps
        .filter(
          (s) => s.boilerplateId === "GLOVE_REMOVE" && !s.subSteps?.length,
        )
        .map((step) => ({ slug: skill.slug, step })),
    );
    expect(gloveSteps.length).toBeGreaterThan(0);
    for (const { step } of gloveSteps) {
      expect(resolveStepSubSteps(step)).toHaveLength(2);
    }
  });

  it("FINAL-PASS skills have detailedText on scored measurement steps", () => {
    const bp = skills.find((s) => s.slug === "manual-blood-pressure");
    const step14 = bp?.steps.find((s) => s.id === 14);
    expect(resolveStepExamScorecardRaw(step14!)).toMatch(/±8/i);
    expect(resolveStepDetailedText(step14!)).toBeTruthy();
  });
});
