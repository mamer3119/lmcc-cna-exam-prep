#!/usr/bin/env node
/** Hard-block dev/build when Node major !== pinned Active LTS in `.node-version`. */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pinPath = path.join(root, ".node-version");

function readPinnedMajor() {
  if (!fs.existsSync(pinPath)) {
    console.error("[dev-preflight] Missing .node-version in project root.");
    process.exit(1);
  }
  const raw = fs.readFileSync(pinPath, "utf8").trim();
  const major = Number.parseInt(raw.split(".")[0], 10);
  if (!Number.isFinite(major) || major < 4) {
    console.error(`[dev-preflight] Invalid .node-version: "${raw}"`);
    process.exit(1);
  }
  return major;
}

function printScoopFix() {
  console.error("");
  console.error("Fix with Scoop (close all terminals first, then reopen):");
  console.error("  scoop update");
  console.error("  scoop install nodejs-lts");
  console.error("  scoop update nodejs-lts");
  console.error("  scoop reset nodejs-lts");
  console.error("  scoop uninstall nodejs");
  console.error("");
  console.error("Verify: node -v   # must show v24.x, not v26.x");
}

const pinnedMajor = readPinnedMajor();
const runningMajor = Number.parseInt(process.versions.node.split(".")[0], 10);

if (runningMajor % 2 !== 0) {
  console.error(
    `[dev-preflight] Node v${process.versions.node} is a Current (odd) release.`,
  );
  console.error(
    `[dev-preflight] Develop only on Active LTS (v${pinnedMajor} Krypton) or Maintenance LTS.`,
  );
  printScoopFix();
  process.exit(1);
}

if (runningMajor !== pinnedMajor) {
  console.error(
    `[dev-preflight] Expected Node ${pinnedMajor}.x (Active LTS), got v${process.versions.node}.`,
  );
  console.error(
    "Webpack runtime errors (a[d] is not a function) are common on mismatched Node versions.",
  );
  printScoopFix();
  process.exit(1);
}

console.log(
  `[dev-preflight] OK — Node v${process.versions.node} (pinned LTS major ${pinnedMajor})`,
);
