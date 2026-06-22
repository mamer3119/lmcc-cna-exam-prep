import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { getCurriculumMeta } from "@/data/skillCurriculum";
import { getStepPhaseColor, getStepPhaseLabel } from "@/lib/step-phase";
import { mapStagingStepToChecklist } from "../scripts/merge-final-pass.mjs";

const STAGING_S05 = path.join(
  process.cwd(),
  "imports/final-pass/thread-A/S05-manual-blood-pressure.json",
);
const STAGING_S14 = path.join(
  process.cwd(),
  "imports/final-pass/thread-B/S14-modified-bed-bath.json",
);

describe("mapStagingStepToChecklist enrichment", () => {
  it("maps FINAL-PASS columns to ChecklistStep fields for S05 step 7", () => {
    const staging = JSON.parse(fs.readFileSync(STAGING_S05, "utf8"));
    const step7 = staging.steps.find((s: { id: number }) => s.id === 7);
    const mapped = mapStagingStepToChecklist(step7);

    expect(mapped.detailedText).toContain("160-180 mmHg");
    expect(mapped.tagCategory).toBe("Core");
    expect(mapped.phaseWord).toBe("Measure");
    expect(mapped.examScorecard).toContain("Technique:");
    expect(mapped.criticalCategory).toBeUndefined();
  });

  it("maps criticalCategory and privacy for S14 step 2", () => {
    const staging = JSON.parse(fs.readFileSync(STAGING_S14, "utf8"));
    const step2 = staging.steps.find((s: { id: number }) => s.id === 2);
    const mapped = mapStagingStepToChecklist(step2);

    expect(mapped.criticalCategory).toBe("privacy");
    expect(mapped.detailedText).toContain("privacy");
    expect(mapped.phaseWord).toBe("Approach");
  });

  it("omits empty criticalCategory and examScorecard", () => {
    const staging = JSON.parse(fs.readFileSync(STAGING_S05, "utf8"));
    const step3 = staging.steps.find((s: { id: number }) => s.id === 3);
    const mapped = mapStagingStepToChecklist(step3);

    expect(mapped.examScorecard).toBeUndefined();
    expect(mapped.criticalCategory).toBeUndefined();
  });
});

describe("step-phase helpers", () => {
  const meta = getCurriculumMeta("manual-blood-pressure");
  if (!meta) {
    throw new Error("missing curriculum meta for manual-blood-pressure");
  }

  it("prefers step.phaseWord over curriculum phase table", () => {
    const step = {
      id: 7,
      text: "Inflate cuff 160–180 mmHg",
      segment: "core" as const,
      phaseWord: "Measure",
    };
    expect(getStepPhaseLabel(step, meta)).toBe("Measure");
    expect(getStepPhaseColor(step, meta)).toBe("#F59E0B");
  });

  it("uses segment fallback when phase word is not in palette", () => {
    const step = {
      id: 7,
      text: "Inflate cuff 160–180 mmHg",
      segment: "close" as const,
      phaseWord: "CustomUnknown",
    };
    expect(getStepPhaseColor(step, meta)).toBe("#10B981");
  });
});

describe("skills.json enrichment after merge", () => {
  it("manual-blood-pressure step 14 carries examScorecard from staging", () => {
    const skillsPath = path.join(process.cwd(), "data/skills.json");
    const bundle = JSON.parse(fs.readFileSync(skillsPath, "utf8"));
    const skill = bundle.skills.find(
      (s: { slug: string }) => s.slug === "manual-blood-pressure",
    );
    const step14 = skill?.steps?.find((s: { id: number }) => s.id === 14);

    expect(step14?.examScorecard).toContain("Exam tolerance");
    expect(step14?.detailedText).toContain("8 mmHg");
  });

  it("modified-bed-bath has enriched steps for all 28 rows", () => {
    const skillsPath = path.join(process.cwd(), "data/skills.json");
    const bundle = JSON.parse(fs.readFileSync(skillsPath, "utf8"));
    const skill = bundle.skills.find(
      (s: { slug: string }) => s.slug === "modified-bed-bath",
    );

    expect(skill?.steps).toHaveLength(28);
    expect(
      skill?.steps.every((s: { detailedText?: string }) => s.detailedText),
    ).toBe(true);
  });
});
