import { describe, expect, it } from "vitest";

import { getCurriculumMeta, skillCurriculumMeta } from "@/data/skillCurriculum";
import { CHECKLIST_BOILERPLATE } from "@/lib/checklist-boilerplate";
import {
  enrichChecklistStep,
  inferBoilerplateId,
  resolveStepDisplayText,
  resolveStepSegment,
  validateSkillStepSegments,
} from "@/lib/checklist-step";
import { getAllSkills } from "@/lib/skills";

describe("checklist-step meta", () => {
  it("infers boilerplate IDs from canonical strings", () => {
    expect(inferBoilerplateId(CHECKLIST_BOILERPLATE.HAND_HYGIENE)).toBe(
      "HAND_HYGIENE",
    );
    expect(inferBoilerplateId(CHECKLIST_BOILERPLATE.GLOVE_DON)).toBe(
      "GLOVE_DON",
    );
    expect(
      inferBoilerplateId("Turn the patient onto their side."),
    ).toBeUndefined();
  });

  it("resolves display text from boilerplateId", () => {
    expect(
      resolveStepDisplayText({
        boilerplateId: "PRIVACY",
        text: CHECKLIST_BOILERPLATE.PRIVACY,
      }),
    ).toBe(CHECKLIST_BOILERPLATE.PRIVACY);
  });

  it("prefers explicit segment over template inference", () => {
    const segment = resolveStepSegment(
      { id: 5, text: "Raise one side rail", segment: "core" },
      {
        template: "T1+",
        stepIndex: 4,
        totalSteps: 41,
        skillSlug: "perineal-care-female",
      },
    );
    expect(segment).toBe("core");
  });

  it("enriches steps with segment and boilerplateId", () => {
    const step = enrichChecklistStep(
      { id: 3, text: "Perform hand hygiene." },
      {
        template: "T1",
        stepIndex: 2,
        totalSteps: 20,
        skillSlug: "mouth-care",
      },
    );
    expect(step.boilerplateId).toBe("HAND_HYGIENE");
    expect(step.text).toBe(CHECKLIST_BOILERPLATE.HAND_HYGIENE);
    expect(step.segment).toBe("open");
  });
});

describe("skills.json enriched segments", () => {
  it("stores segment on every main step", () => {
    for (const skill of getAllSkills()) {
      for (const step of skill.steps) {
        expect(step.segment, `${skill.slug} step ${step.id}`).toBeDefined();
      }
    }
  });

  it("stores boilerplateId on all canonical boilerplate steps", () => {
    for (const skill of getAllSkills()) {
      for (const step of skill.steps) {
        if (
          Object.values(CHECKLIST_BOILERPLATE).includes(
            step.text as (typeof CHECKLIST_BOILERPLATE)[keyof typeof CHECKLIST_BOILERPLATE],
          )
        ) {
          expect(
            step.boilerplateId,
            `${skill.slug} step ${step.id}`,
          ).toBeDefined();
        }
      }
    }
  });

  it("has no boilerplateId text drift errors", () => {
    const errors = getAllSkills().flatMap((skill) =>
      validateSkillStepSegments(
        skill.slug,
        // template from curriculum meta via infer from known slugs in test file
        getTemplateForSlug(skill.slug),
        skill.steps,
      ).filter((i) => i.severity === "error"),
    );
    expect(errors).toEqual([]);
  });

  it("tags peri outlier segments explicitly", () => {
    const peri = getAllSkills().find((s) => s.slug === "perineal-care-female")!;
    expect(peri.steps.find((s) => s.id === 5)?.segment).toBe("core");
    expect(peri.steps.find((s) => s.id === 6)?.segment).toBe("core");
  });

  it("tags bedpan step 4 hand hygiene as OPEN", () => {
    const bedpan = getAllSkills().find((s) => s.slug === "bedpan-assist")!;
    expect(bedpan.steps.find((s) => s.id === 4)?.segment).toBe("open");
  });
});

function getTemplateForSlug(slug: string) {
  return (
    getCurriculumMeta(slug)?.template ??
    skillCurriculumMeta[slug]?.template ??
    "T1"
  );
}
