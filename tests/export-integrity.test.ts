import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

function assetExists(outDir: string, ref: string): boolean {
  const rel = ref.replace("/lmcc-cna-exam-prep/", "");
  const candidates = [rel, decodeURIComponent(rel)].map((segment) =>
    path.join(outDir, ...segment.split("/")),
  );
  return candidates.some((candidate) => fs.existsSync(candidate));
}

function refsFromHtml(html: string): string[] {
  return [
    ...html.matchAll(
      /(?:href|src)="(\/lmcc-cna-exam-prep\/_next\/static\/[^"]+)"/g,
    ),
  ].map((match) => match[1]);
}

describe("static export integrity", () => {
  it("HTML asset refs resolve on disk when out/ exists", () => {
    const outDir = path.join(process.cwd(), "out");
    if (!fs.existsSync(outDir)) {
      return;
    }

    const pages = [
      path.join(outDir, "index.html"),
      path.join(outDir, "skills", "hand-hygiene", "index.html"),
    ];

    for (const page of pages) {
      if (!fs.existsSync(page)) continue;
      const refs = refsFromHtml(fs.readFileSync(page, "utf8"));
      expect(refs.length).toBeGreaterThan(0);
      for (const ref of refs) {
        expect(assetExists(outDir, ref), ref).toBe(true);
      }
    }
  });

  it("mirrors URL-encoded dynamic chunk folders after postbuild", () => {
    const encoded = path.join(
      process.cwd(),
      "out",
      "_next",
      "static",
      "chunks",
      "app",
      "skills",
      "%5Bslug%5D",
    );
    const literal = path.join(
      process.cwd(),
      "out",
      "_next",
      "static",
      "chunks",
      "app",
      "skills",
      "[slug]",
    );
    if (!fs.existsSync(literal)) {
      return;
    }
    expect(fs.existsSync(encoded)).toBe(true);
  });
});
