/**
 * Parse FINAL-PASS-S05-S22-COMPLETE.md PASTE-READY TSV blocks → staging JSON.
 *
 * Run:
 *   node scripts/import-final-pass.mjs
 *   node scripts/import-final-pass.mjs --thread A
 *   node scripts/import-final-pass.mjs --dry-run
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DEFAULT_SOURCE = path.resolve(
  ROOT,
  "../LMCC CNA Skills - Student Study Guide 6-21-2026/FINAL-PASS-S05-S22-COMPLETE.md",
);
const STAGING_ROOT = path.join(ROOT, "imports/final-pass");

/** @type {Record<string, { studyOrder: number; gwcSkillNumber: number; slug: string; thread: "A"|"B"|"C" }>} */
export const SKILL_REGISTRY = {
  S05: {
    studyOrder: 5,
    gwcSkillNumber: 22,
    slug: "manual-blood-pressure",
    thread: "A",
  },
  S06: {
    studyOrder: 6,
    gwcSkillNumber: 13,
    slug: "weight-ambulatory-client",
    thread: "A",
  },
  S07: {
    studyOrder: 7,
    gwcSkillNumber: 12,
    slug: "urinary-output-measurement",
    thread: "A",
  },
  S08: {
    studyOrder: 8,
    gwcSkillNumber: 16,
    slug: "position-on-side",
    thread: "A",
  },
  S09: {
    studyOrder: 9,
    gwcSkillNumber: 21,
    slug: "bed-wheelchair-transfer",
    thread: "A",
  },
  S10: {
    studyOrder: 10,
    gwcSkillNumber: 3,
    slug: "ambulate-transfer-belt",
    thread: "A",
  },
  S11: {
    studyOrder: 11,
    gwcSkillNumber: 15,
    slug: "prom-shoulder",
    thread: "B",
  },
  S12: {
    studyOrder: 12,
    gwcSkillNumber: 14,
    slug: "prom-knee-ankle",
    thread: "B",
  },
  S13: {
    studyOrder: 13,
    gwcSkillNumber: 2,
    slug: "knee-high-stocking",
    thread: "B",
  },
  S14: {
    studyOrder: 14,
    gwcSkillNumber: 11,
    slug: "modified-bed-bath",
    thread: "B",
  },
  S15: { studyOrder: 15, gwcSkillNumber: 19, slug: "mouth-care", thread: "B" },
  S16: {
    studyOrder: 16,
    gwcSkillNumber: 5,
    slug: "denture-cleaning",
    thread: "B",
  },
  S17: {
    studyOrder: 17,
    gwcSkillNumber: 18,
    slug: "foot-care-one-foot",
    thread: "B",
  },
  S18: {
    studyOrder: 18,
    gwcSkillNumber: 9,
    slug: "dress-weak-right-arm",
    thread: "C",
  },
  S19: {
    studyOrder: 19,
    gwcSkillNumber: 10,
    slug: "feed-client-dependence",
    thread: "C",
  },
  S20: {
    studyOrder: 20,
    gwcSkillNumber: 4,
    slug: "bedpan-assist",
    thread: "C",
  },
  S21: {
    studyOrder: 21,
    gwcSkillNumber: 20,
    slug: "perineal-care-female",
    thread: "C",
  },
  S22: {
    studyOrder: 22,
    gwcSkillNumber: 17,
    slug: "catheter-care-female",
    thread: "C",
  },
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

const DIVIDER_SEGMENT = {
  "OPEN DIVIDER": "open",
  "CORE DIVIDER": "core",
  "CLOSE DIVIDER": "close",
};

/**
 * @param {string} line
 * @returns {string[]}
 */
export function splitTsvLine(line) {
  return line.split("\t");
}

/**
 * @param {string} markdown
 * @returns {Map<string, string>}
 */
export function extractSections(markdown) {
  const sections = new Map();
  const parts = markdown.split(/^## SECTION /m);
  for (const part of parts.slice(1)) {
    const sectionKey = part.slice(0, 3);
    if (/^S\d{2}$/.test(sectionKey)) {
      sections.set(sectionKey, part);
    }
  }
  return sections;
}

/**
 * @param {string} sectionBody
 */
export function extractTsvBlock(sectionBody) {
  const match = sectionBody.match(
    /### PASTE-READY TSV\r?\n(?:\r?\n)?```\r?\n([\s\S]*?)```/,
  );
  if (!match) {
    throw new Error("PASTE-READY TSV block not found");
  }
  return match[1].trimEnd();
}

/**
 * @param {string} sectionBody
 */
export function parseSectionHeader(sectionBody, sectionKey = "") {
  const headerLine = sectionBody.split("\n")[0].trim();
  const m = headerLine.match(
    /^(?:S(\d{2}) )?— GWC Skill (\d+) · (.+) \((\d+) steps\)\s*$/,
  );
  if (!m) {
    throw new Error(`Unrecognized section header: ${headerLine}`);
  }
  const studyNum = m[1] ?? sectionKey.replace(/^S/, "");
  return {
    sourceSection: sectionKey || `S${studyNum}`,
    gwcSkillNumber: Number(m[2]),
    title: m[3].trim(),
    declaredStepCount: Number(m[4]),
  };
}

/**
 * @param {string} sectionBody
 */
export function parseSelfScore(sectionBody) {
  const blockMatch = sectionBody.match(
    /### SELF-SCORE\r?\n([\s\S]*?)(?:\r?\n---|\r?\n## SECTION |$)/,
  );
  const block = blockMatch?.[1] ?? "";

  const pick = (label) => {
    const re = new RegExp(`${label}:\\s*\\*?\\*?(PASS|FAIL)\\*?\\*?`, "i");
    return block.match(re)?.[1]?.toUpperCase() ?? "";
  };

  const confidenceMatch = block.match(/Confidence:\s*\*?\*?(\d{2,3})\*?\*?/i);
  const residualMatch = block.match(
    /residual risk[:\s—-]+(.+?)(?:\.\s*$|\.$)/im,
  );

  return {
    rubricFidelity: pick("Rubric fidelity") || pick("rubric fidelity"),
    studentExecution:
      pick("Student-execution test") || pick("student-execution test"),
    consistency: pick("Consistency") || pick("consistency"),
    confidence: confidenceMatch ? Number(confidenceMatch[1]) : null,
    residualRisk: residualMatch?.[1]?.trim() ?? "",
  };
}

/**
 * @param {string} tsv
 */
export function parseTsvSteps(tsv) {
  const lines = tsv.split(/\r?\n/).filter((line) => line.trim().length > 0);
  /** @type {"open"|"core"|"close"} */
  let currentSegment = "open";
  /** @type {import("./import-final-pass.types").StagingStep[]} */
  const steps = [];

  for (const line of lines) {
    const cols = splitTsvLine(line);
    const first = (cols[0] ?? "").trim();

    if (first === "Step #") {
      continue;
    }

    if (first in DIVIDER_SEGMENT) {
      currentSegment = /** @type {"open"|"core"|"close"} */ (
        DIVIDER_SEGMENT[first]
      );
      continue;
    }

    const stepId = Number(first);
    if (!Number.isFinite(stepId)) {
      continue;
    }

    const row = Object.fromEntries(
      TSV_COLUMNS.map((key, i) => [key, (cols[i] ?? "").trim()]),
    );

    const subSteps =
      row.subStepsRaw ?
        row.subStepsRaw
          .split("|")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    /** @type {import("./import-final-pass.types").StagingStep} */
    const step = {
      id: stepId,
      segment: currentSegment,
      stepText: row.stepText,
      detailedTagText: row.detailedTagText,
      tagCategory: row.tagCategory,
      phaseWord: row.phaseWord,
      clinicalNote: row.clinicalNote,
      subSteps,
      criticalCategory: row.criticalCategory,
      examScorecard: row.examScorecard,
      icon: row.icon,
    };

    if (row.boilerplateId) {
      step.boilerplateId = row.boilerplateId;
    }

    steps.push(step);
  }

  return steps;
}

/**
 * @param {string} sectionKey
 * @param {string} sectionBody
 */
export function parseSkillSection(sectionKey, sectionBody) {
  const meta = SKILL_REGISTRY[sectionKey];
  if (!meta) {
    throw new Error(`Unknown section key: ${sectionKey}`);
  }

  const header = parseSectionHeader(sectionBody, sectionKey);
  const tsv = extractTsvBlock(sectionBody);
  const steps = parseTsvSteps(tsv);
  const selfScore = parseSelfScore(sectionBody);

  if (steps.length !== header.declaredStepCount) {
    throw new Error(
      `${sectionKey}: parsed ${steps.length} steps but header declares ${header.declaredStepCount}`,
    );
  }

  const longStepText = steps.filter(
    (s) => s.stepText.split(/\s+/).filter(Boolean).length > 6,
  );

  return {
    studyOrder: meta.studyOrder,
    slug: meta.slug,
    gwcSkillNumber: meta.gwcSkillNumber,
    title: header.title,
    stepCount: steps.length,
    sourceSection: sectionKey,
    selfScore: {
      ...selfScore,
      ...(longStepText.length ?
        {
          residualRisk: [
            selfScore.residualRisk,
            `Steps exceeding 6-word cue: ${longStepText.map((s) => s.id).join(", ")}`,
          ]
            .filter(Boolean)
            .join("; "),
        }
      : {}),
    },
    steps,
  };
}

/**
 * @param {string} markdown
 */
export function parseFinalPassDocument(markdown) {
  const sections = extractSections(markdown);
  /** @type {Record<string, ReturnType<typeof parseSkillSection>>} */
  const skills = {};

  for (const [key, body] of sections) {
    if (key in SKILL_REGISTRY) {
      skills[key] = parseSkillSection(key, body);
    }
  }

  return skills;
}

/**
 * @param {string} skillsJsonPath
 */
export function loadSkillsJsonStepCounts(skillsJsonPath) {
  const bundle = JSON.parse(fs.readFileSync(skillsJsonPath, "utf8"));
  /** @type {Record<string, number>} */
  const counts = {};
  for (const skill of bundle.skills) {
    counts[skill.slug] = skill.steps.length;
  }
  return counts;
}

/**
 * @param {ReturnType<typeof parseSkillSection>} skill
 * @param {Record<string, number>} currentCounts
 */
export function compareStepCounts(skill, currentCounts) {
  const current = currentCounts[skill.slug];
  if (current === undefined) {
    return {
      slug: skill.slug,
      current: null,
      finalPass: skill.stepCount,
      status: "missing",
    };
  }
  if (current === skill.stepCount) {
    return {
      slug: skill.slug,
      current,
      finalPass: skill.stepCount,
      status: "ok",
    };
  }
  return {
    slug: skill.slug,
    current,
    finalPass: skill.stepCount,
    status: "mismatch",
  };
}

/**
 * @param {ReturnType<typeof parseSkillSection>} skill
 */
export function collectExamScorecards(skill) {
  return skill.steps
    .filter((s) => s.examScorecard)
    .map((s) => ({
      sourceSection: skill.sourceSection,
      slug: skill.slug,
      stepId: s.id,
      examScorecard: s.examScorecard,
    }));
}

/**
 * @param {object} options
 * @param {string} [options.sourcePath]
 * @param {string|null} [options.thread] A|B|C
 * @param {boolean} [options.dryRun]
 */
export function runImport({
  sourcePath = DEFAULT_SOURCE,
  thread = null,
  dryRun = false,
} = {}) {
  const markdown = fs.readFileSync(sourcePath, "utf8");
  const parsed = parseFinalPassDocument(markdown);
  const currentCounts = loadSkillsJsonStepCounts(
    path.join(ROOT, "data/skills.json"),
  );

  /** @type {ReturnType<typeof collectExamScorecards>[]} */
  const allScorecards = [];
  /** @type {ReturnType<typeof compareStepCounts>[]} */
  const parity = [];

  for (const [sectionKey, skill] of Object.entries(parsed)) {
    const reg = SKILL_REGISTRY[sectionKey];
    if (thread && reg.thread !== thread) {
      continue;
    }

    parity.push(compareStepCounts(skill, currentCounts));
    allScorecards.push(...collectExamScorecards(skill));

    const outDir = path.join(STAGING_ROOT, `thread-${reg.thread}`);
    const outFile = path.join(outDir, `${sectionKey}-${skill.slug}.json`);

    if (!dryRun) {
      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(outFile, `${JSON.stringify(skill, null, 2)}\n`, "utf8");
    }
  }

  const mismatches = parity.filter((p) => p.status === "mismatch");
  const summary = {
    generatedAt: new Date().toISOString(),
    sourcePath,
    thread: thread ?? "ALL",
    skillCount: Object.keys(parsed).filter(
      (k) => !thread || SKILL_REGISTRY[k].thread === thread,
    ).length,
    mismatches,
    examScorecards: allScorecards,
    parity,
  };

  if (!dryRun && !thread) {
    fs.mkdirSync(STAGING_ROOT, { recursive: true });
    fs.writeFileSync(
      path.join(STAGING_ROOT, "manifest.json"),
      `${JSON.stringify(
        {
          generatedAt: summary.generatedAt,
          sourcePath,
          skills: Object.values(parsed).map((s) => ({
            sourceSection: s.sourceSection,
            slug: s.slug,
            stepCount: s.stepCount,
            thread: SKILL_REGISTRY[s.sourceSection].thread,
            file: `thread-${SKILL_REGISTRY[s.sourceSection].thread}/${s.sourceSection}-${s.slug}.json`,
          })),
          mismatches,
          examScorecardCount: allScorecards.length,
        },
        null,
        2,
      )}\n`,
      "utf8",
    );

    for (const t of ["A", "B", "C"]) {
      const threadSkills = Object.entries(parsed).filter(
        ([k]) => SKILL_REGISTRY[k].thread === t,
      );
      const threadParity = threadSkills.map(([k, s]) =>
        compareStepCounts(s, currentCounts),
      );
      const threadScorecards = threadSkills.flatMap(([, s]) =>
        collectExamScorecards(s),
      );
      const md = [
        `# Thread ${t} — FINAL-PASS staging summary`,
        "",
        `Generated: ${summary.generatedAt}`,
        "",
        "## Step-count parity vs skills.json",
        "",
        "| Section | Slug | skills.json | FINAL-PASS | Status |",
        "| --- | --- | ---: | ---: | --- |",
        ...threadParity.map(
          (p) =>
            `| ${Object.entries(SKILL_REGISTRY).find(([, v]) => v.slug === p.slug)?.[0] ?? "?"} | \`${p.slug}\` | ${p.current ?? "—"} | ${p.finalPass} | ${p.status === "mismatch" ? "**MISMATCH**" : p.status} |`,
        ),
        "",
        "## Exam Scorecard rows",
        "",
        threadScorecards.length ?
          [
            "| Section | Slug | stepId | Exam Scorecard |",
            "| --- | --- | ---: | --- |",
            ...threadScorecards.map(
              (r) =>
                `| ${r.sourceSection} | \`${r.slug}\` | ${r.stepId} | ${r.examScorecard} |`,
            ),
          ].join("\n")
        : "_No exam scorecard rows in this thread._",
        "",
      ].join("\n");

      fs.writeFileSync(
        path.join(STAGING_ROOT, `thread-${t}`, `thread-${t}-summary.md`),
        md,
        "utf8",
      );
    }
  }

  return summary;
}

function isMain() {
  const entry = process.argv[1];
  return entry && path.resolve(entry) === fileURLToPath(import.meta.url);
}

if (isMain()) {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const threadArg = args.find((a) => a.startsWith("--thread"));
  const thread =
    threadArg?.includes("=") ? threadArg.split("=")[1]?.toUpperCase()
    : args.includes("--thread") ?
      args[args.indexOf("--thread") + 1]?.toUpperCase()
    : null;

  if (thread && !["A", "B", "C"].includes(thread)) {
    console.error(`Invalid --thread value: ${thread}`);
    process.exit(1);
  }

  const summary = runImport({ thread, dryRun });
  console.log(
    JSON.stringify(
      {
        thread: summary.thread,
        skillCount: summary.skillCount,
        mismatches: summary.mismatches,
        examScorecardCount: summary.examScorecards.length,
        dryRun,
      },
      null,
      2,
    ),
  );
}
