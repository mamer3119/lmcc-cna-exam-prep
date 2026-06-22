// skillCurriculum-6-patch.ts
// Wires getPhaseWordForStep() to per-step phase badge rendering.
// Import alongside skillCurriculum-6.ts.

import { getPhaseWordForStep } from "./skillCurriculum-6";
import type { ChecklistStep, StepSegment } from "./checklist-step-2";

export const PHASE_COLORS: Record<string, string> = {
  // OPEN
  Approach:"#3B82F6", Prepare:"#3B82F6", Identify:"#3B82F6", Introduce:"#3B82F6",
  // CORE task words
  Wash:"#F59E0B", Measure:"#F59E0B", Weigh:"#F59E0B", Transfer:"#F59E0B",
  Position:"#F59E0B", Ambulate:"#F59E0B", Shoulder:"#F59E0B", Lower:"#F59E0B",
  Apply:"#F59E0B", Bathe:"#F59E0B", Don:"#F59E0B", Doff:"#F59E0B",
  Foot:"#F59E0B", Hand:"#F59E0B", Dress:"#F59E0B", Oral:"#F59E0B",
  Peri:"#F59E0B", Catheter:"#F59E0B", Count:"#F59E0B",
  // Late-CORE (darker amber)
  Secure:"#D97706", Finish:"#D97706", Clean:"#D97706",
  // CLOSE
  Record:"#10B981", Work:"#10B981",
};

const FALLBACK: Record<StepSegment, string> = {
  open:"#3B82F6", core:"#F59E0B", close:"#10B981",
};

export function getStepPhaseColor(step: ChecklistStep, skillId: string): string {
  const word = step.phaseWord ?? getPhaseWordForStep(skillId, step.id) ?? step.segment;
  return (word && PHASE_COLORS[word]) ?? FALLBACK[step.segment ?? "core"];
}

export function getStepPhaseLabel(step: ChecklistStep, skillId: string): string {
  const w = step.phaseWord ?? getPhaseWordForStep(skillId, step.id);
  if (w) return w;
  return step.segment ? step.segment.charAt(0).toUpperCase() + step.segment.slice(1) : "";
}

/*
USAGE in step-row JSX:
  import { getStepPhaseLabel, getStepPhaseColor } from "./skillCurriculum-6-patch";
  <span style={{ background: getStepPhaseColor(step, skillId) }}>
    {getStepPhaseLabel(step, skillId)}
  </span>
*/
