#!/usr/bin/env node
/** Written by postbuild — signals that the last `pnpm build` was a static export. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const stamp = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  ".export-build-stamp",
);

fs.writeFileSync(stamp, `${Date.now()}\n`, "utf8");
console.log("[mark-export-build] Wrote .export-build-stamp");
