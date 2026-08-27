"use client";

export type ChecklistView = "list" | "pattern";

type PatternToggleProps = {
  view: ChecklistView;
  onChange: (view: ChecklistView) => void;
};

export default function PatternToggle({ view, onChange }: PatternToggleProps) {
  return (
    <div
      className="mp-toggle"
      role="group"
      aria-label="Choose checklist view"
      data-testid="pattern-toggle"
    >
      <button
        type="button"
        className={`mp-toggle__btn ${view === "list" ? "mp-toggle__btn--active" : ""}`}
        aria-pressed={view === "list"}
        onClick={() => onChange("list")}
      >
        Checklist
      </button>
      <button
        type="button"
        className={`mp-toggle__btn ${view === "pattern" ? "mp-toggle__btn--active" : ""}`}
        aria-pressed={view === "pattern"}
        onClick={() => onChange("pattern")}
      >
        Pattern view
      </button>
    </div>
  );
}
