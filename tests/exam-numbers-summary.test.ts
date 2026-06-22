import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { getExamScorecardsForSkill } from "@/lib/exam-scorecard";

function readProjectFile(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("SkillExamNumbersSummary (Block D)", () => {
  it("lists 7 hand-hygiene and 4 BP rows from getExamScorecardsForSkill", () => {
    expect(getExamScorecardsForSkill("hand-hygiene")).toHaveLength(7);
    const bp = getExamScorecardsForSkill("manual-blood-pressure");
    expect(bp).toHaveLength(4);
    expect(bp.map((e) => e.stepId)).toEqual([7, 8, 9, 14]);
  });

  it("SkillPageClient renders summary when skillHasExamNumbersSummary", () => {
    const source = readProjectFile("components/SkillPageClient.tsx");
    expect(source).toMatch(/SkillExamNumbersSummary/);
    expect(source).toMatch(/skillHasExamNumbersSummary/);
    expect(source.indexOf("SkillExamNumbersSummary")).toBeLessThan(
      source.indexOf("<SkillChecklist"),
    );
  });

  it("summary component maps data layer without duplicate strings", () => {
    const source = readProjectFile("components/SkillExamNumbersSummary.tsx");
    expect(source).toMatch(/getExamScorecardsForSkill/);
    expect(source).toMatch(/exam-numbers-summary__grid/);
    expect(source).not.toMatch(/<ExamScorecard/);
    expect(source).not.toMatch(/±8 mmHg/);
  });

  it("styles summary panel for wrapped mobile values", () => {
    const css = readProjectFile("app/phase-organizer.css");
    expect(css).toMatch(/\.exam-numbers-summary/);
    expect(css).toMatch(
      /\.exam-numbers-summary__value[\s\S]*?white-space:\s*normal/,
    );
    expect(css).toMatch(/flex-direction:\s*column/);
  });
});
