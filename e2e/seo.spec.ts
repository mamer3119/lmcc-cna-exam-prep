import { expect, test } from "@playwright/test";

test.describe("SEO / crawlability", () => {
  test("home page exposes sitemap, robots, canonical, and JSON-LD", async ({
    page,
  }) => {
    await page.goto("", { waitUntil: "networkidle" });

    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      /\/lmcc-cna-exam-prep\/$/,
    );

    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      /22 official California CNA skills/i,
    );

    const jsonLd = await page
      .locator('script[type="application/ld+json"]')
      .textContent();
    expect(jsonLd).toContain("https://schema.org");
    expect(jsonLd).toContain("WebSite");
    expect(jsonLd).toContain("Organization");
  });

  test("sitemap includes home, skills, and for-graduates", async ({
    request,
  }) => {
    const sitemap = await request.get("sitemap.xml");
    expect(sitemap.status()).toBe(200);
    const body = await sitemap.text();
    expect(body).toContain("<loc>");
    expect(body).toContain("/lmcc-cna-exam-prep/");
    expect(body).toContain("/lmcc-cna-exam-prep/skills/");
    expect(body).toContain("/lmcc-cna-exam-prep/for-graduates/");
    expect(body).not.toContain("/lmcc-cna-exam-prep/schools/");
  });

  test("robots allows all crawlers and points to the sitemap", async ({
    request,
  }) => {
    const robots = await request.get("robots.txt");
    expect(robots.status()).toBe(200);
    const body = await robots.text();
    expect(body).toContain("User-Agent: *");
    expect(body).toContain("Allow: /");
    expect(body).toContain("Sitemap:");
    expect(body).toContain("/lmcc-cna-exam-prep/sitemap.xml");
  });
});
