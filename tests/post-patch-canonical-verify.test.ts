import { describe, expect, it } from "vitest";

import { CHECKLIST_BOILERPLATE } from "@/lib/checklist-boilerplate";
import {
  FINAL_PASS_SLUGS,
  isCompositeBoilerplateId,
  resolveStepDisplayText,
  type BoilerplateId,
} from "@/lib/checklist-step";
import type { StepSegment } from "@/lib/skill-templates";
import { getAllSkills } from "@/lib/skills";

/** Post-FINAL-PASS bookend coverage (22-skill short cues + composite rows). */
const POST_FINAL_PASS_BOOKEND_COUNTS: Record<BoilerplateId, number> = {
  INTRO_IDENTIFY: 2,
  INTRO_EXPLAIN: 19,
  PRIVACY: 13,
  HAND_HYGIENE: 42,
  GLOVE_DON: 11,
  GLOVE_REMOVE: 9,
  GLOVE_REMOVE_THEN_HH: 1,
  CALL_LIGHT: 15,
  BED_LOW: 11,
  WATER_CHECK: 3,
};

const COMPOSITE_BOOKEND_COUNT = 3;

const SEGMENTS: StepSegment[] = ["open", "core", "close"];

describe("post-patch canonical verify (skills.json)", () => {
  it("all 22 skills show short cue text in display resolver for boilerplate rows", () => {
    expect(getAllSkills()).toHaveLength(22);
    for (const skill of getAllSkills()) {
      expect(FINAL_PASS_SLUGS.has(skill.slug), skill.slug).toBe(true);
      for (const step of skill.steps) {
        if (
          !step.boilerplateId ||
          isCompositeBoilerplateId(step.boilerplateId)
        ) {
          continue;
        }
        expect(
          resolveStepDisplayText(step, { slug: skill.slug }),
          `${skill.slug} step ${step.id}`,
        ).toBe(step.text);
      }
    }
  });

  it("uses only known boilerplateId keys or FINAL-PASS composites", () => {
    const known = new Set(Object.keys(CHECKLIST_BOILERPLATE));
    for (const skill of getAllSkills()) {
      for (const step of skill.steps) {
        if (step.boilerplateId) {
          expect(
            known.has(step.boilerplateId) ||
              isCompositeBoilerplateId(step.boilerplateId),
            `${skill.slug} step ${step.id}`,
          ).toBe(true);
        }
      }
    }
  });

  it("matches post-FINAL-PASS bookend coverage counts (126 tagged + 3 composite)", () => {
    const counts = Object.fromEntries(
      Object.keys(CHECKLIST_BOILERPLATE).map((id) => [id, 0]),
    ) as Record<BoilerplateId, number>;
    let compositeCount = 0;

    for (const skill of getAllSkills()) {
      for (const step of skill.steps) {
        if (!step.boilerplateId) {
          continue;
        }
        if (isCompositeBoilerplateId(step.boilerplateId)) {
          compositeCount += 1;
          continue;
        }
        counts[step.boilerplateId as BoilerplateId] += 1;
      }
    }

    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    expect(total).toBe(126);
    expect(compositeCount).toBe(COMPOSITE_BOOKEND_COUNT);
    expect(total + compositeCount).toBe(129);

    for (const [id, expected] of Object.entries(
      POST_FINAL_PASS_BOOKEND_COUNTS,
    ) as [BoilerplateId, number][]) {
      expect(counts[id], id).toBe(expected);
    }
  });

  it("assigns segment on every step", () => {
    for (const skill of getAllSkills()) {
      for (const step of skill.steps) {
        expect(step.segment, `${skill.slug} step ${step.id}`).toBeDefined();
        expect(SEGMENTS, `${skill.slug} step ${step.id}`).toContain(
          step.segment,
        );
      }
    }
  });

  it("keeps open → core → close order without interleaving", () => {
    for (const skill of getAllSkills()) {
      const order = skill.steps.map((s) => s.segment!);
      let phase: StepSegment = "open";
      for (const segment of order) {
        if (segment === "core" && phase === "open") {
          phase = "core";
        } else if (segment === "close" && phase !== "close") {
          phase = "close";
        } else if (
          (segment === "open" && phase !== "open") ||
          (segment === "core" && phase === "close")
        ) {
          expect.fail(
            `${skill.slug}: phase interleaving at segment sequence ${order.join(" → ")}`,
          );
        }
      }
    }
  });

  it("tags bedpan mid-skill call light and glove-remove-then-hh combo", () => {
    const bedpan = getAllSkills().find((s) => s.slug === "bedpan-assist")!;
    expect(bedpan.steps.find((s) => s.id === 8)?.boilerplateId).toBe(
      "GLOVE_REMOVE_THEN_HH",
    );
    expect(bedpan.steps.find((s) => s.id === 12)?.boilerplateId).toBe(
      "CALL_LIGHT",
    );
    expect(bedpan.steps.find((s) => s.id === 12)?.segment).toBe("core");
  });

  it("S01 hand hygiene OPEN/CORE only — no scored close steps", () => {
    const hh = getAllSkills().find((s) => s.slug === "hand-hygiene")!;
    expect(hh.stepCount).toBe(11);
    expect(hh.steps.every((s) => s.segment !== "close")).toBe(true);
    expect(hh.steps.find((s) => s.id === 1)?.boilerplateId).toBe(
      "INTRO_IDENTIFY",
    );
    expect(hh.steps.find((s) => s.id === 5)?.subSteps?.length).toBeGreaterThan(
      3,
    );
  });

  it("S02 PPE mid-doff HAND_HYGIENE|VIDEO_WARNING composite on step 11", () => {
    const ppe = getAllSkills().find((s) => s.slug === "ppe-gown-gloves")!;
    expect(ppe.steps.find((s) => s.id === 11)?.boilerplateId).toBe(
      "HAND_HYGIENE|VIDEO_WARNING",
    );
    expect(ppe.steps.find((s) => s.id === 16)?.segment).toBe("close");
  });
});
