/**
 * Audit which checklist steps get BoilerplateTokenChip (🧼 etc.)
 * Run: node scripts/audit-boilerplate-chips.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const skills = JSON.parse(
  fs.readFileSync(path.join(root, "data/skills.json"), "utf8"),
).skills;

const COMPOSITE = new Set(["BED_LOW|CALL_LIGHT", "HAND_HYGIENE|VIDEO_WARNING"]);

const REGISTRY = {
  INTRO_EXPLAIN:
    "Introduce yourself by name and title, explain the procedure to the patient in clear, plain language, and obtain verbal consent before proceeding.",
  INTRO_IDENTIFY:
    "Introduce yourself by name and title, and verify the patient's identity using two identifiers (name and date of birth or wristband ID).",
  PRIVACY:
    "Provide for patient privacy (close the curtain, door, or privacy screen).",
  HAND_HYGIENE:
    "Perform hand hygiene using the six-step technique for a minimum of 20 seconds with soap and water, or use an alcohol-based hand rub when hands are visibly clean.",
  GLOVE_DON: "Don clean, non-sterile gloves.",
  GLOVE_REMOVE: "Remove the gloves, turning them inside out.",
  BED_LOW:
    "Lower the bed to the lowest position and ensure side rails are up as appropriate.",
  CALL_LIGHT:
    "Place the call signal within the patient's reach and ensure the patient can use it.",
};

function resolveTokenId(boilerplateId) {
  if (!boilerplateId || COMPOSITE.has(boilerplateId)) return null;
  if (boilerplateId in REGISTRY) return boilerplateId;
  return null;
}

function shouldShowChip(step, slug) {
  const tokenId = resolveTokenId(step.boilerplateId);
  if (!tokenId) {
    return { show: false, reason: chipBlockReason(step) };
  }
  const canonical = REGISTRY[tokenId];
  const official = step.detailedText?.trim() || step.text?.trim() || "";
  if (official !== canonical) {
    return {
      show: false,
      reason: "wording_mismatch",
      tokenId,
      official: official.slice(0, 60),
      canonical: canonical.slice(0, 60),
    };
  }
  return { show: true, reason: "ok", tokenId };
}

function chipBlockReason(step) {
  const id = step.boilerplateId;
  if (!id) return "no_boilerplate_id";
  if (COMPOSITE.has(id)) return "composite_id";
  if (!(id in REGISTRY)) return "unknown_token";
  return "unknown";
}

const hhRelated = [];
const allTagged = [];
const missing = [];
const showing = [];

for (const skill of skills) {
  for (const step of skill.steps) {
    if (!step.boilerplateId) continue;
    allTagged.push({
      skill: skill.slug,
      step: step.id,
      id: step.boilerplateId,
    });
    const isHh =
      step.boilerplateId.includes("HAND_HYGIENE") ||
      step.boilerplateId === "GLOVE_REMOVE_THEN_HH" ||
      step.criticalCategory === "hand-hygiene";
    if (!isHh && step.boilerplateId !== "INTRO_IDENTIFY") continue;

    const result = shouldShowChip(step, skill.slug);
    const row = {
      skill: skill.slug,
      step: step.id,
      text: step.text?.slice(0, 50),
      boilerplateId: step.boilerplateId,
      ...result,
    };
    hhRelated.push(row);
    if (result.show) showing.push(row);
    else missing.push(row);
  }
}

console.log("=== HAND_HYGIENE / related chip audit ===\n");
console.log(`Showing chip: ${showing.length}`);
console.log(`Missing chip: ${missing.length}\n`);

const byReason = {};
for (const r of missing) {
  byReason[r.reason] = byReason[r.reason] || [];
  byReason[r.reason].push(r);
}

for (const [reason, rows] of Object.entries(byReason).sort()) {
  console.log(`\n--- ${reason} (${rows.length}) ---`);
  for (const r of rows) {
    console.log(
      `  ${r.skill} step ${r.step}: ${r.boilerplateId} | "${r.text}"`,
    );
  }
}

console.log("\n=== All HAND_HYGIENE boilerplateId steps (chip show/miss) ===");
for (const skill of skills) {
  for (const step of skill.steps) {
    if (!step.boilerplateId?.includes("HAND_HYGIENE")) continue;
    const r = shouldShowChip(step, skill.slug);
    console.log(
      `${r.show ? "✓" : "✗"} ${skill.slug} #${step.id} [${step.boilerplateId}]`,
    );
  }
}

console.log("\n=== GLOVE_REMOVE_THEN_HH ===");
for (const skill of skills) {
  for (const step of skill.steps) {
    if (step.boilerplateId === "GLOVE_REMOVE_THEN_HH") {
      console.log(`  ${skill.slug} step ${step.id}: "${step.text}"`);
    }
  }
}

console.log("\n=== INTRO_IDENTIFY wording mismatches (no chip) ===");
for (const skill of skills) {
  for (const step of skill.steps) {
    if (step.boilerplateId !== "INTRO_IDENTIFY") continue;
    const r = shouldShowChip(step, skill.slug);
    if (!r.show) {
      console.log(`  ${skill.slug} step ${step.id}: "${step.text}"`);
    }
  }
}
