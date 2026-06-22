/** @vitest-environment jsdom */
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("@/store/useMasteryStore", () => {
  const state = {
    isHydrated: true,
    skills: {},
    toggleStep: vi.fn(),
    markDrilled: vi.fn(),
    setMode: vi.fn(),
    setGotIt: vi.fn(),
    resetSkill: vi.fn(),
    isStepChecked: vi.fn(() => false),
    countCheckedScoredSteps: vi.fn(() => 0),
    migrateLegacyChecklist: vi.fn(),
  };
  return {
    useMasteryStore: (selector: (value: typeof state) => unknown) =>
      selector(state),
    rehydrateMasteryStore: vi.fn(),
    MASTERY_STORE_KEY: "lmcc-cna-mastery-v1-test",
  };
});

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

beforeAll(() => {
  class MockIntersectionObserver {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  }
  vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
});

afterEach(() => {
  cleanup();
});

import HomePage from "@/app/page";
import StudyPage from "@/app/study/page";
import SkillPageView from "@/components/SkillPageView";
import { ClientProviders } from "@/components/ClientProviders";
import { getSkillBySlug } from "@/lib/skills";

function renderWithProviders(ui: React.ReactElement) {
  return render(<ClientProviders>{ui}</ClientProviders>);
}

describe("route smoke — real layout provider tree", () => {
  it("index (/) renders through ClientProviders without throw", () => {
    expect(() => renderWithProviders(<HomePage />)).not.toThrow();
    expect(screen.getByRole("main")).toBeTruthy();
  });

  it("study page renders through ClientProviders without throw", () => {
    expect(() => renderWithProviders(<StudyPage />)).not.toThrow();
    expect(screen.getByRole("main")).toBeTruthy();
  });

  it("skill page (hand-hygiene) renders through ClientProviders without throw", () => {
    const skill = getSkillBySlug("hand-hygiene");
    expect(skill).toBeDefined();

    expect(() =>
      renderWithProviders(
        <SkillPageView skill={skill!} prev={undefined} next={undefined} />,
      ),
    ).not.toThrow();
    expect(
      screen.getAllByText("Hand Hygiene (Hand Washing)").length,
    ).toBeGreaterThan(0);
  });

  it("does not surface Internal Server Error copy in provider tree", () => {
    renderWithProviders(<StudyPage />);
    expect(document.body.textContent).not.toMatch(/Internal Server Error/i);
  });
});

describe("InstructorViewProvider — no useSearchParams SSR bailout", () => {
  it("defaults instructorView=false before client mount", () => {
    renderWithProviders(<HomePage />);
    expect(screen.queryAllByTestId("source-chip")).toHaveLength(0);
  });
});
