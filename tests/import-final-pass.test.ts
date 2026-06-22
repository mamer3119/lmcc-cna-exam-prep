import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  SKILL_REGISTRY,
  collectExamScorecards,
  compareStepCounts,
  extractTsvBlock,
  parseFinalPassDocument,
  parseSelfScore,
  parseSkillSection,
  parseTsvSteps,
  runImport,
  splitTsvLine,
} from "../scripts/import-final-pass.mjs";

const SOURCE = path.resolve(
  process.cwd(),
  "../LMCC CNA Skills - Student Study Guide 6-21-2026/FINAL-PASS-S05-S22-COMPLETE.md",
);

const markdown = fs.readFileSync(SOURCE, "utf8");

describe("import-final-pass parser", () => {
  it("registers all 18 skills S05–S22 across three threads", () => {
    expect(Object.keys(SKILL_REGISTRY)).toHaveLength(18);
    expect(
      Object.values(SKILL_REGISTRY).filter((s) => s.thread === "A"),
    ).toHaveLength(6);
    expect(
      Object.values(SKILL_REGISTRY).filter((s) => s.thread === "B"),
    ).toHaveLength(7);
    expect(
      Object.values(SKILL_REGISTRY).filter((s) => s.thread === "C"),
    ).toHaveLength(5);
  });

  it("splits TSV on tabs preserving 11 columns for S05 row 7", () => {
    const s05 = markdown.split("## SECTION S05")[1].split("## SECTION S06")[0];
    const tsv = extractTsvBlock(s05);
    const row7 = tsv.split("\n").find((line) => line.startsWith("7\t"));
    expect(row7).toBeTruthy();
    const cols = splitTsvLine(row7!);
    expect(cols[2]).toBe("Inflate cuff 160–180 mmHg");
    expect(cols[10]).toBe("Technique: Inflate cuff 160–180 mmHg");
  });

  it("parses S05 with 14 steps, segments, and scorecards", () => {
    const s05 = markdown.split("## SECTION S05")[1].split("## SECTION S06")[0];
    const skill = parseSkillSection("S05", s05);

    expect(skill.stepCount).toBe(14);
    expect(skill.slug).toBe("manual-blood-pressure");
    expect(skill.steps[0].segment).toBe("open");
    expect(skill.steps[2].segment).toBe("core");
    expect(skill.steps[12].segment).toBe("close");
    expect(skill.steps[6].examScorecard).toContain("Technique:");
    expect(skill.steps[13].examScorecard).toContain("Exam tolerance:");
    expect(skill.selfScore.rubricFidelity).toBe("PASS");
    expect(skill.selfScore.confidence).toBe(96);
  });

  it("skips divider rows and assigns segment from last divider", () => {
    const s05 = markdown.split("## SECTION S05")[1].split("## SECTION S06")[0];
    const tsv = extractTsvBlock(s05);
    const steps = parseTsvSteps(tsv);
    expect(steps.map((s) => s.id)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
    ]);
    expect(
      steps.every((s) => ["open", "core", "close"].includes(s.segment)),
    ).toBe(true);
  });

  it("preserves S22 step 21 prohibition phrasing verbatim", () => {
    const s22 = markdown.split("## SECTION S22")[1];
    const skill = parseSkillSection("S22", s22);
    const step21 = skill.steps.find((s) => s.id === 21);
    expect(step21?.stepText).toBe("Never pull the catheter tube");
  });

  it("handles S13 combined BED_LOW|CALL_LIGHT boilerplate id", () => {
    const s13 = markdown.split("## SECTION S13")[1].split("## SECTION S14")[0];
    const skill = parseSkillSection("S13", s13);
    const closeStep = skill.steps.find((s) =>
      s.boilerplateId?.includes("BED_LOW"),
    );
    expect(closeStep?.boilerplateId).toBe("BED_LOW|CALL_LIGHT");
    expect(skill.stepCount).toBe(11);
  });

  it("parses full document with header-declared step counts", () => {
    const all = parseFinalPassDocument(markdown);
    expect(Object.keys(all)).toHaveLength(18);
    for (const skill of Object.values(all)) {
      expect(skill.steps.length).toBe(skill.stepCount);
    }
  });

  it("detects known skills.json mismatches from review.md §3 (pre-merge baseline)", () => {
    const all = parseFinalPassDocument(markdown);
    const counts = Object.fromEntries(
      Object.values(all).map((s) => [s.slug, s.stepCount]),
    );
    const preMergeBaseline = {
      "weight-ambulatory-client": 12,
      "ambulate-transfer-belt": 19,
      "knee-high-stocking": 12,
      "manual-blood-pressure": 14,
    };

    expect(compareStepCounts(all.S06, preMergeBaseline).status).toBe(
      "mismatch",
    );
    expect(compareStepCounts(all.S10, preMergeBaseline).status).toBe(
      "mismatch",
    );
    expect(compareStepCounts(all.S13, preMergeBaseline).status).toBe(
      "mismatch",
    );
    expect(compareStepCounts(all.S05, preMergeBaseline).status).toBe("ok");
    expect(counts["weight-ambulatory-client"]).toBe(13);
    expect(counts["ambulate-transfer-belt"]).toBe(18);
    expect(counts["knee-high-stocking"]).toBe(11);
  });

  it("collects only S05–S07 exam scorecards in measurement skills", () => {
    const all = parseFinalPassDocument(markdown);
    const cards = [
      ...collectExamScorecards(all.S05),
      ...collectExamScorecards(all.S06),
      ...collectExamScorecards(all.S07),
    ];
    expect(cards).toHaveLength(6);
    expect(
      cards.some((c) => c.slug === "manual-blood-pressure" && c.stepId === 14),
    ).toBe(true);
  });

  it("parses SELF-SCORE confidence and residual risk", () => {
    const s05 = markdown.split("## SECTION S05")[1].split("## SECTION S06")[0];
    const score = parseSelfScore(s05);
    expect(score.confidence).toBe(96);
    expect(score.residualRisk.toLowerCase()).toContain("step 7");
  });
});

describe("import-final-pass staging output", () => {
  it("writes 18 JSON files + manifest when runImport executes", () => {
    const stagingRoot = path.join(process.cwd(), "imports/final-pass");
    if (fs.existsSync(stagingRoot)) {
      fs.rmSync(stagingRoot, { recursive: true, force: true });
    }

    const summary = runImport({ sourcePath: SOURCE });
    expect(summary.skillCount).toBe(18);
    expect(summary.mismatches).toHaveLength(0);
    expect(fs.existsSync(path.join(stagingRoot, "manifest.json"))).toBe(true);

    for (const key of Object.keys(SKILL_REGISTRY)) {
      const reg = SKILL_REGISTRY[key as keyof typeof SKILL_REGISTRY];
      const file = path.join(
        stagingRoot,
        `thread-${reg.thread}`,
        `${key}-${reg.slug}.json`,
      );
      expect(fs.existsSync(file), file).toBe(true);
      const json = JSON.parse(fs.readFileSync(file, "utf8"));
      expect(json.steps.length).toBe(json.stepCount);
    }

    for (const t of ["A", "B", "C"]) {
      expect(
        fs.existsSync(
          path.join(stagingRoot, `thread-${t}`, `thread-${t}-summary.md`),
        ),
      ).toBe(true);
    }
  });
});
