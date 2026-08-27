import { describe, expect, it } from "vitest";

import {
  isTagCategoryRedundantWithSegment,
  shouldShowRowSegmentBadge,
} from "@/lib/script-row-badges";

describe("script-row badge dedupe", () => {
  it("flags Opening/Core/Closing tagCategory when segment matches", () => {
    expect(isTagCategoryRedundantWithSegment("Opening", "open")).toBe(true);
    expect(isTagCategoryRedundantWithSegment("Core", "core")).toBe(true);
    expect(isTagCategoryRedundantWithSegment("Closing", "close")).toBe(true);
    expect(isTagCategoryRedundantWithSegment("Key Procedure", "open")).toBe(
      false,
    );
  });

  it("hides per-row segment badge when script rows + learn polish headings", () => {
    expect(
      shouldShowRowSegmentBadge({
        scriptRows: true,
        learnPolish: true,
        segmentBadges: true,
      }),
    ).toBe(false);
    expect(
      shouldShowRowSegmentBadge({
        scriptRows: false,
        learnPolish: true,
        segmentBadges: true,
      }),
    ).toBe(true);
  });
});
