/**
 * Serve static export the way GitHub Pages does (basePath /lmcc-cna-exam-prep).
 * Usage: node scripts/serve-export-ghpages.mjs
 */
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { spawn } from "node:child_process";

const root = process.cwd();
const outDir = join(root, "out");
const serveRoot = join(root, ".slice2-serve");
const nested = join(serveRoot, "lmcc-cna-exam-prep");
const port = process.env.SLICE2_SERVE_PORT ?? "3010";

if (!existsSync(outDir)) {
  console.error("Run pnpm build first.");
  process.exit(1);
}

rmSync(serveRoot, { recursive: true, force: true });
mkdirSync(nested, { recursive: true });
cpSync(outDir, nested, { recursive: true });

console.log(
  `Serving ${nested} at http://127.0.0.1:${port}/lmcc-cna-exam-prep/`,
);
const child = spawn("npx", ["--yes", "serve", serveRoot, "-l", port], {
  stdio: "inherit",
  shell: false,
});
child.on("exit", (code) => process.exit(code ?? 0));
