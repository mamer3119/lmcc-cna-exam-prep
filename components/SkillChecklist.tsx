"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";

import type { CurriculumSkillMeta } from "@/data/skillCurriculum";
import {
  criticalStepBadgeLabel,
  isCriticalStepText,
} from "@/lib/critical-steps";
import { stepOrganizerAttributes } from "@/hooks/useScrollOrganizers";
import type { ChecklistStep } from "@/lib/checklist-step";
import {
  resolveStepDisplayText,
  resolveStepSegment,
} from "@/lib/checklist-step";
import type { StepSegment } from "@/lib/skill-templates";

import { StepSegmentBadge } from "@/components/TemplateChip";
import { PhaseDivider } from "@/components/PhaseDivider";
import { ExamScorecard } from "@/components/ExamScorecard";
import {
  getExamScorecard,
  shouldShowInlineExamScorecard,
  skillHasExamScorecards,
} from "@/lib/exam-scorecard";

import "./skill-checklist.css";

export type { ChecklistStep } from "@/lib/checklist-step";

export type ChecklistMode = "study" | "quiz";

export type SkillChecklistProps = {
  title: string;
  steps: ChecklistStep[];
  /** localStorage key for persisting checkbox state */
  storageKey?: string;
  mode?: ChecklistMode;
  onModeChange?: (mode: ChecklistMode) => void;
  showModeToggle?: boolean;
  showCriticalBadges?: boolean;
  onAnyCheckedChange?: (anyChecked: boolean) => void;
  compact?: boolean;
  hideFooter?: boolean;
  hideProgress?: boolean;
  hideReset?: boolean;
  /** Phase-organizer layer: template open/core/close weighting */
  organizerMeta?: CurriculumSkillMeta;
  showSegmentBadges?: boolean;
  /** Exam scoring numerics — independent of phase badges (R7) */
  showExamScorecards?: boolean;
  /** Fallback slug when organizerMeta is omitted */
  skillSlug?: string;
};

function stepSegmentClass(segment: StepSegment): string {
  return `skill-step-segment--${segment}`;
}

export function mainStepAriaLabel(step: ChecklistStep, slug?: string): string {
  return `Step ${step.id}: ${resolveStepDisplayText(step, { slug })}`;
}

export function subStepAriaLabel(stepId: number, subText: string): string {
  return `Step ${stepId} sub-step: ${subText}`;
}

function stepRevealKey(stepId: number, subIndex?: number): string {
  return subIndex === undefined ?
      `main-${stepId}`
    : `sub-${stepId}-${subIndex}`;
}

function checkedTextClass(isChecked: boolean): string {
  return isChecked ? "step-text--checked" : "";
}

function readStoredState(storageKey: string): Record<string, boolean> {
  if (typeof window === "undefined") {
    return {};
  }
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return {};
    }
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      return {};
    }
    const state: Record<string, boolean> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === "boolean") {
        state[key] = value;
      }
    }
    return state;
  } catch {
    return {};
  }
}

function writeStoredState(
  storageKey: string,
  state: Record<string, boolean>,
): void {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  } catch {
    // Ignore quota / private-mode errors
  }
}

