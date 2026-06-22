/**
 * Normalize fixing-json/boilerplate_tags.json → data/boilerplate-tags.json.
 * Canonical authored file: fixing-json/boilerplate_tags.json (from xlsx export).
 *
 *   node scripts/import-boilerplate-tags.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SOURCE = path.join(ROOT, "fixing-json", "boilerplate_tags.json");
const OUT = path.join(ROOT, "data", "boilerplate-tags.json");

function str(v) {
  if (v === null || v === undefined) {
    return null;
  }
  const t = String(v).trim();
  return t.length > 0 ? t : null;
}

function parseSubSteps(raw) {
  const text = str(raw);
  if (!text) {
    return null;
  }
  const parts = text
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts : null;
}

if (!fs.existsSync(SOURCE)) {
  console.error(`Missing canonical source: ${SOURCE}`);
  process.exit(1);
}

/** @type {Array<Record<string, unknown>>} */
const rows = JSON.parse(fs.readFileSync(SOURCE, "utf8"));

/** @type {Record<string, object[]>} */
const tagsByBoilerplateId = {};

for (const row of rows) {
  const boilerplateId = str(row.boilerplate_tag_id ?? row.boilerplateId);
  if (!boilerplateId) {
    continue;
  }

  const entry = {
    tagKey: str(row.tag ?? row.tagKey),
    boilerplateId,
    rendersAs: str(row.renders_as ?? row.rendersAs),
    whyRule: str(row.why_your_rule ?? row.whyRule),
    stepTextCue: str(row.step_text ?? row.stepTextCue),
    detailedText: str(row.detailed_tag_text ?? row.detailedText),
    tagCategory: str(row.tag_category ?? row.tagCategory),
    phaseWord: str(row.phase_word ?? row.phaseWord),
    clinicalNote: str(row.clinical_note ?? row.clinicalNote),
    subSteps: parseSubSteps(row.sub_steps ?? row.subSteps),
    criticalCategory: str(row.critical_category ?? row.criticalCategory),
    examScorecard: str(row.exam_scorecard ?? row.examScorecard),
  };

  if (!tagsByBoilerplateId[boilerplateId]) {
    tagsByBoilerplateId[boilerplateId] = [];
  }
  tagsByBoilerplateId[boilerplateId].push(entry);
}

const bundle = {
  generatedAt: new Date().toISOString(),
  source: "fixing-json/boilerplate_tags.json",
  rowCount: rows.length,
  tagsByBoilerplateId,
};

fs.writeFileSync(OUT, `${JSON.stringify(bundle, null, 2)}\n`, "utf8");
console.log(
  `Wrote ${OUT} (${rows.length} rows, ${Object.keys(tagsByBoilerplateId).length} boilerplate ids)`,
);
