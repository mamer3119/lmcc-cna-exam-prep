import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  BOILERPLATE_REGISTRY_NOTE,
  BOILERPLATE_TOKEN_REGISTRY,
  DRILL_TYPE_LABELS,
  MODE_LABELS,
} from "@/lib/practice-labels";

describe("practice-labels — Slice-2 MODE_LABELS", () => {
  it("exports unified skill page mode labels", () => {
    expect(MODE_LABELS.fullView).toBe("Full View");
    expect(MODE_LABELS.coreOnly).toBe("Core Only");
    expect(MODE_LABELS.selfCheck).toBe("Self-Check");
  });

  it("boilerplate registry is canonical and documents 9-vs-10 note", () => {
    expect(BOILERPLATE_REGISTRY_NOTE).toMatch(/9 templates/);
    expect(BOILERPLATE_TOKEN_REGISTRY.HAND_HYGIENE.label).toBe("HAND_HYGIENE");
  });

  it("SkillPageClient uses SkillViewModeSelector only", () => {
    const src = readFileSync(
      path.join(process.cwd(), "components/SkillPageClient.tsx"),
      "utf8",
    );
    expect(src).toMatch(/SkillViewModeSelector/);
    expect(src).not.toMatch(/SkillPracticeToggle/);
  });

  it("drill type labels use shared helper", () => {
    expect(DRILL_TYPE_LABELS.recall(10)).toBe("Recall (10)");
    expect(DRILL_TYPE_LABELS.tolerance(0)).toBe("Tolerance");
  });
});
