/**
 * Phase 1 skill domain types — canonical shape for Learn + Test-Yourself (Phase 2 extends).
 * Runtime data still flows from data/skills.json via lib/checklist-step.ts adapters.
 */
import type { TemplateId } from "@/data/skillCurriculum";
import type { ChecklistStep } from "@/lib/checklist-step";
import type { StepSegment } from "@/lib/skill-templates";

export type Phase = "OPENING" | "CORE" | "CLOSING" | "KEY_PROCEDURE";

export type PhaseCategory =
  | "PROTECT"
  | "OBSERVE"
  | "MOVE"
  | "RESTORE"
  | "CLEAN"
  | "FEED"
  | "ELIMINATE";

export type { TemplateId };

export interface ExamNote {
  authority: "GWC" | "Credentia";
  text: string;
  /** NEVER render in student view — instructor only */
  source?: string;
}

export interface Step {
  n: number;
  title: string;
  phase: Phase;
  /** TRUE = counts toward mastery / drill denominator */
  scored: boolean;
  critical?: boolean;
  instruction: string;
  substeps?: string[];
  examNote?: ExamNote;
  coachingNote?: string;
  failRule?: string;
  linkedSkillId?: string;
}

export interface Skill {
  id: string;
  title: string;
  category: PhaseCategory;
  alwaysTested: boolean;
  studentFocus: string;
  templateId: TemplateId;
  templateHint: string;
  phases: Step[];
}

const SEGMENT_TO_PHASE: Record<StepSegment, Phase> = {
  open: "OPENING",
  core: "CORE",
  close: "CLOSING",
};

const TAG_TO_PHASE: Record<string, Phase> = {
  Opening: "OPENING",
  Core: "CORE",
  Closing: "CLOSING",
  "Key Procedure": "KEY_PROCEDURE",
};

/** Map checklist segment + tagCategory to spec Phase label. */
export function resolveSpecPhase(step: ChecklistStep): Phase {
  const tag = step.tagCategory?.trim();
  if (tag && tag in TAG_TO_PHASE) {
    return TAG_TO_PHASE[tag];
  }
  const segment = step.segment ?? "core";
  return SEGMENT_TO_PHASE[segment];
}
