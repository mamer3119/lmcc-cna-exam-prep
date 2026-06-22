import { expect, test } from "@playwright/test";

import { PRACTICE_MODE_LABELS } from "../lib/practice-labels";

async function readStepOrder(
  page: import("@playwright/test").Page,
): Promise<string[]> {
  return page.locator(".sequence-drill-row__num").allInnerTexts();
}

test.describe("sequence drill — keyboard reorder", () => {
  // Playwright synthetic Space/Arrow does not activate @dnd-kit KeyboardSensor in Chromium
  // (order unchanged after 5s poll). Live keyboard verified on M3 sign-off — manual gate remains.
  test.fixme("Space pick up, ArrowDown, Space drop changes row order", async ({
    page,
  }) => {
    await page.goto("skills/hand-hygiene/", { waitUntil: "networkidle" });

    await page
      .getByRole("button", { name: PRACTICE_MODE_LABELS.testYourself })
      .click();

    const handle = page.locator(".sequence-drill-handle").first();
    await expect(handle).toBeVisible();

    const before = await readStepOrder(page);

    await handle.focus();
    await handle.press("Space");
    await handle.press("ArrowDown");
    await handle.press("Space");

    await expect.poll(async () => readStepOrder(page)).not.toEqual(before);
  });
});
