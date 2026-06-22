#!/usr/bin/env node
/** Patch master_course_database.json checklist steps to canonical boilerplate */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  applyStructuralChecklistFixes,
  normalizeChecklistStep,
} from "./checklist-boilerplate.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const dbCandidates = [
  path.join(root, "..", "Educator_Mastermind", "master_course_database.json"),
  path.join(root, "data", "master_course_database.json"),
];

const dbPath = dbCandidates.find((p) => fs.existsSync(p));
if (!dbPath) {
  console.error("master_course_database.json not found");
  process.exit(1);
}

const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));
let patchCount = 0;

for (let i = 0; i < db.skills.length; i++) {
  const skill = db.skills[i];
  if (!Array.isArray(skill.checklist_steps)) {
    continue;
  }

  const structural = applyStructuralChecklistFixes(skill);
  const steps = structural.checklist_steps.map((step) => {
    const before = JSON.stringify(step);
    const normalized = normalizeChecklistStep(step);
    if (before !== JSON.stringify(normalized)) {
      patchCount += 1;
    }
    return normalized;
  });

  db.skills[i] = {
    ...structural,
    checklist_steps: steps,
    checklist_step_count: steps.length,
  };
}

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), "utf8");
console.log(`Normalized ${patchCount} checklist step(s) in ${dbPath}`);
