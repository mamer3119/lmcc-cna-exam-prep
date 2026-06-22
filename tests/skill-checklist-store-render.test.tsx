/** @vitest-environment jsdom */
/**
 * Hydration gate — real Zustand store + useSyncExternalStore snapshot path.
 * HTTP 200 probes miss client throws from unstable selector references.
 */
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

afterEach(() => {
  cleanup();
});

import SkillChecklist from "@/components/SkillChecklist";
import SkillPageClient from "@/components/SkillPageClient";
import { ClientProviders } from "@/components/ClientProviders";
import { getCurriculumMeta } from "@/data/skillCurriculum";
import { getSkillBySlug } from "@/lib/skills";
import {
  EMPTY_CHECKED_STEPS,
  selectSkillCheckedSteps,
} from "@/store/mastery-selectors";
import { MASTERY_STORE_KEY, useMasteryStore } from "@/store/useMasteryStore";

describe("selectSkillCheckedSteps — stable snapshot references", () => {
  beforeEach(() => {
    useMasteryStore.setState({ skills: {}, isHydrated: true });
  });

  it("returns the same EMPTY reference for missing skills", () => {
    const a = selectSkillCheckedSteps(useMasteryStore.getState(), "missing");
    const b = selectSkillCheckedSteps(useMasteryStore.getState(), "missing");
    expect(a).toBe(b);
    expect(a).toBe(EMPTY_CHECKED_STEPS);
  });
});

describe("SkillChecklist + real useMasteryStore (hydration render gate)", () => {
  beforeEach(() => {
    useMasteryStore.setState({ skills: {}, isHydrated: true });
    window.localStorage.removeItem(MASTERY_STORE_KEY);
  });

  it("renders hand-hygiene progress without useSyncExternalStore loop", () => {
    const skill = getSkillBySlug("hand-hygiene");
    expect(skill).toBeDefined();

    expect(() =>
      render(
        <ClientProviders>
          <SkillChecklist
            title={skill!.title}
            steps={skill!.steps}
            skillSlug={skill!.slug}
            organizerMeta={getCurriculumMeta(skill!.slug)}
            hideReset
          />
        </ClientProviders>,
      ),
    ).not.toThrow();

    expect(screen.getByText(/0 of 11 steps/i)).toBeTruthy();
    expect(document.body.textContent).not.toMatch(/Application error/i);
    expect(document.body.textContent).not.toMatch(
      /getServerSnapshot should be cached/i,
    );
  });

  it("SkillPageClient mounts SkillChecklist without throw", () => {
    const skill = getSkillBySlug("hand-hygiene");
    expect(skill).toBeDefined();

    expect(() =>
      render(
        <ClientProviders>
          <SkillPageClient skill={skill!} />
        </ClientProviders>,
      ),
    ).not.toThrow();

    expect(screen.getByText(/0 of 11 steps/i)).toBeTruthy();
  });
});
