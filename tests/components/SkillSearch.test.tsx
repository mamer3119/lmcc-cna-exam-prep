import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import SkillSearch from "@/components/SkillSearch";
import { getAllSkills } from "@/lib/skills";

describe("SkillSearch", () => {
  it("renders a search input", () => {
    render(<SkillSearch />);
    expect(screen.getByLabelText(/Or jump to a skill/i)).toBeTruthy();
  });

  it("shows matching skills as the user types", () => {
    render(<SkillSearch />);
    const input = screen.getByLabelText(/Or jump to a skill/i);

    fireEvent.change(input, { target: { value: "hand" } });

    const handHygiene = getAllSkills().find((s) => s.slug === "hand-hygiene");
    expect(handHygiene).toBeDefined();
    expect(
      screen.getByRole("link", { name: handHygiene!.title }),
    ).toBeTruthy();
  });

  it("shows an empty state when no skills match", () => {
    render(<SkillSearch />);
    const input = screen.getByLabelText(/Or jump to a skill/i);

    fireEvent.change(input, { target: { value: "xyz-not-a-skill" } });

    expect(screen.getByText(/No skills match your search/i)).toBeTruthy();
  });

  it("does not show results when the query is empty", () => {
    render(<SkillSearch />);
    expect(screen.queryByRole("list")).toBeNull();
  });
});
