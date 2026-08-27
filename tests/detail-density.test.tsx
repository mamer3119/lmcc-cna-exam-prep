/** @vitest-environment jsdom */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DetailDensitySelector } from "@/components/DetailDensitySelector";
import {
  getDetailDensitySnapshot,
  setDetailDensity,
} from "@/lib/detail-density-store";

describe("DetailDensitySelector", () => {
  it("defaults to standard and switches density", () => {
    setDetailDensity("standard");
    render(<DetailDensitySelector />);
    expect(getDetailDensitySnapshot().density).toBe("standard");

    fireEvent.click(screen.getByRole("button", { name: "Quick" }));
    expect(getDetailDensitySnapshot().density).toBe("quick");

    fireEvent.click(screen.getByRole("button", { name: "Coach" }));
    expect(getDetailDensitySnapshot().density).toBe("coach");
  });
});
