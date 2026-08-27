import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import SimplifiedSkillChecklist from "@/components/SimplifiedSkillChecklist";
import { getSkillBySlug } from "@/lib/skills";

describe("SimplifiedSkillChecklist", () => {
  const skill = getSkillBySlug("hand-hygiene")!;

  beforeEach(() => {
    localStorage.clear();
  });

  it("renders all steps for the skill", () => {
    render(<SimplifiedSkillChecklist skill={skill} />);

    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes.length).toBe(skill.steps.length);

    for (const step of skill.steps) {
      const checkbox = screen.getByRole("checkbox", {
        name: new RegExp(step.text, "i"),
      });
      expect(checkbox).toBeTruthy();
    }
  });

  it("checks a step when clicked", () => {
    render(<SimplifiedSkillChecklist skill={skill} />);
    const firstCheckbox = screen.getAllByRole("checkbox")[0];

    fireEvent.click(firstCheckbox);

    expect((firstCheckbox as HTMLInputElement).checked).toBe(true);
  });

  it("shows a mark-reviewed button when all steps are checked", async () => {
    render(<SimplifiedSkillChecklist skill={skill} />);

    const checkboxes = screen.getAllByRole("checkbox");
    for (const checkbox of checkboxes) {
      fireEvent.click(checkbox);
    }

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Mark as reviewed/i })).toBeTruthy();
    });
  });

  it("persists checked state to localStorage", () => {
    render(<SimplifiedSkillChecklist skill={skill} />);
    const firstCheckbox = screen.getAllByRole("checkbox")[0];

    fireEvent.click(firstCheckbox);

    const storageKey = `simplified-checklist-${skill.slug}`;
    const stored = localStorage.getItem(storageKey);
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored!);
    expect(parsed[skill.steps[0].id]).toBe(true);
  });

  it("switches to pattern view and shows OPEN / CORE / CLOSE bands", () => {
    render(<SimplifiedSkillChecklist skill={skill} />);

    const patternButton = screen.getByRole("button", { name: /Pattern view/i });
    fireEvent.click(patternButton);

    expect(screen.getByRole("region", { name: /OPEN steps/i })).toBeTruthy();
    expect(screen.getByRole("region", { name: /CORE steps/i })).toBeTruthy();
  });

  it("shows FLAME badges in pattern view", () => {
    render(<SimplifiedSkillChecklist skill={skill} />);

    fireEvent.click(screen.getByRole("button", { name: /Pattern view/i }));

    expect(screen.getAllByLabelText("FLAME F").length).toBeGreaterThan(0);
    expect(screen.getAllByLabelText("FLAME A").length).toBeGreaterThan(0);
  });

  it("links to the study-method page", () => {
    render(<SimplifiedSkillChecklist skill={skill} />);

    const link = screen.getByRole("link", { name: /How to study/i });
    expect(link).toBeTruthy();
    expect(link.getAttribute("href")).toMatch(/study-method/);
  });
});
