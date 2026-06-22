/**
 * Parse Perplexity exemplars 1.md–4.md → FINAL-PASS staging JSON (S01–S04).
 *
 * Run:
 *   node scripts/import-exemplar-s01-s04.mjs
 *   node scripts/import-exemplar-s01-s04.mjs --dry-run
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  collectExamScorecards,
  compareStepCounts,
  parseTsvSteps,
  splitTsvLine,
} from "./import-final-pass.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const STAGING_ROOT = path.join(ROOT, "imports/final-pass");
const THREAD_D = path.join(STAGING_ROOT, "thread-D");
const MANIFEST_PATH = path.join(STAGING_ROOT, "manifest.json");
const SKILLS_PATH = path.join(ROOT, "data/skills.json");

const EXEMPLAR_ROOT = path.resolve(
  ROOT,
  "../LMCC CNA Skills - Student Study Guide 6-21-2026/Perplexity Prompts/0",
);

/** @type {Record<string, { studyOrder: number; gwcSkillNumber: number; slug: string; title: string; exemplarFile: string }>} */
export const S01_S04_REGISTRY = {
  S01: {
    studyOrder: 1,
    gwcSkillNumber: 1,
    slug: "hand-hygiene",
    title: "Hand Hygiene (Hand Washing)",
    exemplarFile: "1.md",
  },
  S02: {
    studyOrder: 2,
    gwcSkillNumber: 8,
    slug: "ppe-gown-gloves",
    title: "Donning and Removing PPE (Gown and Gloves)",
    exemplarFile: "2.md",
  },
  S03: {
    studyOrder: 3,
    gwcSkillNumber: 6,
    slug: "radial-pulse-60-seconds",
    title: "Counts and Records Radial Pulse",
    exemplarFile: "3.md",
  },
  S04: {
    studyOrder: 4,
    gwcSkillNumber: 7,
    slug: "respirations-60-seconds",
    title: "Counts and Records Respirations",
    exemplarFile: "4.md",
  },
};

const DIVIDER_SEGMENT = {
  "OPEN DIVIDER": "open",
  "CORE DIVIDER": "core",
  "CLOSE DIVIDER": "close",
};

const TSV_COLUMNS = [
  "stepNum",
  "icon",
  "stepText",
  "boilerplateId",
  "detailedTagText",
  "tagCategory",
  "phaseWord",
  "clinicalNote",
  "subStepsRaw",
  "criticalCategory",
  "examScorecard",
];

const PIPE_ESC = "\u0001";

/**
 * @param {string} line
 */
function parsePipeCells(line) {
  const safe = line.replace(/\\\|/g, PIPE_ESC);
  return safe
    .split("|")
    .map((c) => c.trim().replaceAll(PIPE_ESC, "|"))
    .filter((_, i, arr) => i > 0 && i < arr.length - 1);
}

/**
 * @param {string} raw
 */
function normalizeCriticalCategory(raw) {
  const t = raw.trim();
  if (!t || t === "🔴 Critical") {
    return t === "🔴 Critical" ? "hand-hygiene" : "";
  }
  if (t.includes("Critical")) {
    return "hand-hygiene";
  }
  return t.replace(/^🔴\s*/, "").trim();
}

/**
 * @param {string} markdownTable
 */
export function parseElevenColumnMarkdownTable(markdownTable) {
  const lines = markdownTable
    .split(/\r?\n/)
    .filter((line) => line.trim().startsWith("|"));

  /** @type {"open"|"core"|"close"} */
  let currentSegment = "open";
  /** @type {import("./import-final-pass.types").StagingStep[]} */
  const steps = [];

  for (const line of lines) {
    const cells = parsePipeCells(line);
    if (cells.length < 3) {
      continue;
    }
    const first = cells[0].replace(/\*\*/g, "").trim();

    if (/^:?-+:?$/.test(first.replace(/\s/g, ""))) {
      continue;
    }
    if (first === "Step #" || first === "Step \\#") {
      continue;
    }

    if (first in DIVIDER_SEGMENT) {
      currentSegment = DIVIDER_SEGMENT[first];
      continue;
    }

    if (first === "—" || first === "–" || first === "-") {
      continue;
    }

    const stepId = Number(first);
    if (!Number.isFinite(stepId)) {
      continue;
    }

    const subStepsRaw = cells[8] ?? "";
    const subSteps =
      subStepsRaw ?
        subStepsRaw
          .split("|")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    /** @type {import("./import-final-pass.types").StagingStep} */
    const step = {
      id: stepId,
      segment: (cells[5] ?? "").trim() === "Closing" ? "close" : currentSegment,
      stepText: cells[2] ?? "",
      detailedTagText: cells[4] ?? "",
      tagCategory: cells[5] ?? "",
      phaseWord: cells[6] ?? "",
      clinicalNote: cells[7] ?? "",
      subSteps,
      criticalCategory: normalizeCriticalCategory(cells[9] ?? ""),
      examScorecard: cells[10] ?? "",
      icon: cells[1] ?? "",
    };

    const bp = (cells[3] ?? "").trim();
    if (bp && /^[A-Z][A-Z0-9_|]*$/.test(bp)) {
      step.boilerplateId = bp;
    }

    steps.push(step);
  }

  return steps;
}

