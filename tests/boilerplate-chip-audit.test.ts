import { describe, expect, it } from "vitest";

import { getAllSkills } from "@/lib/skills";
import {
  resolveRegistryTokenId,
  shouldRenderBoilerplateChip,
} from "@/lib/boilerplate-tokens";

describe("boilerplate chip coverage audit", () => {
  it("shows chips for all registry-tagged steps including composites", () => {
    const gaps: { slug: string; stepId: number; boilerplateId: string }[] = [];

    for (const skill of getAllSkills()) {
      for (const step of skill.steps) {
        if (!step.boilerplateId) continue;
        if (!shouldRenderBoilerplateChip(step, skill.slug)) {
          gaps.push({
            slug: skill.slug,
            stepId: step.id,
            boilerplateId: step.boilerplateId,
          });
        }
      }
    }

    expect(gaps).toEqual([]);
  });

  it("PPE step 11 composite resolves HAND_HYGIENE chip", () => {
    const skill = getAllSkills().find((s) => s.slug === "ppe-gown-gloves")!;
    const step = skill.steps.find((s) => s.id === 11)!;
    expect(resolveRegistryTokenId(step.boilerplateId)).toBe("HAND_HYGIENE");
    expect(shouldRenderBoilerplateChip(step, skill.slug)).toBe(true);
  });

  it("bedpan step 8 resolves GLOVE_REMOVE_THEN_HH chip", () => {
    const skill = getAllSkills().find((s) => s.slug === "bedpan-assist")!;
    const step = skill.steps.find((s) => s.id === 8)!;
    expect(resolveRegistryTokenId(step.boilerplateId)).toBe(
      "GLOVE_REMOVE_THEN_HH",
    );
    expect(shouldRenderBoilerplateChip(step, skill.slug)).toBe(true);
  });
});
