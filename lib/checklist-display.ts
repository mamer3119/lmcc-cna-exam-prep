export type ChecklistMode = "study" | "quiz";

/**
 * Toggle each enrichment layer resolved via lib/skill-step-meta.ts.
 * Single place to turn checklist UI facets on/off per surface (study, quiz, export).
 */
export type ChecklistEnrichmentDisplay = {
  /** resolveStepSubSteps — incl. GLOVE_REMOVE tag fallback */
  subSteps: boolean;
  /** resolveStepClinicalNote — step.note + tag clinicalNote */
  clinicalNote: boolean;
  /** resolveStepDetailedText — title tooltip + expandable rubric */
  detailedText: boolean;
  /** resolveStepTagCategory badge */
  tagCategory: boolean;
  /** resolveStepPhaseWord coloured badge (study segment mode) */
  phaseWordBadge: boolean;
  /** OPEN / CORE / CLOSE segment badges */
  segmentBadges: boolean;
  /** isStepCritical / criticalStepBadgeLabelForStep */
  criticalBadges: boolean;
  /** getExamScorecardForStep inline strips (R7: independent of segments) */
  examScorecards: boolean;
  /** resolveStepRendersAs emoji — off by default (export/study HUD only when enabled) */
  rendersAsEmoji: boolean;
  /** M2 Learn Mode polish — phase headings, step anatomy, HH embed, motion */
  learnPolish: boolean;
  /** Slice-2 script row layout — primary line + demoted secondary meta */
  scriptRows: boolean;
};

export const CHECKLIST_DISPLAY_PRESETS = {
  /** Skill page — study mode with full enrichment */
  studyFull: {
    subSteps: true,
    clinicalNote: true,
    detailedText: true,
    tagCategory: true,
    phaseWordBadge: true,
    segmentBadges: true,
    criticalBadges: true,
    examScorecards: true,
    rendersAsEmoji: false,
    learnPolish: true,
    scriptRows: true,
  },
  /** /study/ leaf — compact but fully hydrated */
  studyCompact: {
    subSteps: true,
    clinicalNote: true,
    detailedText: true,
    tagCategory: true,
    phaseWordBadge: true,
    segmentBadges: true,
    criticalBadges: true,
    examScorecards: true,
    rendersAsEmoji: false,
    learnPolish: true,
    scriptRows: false,
  },
  /** Quiz recall — minimal chrome; scorecards when step hidden (R7) */
  quiz: {
    subSteps: true,
    clinicalNote: true,
    detailedText: false,
    tagCategory: false,
    phaseWordBadge: false,
    segmentBadges: false,
    criticalBadges: true,
    examScorecards: true,
    rendersAsEmoji: false,
    learnPolish: false,
    scriptRows: false,
  },
  /** Exam simulation modal — same as quiz, no progress chrome */
  examSim: {
    subSteps: true,
    clinicalNote: true,
    detailedText: false,
    tagCategory: false,
    phaseWordBadge: false,
    segmentBadges: false,
    criticalBadges: true,
    examScorecards: true,
    rendersAsEmoji: false,
    learnPolish: false,
    scriptRows: false,
  },
  /** Print / minimal surfaces */
  minimal: {
    subSteps: true,
    clinicalNote: true,
    detailedText: false,
    tagCategory: false,
    phaseWordBadge: false,
    segmentBadges: false,
    criticalBadges: false,
    examScorecards: false,
    rendersAsEmoji: false,
    learnPolish: false,
    scriptRows: false,
  },
} as const satisfies Record<string, ChecklistEnrichmentDisplay>;
export type ChecklistDisplayPreset = keyof typeof CHECKLIST_DISPLAY_PRESETS;

export type ChecklistDisplayInput = {
  mode?: ChecklistMode;
  preset?: ChecklistDisplayPreset;
  /** Legacy props — merged after preset, before overrides */
  showSegmentBadges?: boolean;
  showCriticalBadges?: boolean;
  showExamScorecards?: boolean;
  /** Fine-grained overrides */
  overrides?: Partial<ChecklistEnrichmentDisplay>;
};

function presetForMode(mode: ChecklistMode): ChecklistEnrichmentDisplay {
  return mode === "quiz" ?
      { ...CHECKLIST_DISPLAY_PRESETS.quiz }
    : { ...CHECKLIST_DISPLAY_PRESETS.studyFull };
}

/** Merge preset → legacy boolean props → explicit overrides. */
export function resolveChecklistDisplay(
  input: ChecklistDisplayInput = {},
): ChecklistEnrichmentDisplay {
  const base =
    input.preset ?
      { ...CHECKLIST_DISPLAY_PRESETS[input.preset] }
    : presetForMode(input.mode ?? "study");

  if (input.showSegmentBadges !== undefined) {
    base.segmentBadges = input.showSegmentBadges;
    if (!input.showSegmentBadges) {
      base.phaseWordBadge = false;
    }
  }
  if (input.showCriticalBadges !== undefined) {
    base.criticalBadges = input.showCriticalBadges;
  }
  if (input.showExamScorecards !== undefined) {
    base.examScorecards = input.showExamScorecards;
  }

  if (input.overrides) {
    Object.assign(base, input.overrides);
  }

  return base;
}
