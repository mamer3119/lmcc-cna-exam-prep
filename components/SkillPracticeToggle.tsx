"use client";

import {
  CHECKLIST_VIEW_LABELS,
  PRACTICE_MODE_LABELS,
} from "@/lib/practice-labels";

type SkillPracticeToggleProps = {
  mode: "learn" | "test-yourself";
  onChange: (mode: "learn" | "test-yourself") => void;
};

export function SkillPracticeToggle({
  mode,
  onChange,
}: SkillPracticeToggleProps) {
  return (
    <div
      className="skill-practice-toggle print:hidden"
      role="group"
      aria-label={PRACTICE_MODE_LABELS.practiceGroupAria}
    >
      <button
        type="button"
        className={`skill-practice-toggle__btn ${mode === "learn" ? "skill-practice-toggle__btn--active" : ""}`}
        aria-pressed={mode === "learn"}
        onClick={() => onChange("learn")}
      >
        {PRACTICE_MODE_LABELS.learn}
      </button>
      <button
        type="button"
        className={`skill-practice-toggle__btn ${mode === "test-yourself" ? "skill-practice-toggle__btn--active" : ""}`}
        aria-pressed={mode === "test-yourself"}
        onClick={() => onChange("test-yourself")}
      >
        {PRACTICE_MODE_LABELS.testYourself}
      </button>
    </div>
  );
}
