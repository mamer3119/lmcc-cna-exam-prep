import { describe, expect, it } from "vitest";

import {
  detectProductionWebpackCache,
  shouldClearNextForDev,
} from "../lib/ensure-dev-webpack.mjs";

describe("ensure-dev-webpack", () => {
  it("clears when out/ and .next both exist", () => {
    expect(
      shouldClearNextForDev({
        nextExists: true,
        outExists: true,
        exportStampExists: false,
        hasProductionWebpackCache: false,
      }),
    ).toBe(true);
  });

  it("clears when export stamp and .next exist", () => {
    expect(
      shouldClearNextForDev({
        nextExists: true,
        outExists: false,
        exportStampExists: true,
        hasProductionWebpackCache: false,
      }),
    ).toBe(true);
  });

  it("clears when production webpack cache exists without out/", () => {
    expect(
      shouldClearNextForDev({
        nextExists: true,
        outExists: false,
        exportStampExists: false,
        hasProductionWebpackCache: true,
      }),
    ).toBe(true);
  });

  it("does not clear fresh dev-only .next", () => {
    expect(
      shouldClearNextForDev({
        nextExists: true,
        outExists: false,
        exportStampExists: false,
        hasProductionWebpackCache: false,
      }),
    ).toBe(false);
  });

  it("detectProductionWebpackCache is false for missing dir", () => {
    expect(
      detectProductionWebpackCache("/nonexistent/.next", () => false),
    ).toBe(false);
  });
});