export default function SkillChecklist({
  title,
  steps,
  storageKey,
  mode = "study",
  onModeChange,
  showModeToggle = false,
  showCriticalBadges = true,
  onAnyCheckedChange,
  compact = false,
  hideFooter = false,
  hideProgress = false,
  hideReset = false,
  organizerMeta,
  showSegmentBadges = false,
  showExamScorecards,
  skillSlug,
}: SkillChecklistProps) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [hydrated, setHydrated] = useState(false);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  const allRevealKeys = useMemo(() => {
    const keys: string[] = [];
    for (const step of steps) {
      keys.push(stepRevealKey(step.id));
      step.subSteps?.forEach((_, index) => {
        keys.push(stepRevealKey(step.id, index));
      });
    }
    return keys;
  }, [steps]);

  const allAriaLabels = useMemo(() => {
    const labels: string[] = [];
    for (const step of steps) {
      labels.push(mainStepAriaLabel(step));
      step.subSteps?.forEach((subText) => {
        labels.push(subStepAriaLabel(step.id, subText));
      });
    }
    return labels;
  }, [steps]);

  useEffect(() => {
    if (!storageKey) {
      setHydrated(true);
      return;
    }
    setChecked(readStoredState(storageKey));
    setHydrated(true);
  }, [storageKey]);

  useEffect(() => {
    if (!storageKey || !hydrated) {
      return;
    }
    writeStoredState(storageKey, checked);
  }, [checked, storageKey, hydrated]);

  const anyChecked = allAriaLabels.some((label) => checked[label]);

  useEffect(() => {
    onAnyCheckedChange?.(anyChecked);
  }, [anyChecked, onAnyCheckedChange]);

  const isChecked = useCallback(
    (ariaLabel: string) => Boolean(checked[ariaLabel]),
    [checked],
  );

  const toggle = useCallback((ariaLabel: string) => {
    setChecked((prev) => ({ ...prev, [ariaLabel]: !prev[ariaLabel] }));
  }, []);

  const resetAll = useCallback(() => {
    setChecked({});
    if (storageKey) {
      try {
        window.localStorage.removeItem(storageKey);
      } catch {
        // Ignore private-mode errors
      }
    }
  }, [storageKey]);

  const isRevealed = useCallback(
    (key: string) => Boolean(revealed[key]),
    [revealed],
  );

  const revealOne = useCallback((key: string) => {
    setRevealed((prev) => ({ ...prev, [key]: true }));
  }, []);

  const revealAll = useCallback(() => {
    const all: Record<string, boolean> = {};
    for (const key of allRevealKeys) {
      all[key] = true;
    }
    setRevealed(all);
  }, [allRevealKeys]);

  const hideAll = useCallback(() => {
    setRevealed({});
  }, []);

  const totalSteps = allAriaLabels.length;
  const completedSteps = allAriaLabels.filter((label) =>
    Boolean(checked[label]),
  ).length;
  const progressPct =
    totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  const isQuiz = mode === "quiz";
  const resolvedSkillSlug = skillSlug ?? organizerMeta?.slug;
  const showScorecards =
    showExamScorecards ??
    (resolvedSkillSlug ? skillHasExamScorecards(resolvedSkillSlug) : false);

  function renderSegmentBadge(
    stepSegment: StepSegment | null,
    phaseStartBadge: boolean,
  ) {
    if (!showSegmentBadges || !stepSegment) {
      return null;
    }
    return (
      <div className="skill-step-segment-col">
        <StepSegmentBadge segment={stepSegment} phaseStart={phaseStartBadge} />
      </div>
    );
  }

  function renderCriticalBadge(text: string, revealedNow: boolean) {
    if (!showCriticalBadges || !isCriticalStepText(text)) {
      return null;
    }
    const label = criticalStepBadgeLabel(text);
    if (!label) {
      return null;
    }
    return (
      <span
        className={`skill-critical-badge ${revealedNow && isQuiz ? "skill-critical-badge--revealed" : ""}`.trim()}
      >
        {label}
      </span>
    );
  }

  return (
    <article
      className={`skill-checklist mx-auto max-w-3xl px-4 py-8 print:px-0 print:py-0 print:text-black ${compact ? "skill-checklist--compact" : ""} ${showSegmentBadges ? "skill-checklist--segment-badges" : ""}`.trim()}
    >
      <p className="print-header mb-4 hidden text-sm font-semibold uppercase tracking-wide print:block print:text-black">
        LMCC — California CNA Skills Exam Prep
      </p>

      <header className="skill-checklist-header print:border-black">
        <h1 className="skill-checklist-title print:text-black">{title}</h1>
      </header>

      {showModeToggle ?
        <div className="skill-mode-toggle print:hidden">
          <button
            type="button"
            className={`skill-mode-btn ${mode === "study" ? "skill-mode-btn--active" : ""}`}
            onClick={() => onModeChange?.("study")}
            aria-pressed={mode === "study"}
          >
            📖 Study Mode
          </button>
          <button
            type="button"
            className={`skill-mode-btn ${mode === "quiz" ? "skill-mode-btn--active" : ""}`}
            onClick={() => onModeChange?.("quiz")}
            aria-pressed={mode === "quiz"}
          >
            🧠 Quiz Mode
          </button>
        </div>
      : null}

      {isQuiz ?
        <div className="skill-quiz-toolbar print:hidden">
          <button
            type="button"
            className="skill-quiz-action"
            onClick={revealAll}
          >
            Reveal All
          </button>
          <button type="button" className="skill-quiz-action" onClick={hideAll}>
            Hide All
          </button>
        </div>
      : null}

      {!hideProgress ?
        <div
          className="skill-checklist-progress print:hidden"
          role="progressbar"
          aria-valuenow={completedSteps}
          aria-valuemin={0}
          aria-valuemax={totalSteps}
          aria-label={`Checklist progress: ${completedSteps} of ${totalSteps} steps complete`}
        >
          <div className="skill-checklist-progress-meta">
            <span>
              {completedSteps} of {totalSteps} steps
            </span>
            <span className="skill-checklist-progress-pct">{progressPct}%</span>
          </div>
          <div className="skill-checklist-progress-track">
            <div
              className="skill-checklist-progress-fill"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      : null}

      {!hideReset ?
        <div className="skill-checklist-toolbar print:hidden">
          <button
            type="button"
            onClick={resetAll}
            disabled={!anyChecked}
            className="skill-checklist-reset reset-button print:hidden"
          >
            Reset checklist
          </button>
        </div>
      : null}

      <h2 className="skill-checklist-section-label print:border-black print:text-black">
        Official Checklist
      </h2>

      <ul className="list-none space-y-3 p-0">
        {steps.map((step, stepIndex) => {
          const checklistSlug = organizerMeta?.slug ?? skillSlug;
          const mainLabel = mainStepAriaLabel(step, checklistSlug);
          const mainChecked = isChecked(mainLabel);
          const mainKey = stepRevealKey(step.id);
          const mainRevealed = isRevealed(mainKey);
          const showMainText = !isQuiz || mainRevealed;
          const displayText = resolveStepDisplayText(step, {
            slug: checklistSlug,
          });
          const segmentCtx =
            organizerMeta ?
              {
                template: organizerMeta.template,
                stepIndex,
                totalSteps: steps.length,
                skillSlug: organizerMeta.slug,
              }
            : null;
          const stepSegment: StepSegment | null =
            segmentCtx ? resolveStepSegment(step, segmentCtx) : null;
          const prevStep = stepIndex > 0 ? steps[stepIndex - 1] : null;
          const prevSegment: StepSegment | null =
            prevStep && segmentCtx ?
              resolveStepSegment(prevStep, {
                ...segmentCtx,
                stepIndex: stepIndex - 1,
              })
            : null;
          const showCoreDivider =
            showSegmentBadges &&
            prevSegment === "open" &&
            stepSegment === "core";
          const showCloseDivider =
            showSegmentBadges &&
            prevSegment === "core" &&
            stepSegment === "close";
          const phaseStartBadge =
            showSegmentBadges &&
            stepSegment !== null &&
            ((stepSegment === "core" && prevSegment === "open") ||
              (stepSegment === "close" && prevSegment === "core"));
          const organizerAttrs =
            organizerMeta && stepSegment ?
              stepOrganizerAttributes({
                meta: organizerMeta,
                stepNumber: step.id,
                stepSegment,
                skillName: title,
              })
            : {};

          const scorecardEntry =
            showScorecards && resolvedSkillSlug ?
              getExamScorecard(resolvedSkillSlug, step.id)
            : undefined;
          const showInlineScorecard =
            scorecardEntry &&
            resolvedSkillSlug &&
            shouldShowInlineExamScorecard(scorecardEntry, {
              isQuiz,
              showMainText,
              slug: resolvedSkillSlug,
            });

          return (
            <Fragment key={step.id}>
              {showCoreDivider ?
                <li
                  role="presentation"
                  className="phase-divider-wrap print:hidden"
                >
                  <PhaseDivider label="Core Procedure Begins" />
                </li>
              : null}
              {showCloseDivider ?
                <li
                  role="presentation"
                  className="phase-divider-wrap print:hidden"
                >
                  <PhaseDivider label="Closing Phase Begins" />
                </li>
              : null}
              <li
                className={`space-y-1 ${stepSegment ? stepSegmentClass(stepSegment) : ""}`}
                {...organizerAttrs}
              >
                {showInlineScorecard ?
                  <ExamScorecard entry={scorecardEntry} />
                : null}
                <div className="skill-step-row flex items-start gap-2">
                  {!isQuiz ?
                    <label className="skill-step-label flex min-h-[44px] min-w-0 flex-1 cursor-pointer items-start gap-2">
                      <input
                        type="checkbox"
                        aria-label={mainLabel}
                        checked={mainChecked}
                        onChange={() => toggle(mainLabel)}
                        className="skill-checkbox mt-2 shrink-0 rounded border-gray-400 print:mt-0"
                      />
                      {renderSegmentBadge(stepSegment, phaseStartBadge)}
                      <span
                        className={`skill-step-body leading-relaxed ${checkedTextClass(mainChecked)} ${isCriticalStepText(displayText) ? "skill-step--critical" : ""}`}
                      >
                        <strong className="skill-checklist-step-num print:text-black">
                          {step.id}.
                        </strong>{" "}
                        {displayText}
                        {renderCriticalBadge(displayText, showMainText)}
                      </span>
                    </label>
                  : <div className="skill-step-label flex min-h-[44px] min-w-0 flex-1 flex-col gap-2">
                      <div className="skill-step-row flex min-w-0 items-start gap-2">
                        {renderSegmentBadge(stepSegment, phaseStartBadge)}
                        <div className="skill-step-body min-w-0 flex-1">
                          <strong className="skill-checklist-step-num skill-quiz-placeholder print:text-black">
                            {step.id}.
                          </strong>{" "}
                          {showMainText ?
                            <span
                              className={`leading-relaxed ${isCriticalStepText(displayText) ? "skill-step--critical skill-step--critical-revealed" : ""}`}
                            >
                              {displayText}
                              {renderCriticalBadge(displayText, true)}
                            </span>
                          : <span className="skill-quiz-hidden">
                              Step hidden — recall from memory
                            </span>
                          }
                        </div>
                      </div>
                      {!showMainText ?
                        <button
                          type="button"
                          className="skill-reveal-btn"
                          onClick={() => revealOne(mainKey)}
                        >
                          Reveal Step
                        </button>
                      : null}
                    </div>
                  }
                </div>

                {step.note && (!isQuiz || mainRevealed) ?
                  <p className="skill-checklist-note note-text print:text-black">
                    {step.note}
                  </p>
                : null}

                {step.subSteps && step.subSteps.length > 0 ?
                  <ul className="ml-6 list-none space-y-2 p-0">
                    {step.subSteps.map((subText, subIndex) => {
                      const subLabel = subStepAriaLabel(step.id, subText);
                      const subChecked = isChecked(subLabel);
                      const subKey = stepRevealKey(step.id, subIndex);
                      const subRevealed = isRevealed(subKey);
                      const showSubText = !isQuiz || subRevealed;

                      return (
                        <li key={subLabel}>
                          {!isQuiz ?
                            <label className="flex min-h-[44px] cursor-pointer items-start gap-2">
                              <input
                                type="checkbox"
                                aria-label={subLabel}
                                checked={subChecked}
                                onChange={() => toggle(subLabel)}
                                className="skill-checkbox mt-2 shrink-0 rounded border-gray-400"
                              />
                              <span
                                className={`text-sm leading-relaxed ${checkedTextClass(subChecked)} ${isCriticalStepText(subText) ? "skill-step--critical" : ""}`}
                              >
                                {subText}
                                {renderCriticalBadge(subText, true)}
                              </span>
                            </label>
                          : <div className="flex min-h-[44px] flex-col gap-2">
                              {showSubText ?
                                <span
                                  className={`text-sm leading-relaxed ${isCriticalStepText(subText) ? "skill-step--critical skill-step--critical-revealed" : ""}`}
                                >
                                  • {subText}
                                  {renderCriticalBadge(subText, true)}
                                </span>
                              : <span className="skill-quiz-hidden text-sm">
                                  Sub-step hidden
                                </span>
                              }
                              {!showSubText ?
                                <button
                                  type="button"
                                  className="skill-reveal-btn"
                                  onClick={() => revealOne(subKey)}
                                >
                                  Reveal Step
                                </button>
                              : null}
                            </div>
                          }
                        </li>
                      );
                    })}
                  </ul>
                : null}
              </li>
            </Fragment>
          );
        })}
      </ul>

      {!hideFooter ?
        <footer className="skill-checklist-footer print:border-black print:text-black">
          Check each box during lab practice. Step wording matches the state
          evaluator checklist.
        </footer>
      : null}
    </article>
  );
}
