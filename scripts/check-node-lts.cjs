/**
 * Hard-block dev/build when Node major != pinned Active LTS in `.node-version`.
 * Managed by ~/.cursor/scripts/Ensure-ProjectNodeTooling.ps1 — do not hardcode major here.
 */
const fs = require("fs");
const path = require("path");

const root = process.cwd();
const pinPath = path.join(root, ".node-version");

function readPinnedMajor() {
  if (!fs.existsSync(pinPath)) {
    console.error("[check-node-lts] Missing .node-version in project root.");
    process.exit(1);
  }
  const raw = fs.readFileSync(pinPath, "utf8").trim();
  const major = parseInt(raw.split(".")[0], 10);
  if (!Number.isFinite(major) || major < 4) {
    console.error(`[check-node-lts] Invalid .node-version: "${raw}"`);
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
  console.error("Or run: pwsh -File \"$env:USERPROFILE\\.cursor\\scripts\\Invoke-WorkstationToolingBootstrap.ps1\"");
  console.error("");
  console.error("Verify: node -v   # must show v<pinned>.x, not odd/Current");
}

const pinnedMajor = readPinnedMajor();
const runningMajor = parseInt(process.versions.node.split(".")[0], 10);

if (runningMajor % 2 !== 0) {
  console.error(
    `[check-node-lts] Node v${process.versions.node} is a Current (odd) release.`,
  );
  console.error(
    `[check-node-lts] Develop only on Active LTS (v${pinnedMajor}) or Maintenance LTS.`,
  );
  printScoopFix();
  process.exit(1);
}

if (runningMajor !== pinnedMajor) {
  console.error(
    `[check-node-lts] Expected Node ${pinnedMajor}.x (Active LTS), got v${process.versions.node}.`,
  );
  console.error(
    "Webpack/runtime errors (e.g. a[d] is not a function) are common on mismatched Node.",
  );
  printScoopFix();
  process.exit(1);
}

console.log(`[check-node-lts] OK — Node v${process.versions.node} (pinned LTS major ${pinnedMajor})`);
