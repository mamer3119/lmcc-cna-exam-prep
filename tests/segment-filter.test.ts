import { describe, expect, it } from "vitest";

import { getSkillBySlug } from "@/lib/skills";
import {
  filterStepsBySegment,
  parseSegmentFilter,
  segmentFilterQuery,
} from "@/lib/segment-filter";

describe("segment-filter", () => {
  it("parseSegmentFilter treats only 'core' as core mode", () => {
    expect(parseSegmentFilter(null)).toBe("all");
    expect(parseSegmentFilter("")).toBe("all");
    expect(parseSegmentFilter("core")).toBe("core");
    expect(parseSegmentFilter("all")).toBe("all");
  });

  it("filterStepsBySegment keeps only core segment rows", () => {
    const ppe = getSkillBySlug("ppe-gown-gloves")!;
    const coreOnly = filterStepsBySegment(ppe.steps, "core");
    expect(coreOnly.length).toBeGreaterThan(0);
    expect(coreOnly.every((step) => step.segment === "core")).toBe(true);
    expect(coreOnly.length).toBeLessThan(ppe.steps.length);
  });

  it("segmentFilterQuery returns shareable query string", () => {
    expect(segmentFilterQuery("all")).toBe("");
    expect(segmentFilterQuery("core")).toBe("?filter=core");
  });
});
