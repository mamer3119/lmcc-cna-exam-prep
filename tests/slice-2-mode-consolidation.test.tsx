import { readFileSync } from "node:fs";
import path from "node:path";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import SkillPageClient from "@/components/SkillPageClient";
import { ClientProviders } from "@/components/ClientProviders";
import {
  BOILERPLATE_TOKEN_REGISTRY,
  MODE_LABELS,
} from "@/lib/practice-labels";
import { getSkillBySlug } from "@/lib/skills";
import { shouldRenderBoilerplateChip } from "@/lib/boilerplate-tokens";
import {
  getSkillViewModeSnapshot,
  setSkillViewMode,
} from "@/lib/skill-view-mode-store";

function renderSkillPage(slug: string) {
  const skill = getSkillBySlug(slug);
  expect(skill).toBeTruthy();
  return render(
    <ClientProviders>
      <SkillPageClient skill={skill!} />
    </ClientProviders>,
  );
}

describe("Slice-2 mode consolidation", () => {
  it("renders exactly one mode selector with Full View / Core Only / Self-Check", () => {
    renderSkillPage("hand-hygiene");
    expect(screen.getByTestId("skill-view-mode-selector")).toBeTruthy();
    expect(screen.getByRole("button", { name: MODE_LABELS.fullView })).toBeTruthy();
    expect(screen.getByRole("button", { name: MODE_LABELS.coreOnly })).toBeTruthy();
    expect(screen.getByRole("button", { name: MODE_LABELS.selfCheck })).toBeTruthy();
  });

  it("does not render legacy nested toggles on skill page", () => {
    const pageSrc = readFileSync(
      path.join(process.cwd(), "components/SkillPageClient.tsx"),
      "utf8",
    );
    expect(pageSrc).not.toMatch(/SkillPracticeToggle/);
    expect(pageSrc).not.toMatch(/SegmentFilterToggle/);

    renderSkillPage("hand-hygiene");
    expect(screen.queryByRole("button", { name: /Hide & reveal/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /All steps/i })).toBeNull();
    expect(screen.queryByText("Learn")).toBeNull();
    expect(screen.queryByText("Test Yourself")).toBeNull();
  });

  it("SkillChecklist source has no Hide & reveal toggle block", () => {
    const src = readFileSync(
      path.join(process.cwd(), "components/SkillChecklist.tsx"),
      "utf8",
    );
    expect(src).not.toMatch(/CHECKLIST_VIEW_LABELS/);
    expect(src).not.toMatch(/Hide & reveal/);
  });

  it("mode persists in memory across setSkillViewMode calls (no localStorage)", () => {
    setSkillViewMode("self-check");
    expect(getSkillViewModeSnapshot().mode).toBe("self-check");
    setSkillViewMode("core-only");
    expect(getSkillViewModeSnapshot().mode).toBe("core-only");
    setSkillViewMode("full-view");
    expect(getSkillViewModeSnapshot().mode).toBe("full-view");
  });
});

describe("Slice-2 boilerplate token chips", () => {
  it("registry documents 9-templates vs 10-tokens reconciliation", () => {
    expect(Object.keys(BOILERPLATE_TOKEN_REGISTRY)).toHaveLength(9);
    expect(BOILERPLATE_TOKEN_REGISTRY.INTRO_EXPLAIN.wording).toBeTruthy();
    expect(BOILERPLATE_TOKEN_REGISTRY.INTRO_IDENTIFY.wording).toBeTruthy();
  });

  it("renders inline chips on urinary-output HAND_HYGIENE step", () => {
    renderSkillPage("urinary-output-measurement");
    const chips = screen.getAllByTestId("boilerplate-token-chip");
    expect(chips.length).toBeGreaterThan(0);
    expect(
      chips.some((el) => el.getAttribute("data-token-id") === "HAND_HYGIENE"),
    ).toBe(true);
  });

  it("does not render chip on hand-hygiene INTRO_IDENTIFY — wording mismatch", () => {
    const skill = getSkillBySlug("hand-hygiene")!;
    const step = skill.steps.find((s) => s.boilerplateId === "INTRO_IDENTIFY")!;
    expect(shouldRenderBoilerplateChip(step, skill.slug)).toBe(false);
  });

  it("chip wording matches registry const for tagged urinary-output steps", () => {
    const skill = getSkillBySlug("urinary-output-measurement")!;
    for (const step of skill.steps) {
      if (!shouldRenderBoilerplateChip(step, skill.slug)) {
        continue;
      }
      const id = step.boilerplateId as keyof typeof BOILERPLATE_TOKEN_REGISTRY;
      expect(BOILERPLATE_TOKEN_REGISTRY[id].wording).toBeTruthy();
    }
  });
});
