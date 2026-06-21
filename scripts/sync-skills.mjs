#!/usr/bin/env node
/** Sync web skill bundle from master_course_database.json (monorepo) or validate existing data/skills.json */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outPath = path.join(root, "data", "skills.json");

const dbCandidates = [
  path.join(root, "..", "Educator_Mastermind", "master_course_database.json"),
  path.join(root, "data", "master_course_database.json"),
];

function mapStep(step) {
  if (step.sub_lines?.length) {
    const lead =
      step.display_lead ??
      (step.text.includes(":") ?
        step.text.slice(0, step.text.indexOf(":") + 1)
      : step.text);
    return {
      id: step.number,
      text: lead.trim(),
      subSteps: step.sub_lines,
    };
  }

  const notes = step.note_lines ?? step.wrap_lines;
  if (notes?.length && step.display_lead) {
    return {
      id: step.number,
      text: step.display_lead.trim(),
      note: notes[0],
    };
  }

  return { id: step.number, text: step.text.trim() };
}

function slugFromFile(file) {
  return file.replace(/^\d+-/, "").replace(/\.md$/, "");
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

const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));
const byFile = new Map(db.skills.map((s) => [s.file, s]));

const skills = db.skills.map((skill) => {
  const prevSlug = skill.prev_file ? slugFromFile(skill.prev_file) : null;
  const nextSlug = skill.next_file ? slugFromFile(skill.next_file) : null;

  return {
    slug: skill.slug,
    file: skill.file,
    studyOrder: skill.study_order,
    examSkillNumber: skill.exam_skill_number,
    examCardLabel: skill.exam_card_label,
    title: skill.title,
    section: skill.section,
    rtcVideoUrl: skill.rtc_video_url || null,
    rtcVideoTitle: skill.rtc_video_title || null,
    prevSlug,
    nextSlug,
    storageKey: storageKeyFromFile(skill.file),
    stepCount: skill.checklist_step_count,
    steps: skill.checklist_steps.map(mapStep),
  };
});

if (skills.length !== 22) {
  throw new Error(`Expected 22 skills, got ${skills.length}`);
}

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(
  outPath,
  JSON.stringify({ generatedAt: new Date().toISOString(), skills }, null, 2),
  "utf8",
);
console.log(`Wrote ${skills.length} skills to ${outPath}`);
