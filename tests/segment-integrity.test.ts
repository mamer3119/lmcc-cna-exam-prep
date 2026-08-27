import { describe, expect, it } from "vitest";

import { getAllSkills } from "@/lib/skills";
import type { ChecklistStep } from "@/lib/checklist-step";
import { getFlameLetter, getTemplateForSkill } from "@/lib/flame";

const VALID_SEGMENTS: Array<ChecklistStep["segment"]> = ["open", "core", "close"];

describe("segment and template integrity", () => {
  for (const skill of getAllSkills()) {
    it(`${skill.slug} has a known template`, () => {
      const template = getTemplateForSkill(skill.examSkillNumber);
      expect(template, `examSkillNumber ${skill.examSkillNumber}`).toBeDefined();
    });

    it(`${skill.slug} steps are fully segmented`, () => {
      expect(skill.steps.length).toBe(skill.stepCount);

      const segmented = skill.steps.filter((step) =>
        VALID_SEGMENTS.includes(step.segment),
      );
      expect(segmented.length).toBe(skill.steps.length);

      const counts = {
        open: skill.steps.filter((s) => s.segment === "open").length,
        core: skill.steps.filter((s) => s.segment === "core").length,
        close: skill.steps.filter((s) => s.segment === "close").length,
      };
      expect(counts.open + counts.core + counts.close).toBe(skill.stepCount);
    });

    it(`${skill.slug} steps map to a FLAME letter`, () => {
      for (let i = 0; i < skill.steps.length; i++) {
        const step = skill.steps[i];
        const letter = getFlameLetter(step, {
          slug: skill.slug,
          stepIndex: i,
          totalSteps: skill.steps.length,
        });
        expect(letter, `step ${step.id} maps to a FLAME letter`).toBeTruthy();
      }
    });
  }
});
