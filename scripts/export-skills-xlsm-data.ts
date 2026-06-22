/**
 * CLI: write exports/skills-xlsm-payload.json for Excel (.xlsm builder).
 * Run: pnpm export:xlsm
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { buildSkillsXlsmPayload } from "@/lib/export-skills-xlsm";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const payload = buildSkillsXlsmPayload();
const outPath = path.join(root, "exports", "skills-xlsm-payload.json");

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(payload, null, 2), "utf8");
console.log(`Wrote ${outPath} (${payload.skills.length} skills)`);
