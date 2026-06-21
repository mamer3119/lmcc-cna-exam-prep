import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

for (const dir of [".next", "out"]) {
  fs.rmSync(path.join(root, dir), { recursive: true, force: true });
}

console.log("Removed .next and out");
