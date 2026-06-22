/**
 * Merge FINAL-PASS staging JSON (S01–S22) into data/skills.json.
 *
 * Run after thread A/B/C staging is complete:
 *   node scripts/merge-final-pass.mjs
 *   node scripts/merge-final-pass.mjs --dry-run
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const STAGING_ROOT = path.join(ROOT, "imports/final-pass");
const SKILLS_PATH = path.join(ROOT, "data/skills.json");
const MANIFEST_PATH = path.join(STAGING_ROOT, "manifest.json");

/** Composite close-step IDs from FINAL-PASS (GWC merged call-light + bed-low; PPE video-warning HH). */
export const COMPOSITE_BOILERPLATE_IDS = new Set([
  "BED_LOW|CALL_LIGHT",
  "HAND_HYGIENE|VIDEO_WARNING",
]);

/**
 * @param {import("./import-final-pass.types").StagingStep} stagingStep
 */
export function mapStagingStepToChecklist(stagingStep) {
  /** @type {Record<string, unknown>} */
  const out = {
    id: stagingStep.id,
    text: stagingStep.stepText,
    segment: stagingStep.segment,
  };

  const note = stagingStep.clinicalNote?.trim();
  if (note) {
    out.note = note;
  }

  if (stagingStep.subSteps?.length) {
    out.subSteps = stagingStep.subSteps;
  }

  const bpId = stagingStep.boilerplateId?.trim();
  if (bpId) {
    out.boilerplateId = bpId;
  }

  const detailedText = stagingStep.detailedTagText?.trim();
  if (detailedText) {
    out.detailedText = detailedText;
  }

  const tagCategory = stagingStep.tagCategory?.trim();
  if (tagCategory) {
    out.tagCategory = tagCategory;
  }

  const criticalCategory = stagingStep.criticalCategory?.trim();
  if (criticalCategory) {
    out.criticalCategory = criticalCategory;
  }

  const examScorecard = stagingStep.examScorecard?.trim();
  if (examScorecard) {
    out.examScorecard = examScorecard;
  }

  const phaseWord = stagingStep.phaseWord?.trim();
  if (phaseWord) {
    out.phaseWord = phaseWord;
  }

  return out;
}

/**
 * @param {object} options
 * @param {boolean} [options.dryRun]
 */
export function mergeFinalPass({ dryRun = false } = {}) {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
  const bundle = JSON.parse(fs.readFileSync(SKILLS_PATH, "utf8"));

  /** @type {Array<{ slug: string; sourceSection: string; oldCount: number; newCount: number }>} */
  const merged = [];

  for (const entry of manifest.skills) {
    const stagingFile = path.join(STAGING_ROOT, entry.file);
    if (!fs.existsSync(stagingFile)) {
      throw new Error(`Missing staging file: ${stagingFile}`);
    }

    const staging = JSON.parse(fs.readFileSync(stagingFile, "utf8"));
    if (staging.steps.length !== entry.stepCount) {
      throw new Error(
        `${entry.slug}: staging steps ${staging.steps.length} !== manifest ${entry.stepCount}`,
      );
    }

    const skill = bundle.skills.find((s) => s.slug === entry.slug);
    if (!skill) {
      throw new Error(`skills.json missing slug: ${entry.slug}`);
    }

    const oldCount = skill.steps.length;
    skill.steps = staging.steps.map(mapStagingStepToChecklist);
    skill.stepCount = entry.stepCount;

    merged.push({
      slug: entry.slug,
      sourceSection: entry.sourceSection,
      oldCount,
      newCount: entry.stepCount,
    });
  }

  if (!dryRun) {
    fs.writeFileSync(
      SKILLS_PATH,
      `${JSON.stringify(bundle, null, 2)}\n`,
      "utf8",
    );
  }

  return {
    skillCount: merged.length,
    merged,
    mismatches: manifest.mismatches ?? [],
  };
}

function isMain() {
  const entry = process.argv[1];
  return entry && path.resolve(entry) === fileURLToPath(import.meta.url);
}

if (isMain()) {
  const dryRun = process.argv.includes("--dry-run");
  const result = mergeFinalPass({ dryRun });
  console.log(JSON.stringify(result, null, 2));
}
