import { describe, expect, it } from "vitest";

import {
  CHECKLIST_BOILERPLATE,
  normalizeBoilerplateText,
} from "@/lib/checklist-boilerplate";
import { resolveStepDisplayText, FINAL_PASS_SLUGS } from "@/lib/checklist-step";
import { SEGMENT_DISPLAY_LABELS } from "@/lib/skill-templates";
import { getAllSkills } from "@/lib/skills";

/**
 * Invariants from Normalized & Standardized / CNA-Skills-Normalized-2026.md
 */
describe("2026.1 normalized boilerplate", () => {
  it("maps all legacy Headmaster boilerplate strings to 2026 canonical", () => {
    expect(normalizeBoilerplateText("Perform hand hygiene.")).toBe(
      CHECKLIST_BOILERPLATE.HAND_HYGIENE,
    );
    expect(normalizeBoilerplateText("Put on clean gloves.")).toBe(
      CHECKLIST_BOILERPLATE.GLOVE_DON,
    );
    expect(
      normalizeBoilerplateText(
        "Get water and check water temperature for safety.",
      ),
    ).toBe(CHECKLIST_BOILERPLATE.WATER_CHECK);
  });

  it("renders boilerplateId steps from single source of truth", () => {
    const pulse = getAllSkills().find(
      (s) => s.slug === "radial-pulse-60-seconds",
    )!;
    const intro = pulse.steps.find((s) => s.boilerplateId === "INTRO_EXPLAIN")!;
    expect(FINAL_PASS_SLUGS.has(pulse.slug)).toBe(true);
    expect(intro.text).toBe("Introduce and explain");
    expect(intro.text).not.toBe(CHECKLIST_BOILERPLATE.INTRO_EXPLAIN);
    expect(resolveStepDisplayText(intro, { slug: pulse.slug })).toBe(
      "Introduce and explain",
    );
    expect(resolveStepDisplayText(intro)).toBe(
      CHECKLIST_BOILERPLATE.INTRO_EXPLAIN,
    );
  });

  it("uses 2026 segment display labels", () => {
    expect(SEGMENT_DISPLAY_LABELS.open).toBe("Opening Phase");
    expect(SEGMENT_DISPLAY_LABELS.core).toBe("Core Procedure");
    expect(SEGMENT_DISPLAY_LABELS.close).toBe("Closing Phase");
  });

  it("has no legacy short boilerplate in skills bundle", () => {
    const legacy = new Set([
      "Perform hand hygiene.",
      "Put on clean gloves.",
      "Provide for privacy.",
      "Ensure the bed is low and locked.",
      "Get water and check water temperature for safety.",
    ]);
    for (const skill of getAllSkills()) {
      for (const step of skill.steps) {
        if (step.boilerplateId) {
          expect(legacy.has(step.text), `${skill.slug} step ${step.id}`).toBe(
            false,
          );
        }
      }
    }
  });
});
