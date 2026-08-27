import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ForGraduatesPage from "@/app/for-graduates/page";

describe("ForGraduatesPage", () => {
  it("renders the page title and paths", () => {
    render(<ForGraduatesPage />);

    expect(
      screen.getByRole("heading", {
        name: /Keep practicing after graduation/i,
      }),
    ).toBeTruthy();
    expect(
      screen.getByRole("heading", { name: /Start with a skill/i }),
    ).toBeTruthy();
    expect(
      screen.getByRole("heading", { name: /Browse all 22 skills/i }),
    ).toBeTruthy();
  });

  it("links to hand hygiene and the skills list", () => {
    render(<ForGraduatesPage />);

    expect(
      screen
        .getByRole("link", { name: /Open Hand Hygiene/i })
        .getAttribute("href"),
    ).toMatch(/\/skills\/hand-hygiene\/?$/);
    expect(
      screen
        .getByRole("link", { name: /View all skills/i })
        .getAttribute("href"),
    ).toMatch(/\/skills\/?$/);
  });
});
