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
});
