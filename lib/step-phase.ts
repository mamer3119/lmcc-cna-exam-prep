import {
  getPhaseWordForStep,
  type CurriculumSkillMeta,
} from "@/data/skillCurriculum";
import type { ChecklistStep } from "@/lib/checklist-step";
import type { StepSegment } from "@/lib/skill-templates";

/** Per-step phase badge colours — OPEN blue, CORE amber, CLOSE green */
export const PHASE_COLORS: Record<string, string> = {
  Approach: "#3B82F6",
  Prepare: "#3B82F6",
  Identify: "#3B82F6",
  Introduce: "#3B82F6",
  Wash: "#F59E0B",
  Measure: "#F59E0B",
  Weigh: "#F59E0B",
  Transfer: "#F59E0B",
  Position: "#F59E0B",
  Ambulate: "#F59E0B",
  Shoulder: "#F59E0B",
  Lower: "#F59E0B",
  Apply: "#F59E0B",
  Bathe: "#F59E0B",
  Don: "#F59E0B",
  Doff: "#F59E0B",
  Foot: "#F59E0B",
  Hand: "#F59E0B",
  Dress: "#F59E0B",
  Oral: "#F59E0B",
  Peri: "#F59E0B",
  Catheter: "#F59E0B",
  Count: "#F59E0B",
  Secure: "#D97706",
  Finish: "#D97706",
  Clean: "#D97706",
  Record: "#10B981",
  Work: "#10B981",
};

const SEGMENT_FALLBACK: Record<StepSegment, string> = {
  open: "#3B82F6",
  core: "#F59E0B",
  close: "#10B981",
};

/** step.phaseWord → getPhaseWordForStep() → segment title-case */
export function getStepPhaseLabel(
  step: ChecklistStep,
  meta: CurriculumSkillMeta,
): string {
  const word = step.phaseWord ?? getPhaseWordForStep(meta, step.id);
  if (word) {
    return word;
  }
  return step.segment ?
      step.segment.charAt(0).toUpperCase() + step.segment.slice(1)
    : "";
}

export function getStepPhaseColor(
  step: ChecklistStep,
  meta: CurriculumSkillMeta,
): string {
  const word = step.phaseWord ?? getPhaseWordForStep(meta, step.id);
  if (word && PHASE_COLORS[word]) {
    return PHASE_COLORS[word];
  }
  return SEGMENT_FALLBACK[step.segment ?? "core"];
}
