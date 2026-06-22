import { describe, expect, it } from "vitest";

import { CHECKLIST_BOILERPLATE } from "@/lib/checklist-boilerplate";
import {
  getCriticalStepCategory,
  isCriticalStepText,
} from "@/lib/critical-steps";
import {
  HAND_HYGIENE_SLUG,
  MEASUREMENT_SKILL_SLUGS,
  getExamSkillBadge,
  sectionAnchorId,
} from "@/lib/exam-meta";
import {
  generateExamSimulation,
  parseExamSimulation,
  reshuffleExamSimulation,
} from "@/lib/exam-simulation";
import { getAllSkills } from "@/lib/skills";
import {
  countReviewedSkills,
  getSkillProgressStatus,
  markSkillInProgress,
  markSkillReviewed,
  parseSkillProgress,
} from "@/lib/skill-progress";

const ALL_SLUGS = getAllSkills().map((s) => s.slug);

describe("exam-meta", () => {
  it("marks hand hygiene as always tested", () => {
    expect(getExamSkillBadge(HAND_HYGIENE_SLUG)).toBe("always-tested");
  });

  it("marks all five measurement skills", () => {
    for (const slug of MEASUREMENT_SKILL_SLUGS) {
      expect(getExamSkillBadge(slug)).toBe("measurement-pool");
    }
  });

  it("returns null for non-special skills", () => {
    expect(getExamSkillBadge("mouth-care")).toBeNull();
  });

  it("maps section titles to stable anchor ids", () => {
    expect(sectionAnchorId("Measurement and Recording")).toBe(
      "section-vital-signs",
    );
  });
});

describe("exam-simulation", () => {
  const seededRandom = () => 0.1;

  it("always includes hand hygiene and exactly one measurement skill", () => {
    const sim = generateExamSimulation(ALL_SLUGS, seededRandom);
    expect(sim.slugs).toHaveLength(5);
    expect(sim.slugs[0]).toBe(HAND_HYGIENE_SLUG);
    const measurementCount = sim.slugs.filter((slug) =>
      MEASUREMENT_SKILL_SLUGS.includes(
        slug as (typeof MEASUREMENT_SKILL_SLUGS)[number],
      ),
    ).length;
    expect(measurementCount).toBe(1);
  });

  it("reshuffle keeps hand hygiene locked", () => {
    const first = generateExamSimulation(ALL_SLUGS, () => 0.2);
    const second = reshuffleExamSimulation(first, ALL_SLUGS, () => 0.8);
    expect(second.slugs[0]).toBe(HAND_HYGIENE_SLUG);
    expect(second.slugs).toHaveLength(5);
  });

  it("parses valid stored simulation", () => {
    const sim = generateExamSimulation(ALL_SLUGS);
    expect(parseExamSimulation(sim)).toEqual(sim);
  });

  it("rejects simulation without hand hygiene", () => {
    expect(
      parseExamSimulation({
        slugs: ["mouth-care", "radial-pulse-60-seconds", "a", "b", "c"],
        generatedAt: "2026-01-01",
      }),
    ).toBeNull();
  });
});

describe("skill-progress", () => {
  it("defaults to not-started", () => {
    expect(getSkillProgressStatus({}, "hand-hygiene")).toBe("not-started");
  });

  it("marks in-progress without downgrading reviewed", () => {
    let map = markSkillReviewed({}, "hand-hygiene");
    map = markSkillInProgress(map, "hand-hygiene");
    expect(map["hand-hygiene"]).toBe("reviewed");
  });

  it("counts reviewed skills", () => {
    const map = markSkillReviewed(
      markSkillReviewed({}, "hand-hygiene"),
      "mouth-care",
    );
    expect(countReviewedSkills(map, 22)).toBe(2);
  });

  it("parses progress map safely", () => {
    expect(parseSkillProgress({ "hand-hygiene": "reviewed", bad: 1 })).toEqual({
      "hand-hygiene": "reviewed",
    });
  });
});

describe("critical-steps", () => {
  it("detects patient identification", () => {
    expect(isCriticalStepText(CHECKLIST_BOILERPLATE.INTRO_IDENTIFY)).toBe(true);
    expect(getCriticalStepCategory(CHECKLIST_BOILERPLATE.INTRO_IDENTIFY)).toBe(
      "identification",
    );
  });

  it("detects hand hygiene bookends", () => {
    expect(isCriticalStepText(CHECKLIST_BOILERPLATE.HAND_HYGIENE)).toBe(true);
    expect(isCriticalStepText("Perform hand hygiene.")).toBe(true);
    expect(isCriticalStepText("Perform proper hand hygiene.")).toBe(true);
  });

  it("detects privacy steps", () => {
    expect(isCriticalStepText(CHECKLIST_BOILERPLATE.PRIVACY)).toBe(true);
    expect(isCriticalStepText("Provide for privacy.")).toBe(true);
  });

  it("detects bed and call light steps", () => {
    expect(isCriticalStepText(CHECKLIST_BOILERPLATE.BED_LOW)).toBe(true);
    expect(isCriticalStepText(CHECKLIST_BOILERPLATE.CALL_LIGHT)).toBe(true);
    expect(getCriticalStepCategory("Call light; bed low and locked")).toBe(
      "bed-call-light",
    );
    expect(getCriticalStepCategory("Call light within reach")).toBe(
      "bed-call-light",
    );
  });

  it("detects FINAL-PASS short identification and hand hygiene cues", () => {
    expect(getCriticalStepCategory("Introduce and identify the patient")).toBe(
      "identification",
    );
    expect(isCriticalStepText("Wash hands")).toBe(true);
  });

  it("does not flag non-critical procedural steps", () => {
    expect(isCriticalStepText("Apply a palm-sized amount of hand soap.")).toBe(
      false,
    );
  });
});

describe("critical steps across all 22 skills", () => {
  it("finds at least one critical step per skill (except pure measurement-only patterns)", () => {
    const skills = getAllSkills();
    const withoutCritical = skills.filter((skill) =>
      skill.steps.every(
        (step) =>
          !isCriticalStepText(step.text) &&
          !(step.subSteps?.some((sub) => isCriticalStepText(sub)) ?? false),
      ),
    );
    expect(withoutCritical.map((s) => s.slug)).toEqual([]);
  });
});
