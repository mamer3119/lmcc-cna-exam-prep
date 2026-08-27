import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PracticeTools from "@/components/PracticeTools";
import { getSkillBySlug } from "@/lib/skills";

describe("PracticeTools", () => {
  it("renders a disclosure summary", () => {
    render(<PracticeTools />);
    expect(screen.getByText(/Practice tools/i)).toBeTruthy();
  });

  it("renders a link to the study page", () => {
    render(<PracticeTools />);
    const link = screen.getByRole("link", { name: /Full study mode/i });
    expect(link.getAttribute("href")).toMatch(/\/study\/?$/);
  });

  it("renders a back link when a skill is provided", () => {
    const skill = getSkillBySlug("hand-hygiene")!;
    render(<PracticeTools skill={skill} />);
    const link = screen.getByRole("link", { name: /Back to this checklist/i });
    expect(link.getAttribute("href")).toMatch(/\/skills\/hand-hygiene\/?$/);
  });
});
