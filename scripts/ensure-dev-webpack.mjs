#!/usr/bin/env node
/**
 * Prevent webpack "a[d] is not a function" / factory.call errors in dev.
 * After `pnpm build`, `.next` holds production chunks — reusing it in `pnpm dev`
 * causes __webpack_require__ failures (FIX_LOG #3 / #31 / #40).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  detectProductionWebpackCache,
  shouldClearNextForDev,
} from "../lib/ensure-dev-webpack.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const nextDir = path.join(root, ".next");
const outDir = path.join(root, "out");
const exportStamp = path.join(root, ".export-build-stamp");

function rmNext() {
  fs.rmSync(nextDir, {
    recursive: true,
    force: true,
    maxRetries: 3,
    retryDelay: 200,
  });
}

function clearExportStamp() {
  if (fs.existsSync(exportStamp)) {
    fs.rmSync(exportStamp, { force: true });
  }
}

const nextExists = fs.existsSync(nextDir);
const outExists = fs.existsSync(outDir);
const exportStampExists = fs.existsSync(exportStamp);
const hasProductionWebpackCache = detectProductionWebpackCache(
  nextDir,
  fs.existsSync.bind(fs),
);

if (
  shouldClearNextForDev({
    nextExists,
    outExists,
    exportStampExists,
    hasProductionWebpackCache,
  })
) {
  rmNext();
  clearExportStamp();
  const reasons = [];
  if (outExists) {
    reasons.push("static out/ present");
  }
  if (exportStampExists) {
    reasons.push(".export-build-stamp present");
  }
  if (hasProductionWebpackCache) {
    reasons.push("production webpack cache in .next");
  }
  console.log(
    `[ensure-dev-webpack] Cleared .next (${reasons.join("; ")}) — avoids a[d] / factory errors in dev`,
  );
}
