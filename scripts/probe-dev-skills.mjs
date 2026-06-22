#!/usr/bin/env node
/**
 * Verify skills.json after FINAL-PASS merge (S01–S22 short cues).
 * Usage: node scripts/probe-dev-skills.mjs [--live http://localhost:3005/lmcc-cna-exam-prep/skills/manual-blood-pressure/]
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { CHECKLIST_BOILERPLATE } from "./checklist-boilerplate.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const skillsPath = path.join(root, "data", "skills.json");

const FINAL_PASS_SLUGS = new Set([
  "hand-hygiene",
  "ppe-gown-gloves",
  "radial-pulse-60-seconds",
  "respirations-60-seconds",
  "manual-blood-pressure",
  "weight-ambulatory-client",
  "urinary-output-measurement",
  "position-on-side",
  "bed-wheelchair-transfer",
  "ambulate-transfer-belt",
  "prom-shoulder",
  "prom-knee-ankle",
  "knee-high-stocking",
  "modified-bed-bath",
  "mouth-care",
  "denture-cleaning",
  "foot-care-one-foot",
  "dress-weak-right-arm",
  "feed-client-dependence",
  "bedpan-assist",
  "perineal-care-female",
  "catheter-care-female",
]);

const FORBIDDEN_EXACT = [
  "Perform proper hand hygiene.",
  "Put on gloves.",
  "Put on clean gloves",
  "Put on clean gloves.",
  "Remove gloves",
  "Remove the gloves, turning them inside out.",
  "Get water and check water temperature for safety.",
  "Provide for privacy.",
  "Introduce yourself and explain the procedure to the patient.",
  "Ensure the bed is low and locked.",
  "Place the call light or signaling device within reach of the patient.",
  "Call lights within reach and bed in low position.",
  "empty it to the toilet",
  "Measure the amount of urine at the eye level with the container on flat surface",
  "Remove gown from the patient and place in designated hamper",
  "Proceed to the arm, expose one arm and place dry towel underneath",
  "Assist the patient to put on a clean gown",
  "Record the volume within plus or minus 25 mL of the actual volume",
];

const MERGED_CLOSE =
  "Place the call light or signaling device within reach of the patient. Ensure the bed is low and locked.";

const REQUIRED = [
  {
    slug: "hand-hygiene",
    stepCount: 11,
    stepId: 1,
    text: "Introduce and identify the patient",
    boilerplateId: "INTRO_IDENTIFY",
  },
  {
    slug: "hand-hygiene",
    stepId: 5,
    text: "Lather twenty seconds minimum",
  },
  {
    slug: "ppe-gown-gloves",
    stepCount: 16,
    stepId: 11,
    boilerplateId: "HAND_HYGIENE|VIDEO_WARNING",
    text: "Perform hand hygiene now",
  },
  {
    slug: "radial-pulse-60-seconds",
    stepCount: 6,
    stepId: 4,
    text: "Call light within reach",
  },
  {
    slug: "respirations-60-seconds",
    stepCount: 5,
    stepId: 2,
    text: "Count respirations 60 seconds",
  },
  {
    slug: "manual-blood-pressure",
    stepId: 7,
    text: "Inflate cuff 160–180 mmHg",
  },
  {
    slug: "manual-blood-pressure",
    stepId: 13,
    text: "Perform hand hygiene",
  },
  { slug: "weight-ambulatory-client", stepCount: 13 },
  {
    slug: "weight-ambulatory-client",
    stepId: 12,
    text: "Document weight within ±2 lb",
  },
  {
    slug: "urinary-output-measurement",
    stepId: 3,
    text: "Don clean gloves",
  },
  {
    slug: "urinary-output-measurement",
    stepId: 9,
    text: "Remove gloves inside out",
  },
  { slug: "ppe-gown-gloves", stepId: 6, text: "Don clean gloves" },
  {
    slug: "perineal-care-female",
    stepId: 4,
    text: "Check water for safe temperature",
  },
  {
    slug: "perineal-care-female",
    stepId: 6,
    boilerplateId: "GLOVE_DON",
  },
  {
    slug: "ambulate-transfer-belt",
    stepId: 17,
    boilerplateId: "BED_LOW|CALL_LIGHT",
    text: "Call light; bed low and locked",
  },
  {
    slug: "knee-high-stocking",
    stepCount: 11,
    stepId: 10,
    boilerplateId: "BED_LOW|CALL_LIGHT",
    text: "Call light; bed low and locked",
  },
];

const bundle = JSON.parse(fs.readFileSync(skillsPath, "utf8"));
let failed = 0;

for (const skill of bundle.skills) {
  for (const step of skill.steps) {
    const text = step.text.trim();
    if (FORBIDDEN_EXACT.includes(text) && !FINAL_PASS_SLUGS.has(skill.slug)) {
      console.error(
        `FAIL ${skill.slug} step ${step.id} forbidden legacy exact: "${text.slice(0, 60)}…"`,
      );
      failed += 1;
    }
    if (text === MERGED_CLOSE) {
      console.error(
        `FAIL ${skill.slug} step ${step.id} merged CLOSE not split`,
      );
      failed += 1;
    }
  }
}

for (const req of REQUIRED) {
  const skill = bundle.skills.find((s) => s.slug === req.slug);
  if (!skill) {
    console.error(`FAIL missing skill ${req.slug}`);
    failed += 1;
    continue;
  }
  if (req.stepCount !== undefined && skill.stepCount !== req.stepCount) {
    console.error(
      `FAIL ${req.slug} stepCount ${skill.stepCount} expected ${req.stepCount}`,
    );
    failed += 1;
  }
  if (req.stepId !== undefined) {
    const step = skill.steps.find((s) => s.id === req.stepId);
    if (req.text !== undefined && step?.text !== req.text) {
      console.error(
        `FAIL ${req.slug} step ${req.stepId}: got "${step?.text?.slice(0, 50)}…"`,
      );
      failed += 1;
    }
    if (
      req.boilerplateId !== undefined &&
      step?.boilerplateId !== req.boilerplateId
    ) {
      console.error(
        `FAIL ${req.slug} step ${req.stepId} boilerplateId ${step?.boilerplateId} expected ${req.boilerplateId}`,
      );
      failed += 1;
    }
  }
}

const liveArg = process.argv.find((a) => a.startsWith("--live"));
if (liveArg) {
  const url =
    liveArg.includes("=") ?
      liveArg.split("=")[1]
    : process.argv[process.argv.indexOf("--live") + 1];
  if (url) {
    const res = await fetch(url);
    const html = await res.text();
    if (!res.ok) {
      console.error(`FAIL live ${url} status ${res.status}`);
      failed += 1;
    }
    const stalePatterns = [
      /Perform proper hand hygiene/,
      /\bPut on gloves\./,
      /Get water and check water temperature for safety/,
      /Provide for privacy\./,
      /Ensure the bed is low and locked/,
      /Call lights within reach and bed in low position/,
      /empty it to the toilet/,
      /container on flat surface(?! with)/,
      /place in designated hamper(?!\.)/,
      /place dry towel underneath(?!\.)/,
      /Assist the patient to put on a clean gown(?!\.)/,
      /Record the volume within plus or minus 25 mL of the actual volume(?!\.)/,
    ];
    for (const re of stalePatterns) {
      if (re.test(html)) {
        console.error(`FAIL live HTML matches stale pattern: ${re}`);
        failed += 1;
      }
    }
    if (html.includes(MERGED_CLOSE)) {
      console.error("FAIL live HTML contains merged CLOSE step");
      failed += 1;
    }
    console.log(`Live probe: ${url} (${html.length} bytes, ${res.status})`);
  }
}

console.log(`generatedAt: ${bundle.generatedAt}`);
if (failed) {
  console.error(`${failed} probe failure(s)`);
  process.exit(1);
}
console.log("probe-dev-skills: OK");
