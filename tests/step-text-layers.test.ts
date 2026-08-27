import { describe, expect, it } from "vitest";

import { getSkillBySlug } from "@/lib/skills";
import {
  hasStepCoachingContent,
  hasStepDetailLayer,
  resolveStepDetailText,
  resolveStepHeaderText,
  splitDetailWithBoldPhrases,
} from "@/lib/step-text-layers";
import { shouldRenderBoilerplateChip } from "@/lib/boilerplate-tokens";

describe("step-text-layers", () => {
  it("header uses detailedText as official scored line", () => {
    const skill = getSkillBySlug("manual-blood-pressure")!;
    const step = skill.steps.find((s) => s.id === 2)!;
    expect(resolveStepHeaderText(step)).toBe(step.detailedText);
  });

  it("PPE step 11 expands detail from registry when header is short", () => {
    const skill = getSkillBySlug("ppe-gown-gloves")!;
    const step = skill.steps.find((s) => s.id === 11)!;
    expect(resolveStepHeaderText(step)).toBe("Perform hand hygiene.");
    expect(hasStepDetailLayer(step)).toBe(true);
    expect(resolveStepDetailText(step)).toMatch(/six-step technique/i);
  });

  it("PPE step 11 composite shows HAND_HYGIENE chip", () => {
    const skill = getSkillBySlug("ppe-gown-gloves")!;
    const step = skill.steps.find((s) => s.id === 11)!;
    expect(shouldRenderBoilerplateChip(step, skill.slug)).toBe(true);
  });

  it("PPE step 11 has coaching content (VIDEO WARNING)", () => {
    const skill = getSkillBySlug("ppe-gown-gloves")!;
    const step = skill.steps.find((s) => s.id === 11)!;
    expect(hasStepCoachingContent(step)).toBe(true);
  });

  it("bolds operative phrases in detail text", () => {
    const parts = splitDetailWithBoldPhrases(
      "Perform hand hygiene using the six-step technique for a minimum of 20 seconds with soap and water.",
    );
    expect(parts.some((p) => p.bold && /20 seconds/i.test(p.text))).toBe(true);
    expect(parts.some((p) => p.bold && /six-step/i.test(p.text))).toBe(true);
  });
});
