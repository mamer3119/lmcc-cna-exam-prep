import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function readProjectFile(relativePath: string): string {
  return readFileSync(path.join(ROOT, relativePath), "utf8");
}

describe("exam scorecard UI (Block C)", () => {
  it("ExamScorecard is accessible presentational note", () => {
    const source = readProjectFile("components/ExamScorecard.tsx");
    expect(source).toMatch(/role="note"/);
    expect(source).toMatch(/aria-label=\{entry\.ariaLabel\}/);
  });

  it("SkillChecklist gates inline scorecards via shouldShowInlineExamScorecard", () => {
    const source = readProjectFile("components/SkillChecklist.tsx");
    expect(source).toMatch(/showExamScorecards\?: boolean/);
    expect(source).toMatch(/shouldShowInlineExamScorecard/);
    expect(source).toMatch(/showInlineScorecard/);
  });

  it("renders inline scorecard before quiz hidden step text when shown", () => {
    const source = readProjectFile("components/SkillChecklist.tsx");
    const scorecardIdx = source.indexOf("<ExamScorecard");
    const hiddenIdx = source.indexOf("skill-quiz-hidden");
    expect(scorecardIdx).toBeGreaterThan(-1);
    expect(hiddenIdx).toBeGreaterThan(-1);
    expect(scorecardIdx).toBeLessThan(hiddenIdx);
  });

  it("SkillPageClient enables exam scorecards via surface config", () => {
    const source = readProjectFile("components/SkillPageClient.tsx");
    expect(source).toMatch(/resolveSkillPageSurfaceConfig/);
    expect(source).toMatch(
      /showExamScorecards=\{surface\.showExamScorecards\}/,
    );
  });

  it("styles exam scorecard with gold institutional strip", () => {
    const css = readProjectFile("app/phase-organizer.css");
    expect(css).toMatch(/\.exam-scorecard/);
    expect(css).toMatch(/border-left:\s*3px solid var\(--gold\)/);
    expect(css).toMatch(/tabular-nums/);
  });
});
