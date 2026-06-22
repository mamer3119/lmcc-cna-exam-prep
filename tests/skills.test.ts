import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

import { mapDbStepToChecklistStep } from "@/lib/map-checklist-step";
import { getAllSkills, getSkillBySlug } from "@/lib/skills";

describe("mapDbStepToChecklistStep", () => {
  it("maps sub_lines to subSteps with display lead", () => {
    const step = mapDbStepToChecklistStep({
      number: 5,
      text: "Perform hand hygiene using plenty of lather and friction for at least 20 seconds: Rub hands palm to palm",
      display_lead:
        "Perform hand hygiene using plenty of lather and friction for at least 20 seconds:",
      sub_lines: ["Rub hands palm to palm", "Rub wrists."],
    });
    expect(step.text).toBe(
      "Perform hand hygiene using plenty of lather and friction for at least 20 seconds:",
    );
    expect(step.subSteps).toHaveLength(2);
  });

  it("maps note_lines with display_lead", () => {
    const step = mapDbStepToChecklistStep({
      number: 3,
      text: "Wet hands thoroughly, keeping hands and forearms lower than elbows. Avoid splashing water on uniform.",
      display_lead:
        "Wet hands thoroughly, keeping hands and forearms lower than elbows.",
      note_lines: ["Avoid splashing water on uniform."],
    });
    expect(step.note).toBe("Avoid splashing water on uniform.");
    expect(step.text).not.toContain("Avoid splashing");
  });
});

describe("skills bundle", () => {
  it("loads 22 skills with unique slugs", () => {
    const skills = getAllSkills();
    expect(skills).toHaveLength(22);
    expect(new Set(skills.map((s) => s.slug)).size).toBe(22);
  });

  it("includes hand hygiene with 11 steps and nested step 5", () => {
    const skill = getSkillBySlug("hand-hygiene");
    expect(skill?.stepCount).toBe(11);
    expect(skill?.steps).toHaveLength(11);
    const step5 = skill?.steps.find((s) => s.id === 5);
    expect(step5?.subSteps?.length).toBe(7);
    expect(skill?.storageKey).toBe("checklist-01-hand-hygiene");
  });

  it("every skill has steps matching stepCount", () => {
    for (const skill of getAllSkills()) {
      expect(skill.steps.length).toBe(skill.stepCount);
    }
  });
});

describe("SkillChecklist markup", () => {
  it("does not hardcode checked styling on sub-step labels", () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), "components", "SkillChecklist.tsx"),
      "utf8",
    );
    expect(src).not.toContain("substep-text--checked");
  });
});
