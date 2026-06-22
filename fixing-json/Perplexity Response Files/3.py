
import os, json
from pathlib import Path

out = Path.home() / "output" / "lmcc-code-additions"
out.mkdir(parents=True, exist_ok=True)

# ─── A: checklist-step-2.ts ──────────────────────────────────────────────────
ts_a = '''\
// checklist-step-2.ts
// Extended ChecklistStep type — adds FINAL-PASS columns to every step object.
// Source: FINAL-PASS-S05-S22-COMPLETE.md  +  Skills-Multiple-occurance-list-TAGs.xlsx
// Drop-in replacement for the existing checklist-step-2.ts.

export type StepSegment = "open" | "core" | "close";

/** All single boilerplate IDs used across the 22-skill curriculum */
export type BoilerplateId =
  | "INTRO_IDENTIFY"
  | "INTRO_EXPLAIN"
  | "PRIVACY"
  | "HAND_HYGIENE"
  | "GLOVE_DON"
  | "GLOVE_REMOVE"
  | "GLOVE_REMOVE_THEN_HH"
  | "CALL_LIGHT"
  | "BED_LOW"
  | "WATER_CHECK";

/**
 * Compound boilerplate — pipe-delimited, mirrors FINAL-PASS TSV notation.
 * Used when a GWC skill combines BED_LOW + CALL_LIGHT in a single scored step
 * (S10 step 17 "Call light; bed low and locked", S13 step 10).
 */
export type CompoundBoilerplateId = "BED_LOW|CALL_LIGHT";

export type ChecklistStep = {
  id: number;
  text: string;
  note?: string;
  subSteps?: string[];
  segment?: StepSegment;
  boilerplateId?: BoilerplateId | CompoundBoilerplateId | (string & {});

  // ─── New fields — ported directly from FINAL-PASS 11-column tables ────────

  /**
   * Full GWC rubric language ("Detailed Tag Text" column).
   * Displayed in the expand panel and fed to the AI study mode.
   * For boilerplate steps this equals the canonical boilerplate text.
   */
  detailedText?: string;

  /**
   * Broad classification bucket ("Tag Category" column).
   * Values in curriculum: "Opening" | "Key Procedure" | "Core" | "Closing"
   */
  tagCategory?: string;

  /**
   * Machine-readable label for the confusion-pair banner ("Critical Category" column).
   * Values in curriculum: "hand-hygiene" | "privacy" | "bed-call-light"
   * null/undefined ⟹ no badge rendered.
   */
  criticalCategory?: string;

  /**
   * Exam-scorecard annotation ("Exam Scorecard" column).
   * Shown as a yellow badge when non-null.
   * Examples:
   *   "Exam tolerance: Document BP ±8 mmHg (systolic AND diastolic)"
   *   "Technique: Deflate rate 2–3 mm Hg/second (systolic)"
   *   "Exam tolerance: Record volume ±25 mL"
   */
  examScorecard?: string;

  /**
   * Override the segment-level phase label produced by getPhaseWordForStep()
   * ("Phase Word" column).
   * Only populate when a step\\\'s Phase Word differs from the segment default.
   * Example: S08 steps 19–21 are inside the CORE segment but carry phaseWord "Secure".
   */
  phaseWord?: string;
};
'''

(out / "checklist-step-2.ts").write_text(ts_a)
print("A written:", (out / "checklist-step-2.ts").stat().st_size, "bytes")