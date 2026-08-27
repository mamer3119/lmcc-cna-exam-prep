import { describe, expect, it } from "vitest";
import { appPath, assetPath, canonicalPath } from "@/lib/paths";

describe("lib/paths", () => {
  describe("appPath", () => {
    it("returns a root-relative path without basePath", () => {
      expect(appPath("/")).toBe("/");
      expect(appPath("skills/hand-hygiene/")).toBe("/skills/hand-hygiene/");
    });
  });

  describe("assetPath", () => {
    it("includes basePath when BASE_PATH is set", () => {
      expect(assetPath("images/logo.png")).toMatch(/^\/lmcc-cna-exam-prep\/images\/logo\.png$/);
    });
  });

  describe("canonicalPath", () => {
    it("includes basePath when BASE_PATH is set", () => {
      expect(canonicalPath("/")).toBe("/lmcc-cna-exam-prep/");
      expect(canonicalPath("skills/hand-hygiene/")).toBe(
        "/lmcc-cna-exam-prep/skills/hand-hygiene/",
      );
    });
  });
});
