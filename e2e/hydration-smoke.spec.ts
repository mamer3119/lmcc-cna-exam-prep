import { expect, test } from "@playwright/test";

const HYDRATION_PATTERNS = [
  /hydration/i,
  /didn't match/i,
  /did not match/i,
  /getServerSnapshot should be cached/i,
  /a\[d\] is not a function/i,
  /Application error/i,
  /useInsertionEffect must not schedule updates/i,
];

function isBlockingConsoleMessage(text: string): boolean {
  if (/favicon/i.test(text)) {
    return false;
  }
  return HYDRATION_PATTERNS.some((pattern) => pattern.test(text));
}

test.describe("browser smoke — no console errors", () => {
  /** Relative to baseURL — no leading slash (Playwright URL rules). */
  for (const path of [
    "study/",
    "skills/hand-hygiene/",
    "skills/ppe-gown-gloves/?instructor=true",
  ]) {
    test(`/${path} renders without hydration or runtime console errors`, async ({
      page,
    }) => {
      const errors: string[] = [];

      page.on("console", (msg) => {
        if (msg.type() === "error" && isBlockingConsoleMessage(msg.text())) {
          errors.push(msg.text());
        }
      });
      page.on("pageerror", (err) => {
        errors.push(err.message);
      });

      await page.goto(path, { waitUntil: "networkidle" });
      await page.reload({ waitUntil: "networkidle" });

      await expect(page.getByRole("heading", { name: "404" })).toHaveCount(0);

      if (path.startsWith("study/")) {
        await expect(page.locator(".study-page")).toBeVisible();
      }
      if (path.includes("hand-hygiene")) {
        await expect(page.getByText(/Hand Hygiene/i).first()).toBeVisible();
      }

      expect(
        errors,
        `Console errors on ${path}:\n${errors.join("\n")}`,
      ).toEqual([]);
    });
  }
});