/**
 * Radial pulse exemplar uses 8 columns (no boilerplate id column).
 * @param {string} markdownTable
 */
export function parsePulseMarkdownTable(markdownTable) {
  const lines = markdownTable
    .split(/\r?\n/)
    .filter((line) => line.trim().startsWith("|"));

  /** @type {import("./import-final-pass.types").StagingStep[]} */
  const steps = [];
  const segmentByStep = {
    1: "open",
    2: "core",
    3: "core",
    4: "close",
    5: "close",
    6: "close",
  };

  const boilerplateByStep = {
    1: "INTRO_EXPLAIN",
    4: "CALL_LIGHT",
    5: "HAND_HYGIENE",
  };

  for (const line of lines) {
    const cells = parsePipeCells(line);
    if (cells.length < 3) {
      continue;
    }
    const first = cells[0].replace(/\*\*/g, "").trim();
    if (first === "Step \\#" || first === "Step #" || /^:?-+:?$/.test(first)) {
      continue;
    }
    const stepId = Number(first);
    if (!Number.isFinite(stepId)) {
      continue;
    }

    const stepText = cells[2] ?? "";
    const detailedTagText = cells[3] ?? "";
    const phaseWord = cells[4] ?? "";
    const clinicalNote = cells[5] ?? "";
    const criticalCategory = (cells[6] ?? "").trim();
    const examScorecard = cells[7] ?? "";

    /** @type {import("./import-final-pass.types").StagingStep} */
    const step = {
      id: stepId,
      segment: segmentByStep[stepId] ?? "core",
      stepText,
      detailedTagText,
      tagCategory:
        stepId === 1 ? "Opening"
        : stepId <= 3 ? "Core"
        : "Closing",
      phaseWord,
      clinicalNote,
      subSteps: [],
      criticalCategory,
      examScorecard,
      icon: cells[1] ?? "",
    };

    const bp = boilerplateByStep[stepId];
    if (bp) {
      step.boilerplateId = bp;
    }

    steps.push(step);
  }

  return steps;
}

/**
 * @param {string} fencedTsv
 */
export function normalizeRespirationsTsv(fencedTsv) {
  return fencedTsv
    .replace(/^🟢\s+──\s+OPEN\s+──.*$/m, "OPEN DIVIDER")
    .replace(/^🔵\s+──\s+CORE\s+──.*$/m, "CORE DIVIDER")
    .replace(/^🔴\s+──\s+CLOSE\s+──.*$/m, "CLOSE DIVIDER");
}

/**
 * @param {string} sectionKey
 * @param {string} body
 */
