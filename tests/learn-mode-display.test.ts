import { describe, expect, it } from "vitest";

import type { ChecklistStep } from "@/lib/checklist-step";
import {
  isHandHygieneEmbedStep,
  resolveStepCoachingNote,
  resolveStepExamAuthority,
  resolveStepFailRule,
  segmentPhaseLabel,
} from "@/lib/learn-mode-display";

describe("learn-mode-display", () => {
  it("extracts failRule timing from examScorecard", () => {
    const step: ChecklistStep = {
      id: 3,
      text: "Lather",
      examScorecard:
        "Technique: Lather all surfaces ≥20 sec; repeat full sequence ≥2×",
    };
    expect(resolveStepFailRule(step)).toBe("≥20 sec; repeat full sequence ≥2×");
  });

  it("extracts tolerance failRule", () => {
    const step: ChecklistStep = {
      id: 4,
      text: "Count",
      examScorecard: "Tolerance: ±4 beats/min vs evaluator",
    };
    expect(resolveStepFailRule(step)).toBe("±4 beats/min vs evaluator");
  });

  it("detects hand hygiene embed on non-HH skills", () => {
    const step: ChecklistStep = {
      id: 16,
      text: "Hand hygiene",
      boilerplateId: "HAND_HYGIENE",
    };
    expect(isHandHygieneEmbedStep(step, "ppe-gown-gloves")).toBe(true);
    expect(isHandHygieneEmbedStep(step, "hand-hygiene")).toBe(false);
  });

  it("maps segment labels for phase headings", () => {
    expect(segmentPhaseLabel("open")).toBe("OPENING");
    expect(segmentPhaseLabel("core")).toBe("CORE");
    expect(segmentPhaseLabel("close")).toBe("CLOSING");
  });

  it("filters coaching notes that duplicate clinical provenance", () => {
    const step: ChecklistStep = {
      id: 1,
      text: "Intro",
      note: "Michelle's exact phrase in S07",
    };
    expect(resolveStepCoachingNote(step)).toBeUndefined();
    expect(
      resolveStepCoachingNote(
        { id: 2, text: "Cue", note: "Keep elbow below shoulder." },
        "Clinical cue",
      ),
    ).toBe("Keep elbow below shoulder.");
  });

  it("resolves GWC authority from scorecard context", () => {
    const step: ChecklistStep = {
      id: 5,
      text: "Measure",
      detailedText: "GWC rubric wording",
      examScorecard: "Technique: Inflate cuff 160–180 mmHg",
    };
    expect(resolveStepExamAuthority(step)).toBe("GWC");
  });
});
