"use client";

import {
  type ChecklistDisplayInput,
  type ChecklistEnrichmentDisplay,
  type ChecklistMode,
  resolveChecklistDisplay,
} from "@/lib/checklist-display";

/**
 * Per-surface bundle — replaces scattered boolean props on skill page parents.
 * Checklist enrichment toggles flow through `display` → `resolveChecklistDisplay`.
 */
export type SkillSurfaceConfig = {
  display: ChecklistDisplayInput;
  showStudentFocus: boolean;
  showExamNumbersSummary: boolean;
  showModeToggle: boolean;
  /** Pass organizerMeta to SkillChecklist when true */
  showSegmentOrganizer: boolean;
  showCriticalBadges: boolean;
  showExamScorecards: boolean;
  showSegmentBadges: boolean;
};

export const SURFACE_CONFIGS = {
  skillPageStudy: {
    display: { preset: "studyFull" },
    showStudentFocus: true,
    showExamNumbersSummary: true,
    showModeToggle: true,
    showSegmentOrganizer: true,
    showCriticalBadges: true,
    showExamScorecards: true,
    showSegmentBadges: true,
  },
  skillPageQuiz: {
    display: { preset: "quiz" },
    showStudentFocus: true,
    showExamNumbersSummary: true,
    showModeToggle: true,
    showSegmentOrganizer: true,
    showCriticalBadges: true,
    showExamScorecards: true,
    showSegmentBadges: false,
  },
  studyLeaf: {
    display: { preset: "studyCompact" },
    showStudentFocus: true,
    showExamNumbersSummary: false,
    showModeToggle: false,
    showSegmentOrganizer: true,
    showCriticalBadges: true,
    showExamScorecards: true,
    showSegmentBadges: true,
  },
  examSim: {
    display: { preset: "examSim" },
    showStudentFocus: true,
    showExamNumbersSummary: false,
    showModeToggle: false,
    showSegmentOrganizer: false,
    showCriticalBadges: true,
    showExamScorecards: true,
    showSegmentBadges: false,
  },
  print: {
    display: { preset: "minimal" },
    showStudentFocus: false,
    showExamNumbersSummary: false,
    showModeToggle: false,
    showSegmentOrganizer: false,
    showCriticalBadges: false,
    showExamScorecards: false,
    showSegmentBadges: false,
  },
} as const satisfies Record<string, SkillSurfaceConfig>;

export type SkillSurfaceKey = keyof typeof SURFACE_CONFIGS;

export function getSurfaceConfig(key: SkillSurfaceKey): SkillSurfaceConfig {
  return SURFACE_CONFIGS[key];
}

/** Skill page toggles study vs quiz surface by checklist mode. */
export function resolveSkillPageSurfaceConfig(
  mode: ChecklistMode,
): SkillSurfaceConfig {
  return mode === "quiz" ?
      SURFACE_CONFIGS.skillPageQuiz
    : SURFACE_CONFIGS.skillPageStudy;
}

/** Resolved enrichment display for a surface (tests + tooling). */
export function resolveSurfaceDisplay(
  key: SkillSurfaceKey,
): ChecklistEnrichmentDisplay {
  const cfg = SURFACE_CONFIGS[key];
  return resolveChecklistDisplay({
    ...cfg.display,
    showSegmentBadges: cfg.showSegmentBadges,
    showCriticalBadges: cfg.showCriticalBadges,
    showExamScorecards: cfg.showExamScorecards,
  });
}
