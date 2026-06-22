/**
 * Slice-2 render gate — static export on port 3010.
 * Usage: pnpm build && npx serve out -l 3010 && node scripts/verify-slice2-render.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "@playwright/test";

const base =
  process.env.SLICE2_BASE_URL ?? "http://127.0.0.1:3010/lmcc-cna-exam-prep";
const outDir = join(process.cwd(), "docs", "slice-2-screenshots");

mkdirSync(outDir, { recursive: true });

const LEGACY_LABELS = [
  "Learn",
  "Test Yourself",
  "Hide & reveal",
  "All steps",
  "Show:",
];

async function assertModeCollapse(page) {
  const selectors = page.getByTestId("skill-view-mode-selector");
  await selectors.waitFor({ state: "visible" });
  if ((await selectors.count()) !== 1) {
    throw new Error(`Expected 1 mode selector, found ${await selectors.count()}`);
  }
  for (const label of ["Full View", "Core Only", "Self-Check"]) {
    await page.getByRole("button", { name: label }).waitFor({ state: "visible" });
  }
  for (const legacy of LEGACY_LABELS) {
    const count = await page.getByRole("button", { name: new RegExp(legacy, "i") }).count();
    if (count > 0) {
      throw new Error(`Legacy control still visible: ${legacy}`);
    }
  }
}

async function assertUrinaryChips(page) {
  const chips = page.getByTestId("boilerplate-token-chip");
  const count = await chips.count();
  if (count < 2) {
    throw new Error(`Expected ≥2 boilerplate chips on urinary skill, found ${count}`);
  }
  const handHygiene = page.locator(
    '[data-testid="boilerplate-token-chip"][data-token-id="HAND_HYGIENE"]',
  );
  if ((await handHygiene.count()) < 1) {
    const ids = await chips.evaluateAll((els) =>
      els.map((el) => el.getAttribute("data-token-id")),
    );
    throw new Error(
      `Expected HAND_HYGIENE chip on urinary-output-measurement; found: ${ids.join(", ")}`,
    );
  }
}

async function assertHandHygieneNoChip(page) {
  await page.goto(`${base}/skills/hand-hygiene/`, { waitUntil: "networkidle" });
  await assertModeCollapse(page);
  const chips = page.getByTestId("boilerplate-token-chip");
  if ((await chips.count()) > 0) {
    throw new Error(
      `hand-hygiene step 1 guardrail failed — found ${await chips.count()} chip(s)`,
    );
  }
}

async function assertMobileRail(page) {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(`${base}/skills/urinary-output-measurement/`, {
    waitUntil: "networkidle",
  });
  await assertModeCollapse(page);
  const trigger = page.getByRole("button", { name: "Browse 22 skills" });
  await trigger.waitFor({ state: "visible" });
  await trigger.click();
  await page.locator("#skill-pathway-sheet").waitFor({ state: "visible" });
  await page.screenshot({
    path: join(outDir, "verify-mobile-375-rail-bottom-sheet.png"),
    fullPage: true,
  });
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

const checks = [];

try {
  await page.goto(`${base}/skills/urinary-output-measurement/`, {
    waitUntil: "networkidle",
  });
  await assertModeCollapse(page);
  checks.push("urinary: single mode control, no legacy toggles");

  await assertUrinaryChips(page);
  checks.push("urinary: inline phase-colored chips on tagged steps");

  await page.screenshot({
    path: join(outDir, "verify-desktop-urinary-mode-control.png"),
    fullPage: true,
  });
  await page.locator(".skill-step-script__primary").first().screenshot({
    path: join(outDir, "verify-desktop-urinary-script-row-chips.png"),
  });

  await assertHandHygieneNoChip(page);
  checks.push("hand-hygiene: step 1 shows NO chip (wording mismatch guardrail)");
  await page.screenshot({
    path: join(outDir, "verify-desktop-hand-hygiene-no-chip.png"),
    fullPage: false,
    clip: { x: 0, y: 200, width: 1280, height: 500 },
  });

  await assertMobileRail(page);
  checks.push("375px: mode control + rail bottom sheet intact");

  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(`${base}/skills/urinary-output-measurement/`, {
    waitUntil: "networkidle",
  });
  await assertModeCollapse(page);
  await page.screenshot({
    path: join(outDir, "verify-mobile-375-urinary.png"),
    fullPage: true,
  });
  checks.push("375px: urinary skill page layout holds");

  const report = {
    branch: "feat/slice-2-mode-consolidation",
    baseUrl: base,
    passedAt: new Date().toISOString(),
    checks,
  };
  writeFileSync(
    join(outDir, "verify-slice2-render-report.json"),
    `${JSON.stringify(report, null, 2)}\n`,
  );
  console.log("Slice-2 render gate: PASS");
  for (const c of checks) {
    console.log(`  ✓ ${c}`);
  }
} catch (error) {
  console.error("Slice-2 render gate: FAIL");
  console.error(error);
  process.exitCode = 1;
} finally {
  await browser.close();
}
