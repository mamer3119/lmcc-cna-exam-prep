import { describe, expect, it } from "vitest";

import {
  CHECKLIST_BOILERPLATE,
  normalizeBoilerplateText,
} from "@/lib/checklist-boilerplate";
import { FINAL_PASS_SLUGS } from "@/lib/checklist-step";
import { getAllSkills } from "@/lib/skills";

describe("normalizeBoilerplateText", () => {
  it("canonicalizes intro explain drift", () => {
    expect(
      normalizeBoilerplateText(
        "Introduce self and explain the procedure to the patient.",
      ),
    ).toBe(CHECKLIST_BOILERPLATE.INTRO_EXPLAIN);
  });

  it("canonicalizes privacy to 2026 patient privacy form", () => {
    expect(normalizeBoilerplateText("Provide privacy.")).toBe(
      CHECKLIST_BOILERPLATE.PRIVACY,
    );
  });

  it("preserves T4 identify intro", () => {
    expect(
      normalizeBoilerplateText("Introduce yourself and identify the patient."),
    ).toBe(CHECKLIST_BOILERPLATE.INTRO_IDENTIFY);
  });
});

describe("skills bundle boilerplate invariants", () => {
  it("all 22 skills are FINAL-PASS short-cue slugs", () => {
    expect(getAllSkills()).toHaveLength(22);
    for (const skill of getAllSkills()) {
      expect(FINAL_PASS_SLUGS.has(skill.slug), skill.slug).toBe(true);
    }
  });

  it("FINAL-PASS boilerplate rows use ≤6-word cue text", () => {
    for (const skill of getAllSkills()) {
      for (const step of skill.steps) {
        if (!step.boilerplateId || String(step.boilerplateId).includes("|")) {
          continue;
        }
        const words = step.text.split(/\s+/).filter(Boolean).length;
        expect(words, `${skill.slug} step ${step.id}`).toBeLessThanOrEqual(6);
      }
    }
  });

  it("S01 hand hygiene uses INTRO_IDENTIFY and OPEN/CORE only", () => {
    const hh = getAllSkills().find((s) => s.slug === "hand-hygiene")!;
    expect(hh.steps.find((s) => s.id === 1)?.text).toBe(
      "Introduce and identify the patient",
    );
    expect(hh.steps.find((s) => s.id === 1)?.boilerplateId).toBe(
      "INTRO_IDENTIFY",
    );
    expect(hh.steps.every((s) => s.segment !== "close")).toBe(true);
    expect(hh.steps.find((s) => s.id === 5)?.subSteps).toHaveLength(7);
  });

  it("S02 PPE composite HAND_HYGIENE|VIDEO_WARNING on step 11", () => {
    const ppe = getAllSkills().find((s) => s.slug === "ppe-gown-gloves")!;
    expect(ppe.stepCount).toBe(16);
    expect(ppe.steps.find((s) => s.id === 11)?.boilerplateId).toBe(
      "HAND_HYGIENE|VIDEO_WARNING",
    );
    expect(ppe.steps.find((s) => s.id === 11)?.text).toBe(
      "Perform hand hygiene now",
    );
  });

  it("S03 radial pulse short vitals close sequence", () => {
    const pulse = getAllSkills().find(
      (s) => s.slug === "radial-pulse-60-seconds",
    )!;
    expect(pulse.steps.find((s) => s.id === 4)?.text).toBe(
      "Call light within reach",
    );
    expect(pulse.steps.find((s) => s.id === 6)?.text).toBe("Document the rate");
  });

  it("S04 respirations short cues and testing-purpose note", () => {
    const resp = getAllSkills().find(
      (s) => s.slug === "respirations-60-seconds",
    )!;
    expect(resp.steps.find((s) => s.id === 2)?.text).toBe(
      "Count respirations 60 seconds",
    );
    expect(resp.steps.find((s) => s.id === 1)?.note).toMatch(
      /testing purposes/i,
    );
  });

  it("has no soup typo in modified bed bath", () => {
    const bath = getAllSkills().find((s) => s.slug === "modified-bed-bath");
    const texts = bath?.steps.map((s) => s.text).join(" ") ?? "";
    expect(texts).not.toMatch(/\bsoup\b/i);
  });
});
