import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  CHECKLIST_VIEW_LABELS,
  DRILL_TYPE_LABELS,
  PRACTICE_MODE_LABELS,
  SEGMENT_FILTER_LABELS,
} from "@/lib/practice-labels";

describe("practice-labels — centralized copy", () => {
  it("exports distinct top-level vs checklist-view labels", () => {
    expect(PRACTICE_MODE_LABELS.learn).toBe("Learn");
    expect(PRACTICE_MODE_LABELS.testYourself).toBe("Test Yourself");
    expect(CHECKLIST_VIEW_LABELS.full).toBe("All steps");
    expect(CHECKLIST_VIEW_LABELS.reveal).toBe("Hide & reveal");
    expect(CHECKLIST_VIEW_LABELS.full).not.toBe(PRACTICE_MODE_LABELS.learn);
    expect(CHECKLIST_VIEW_LABELS.reveal).not.toBe(
      PRACTICE_MODE_LABELS.testYourself,
    );
  });

  it("SkillChecklist does not hardcode legacy Study/Quiz Mode strings", () => {
    const src = readFileSync(
      path.join(process.cwd(), "components/SkillChecklist.tsx"),
      "utf8",
    );
    expect(src).not.toMatch(/Study Mode/);
    expect(src).not.toMatch(/Quiz Mode/);
    expect(src).toMatch(/CHECKLIST_VIEW_LABELS/);
  });

  it("SkillPracticeToggle imports PRACTICE_MODE_LABELS", () => {
    const src = readFileSync(
      path.join(process.cwd(), "components/SkillPracticeToggle.tsx"),
      "utf8",
    );
    expect(src).toMatch(/PRACTICE_MODE_LABELS/);
    expect(src).not.toMatch(/Study Mode/);
  });

  it("drill type labels use shared helper", () => {
    expect(DRILL_TYPE_LABELS.recall(10)).toBe("Recall (10)");
    expect(DRILL_TYPE_LABELS.tolerance(0)).toBe("Tolerance");
  });

  it("segment filter labels are centralized", () => {
    expect(SEGMENT_FILTER_LABELS.coreOnly).toBe("Core only");
    expect(SEGMENT_FILTER_LABELS.all).toBe("All");
  });
});
