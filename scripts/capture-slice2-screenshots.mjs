/**
 * One-off Slice-2 review screenshots (desktop + 375px).
 * Usage: node scripts/capture-slice2-screenshots.mjs
 * Requires: pnpm build && npx serve out -l 3010 (or set SLICE2_BASE_URL).
 */
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "@playwright/test";

const base = process.env.SLICE2_BASE_URL ?? "http://127.0.0.1:3010";
const outDir = join(process.cwd(), "docs", "slice-2-screenshots");

mkdirSync(outDir, { recursive: true });

const targets = [
  {
    name: "after-desktop-urinary-mode-control",
    path: "/skills/urinary-output-measurement/",
    width: 1280,
    height: 900,
  },
  {
    name: "after-desktop-urinary-script-row-chips",
    path: "/skills/urinary-output-measurement/",
    width: 1280,
    height: 900,
    clip: { x: 0, y: 280, width: 1280, height: 420 },
  },
  {
    name: "after-mobile-375-urinary",
    path: "/skills/urinary-output-measurement/",
    width: 375,
    height: 812,
  },
];

const browser = await chromium.launch();
for (const t of targets) {
  const page = await browser.newPage({
    viewport: { width: t.width, height: t.height },
  });
  await page.goto(`${base}${t.path}`, { waitUntil: "networkidle" });
  await page.getByTestId("skill-view-mode-selector").waitFor();
  const file = join(outDir, `${t.name}.png`);
  if (t.clip) {
    await page.screenshot({ path: file, clip: t.clip });
  } else {
    await page.screenshot({ path: file, fullPage: true });
  }
  console.log("Wrote", file);
}
await browser.close();
