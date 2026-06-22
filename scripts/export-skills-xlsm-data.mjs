/**
 * Flat export payload for LMCC CNA skills → Excel (.xlsm builder).
 * Run: node --experimental-strip-types scripts/export-skills-xlsm-data.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import skillsBundle from "../data/skills.json" with { type: "json" };
import {
  getModuleForSlug,
  getPhaseWordForStep,
  skillCurriculumMeta,
} from "../data/skillCurriculum.ts";
import { getExamScorecard } from "../lib/exam-scorecard.ts";
import { getCriticalStepCategory } from "../lib/critical-steps.ts";
import { CHECKLIST_BOILERPLATE } from "./checklist-boilerplate.mjs";

const SEGMENT_SHORT_LABELS = {
  open: "OPEN",
  core: "CORE",
  close: "CLOSE",
};

function resolveStepDisplayText(step) {
  if (step.boilerplateId && CHECKLIST_BOILERPLATE[step.boilerplateId]) {
    return CHECKLIST_BOILERPLATE[step.boilerplateId];
  }
  return step.text;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

/** Bookend tag role (matches demo BOILERPLATES type: o | k | c) */
const TAG_CATEGORY_BY_ID = {
  INTRO_EXPLAIN: { code: "o", label: "Opening" },
  INTRO_IDENTIFY: { code: "o", label: "Opening" },
  IDENTIFY: { code: "o", label: "Opening" },
  "1of1-OPEN": { code: "o", label: "Opening" },
  PRIVACY: { code: "o", label: "Opening" },
  WATER_CHECK: { code: "o", label: "Opening" },
  HAND_HYGIENE: { code: "k", label: "Key Procedure" },
  GLOVE_DON: { code: "k", label: "Key Procedure" },
  GLOVE_REMOVE: { code: "k", label: "Key Procedure" },
  GLOVE_REMOVE_THEN_HH: { code: "k", label: "Key Procedure" },
  CALL_LIGHT: { code: "c", label: "Closing" },
  BED_LOW: { code: "c", label: "Closing" },
};

function tagDetail(boilerplateId) {
  if (!boilerplateId) {
    return { id: "", detailedText: "", categoryCode: "", categoryLabel: "" };
  }
  const detailedText = CHECKLIST_BOILERPLATE[boilerplateId] ?? "";
  const cat = TAG_CATEGORY_BY_ID[boilerplateId] ?? {
    code: "",
    label: "",
  };
  return {
    id: boilerplateId,
    detailedText,
    categoryCode: cat.code,
    categoryLabel: cat.label,
  };
}

function examScorecardLabel(slug, stepId) {
  const entry = getExamScorecard(slug, stepId);
  if (!entry) {
    return "";
  }
  const detail = entry.detail ? ` (${entry.detail})` : "";
  return `${entry.eyebrow}: ${entry.headline} ${entry.value}${detail}`;
}

const skills = [...skillsBundle.skills].sort(
  (a, b) => a.studyOrder - b.studyOrder,
);

const payload = {
  generatedAt: new Date().toISOString(),
  source: "local-checklist-preview/data/skills.json",
  pathwayTagline: skillsBundle.pathwayTagline,
  tagLegend: TAG_CATEGORY_BY_ID,
  segmentOrder: ["open", "core", "close"],
  segmentLabels: SEGMENT_SHORT_LABELS,
  skills: skills.map((skill) => {
    const meta = skillCurriculumMeta[skill.slug];
    const module = getModuleForSlug(skill.slug);
    const steps = skill.steps.map((step) => {
      const displayText = resolveStepDisplayText(step);
      const tag = tagDetail(step.boilerplateId);
      return {
        id: step.id,
        text: displayText,
        rawText: step.text,
        segment: step.segment ?? "core",
        segmentLabel: SEGMENT_SHORT_LABELS[step.segment ?? "core"],
        boilerplateId: step.boilerplateId ?? "",
        detailedTagText: tag.detailedText,
        tagCategoryCode: tag.categoryCode,
        tagCategoryLabel: tag.categoryLabel,
        phaseWord: meta ? getPhaseWordForStep(meta, step.id) : "",
        note: step.note ?? "",
        subSteps: step.subSteps ?? [],
        criticalCategory: getCriticalStepCategory(displayText) ?? "",
        examScorecard: examScorecardLabel(skill.slug, step.id),
      };
    });

    return {
      slug: skill.slug,
      studyOrder: skill.studyOrder,
      examSkillNumber: skill.examSkillNumber,
      examCardLabel: skill.examCardLabel,
      title: skill.title,
      section: skill.section,
      moduleVerb: module?.verb ?? "",
      template: meta?.template ?? "",
      templateTier: meta?.tier ?? "",
      stepCount: skill.stepCount,
      steps,
    };
  }),
};

const outPath = path.join(root, "exports", "skills-xlsm-payload.json");
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(payload, null, 2), "utf8");
console.log(`Wrote ${outPath} (${payload.skills.length} skills)`);
