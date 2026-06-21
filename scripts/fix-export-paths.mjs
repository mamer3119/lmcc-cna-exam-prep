import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "out");

/** Next.js HTML references URL-encoded dynamic segment paths; static hosts need both. */
function mirrorEncodedDynamicDirs(dir) {
  let mirrored = 0;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;

    const source = path.join(dir, entry.name);
    mirrorEncodedDynamicDirs(source);

    if (!entry.name.includes("[") && !entry.name.includes("]")) continue;

    const encodedName = encodeURIComponent(entry.name);
    if (encodedName === entry.name) continue;

    const target = path.join(dir, encodedName);
    if (fs.existsSync(target)) continue;

    fs.cpSync(source, target, { recursive: true });
    mirrored += 1;
  }

  return mirrored;
}

if (!fs.existsSync(outDir)) {
  console.error("fix-export-paths: out/ not found — run next build first.");
  process.exit(1);
}

const count = mirrorEncodedDynamicDirs(outDir);
console.log(
  count > 0
    ? `Mirrored ${count} dynamic route folder(s) to URL-encoded paths.`
    : "Dynamic route paths already mirrored.",
);
