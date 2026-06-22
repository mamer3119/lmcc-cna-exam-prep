import { CHECKLIST_BOILERPLATE } from "@/lib/checklist-boilerplate";

/**
 * Slice-2 skill page — one mutually exclusive mode selector (Full View / Core Only / Self-Check).
 * Self-Check retains intra-mode Sequence | Tolerance | Recall sub-tabs (not nesting).
 */
export type SkillViewMode = "full-view" | "core-only" | "self-check";

export const MODE_LABELS = {
  groupAria: "Checklist view mode",
  fullView: "Full View",
  coreOnly: "Core Only",
  selfCheck: "Self-Check",
} as const;

/** @deprecated Slice-2 — replaced by MODE_LABELS on skill pages. */
export const PRACTICE_MODE_LABELS = {
  learn: "Learn",
  testYourself: "Test Yourself",
  practiceGroupAria: "Practice mode",
} as const;

/** @deprecated Slice-2 — Hide & reveal removed; recall lives in Self-Check. */
export const CHECKLIST_VIEW_LABELS = {
  groupAria: "Checklist view",
  full: "All steps",
  reveal: "Hide & reveal",
} as const;

/** @deprecated Slice-2 — merged into MODE_LABELS.coreOnly. */
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

export type BoilerplatePhase = "open" | "core" | "close";

export type BoilerplateTokenDef = {
  phase: BoilerplatePhase;
  /** Screen-reader + visual label — never T0–T6 mnemonics. */
  label: string;
  /** Decorative only; meaning = phase color + label. */
  emoji: string | null;
  wording: string;
};

/**
 * Canonical Boilerplate Token Registry (10 tokens).
 *
 * Reconciliation: demo Boilerplate Library header says "9 step templates" because
 * INTRO_EXPLAIN and INTRO_IDENTIFY share one intro family in the demo — this
 * registry lists 10 distinct tokens for QA and chip rendering.
 */
export const BOILERPLATE_REGISTRY_NOTE =
  "Demo library: 9 templates / registry: 10 tokens (intro split: INTRO_EXPLAIN + INTRO_IDENTIFY).";

export const BOILERPLATE_TOKEN_REGISTRY = {
  INTRO_EXPLAIN: {
    phase: "open",
    label: "INTRO_EXPLAIN",
    emoji: null,
    wording: CHECKLIST_BOILERPLATE.INTRO_EXPLAIN,
  },
  INTRO_IDENTIFY: {
    phase: "open",
    label: "INTRO_IDENTIFY",
    emoji: null,
    wording: CHECKLIST_BOILERPLATE.INTRO_IDENTIFY,
  },
  PRIVACY: {
    phase: "open",
    label: "PRIVACY",
    emoji: null,
    wording: CHECKLIST_BOILERPLATE.PRIVACY,
  },
  WATER_CHECK: {
    phase: "open",
    label: "WATER_CHECK",
    emoji: null,
    wording: CHECKLIST_BOILERPLATE.WATER_CHECK,
  },
  HAND_HYGIENE: {
    phase: "core",
    label: "HAND_HYGIENE",
    emoji: "🧼",
    wording: CHECKLIST_BOILERPLATE.HAND_HYGIENE,
  },
  GLOVE_DON: {
    phase: "core",
    label: "GLOVE_DON",
    emoji: null,
    wording: CHECKLIST_BOILERPLATE.GLOVE_DON,
  },
  GLOVE_REMOVE: {
    phase: "core",
    label: "GLOVE_REMOVE",
    emoji: null,
    wording: CHECKLIST_BOILERPLATE.GLOVE_REMOVE,
  },
  BED_LOW: {
    phase: "close",
    label: "BED_LOW",
    emoji: null,
    wording: CHECKLIST_BOILERPLATE.BED_LOW,
  },
  CALL_LIGHT: {
    phase: "close",
    label: "CALL_LIGHT",
    emoji: null,
    wording: CHECKLIST_BOILERPLATE.CALL_LIGHT,
  },
} as const satisfies Record<string, BoilerplateTokenDef>;

export type BoilerplateTokenId = keyof typeof BOILERPLATE_TOKEN_REGISTRY;

export const BOILERPLATE_TOKEN_IDS = Object.keys(
  BOILERPLATE_TOKEN_REGISTRY,
) as BoilerplateTokenId[];
