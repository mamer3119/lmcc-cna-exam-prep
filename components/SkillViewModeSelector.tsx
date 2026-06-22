"use client";

import { useCallback, useSyncExternalStore } from "react";

import { MODE_LABELS, type SkillViewMode } from "@/lib/practice-labels";
import {
  getSkillViewModeSnapshot,
  setSkillViewMode,
  subscribeSkillViewMode,
} from "@/lib/skill-view-mode-store";

function getServerSnapshot() {
  return getSkillViewModeSnapshot();
}

export function useSkillViewMode(): SkillViewMode {
  return useSyncExternalStore(
    subscribeSkillViewMode,
    () => getSkillViewModeSnapshot().mode,
    () => getSkillViewModeSnapshot().mode,
  );
}

type SkillViewModeSelectorProps = {
  skillSlug: string;
};

export function SkillViewModeSelector({ skillSlug }: SkillViewModeSelectorProps) {
  const mode = useSkillViewMode();

  const select = useCallback((next: SkillViewMode) => {
    setSkillViewMode(next);
  }, []);

  return (
    <div
      className="skill-view-mode-selector print:hidden"
      role="group"
      aria-label={MODE_LABELS.groupAria}
      data-skill-slug={skillSlug}
      data-testid="skill-view-mode-selector"
    >
      <button
        type="button"
        className={`skill-view-mode-selector__btn ${mode === "full-view" ? "skill-view-mode-selector__btn--active" : ""}`}
        aria-pressed={mode === "full-view"}
        onClick={() => select("full-view")}
      >
        {MODE_LABELS.fullView}
      </button>
      <button
        type="button"
        className={`skill-view-mode-selector__btn ${mode === "core-only" ? "skill-view-mode-selector__btn--active" : ""}`}
        aria-pressed={mode === "core-only"}
        onClick={() => select("core-only")}
      >
        {MODE_LABELS.coreOnly}
      </button>
      <button
        type="button"
        className={`skill-view-mode-selector__btn ${mode === "self-check" ? "skill-view-mode-selector__btn--active" : ""}`}
        aria-pressed={mode === "self-check"}
        onClick={() => select("self-check")}
      >
        {MODE_LABELS.selfCheck}
      </button>
    </div>
  );
}
