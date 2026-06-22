import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const CSS = readFileSync(
  path.join(process.cwd(), "app/phase-organizer.css"),
  "utf8",
);

describe("phase readability (R1)", () => {
  it("does not de-emphasize OPEN/CLOSE step body text", () => {
    expect(CSS).not.toMatch(/opacity:\s*0\.55/);
    expect(CSS).not.toMatch(/opacity:\s*0\.6/);
    expect(CSS).not.toMatch(
      /\.skill-step-segment--open[\s\S]*?font-style:\s*italic/,
    );
  });

  it("keeps CORE body at font-weight 500", () => {
    expect(CSS).toMatch(
      /\.skill-step-segment--core[\s\S]*?font-weight:\s*500/,
    );
  });
});
