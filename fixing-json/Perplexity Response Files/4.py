
# ─── B: skillCurriculum-6.ts patch (getPhaseWordForStep wire-up) ──────────────
ts_b = '''\
// skillCurriculum-6.ts  — PATCH ONLY
// Wire getPhaseWordForStep() to checklist rendering so each step gets
// a per-step phase badge (blue = OPEN, yellow = CORE, green = CLOSE).
//
// Instructions:
//   1. Find the function that renders each ChecklistStep row (e.g. renderStep,
//      ChecklistRow, StepCard — name varies by your component).
//   2. Add the import below to that file (or to the barrel index if shared).
//   3. Replace the static segment-colour logic with the call shown in
//      computedPhase() below.
//
// ── Import (add to the component that renders step rows) ─────────────────────
import { getPhaseWordForStep } from "./skillCurriculum-6";
import type { ChecklistStep, StepSegment } from "./checklist-step-2";

// ── Phase badge colours ───────────────────────────────────────────────────────
export const PHASE_COLORS: Record<string, string> = {
  // OPEN segment — blue family
  Approach:  "#3B82F6",  // blue-500
  Prepare:   "#3B82F6",
  Identify:  "#3B82F6",

  // CORE segment — yellow / amber family (task-specific phase words)
  Wash:      "#F59E0B",  // amber-500
  Measure:   "#F59E0B",
  Weigh:     "#F59E0B",
  Transfer:  "#F59E0B",
  Position:  "#F59E0B",
  Ambulate:  "#F59E0B",
  Shoulder:  "#F59E0B",
  Lower:     "#F59E0B",
  Apply:     "#F59E0B",
  Bathe:     "#F59E0B",
  Don:       "#F59E0B",
  Doff:      "#F59E0B",
  Foot:      "#F59E0B",
  Hand:      "#F59E0B",
  Dress:     "#F59E0B",
  Oral:      "#F59E0B",
  Peri:      "#F59E0B",
  Catheter:  "#F59E0B",

  // Transition — still amber (keep warm) but used in CORE near close
  Secure:    "#D97706",  // amber-600  (slightly darker — late-core / comfort steps)
  Finish:    "#D97706",
  Clean:     "#D97706",

  // CLOSE segment — green family
  Record:    "#10B981",  // emerald-500
  Work:      "#10B981",
};

// Fallback by segment when phaseWord is not in PHASE_COLORS
const SEGMENT_FALLBACK: Record<StepSegment, string> = {
  open:  "#3B82F6",
  core:  "#F59E0B",
  close: "#10B981",
};

/**
 * Returns the hex colour for a step\\\'s phase badge.
 *
 * Resolution order:
 *   1. step.phaseWord override (from FINAL-PASS "Phase Word" column)
 *   2. getPhaseWordForStep(skillId, stepId) — existing curriculum function
 *   3. segment fallback
 */
export function getStepPhaseColor(
  step: ChecklistStep,
  skillId: string
): string {
  const word =
    step.phaseWord ??
    getPhaseWordForStep(skillId, step.id) ??
    step.segment;
  return (word && PHASE_COLORS[word]) ?? SEGMENT_FALLBACK[step.segment ?? "core"];
}

/**
 * Returns the display label for a step\\\'s phase badge.
 * Call this inside your step-row component.
 *
 * @example
 *   const label = getStepPhaseLabel(step, skill.id);   // "Measure"
 *   const color = getStepPhaseColor(step, skill.id);   // "#F59E0B"
 */
export function getStepPhaseLabel(
  step: ChecklistStep,
  skillId: string
): string {
  return (
    step.phaseWord ??
    getPhaseWordForStep(skillId, step.id) ??
    (step.segment ? capitalize(step.segment) : "")
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ── Usage inside your step-row JSX ───────────────────────────────────────────
//
//   import { getStepPhaseLabel, getStepPhaseColor } from "./skillCurriculum-6-patch";
//
//   function StepRow({ step, skillId }: { step: ChecklistStep; skillId: string }) {
//     const label = getStepPhaseLabel(step, skillId);
//     const color = getStepPhaseColor(step, skillId);
//     return (
//       <div>
//         <span
//           style={{ backgroundColor: color }}
//           className="phase-badge"
//         >
//           {label}
//         </span>
//         {/* rest of step row */}
//       </div>
//     );
//   }
'''

(out / "skillCurriculum-6-patch.ts").write_text(ts_b)
print("B written:", (out / "skillCurriculum-6-patch.ts").stat().st_size, "bytes")