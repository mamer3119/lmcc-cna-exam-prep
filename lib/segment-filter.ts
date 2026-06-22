import type { ChecklistStep } from "@/lib/checklist-step";

export type SegmentFilterMode = "all" | "core";

export function parseSegmentFilter(
  value: string | null | undefined,
): SegmentFilterMode {
  return value === "core" ? "core" : "all";
}

export function filterStepsBySegment(
  steps: ChecklistStep[],
  mode: SegmentFilterMode,
): ChecklistStep[] {
  if (mode === "all") {
    return steps;
  }
  return steps.filter((step) => step.segment === "core");
}

export function segmentFilterQuery(mode: SegmentFilterMode): string {
  return mode === "core" ? "?filter=core" : "";
}
