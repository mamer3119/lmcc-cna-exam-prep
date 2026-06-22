/** @vitest-environment jsdom */
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

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

vi.mock("@/components/InstructorViewProvider", () => ({
  useInstructorViewContext: () => ({ instructorView: false, ready: true }),
}));

afterEach(() => {
  cleanup();
});

import SkillChecklist from "@/components/SkillChecklist";
import { StepClinicalNote } from "@/components/StepClinicalNote";
import { getSkillBySlug } from "@/lib/skills";
import { resolveStepClinicalNote } from "@/lib/skill-step-meta";
import {
  getInstructorNote,
  getStudentNote,
  noteBodyHasOrphanExtension,
} from "@/lib/clinical-note-display";

function ppeStep16Note(): string {
  const skill = getSkillBySlug("ppe-gown-gloves");
  const step16 = skill?.steps.find((s) => s.id === 16);
  const raw = resolveStepClinicalNote(step16!);
  expect(raw).toBeTruthy();
  return raw!;
}

describe("StepClinicalNote render (instructor SourceChip)", () => {
  it("renders SourceChip when instructorView is true (PPE step 16)", () => {
    const raw = ppeStep16Note();

    render(<StepClinicalNote rawNote={raw} instructorView instructorReady />);

    expect(screen.getByTestId("source-chip")).toBeTruthy();
    expect(screen.getByTestId("source-chip").textContent).toMatch(
      /Michelle's exact phrase/i,
    );
    expect(screen.getByText(/Washing before documenting/i)).toBeTruthy();
    const noteParagraph = screen
      .getByText(/Washing before documenting/i)
      .closest("p");
    expect(noteParagraph?.textContent).toMatch(
      /Verbalize: "At this time I would wash my hands\." Washing before documenting/,
    );
    expect(noteParagraph?.textContent).not.toMatch(/\.\s*md\.\s*Washing/i);
  });

  it("does not render SourceChip when instructorView is false", () => {
    const raw = ppeStep16Note();

    render(
      <StepClinicalNote rawNote={raw} instructorView={false} instructorReady />,
    );

    expect(screen.queryAllByTestId("source-chip")).toHaveLength(0);
    expect(screen.getByText(/wash my hands/i)).toBeTruthy();
    expect(screen.queryByText(/S07/i)).toBeNull();
  });
});

describe("SkillChecklist instructor wiring", () => {
  it("renders SourceChip on PPE step 16 when instructorView prop is true", () => {
    const skill = getSkillBySlug("ppe-gown-gloves");
    expect(skill).toBeDefined();

    render(
      <SkillChecklist
        title={skill!.title}
        steps={skill!.steps}
        skillSlug={skill!.slug}
        instructorView
        hideProgress
        hideReset
        display={{ preset: "studyCompact" }}
      />,
    );

    expect(screen.getAllByTestId("source-chip").length).toBeGreaterThan(0);
  });

  it("does not render SourceChip when instructorView prop is false", () => {
    const skill = getSkillBySlug("ppe-gown-gloves");
    expect(skill).toBeDefined();

    render(
      <SkillChecklist
        title={skill!.title}
        steps={skill!.steps}
        skillSlug={skill!.slug}
        instructorView={false}
        hideProgress
        hideReset
        display={{ preset: "studyCompact" }}
      />,
    );

    expect(screen.queryAllByTestId("source-chip")).toHaveLength(0);
  });
});

describe("PPE step 16 sanitizer regression", () => {
  it("student and instructor bodies have no orphaned md./pdf. tokens", () => {
    const raw = ppeStep16Note();
    const student = getStudentNote(raw);
    const instructor = getInstructorNote(raw);

    expect(student).toBeTruthy();
    expect(instructor?.body).toBeTruthy();
    expect(noteBodyHasOrphanExtension(student)).toBe(false);
    expect(noteBodyHasOrphanExtension(instructor?.body)).toBe(false);
    expect(student).not.toMatch(/\b(md|pdf)\b\./i);
    expect(instructor?.body).not.toMatch(/\b(md|pdf)\b\./i);
    expect(student).toMatch(/wash my hands/i);
    expect(student).toMatch(/Washing before documenting/i);
  });

  it("instructor body equals student body; chip only when instructorView", () => {
    const raw = ppeStep16Note();
    const student = getStudentNote(raw);
    const instructor = getInstructorNote(raw);

    expect(instructor?.body).toBe(student);
    expect(instructor?.body).not.toMatch(/Michelle's exact phrase/i);
    expect(instructor?.body).not.toMatch(/\bS\d{2}\b/);
    expect(instructor?.body).not.toMatch(/\.md|\.pdf/i);
    expect(instructor?.sourceChip).toBeTruthy();
  });

  it("render: instructor paragraph body matches student (chip excluded)", () => {
    const raw = ppeStep16Note();
    const studentBody = getStudentNote(raw)!;

    const { container: studentDom } = render(
      <StepClinicalNote rawNote={raw} instructorView={false} instructorReady />,
    );
    const studentP = studentDom.querySelector("p");
    const paragraphBody = (el: Element | null) => {
      if (!el) {
        return "";
      }
      const clone = el.cloneNode(true) as Element;
      clone.querySelector("[data-testid='source-chip']")?.remove();
      return clone.textContent?.trim() ?? "";
    };
    expect(paragraphBody(studentP)).toBe(studentBody);

    cleanup();

    const { container: instructorDom } = render(
      <StepClinicalNote rawNote={raw} instructorView instructorReady />,
    );
    const instructorP = instructorDom.querySelector("p");
    expect(paragraphBody(instructorP)).toBe(studentBody);
    expect(
      instructorDom.querySelector("[data-testid='source-chip']"),
    ).toBeTruthy();
  });
});
