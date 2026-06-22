import { describe, expect, it } from "vitest";

import {
  BOILERPLATE_ID_ALIASES,
  normalizeBoilerplateIdAlias,
} from "@/lib/boilerplate-id-aliases";
import { CHECKLIST_BOILERPLATE } from "@/lib/checklist-boilerplate";
import { enrichChecklistStep } from "@/lib/checklist-step";

describe("boilerplate ID aliases", () => {
  it("maps legacy concat IDs to canonical underscore keys", () => {
    expect(normalizeBoilerplateIdAlias("GLOVEDON")).toBe("GLOVE_DON");
    expect(normalizeBoilerplateIdAlias("HANDHYGIENE")).toBe("HAND_HYGIENE");
    expect(normalizeBoilerplateIdAlias("WATERCHECK")).toBe("WATER_CHECK");
    expect(normalizeBoilerplateIdAlias("GLOVE_DON")).toBe("GLOVE_DON");
  });

  it("resolves every alias to a CHECKLIST_BOILERPLATE entry", () => {
    const canonical = new Set(Object.values(BOILERPLATE_ID_ALIASES));
    for (const id of canonical) {
      expect(
        CHECKLIST_BOILERPLATE[id as keyof typeof CHECKLIST_BOILERPLATE],
      ).toBeTruthy();
    }
  });

  it("enriches steps using aliased boilerplateId from DB export shape", () => {
    const step = enrichChecklistStep(
      {
        id: 6,
        text: "legacy",
        boilerplateId: "GLOVEDON" as never,
      },
      {
        template: "T1+",
        stepIndex: 5,
        totalSteps: 24,
        skillSlug: "foot-care-one-foot",
      },
    );
    expect(step.boilerplateId).toBe("GLOVE_DON");
    expect(step.text).toBe(CHECKLIST_BOILERPLATE.GLOVE_DON);
  });
});
