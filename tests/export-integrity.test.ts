import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const BASE = "/lmcc-cna-exam-prep";

function walkHtml(dir: string): string[] {
  const entries: string[] = [];
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, name.name);
    if (name.isDirectory()) entries.push(...walkHtml(full));
    else if (name.name.endsWith(".html")) entries.push(full);
  }
  return entries;
}

function assetExists(outDir: string, ref: string): boolean {
  const rel = ref.replace(`${BASE}/`, "");
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
  const outDir = path.join(process.cwd(), "out");

  it("every exported HTML page resolves all _next static assets", () => {
    if (!fs.existsSync(outDir)) {
      return;
    }

    const htmlFiles = walkHtml(outDir);
    expect(htmlFiles.length).toBeGreaterThanOrEqual(25);

    const missing: string[] = [];

    for (const page of htmlFiles) {
      const refs = refsFromHtml(fs.readFileSync(page, "utf8"));
      for (const ref of refs) {
        if (!assetExists(outDir, ref)) {
          missing.push(`${path.relative(outDir, page)} → ${ref}`);
        }
      }
    }

    expect(missing, missing.join("\n")).toEqual([]);
  });

  it("mirrors URL-encoded dynamic chunk folders after postbuild", () => {
    const encoded = path.join(
      outDir,
      "_next",
      "static",
      "chunks",
      "app",
      "skills",
      "%5Bslug%5D",
    );
    const literal = path.join(
      outDir,
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

  it("encoded slug page chunk matches literal folder content", () => {
    const encodedChunk = path.join(
      outDir,
      "_next",
      "static",
      "chunks",
      "app",
      "skills",
      "%5Bslug%5D",
    );
    const literalChunk = path.join(
      outDir,
      "_next",
      "static",
      "chunks",
      "app",
      "skills",
      "[slug]",
    );
    if (!fs.existsSync(literalChunk)) {
      return;
    }

    const encodedFiles = fs.readdirSync(encodedChunk);
    const literalFiles = fs.readdirSync(literalChunk);
    expect(encodedFiles.sort()).toEqual(literalFiles.sort());
  });
});
