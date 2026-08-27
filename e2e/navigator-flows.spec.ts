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

  test("study-method page shows the three learning-method cards", async ({
    page,
  }) => {
    await page.goto("study-method/", { waitUntil: "networkidle" });

    await expect(
      page.getByRole("heading", { name: /How to study the 22 CNA skills/i }),
    ).toBeVisible();
    await expect(page.getByText("Step 1 — The Sandwich")).toBeVisible();
    await expect(page.getByText("Step 2 — FLAME")).toBeVisible();
    await expect(page.getByText("Step 3 — Confusion Pairs")).toBeVisible();
  });

  test("skill page pattern view shows OPEN / CORE / CLOSE bands and FLAME badges", async ({
    page,
  }) => {
    await page.goto("skills/hand-hygiene/", { waitUntil: "networkidle" });

    await page.getByRole("button", { name: /Pattern view/i }).click();

    await expect(page.getByRole("region", { name: /OPEN steps/i })).toBeVisible();
    await expect(page.getByRole("region", { name: /CORE steps/i })).toBeVisible();
    await expect(page.getByLabel("FLAME F").first()).toBeVisible();
    await expect(page.getByLabel("FLAME A").first()).toBeVisible();
  });
});