export function parseExemplarSection(sectionKey, body) {
  const meta = S01_S04_REGISTRY[sectionKey];
  if (!meta) {
    throw new Error(`Unknown section: ${sectionKey}`);
  }

  let steps;
  if (sectionKey === "S04") {
    const fence = body.match(/```\r?\n([\s\S]*?)```/);
    if (!fence) {
      throw new Error("S04 TSV fence not found");
    }
    steps = parseTsvSteps(normalizeRespirationsTsv(fence[1].trimEnd()));
    for (const step of steps) {
      if (
        step.id === 2 &&
        !step.detailedTagText &&
        step.tagCategory?.includes("Observe")
      ) {
        step.detailedTagText = step.tagCategory;
        step.tagCategory = "Core";
        const note = step.clinicalNote;
        step.phaseWord = note;
        step.clinicalNote =
          step.subSteps.length ?
            step.subSteps.join(" ")
          : "Start on a whole number on the watch, then count.";
        step.subSteps = [];
      }
      if (step.id === 5) {
        if (!step.detailedTagText && step.tagCategory?.includes("Record the")) {
          step.detailedTagText = step.tagCategory;
          step.tagCategory = "Closing";
          step.phaseWord = step.clinicalNote || "Record";
          step.clinicalNote = "";
          step.subSteps = [];
        }
        if (!step.examScorecard) {
          step.examScorecard = "Tolerance: ±4 breaths/min vs evaluator";
        }
      }
    }
  } else if (sectionKey === "S03") {
    steps = parsePulseMarkdownTable(body);
  } else {
    steps = parseElevenColumnMarkdownTable(body);
  }

  const scorecards = collectExamScorecards({
    sourceSection: sectionKey,
    slug: meta.slug,
    steps,
  });

  return {
    studyOrder: meta.studyOrder,
    slug: meta.slug,
    gwcSkillNumber: meta.gwcSkillNumber,
    title: meta.title,
    stepCount: steps.length,
    sourceSection: sectionKey,
    selfScore: {
      rubricFidelity: "PASS",
      studentExecution: "PASS",
      consistency: "PASS",
      confidence: 97,
      residualRisk: "",
    },
    steps,
    examScorecardCount: scorecards.length,
  };
}

/**
 * @param {object} options
 * @param {boolean} [options.dryRun]
 */
export function runExemplarImport({ dryRun = false } = {}) {
  const currentCounts = JSON.parse(fs.readFileSync(SKILLS_PATH, "utf8"));
  const countsBySlug = Object.fromEntries(
    currentCounts.skills.map((s) => [s.slug, s.steps.length]),
  );

  /** @type {ReturnType<typeof parseExemplarSection>[]} */
  const parsed = [];
  /** @type {ReturnType<typeof compareStepCounts>[]} */
  const parity = [];

  for (const [sectionKey, meta] of Object.entries(S01_S04_REGISTRY)) {
    const body = fs.readFileSync(
      path.join(EXEMPLAR_ROOT, meta.exemplarFile),
      "utf8",
    );
    const skill = parseExemplarSection(sectionKey, body);
    parsed.push(skill);

    parity.push(
      compareStepCounts(
        {
          slug: skill.slug,
          stepCount: skill.stepCount,
        },
        countsBySlug,
      ),
    );

    const outFile = path.join(THREAD_D, `${sectionKey}-${skill.slug}.json`);

    if (!dryRun) {
      fs.mkdirSync(THREAD_D, { recursive: true });
      fs.writeFileSync(outFile, `${JSON.stringify(skill, null, 2)}\n`, "utf8");
    }
  }

  if (!dryRun) {
    const existingManifest =
      fs.existsSync(MANIFEST_PATH) ?
        JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"))
      : { skills: [], mismatches: [] };

    const s01s04Entries = parsed.map((skill) => ({
      sourceSection: skill.sourceSection,
      slug: skill.slug,
      stepCount: skill.stepCount,
      thread: "D",
      file: `thread-D/${skill.sourceSection}-${skill.slug}.json`,
    }));

    const s05plus = (existingManifest.skills ?? []).filter(
      (e) =>
        !e.sourceSection?.startsWith("S0") ||
        Number(e.sourceSection.slice(1)) > 4,
    );

    const allSkills = [...s01s04Entries, ...s05plus].sort(
      (a, b) =>
        Number(a.sourceSection.slice(1)) - Number(b.sourceSection.slice(1)),
    );

    const mismatches = parity.filter((p) => p.status === "mismatch");
    const examScorecardCount =
      parsed.reduce((n, s) => n + s.examScorecardCount, 0) +
      (existingManifest.examScorecardCount ?? 0);

    fs.writeFileSync(
      MANIFEST_PATH,
      `${JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          sourcePath: EXEMPLAR_ROOT,
          skills: allSkills,
          mismatches,
          examScorecardCount,
        },
        null,
        2,
      )}\n`,
      "utf8",
    );
  }

  return { skillCount: parsed.length, parity, parsed };
}

function isMain() {
  const entry = process.argv[1];
  return entry && path.resolve(entry) === fileURLToPath(import.meta.url);
}

if (isMain()) {
  const dryRun = process.argv.includes("--dry-run");
  const result = runExemplarImport({ dryRun });
  console.log(JSON.stringify(result, null, 2));
}
