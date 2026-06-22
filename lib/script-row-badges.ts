import type { StepSegment } from "@/lib/skill-templates";

/** tagCategory values that duplicate OPEN/CORE/CLOSE segment badges. */
const TAG_CATEGORY_TO_SEGMENT: Record<string, StepSegment> = {
  Opening: "open",
  Core: "core",
  Closing: "close",
};

export function isTagCategoryRedundantWithSegment(
  tagCategory: string,
  segment: StepSegment | null,
): boolean {
  if (!segment) {
    return false;
  }
  return TAG_CATEGORY_TO_SEGMENT[tagCategory] === segment;
}

/** Learn segment headings replace per-row OPEN/CORE/CLOSE chips in script layout. */
export function shouldShowRowSegmentBadge(options: {
  scriptRows: boolean;
  learnPolish: boolean;
  segmentBadges: boolean;
}): boolean {
  if (!options.segmentBadges) {
    return false;
  }
  if (options.scriptRows && options.learnPolish) {
    return false;
  }
  return true;
}
