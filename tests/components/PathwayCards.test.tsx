import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PathwayCards from "@/components/PathwayCards";

describe("PathwayCards", () => {
  it("renders the LMCC front-door path", () => {
    render(<PathwayCards />);

    expect(
      screen.getByRole("heading", { name: /I study at LMCC/i }),
    ).toBeTruthy();
  });

  it("links the LMCC path to the skills list", () => {
    render(<PathwayCards />);

    expect(
      screen
        .getByRole("link", { name: /Start studying/i })
        .getAttribute("href"),
    ).toMatch(/\/skills\/?$/);
  });

  it("marks the LMCC card distinctly", () => {
    const { container } = render(<PathwayCards />);
    const lmccCard = container.querySelector(".pathway-card--lmcc");
    expect(lmccCard).toBeTruthy();
  });
});
