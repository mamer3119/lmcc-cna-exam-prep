
# ─── Output A: checklist-step-2.ts ───────────────────────────────────────────
ts_content = '''\
// checklist-step-2.ts
// Extended ChecklistStep type with FINAL-PASS columns
// Source: FINAL-PASS-S05-S22-COMPLETE.md + Skills-Multiple-occurance-list-TAGs-and-other.xlsx

export type StepSegment = "open" | "core" | "close";

// All boilerplate IDs used across the 22-skill curriculum
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

// Compound boilerplate for skills that combine BED_LOW + CALL_LIGHT in one step
// (S10 step 17, S13 step 10) — pipe-delimited string, matches TSV notation
export type CompoundBoilerplateId = "BED_LOW|CALL_LIGHT";

export type ChecklistStep = {
  id: number;
  text: string;
  note?: string;
  subSteps?: string[];
  segment?: StepSegment;
  boilerplateId?: BoilerplateId | CompoundBoilerplateId | (string & {});

  // ─── Added from FINAL-PASS columns ────────────────────────────────────────
  /** Full GWC rubric text ("Detailed Tag Text" column). Shown in expand panel / AI context. */
  detailedText?: string;
  /** Broad tag bucket: "Opening" | "Key Procedure" | "Core" | "Closing" */
  tagCategory?: string;
  /** Machine-readable critical-point label for confusion-pair banner.
   *  Values in curriculum: "hand-hygiene" | "privacy" | "bed-call-light" */
  criticalCategory?: string;
  /** Exam-scorecard note — shown as yellow badge when non-null.
   *  Example: "Exam tolerance: Document BP ±8 mmHg (systolic AND diastolic)" */
  examScorecard?: string;
  /** Override the computed phase label from getPhaseWordForStep().
   *  Set only when the step's phaseWord differs from the segment-level default.
   *  Example: step inside CORE segment with phaseWord "Secure" (S08 steps 19-21) */
  phaseWord?: string;
  // ──────────────────────────────────────────────────────────────────────────
};
'''

with open('/root/output/lmcc-code-additions/checklist-step-2.ts', 'w') as f:
    f.write(ts_content)
print("A: checklist-step-2.ts written")