import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
/** @type {{ skills: Array<{ slug: string; steps: Array<Record<string, unknown>> }> }} */
const bundle = JSON.parse(
  fs.readFileSync(path.join(ROOT, "data/skills.json"), "utf8"),
);
const skills = bundle.skills;

const critical = [];
for (const skill of skills) {
  for (const step of skill.steps) {
    if (step.criticalCategory) {
      critical.push({
        skill: skill.slug,
        step: step.id,
        text: step.text,
        category: step.criticalCategory,
        phaseWord: step.phaseWord ?? null,
        tagCategory: step.tagCategory ?? null,
      });
    }
  }
}

console.log(
  JSON.stringify({ criticalCount: critical.length, critical }, null, 2),
);
