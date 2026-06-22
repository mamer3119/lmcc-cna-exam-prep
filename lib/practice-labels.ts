/**
 * Single source of truth for practice-mode UI copy.
 *
 * Top toggle (SkillPracticeToggle): Learn vs Test Yourself — page-level practice.
 * Inner toggle (SkillChecklist, Learn only): checklist display — not a second practice mode.
 */
export const PRACTICE_MODE_LABELS = {
  learn: "Learn",
  testYourself: "Test Yourself",
  practiceGroupAria: "Practice mode",
} as const;

/** Sub-toggle inside Learn — checklist read vs hide/reveal (legacy scaffold; Recall drill is canonical). */
export const CHECKLIST_VIEW_LABELS = {
  groupAria: "Checklist view",
  full: "All steps",
  reveal: "Hide & reveal",
} as const;

/** URL-driven segment filter on skill pages (?filter=core). */
export const SEGMENT_FILTER_LABELS = {
  groupAria: "Step segment filter",
  all: "All",
  coreOnly: "Core only",
} as const;

export const DRILL_TYPE_LABELS = {
  sequence: "Sequence",
  tolerance: (count: number) =>
    count > 0 ? `Tolerance (${count})` : "Tolerance",
  recall: (count: number) => `Recall (${count})`,
  groupAria: "Test yourself drill type",
} as const;

export type DrillType = "sequence" | "tolerance" | "recall";
