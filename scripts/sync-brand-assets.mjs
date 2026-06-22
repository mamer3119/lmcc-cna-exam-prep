import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const sources = [
  path.join(root, "..", "Design", "images"),
  path.join(
    "C:",
    "Users",
    "moham",
    "Final Versions of Everything",
    "LMCC Catalog - 2026",
    "images",
  ),
];
const dest = path.join(root, "public", "images");
const required = ["shield_watermark.png", "full_logo.png", "header_banner.png"];

function resolveSourceDir() {
  for (const dir of sources) {
    if (!fs.existsSync(dir)) continue;
    if (required.every((name) => fs.existsSync(path.join(dir, name)))) {
      return dir;
    }
  }
  return null;
}

const sourceDir = resolveSourceDir();
if (!sourceDir) {
  console.error("sync-brand-assets: no source folder with all required PNGs.");
  process.exit(1);
}

fs.mkdirSync(dest, { recursive: true });
for (const name of required) {
  fs.copyFileSync(path.join(sourceDir, name), path.join(dest, name));
}

console.log(`Synced ${required.length} brand assets from ${sourceDir}`);
