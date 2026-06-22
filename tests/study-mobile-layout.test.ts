import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("study mobile layout", () => {
  it("hides fixed phase HUD below 768px", () => {
    const css = readFileSync("app/phase-organizer.css", "utf8");
    expect(css).toMatch(
      /@media \(max-width: 767px\)[\s\S]*\.study-organizer-hud[\s\S]*display:\s*none/,
    );
  });

  it("removes nested checklist horizontal padding on study leaf", () => {
    const css = readFileSync("app/phase-organizer.css", "utf8");
    expect(css).toMatch(
      /\.study-skill-block \.skill-checklist[\s\S]*padding-left:\s*0/,
    );
  });

  it("hides Official Checklist label in compact mode", () => {
    const css = readFileSync("components/skill-checklist.css", "utf8");
    expect(css).toContain(
      ".skill-checklist--compact .skill-checklist-section-label",
    );
    expect(css).toMatch(
      /\.skill-checklist--compact \.skill-checklist-section-label[\s\S]*display:\s*none/,
    );
  });

  it("stacks step badges on narrow screens", () => {
    const css = readFileSync("components/skill-checklist.css", "utf8");
    expect(css).toContain("skill-step-body__badges");
    expect(css).toMatch(
      /@media \(max-width: 767px\)[\s\S]*\.skill-step-body[\s\S]*flex-direction:\s*column/,
    );
  });
});
