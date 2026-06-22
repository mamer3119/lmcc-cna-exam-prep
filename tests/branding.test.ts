import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const REQUIRED_ASSETS = [
  "shield_watermark.png",
  "full_logo.png",
  "header_banner.png",
];

describe("LMCC brand assets", () => {
  it("public/images contains required PNGs", () => {
    const dir = path.join(process.cwd(), "public", "images");
    for (const name of REQUIRED_ASSETS) {
      expect(fs.existsSync(path.join(dir, name)), name).toBe(true);
    }
  });
});

describe("assetPath helper", () => {
  it("prefixes paths with GitHub Pages basePath", async () => {
    const { assetPath, BASE_PATH } = await import("@/lib/paths");
    expect(BASE_PATH).toBe("/lmcc-cna-exam-prep");
    expect(assetPath("images/shield_watermark.png")).toBe(
      "/lmcc-cna-exam-prep/images/shield_watermark.png",
    );
  });
});
