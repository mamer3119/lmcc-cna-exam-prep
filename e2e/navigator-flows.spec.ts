import { expect, test } from "@playwright/test";

test.describe("CNA navigator LMCC flows", () => {
  test("home page shows the LMCC entry path and links to the skills list", async ({
    page,
  }) => {
    await page.goto("", { waitUntil: "networkidle" });

    await expect(
      page.getByRole("heading", { name: /I study at LMCC/i }),
    ).toBeVisible();

    await page.getByRole("link", { name: /Start studying/i }).click();
    await page.waitForURL("**/skills/");
    await expect(
      page.getByRole("heading", { name: /All 22 official CNA skills/i }),
    ).toBeVisible();
  });

  test("simplified skill page shows the checklist and a practice-tools disclosure", async ({
    page,
  }) => {
    await page.goto("skills/hand-hygiene/", { waitUntil: "networkidle" });

    await expect(
      page.getByRole("heading", { name: /Hand Hygiene/i }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole("checkbox", { name: /Introduce and identify/i }),
    ).toBeVisible();
    await expect(page.getByText(/Practice tools/i)).toBeVisible();
  });
});
