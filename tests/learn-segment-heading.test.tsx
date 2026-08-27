import { readFileSync } from "node:fs";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LearnSegmentHeading } from "@/components/LearnSegmentHeading";
import { getAllSkills } from "@/lib/skills";

describe("LearnSegmentHeading", () => {
  it("CLOSING heading uses divider shell class alongside CORE", () => {
    render(
      <>
        <LearnSegmentHeading segment="core" />
        <LearnSegmentHeading segment="close" />
      </>,
    );

    const core = screen.getByText("CORE").closest(".learn-segment-heading");
    const close = screen.getByText("CLOSING").closest(".learn-segment-heading");

    expect(core?.classList.contains("learn-segment-heading--core")).toBe(true);
    expect(close?.classList.contains("learn-segment-heading--close")).toBe(
      true,
    );
  });

  it("learn-mode.css gives CLOSING the same top border divider as CORE", () => {
    const css = readFileSync("app/learn-mode.css", "utf8");
    expect(css).toMatch(
      /\.learn-segment-heading--core,\s*\n\.learn-segment-heading--close[\s\S]*?border-top:\s*1px solid var\(--border\)/,
    );
  });

  it("21 of 22 skills include a closing segment (hand-hygiene is open/core only)", () => {
    const skills = getAllSkills();
    expect(skills).toHaveLength(22);

    const withClose = skills.filter((skill) =>
      skill.steps.some((step) => step.segment === "close"),
    );
    expect(withClose).toHaveLength(21);
    expect(
      skills
        .find((s) => s.slug === "hand-hygiene")
        ?.steps.every((s) => s.segment !== "close"),
    ).toBe(true);
  });
});
