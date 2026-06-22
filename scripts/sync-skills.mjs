#!/usr/bin/env node
/** Sync web skill bundle from master_course_database.json + pedagogical-order.json */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { normalizeBoilerplateText } from "./checklist-boilerplate.mjs";
import { applyStructuralChecklistFixes } from "./checklist-boilerplate.mjs";
import {
  enrichChecklistStep,
  validateSkillStepSegments,
} from "./checklist-step-meta.mjs";
import { mapStagingStepToChecklist } from "./merge-final-pass.mjs";

function dbStepFields(step) {
  const segment =
    (
      step.segment === "open" ||
      step.segment === "core" ||
      step.segment === "close"
    ) ?
      step.segment
    : undefined;
  const boilerplateId = step.boilerplate_id ?? step.boilerplateId;
  return { segment, boilerplateId };
}

function mapStepPartial(step, normalized, extra = {}) {
  const { segment, boilerplateId } = dbStepFields(step);
  return {
    id: normalized.number,
    ...extra,
    ...(segment ? { segment } : {}),
    ...(boilerplateId ? { boilerplateId } : {}),
  };
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outPath = path.join(root, "data", "skills.json");
const pedagogicalPath = path.join(root, "data", "pedagogical-order.json");

const dbCandidates = [
  path.join(root, "..", "Educator_Mastermind", "master_course_database.json"),
  path.join(root, "data", "master_course_database.json"),
];

function mapStep(step, ctx) {
  const normalized = {
    ...step,
    text: normalizeBoilerplateText(step.text ?? ""),
    display_lead:
      step.display_lead ?
        normalizeBoilerplateText(step.display_lead)
      : step.display_lead,
  };

  if (normalized.sub_lines?.length) {
    const lead =
      normalized.display_lead ??
      (normalized.text.includes(":") ?
        normalized.text.slice(0, normalized.text.indexOf(":") + 1)
      : normalized.text);
    return enrichChecklistStep(
      mapStepPartial(step, normalized, {
        text: lead.trim(),
        subSteps: normalized.sub_lines,
      }),
      ctx,
    );
  }

  const notes = normalized.note_lines ?? normalized.wrap_lines;
  if (notes?.length && normalized.display_lead) {
    return enrichChecklistStep(
      mapStepPartial(step, normalized, {
        text: normalized.display_lead.trim(),
        note: notes[0],
      }),
      ctx,
    );
  }

  return enrichChecklistStep(
    mapStepPartial(step, normalized, {
      text: normalized.text.trim(),
    }),
    ctx,
  );
}

function storageKeyFromFile(file) {
  return `checklist-${file.replace(/\.md$/, "")}`;
}

const dbPath = dbCandidates.find((p) => fs.existsSync(p));
if (!dbPath) {
  if (fs.existsSync(outPath)) {
    console.log(`No DB found; keeping existing ${outPath}`);
    process.exit(0);
  }
  throw new Error(
    "master_course_database.json not found and data/skills.json missing",
  );
}

if (!fs.existsSync(pedagogicalPath)) {
  throw new Error(`Missing pedagogical order: ${pedagogicalPath}`);
}

const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));
const pedagogical = JSON.parse(fs.readFileSync(pedagogicalPath, "utf8"));
const pedagogicalBySlug = new Map(
  pedagogical.skills.map((entry) => [entry.slug, entry]),
);

if (pedagogical.skills.length !== 22) {
  throw new Error(
    `Expected 22 pedagogical entries, got ${pedagogical.skills.length}`,
  );
}

const dbBySlug = new Map(db.skills.map((skill) => [skill.slug, skill]));

for (const entry of pedagogical.skills) {
  if (!dbBySlug.has(entry.slug)) {
    throw new Error(`Pedagogical slug missing from DB: ${entry.slug}`);
  }
}

const orderedSlugs = [...pedagogical.skills]
  .sort((a, b) => a.studyOrder - b.studyOrder)
  .map((entry) => entry.slug);

const skills = orderedSlugs.map((slug, index) => {
  const skill = applyStructuralChecklistFixes(dbBySlug.get(slug));
  const ped = pedagogicalBySlug.get(slug);
  const prevSlug = index > 0 ? orderedSlugs[index - 1] : null;
  const nextSlug =
    index < orderedSlugs.length - 1 ? orderedSlugs[index + 1] : null;
  const template = skill.template ?? "T1";
  const totalSteps = skill.checklist_step_count;

  const steps = skill.checklist_steps.map((step, stepIndex) =>
    mapStep(step, { slug: skill.slug, template, stepIndex, totalSteps }),
  );

  return {
    slug: skill.slug,
    file: skill.file,
    studyOrder: ped.studyOrder,
    examSkillNumber: skill.exam_skill_number,
    examCardLabel: skill.exam_card_label,
    title: ped.officialTitle,
    section: ped.section,
    pedagogicalReason: ped.reasoning,
    rtcVideoUrl: skill.rtc_video_url || null,
    rtcVideoTitle: skill.rtc_video_title || null,
    prevSlug,
    nextSlug,
    storageKey: storageKeyFromFile(skill.file),
    stepCount: skill.checklist_step_count,
    steps,
    studentFocus: skill.student_focus ?? null,
  };
});

if (skills.length !== 22) {
  throw new Error(`Expected 22 skills, got ${skills.length}`);
}

const manifestPath = path.join(root, "imports/final-pass/manifest.json");
const stagingRoot = path.join(root, "imports/final-pass");
if (fs.existsSync(manifestPath)) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  let overlayCount = 0;
  for (const entry of manifest.skills) {
    const skill = skills.find((s) => s.slug === entry.slug);
    const stagingFile = path.join(stagingRoot, entry.file);
    if (!skill || !fs.existsSync(stagingFile)) {
      console.warn(
        `[sync:skills] FINAL-PASS skip ${entry.slug}: missing skill or staging`,
      );
      continue;
    }
    const staging = JSON.parse(fs.readFileSync(stagingFile, "utf8"));
    skill.steps = staging.steps.map(mapStagingStepToChecklist);
    skill.stepCount = entry.stepCount;
    overlayCount += 1;
  }
  console.log(
    `[sync:skills] overlaid FINAL-PASS S01–S22 (${overlayCount} skills from manifest)`,
  );
}

const validationErrors = [];
const validationWarnings = [];
for (const skill of skills) {
  const template = dbBySlug.get(skill.slug)?.template ?? "T1";
  for (const issue of validateSkillStepSegments(
    skill.slug,
    template,
    skill.steps,
  )) {
    if (issue.severity === "error") {
      validationErrors.push(issue);
    } else {
      validationWarnings.push(issue);
    }
  }
}

if (validationWarnings.length > 0) {
  console.warn(
    `[sync:skills] ${validationWarnings.length} segment outlier warning(s) (expected for peri/bedpan)`,
  );
}
if (validationErrors.length > 0) {
  console.error("[sync:skills] boilerplate segment validation failed:");
  for (const issue of validationErrors) {
    console.error(`  ${issue.slug} step ${issue.stepId}: ${issue.message}`);
  }
  process.exit(1);
}

const bundle = {
  generatedAt: new Date().toISOString(),
  pathwayTagline: pedagogical.pathwayTagline,
  sections: pedagogical.sections,
  skills,
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(bundle, null, 2), "utf8");
console.log(`Wrote ${skills.length} skills to ${outPath}`);
