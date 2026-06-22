"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";

import type { CurriculumSkillMeta } from "@/data/skillCurriculum";
import {
  criticalStepBadgeLabelForStep,
  isStepCritical,
  resolveStepClinicalNote,
  resolveStepDetailedText,
  resolveStepPhaseWord,
  resolveStepRendersAs,
  resolveStepSubSteps,
  resolveStepTagCategory,
} from "@/lib/skill-step-meta";
import { getStepPhaseColor, PHASE_COLORS } from "@/lib/step-phase";
import {
  resolveChecklistDisplay,
  type ChecklistDisplayInput,
  type ChecklistEnrichmentDisplay,
  type ChecklistMode,
} from "@/lib/checklist-display";
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
  getExamScorecardForStep,
  shouldShowInlineExamScorecard,
  skillHasExamScorecards,
} from "@/lib/exam-scorecard";
import { useInstructorViewContext } from "@/components/InstructorViewProvider";
import { StepClinicalNote } from "@/components/StepClinicalNote";
import { HandHygieneEmbedChip } from "@/components/HandHygieneEmbedChip";
import { LearnSegmentHeading } from "@/components/LearnSegmentHeading";
import { StepLearnMeta } from "@/components/StepLearnMeta";
import { StepMotionItem } from "@/components/StepMotionItem";
import { isHandHygieneEmbedStep } from "@/lib/learn-mode-display";
import { getLearnProgressSteps, masteryStepId } from "@/lib/scored-steps";
import { CHECKLIST_VIEW_LABELS } from "@/lib/practice-labels";
import {
  filterStepsBySegment,
  type SegmentFilterMode,
} from "@/lib/segment-filter";
import {
  rehydrateMasteryStore,
  useMasteryStore,
} from "@/store/useMasteryStore";
import { selectSkillCheckedSteps } from "@/store/mastery-selectors";

import "./skill-checklist.css";

export type { ChecklistMode } from "@/lib/checklist-display";
export type { ChecklistStep } from "@/lib/checklist-step";

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
  /** Central enrichment toggles — merges with legacy boolean props */
  display?: ChecklistDisplayInput;
  /** Explicit override — used in tests; otherwise read from ?instructor=true via provider */
  instructorView?: boolean;
  /** URL-driven ?filter=core — hides OPEN/CLOSE bookends */
  segmentFilterMode?: SegmentFilterMode;
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

function subStepCheckedTextClass(isChecked: boolean): string {
  return isChecked ? "substep-text--checked" : "";
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
  display,
  instructorView: instructorViewProp,
  segmentFilterMode = "all",
}: SkillChecklistProps) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [hydrated, setHydrated] = useState(false);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const instructorCtx = useInstructorViewContext();
  const instructorViewActive =
    instructorViewProp ?? instructorCtx.instructorView;
  const instructorReady =
    instructorViewProp !== undefined ? true : instructorCtx.ready;
  const storeHydrated = useMasteryStore((s) => s.isHydrated);
  const toggleStepInStore = useMasteryStore((s) => s.toggleStep);
  const resetSkillInStore = useMasteryStore((s) => s.resetSkill);
  const migrateLegacyChecklist = useMasteryStore(
    (s) => s.migrateLegacyChecklist,
  );

  const enrichmentDisplay = useMemo(
    () =>
      resolveChecklistDisplay({
        mode,
        showSegmentBadges,
        showCriticalBadges,
        showExamScorecards,
        ...display,
      }),
    [mode, showSegmentBadges, showCriticalBadges, showExamScorecards, display],
  );

  const resolvedSkillSlug = skillSlug ?? organizerMeta?.slug;

  const visibleSteps = useMemo(
    () => filterStepsBySegment(steps, segmentFilterMode),
    [steps, segmentFilterMode],
  );

  const progressSteps = useMemo(
    () => getLearnProgressSteps(visibleSteps),
    [visibleSteps],
  );

  const allRevealKeys = useMemo(() => {
    const keys: string[] = [];
    for (const step of visibleSteps) {
      keys.push(stepRevealKey(step.id));
      if (!enrichmentDisplay.subSteps) {
        continue;
      }
      resolveStepSubSteps(step)?.forEach((_, index) => {
        keys.push(stepRevealKey(step.id, index));
      });
    }
    return keys;
  }, [visibleSteps, enrichmentDisplay.subSteps]);

  const allAriaLabels = useMemo(() => {
    const labels: string[] = [];
    for (const step of visibleSteps) {
      labels.push(mainStepAriaLabel(step, resolvedSkillSlug));
      if (!enrichmentDisplay.subSteps) {
        continue;
      }
      resolveStepSubSteps(step)?.forEach((subText) => {
        labels.push(subStepAriaLabel(step.id, subText));
      });
    }
    return labels;
  }, [visibleSteps, resolvedSkillSlug, enrichmentDisplay.subSteps]);

  useEffect(() => {
    rehydrateMasteryStore();
  }, []);

  useEffect(() => {
    if (!storageKey) {
      setHydrated(true);
      return;
    }
    setChecked(readStoredState(storageKey));
    setHydrated(true);
  }, [storageKey]);

  useEffect(() => {
    if (!resolvedSkillSlug || !storageKey || !hydrated || !storeHydrated) {
      return;
    }
    migrateLegacyChecklist(resolvedSkillSlug, storageKey, steps, (step) =>
      mainStepAriaLabel(step, resolvedSkillSlug),
    );
  }, [
    resolvedSkillSlug,
    storageKey,
    hydrated,
    storeHydrated,
    steps,
    migrateLegacyChecklist,
  ]);

  useEffect(() => {
    if (!storageKey || !hydrated) {
      return;
    }
    writeStoredState(storageKey, checked);
  }, [checked, storageKey, hydrated]);

  const storeCheckedSteps = useMasteryStore((s) =>
    selectSkillCheckedSteps(s, resolvedSkillSlug),
  );

  const isMainStepChecked = useCallback(
    (step: ChecklistStep) => {
      if (resolvedSkillSlug && storeHydrated) {
        return storeCheckedSteps.includes(masteryStepId(step));
      }
      const label = mainStepAriaLabel(step, resolvedSkillSlug);
      return Boolean(checked[label]);
    },
    [checked, resolvedSkillSlug, storeHydrated, storeCheckedSteps],
  );

  const isChecked = useCallback(
    (ariaLabel: string) => Boolean(checked[ariaLabel]),
    [checked],
  );

  const toggleMainStep = useCallback(
    (step: ChecklistStep) => {
      if (resolvedSkillSlug && storeHydrated) {
        toggleStepInStore(resolvedSkillSlug, masteryStepId(step));
        return;
      }
      const label = mainStepAriaLabel(step, resolvedSkillSlug);
      setChecked((prev) => ({ ...prev, [label]: !prev[label] }));
    },
    [resolvedSkillSlug, storeHydrated, toggleStepInStore],
  );

  const toggle = useCallback((ariaLabel: string) => {
    setChecked((prev) => ({ ...prev, [ariaLabel]: !prev[ariaLabel] }));
  }, []);

  const resetAll = useCallback(() => {
    setChecked({});
    if (resolvedSkillSlug && storeHydrated) {
      resetSkillInStore(resolvedSkillSlug);
    }
    if (storageKey) {
      try {
        window.localStorage.removeItem(storageKey);
      } catch {
        // Ignore private-mode errors
      }
    }
  }, [resolvedSkillSlug, storeHydrated, resetSkillInStore, storageKey]);

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

  const totalSteps = progressSteps.length;
  const completedSteps = progressSteps.filter((step) =>
    isMainStepChecked(step),
  ).length;
  const progressPct =
    totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  const anyMainChecked = progressSteps.some((step) => isMainStepChecked(step));
  const anySubChecked = allAriaLabels
    .filter((label) => label.includes(" sub-step:"))
    .some((label) => checked[label]);

  useEffect(() => {
    onAnyCheckedChange?.(anyMainChecked || anySubChecked);
  }, [anyMainChecked, anySubChecked, onAnyCheckedChange]);

  const isQuiz = mode === "quiz";
  const learnPolish = enrichmentDisplay.learnPolish && !isQuiz;
  const showScorecards =
    enrichmentDisplay.examScorecards &&
    (showExamScorecards ??
      (resolvedSkillSlug ? skillHasExamScorecards(resolvedSkillSlug) : false));

  function renderSegmentBadge(
    stepSegment: StepSegment | null,
    phaseStartBadge: boolean,
    displayFlags: ChecklistEnrichmentDisplay,
  ) {
    if (!displayFlags.segmentBadges || !stepSegment) {
      return null;
    }
    return (
      <div className="skill-step-segment-col">
        <StepSegmentBadge segment={stepSegment} phaseStart={phaseStartBadge} />
      </div>
    );
  }

  function renderCriticalBadge(
    step: ChecklistStep,
    displayText: string,
    revealedNow: boolean,
    displayFlags: ChecklistEnrichmentDisplay,
  ) {
    if (!displayFlags.criticalBadges || !isStepCritical(step, displayText)) {
      return null;
    }
    const label = criticalStepBadgeLabelForStep(step, displayText);
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

  function renderTagCategoryBadge(
    step: ChecklistStep,
    displayFlags: ChecklistEnrichmentDisplay,
  ) {
    if (!displayFlags.tagCategory) {
      return null;
    }
    const tagCategory = resolveStepTagCategory(step);
    if (!tagCategory) {
      return null;
    }
    return (
      <span className="skill-tag-category-badge" title="Tag category">
        {tagCategory}
      </span>
    );
  }

  function renderStepBodyBadges(
    step: ChecklistStep,
    displayText: string,
    revealedNow: boolean,
    displayFlags: ChecklistEnrichmentDisplay,
  ) {
    const phaseBadge =
      organizerMeta ?
        renderPhaseWordBadge(step, organizerMeta, displayFlags)
      : null;
    const tagBadge = renderTagCategoryBadge(step, displayFlags);
    const criticalBadge = renderCriticalBadge(
      step,
      displayText,
      revealedNow,
      displayFlags,
    );
    if (!phaseBadge && !tagBadge && !criticalBadge) {
      return null;
    }
    return (
      <span className="skill-step-body__badges">
        {phaseBadge}
        {tagBadge}
        {criticalBadge}
      </span>
    );
  }

  function renderPhaseWordBadge(
    step: ChecklistStep,
    meta: CurriculumSkillMeta,
    displayFlags: ChecklistEnrichmentDisplay,
  ) {
    if (!displayFlags.phaseWordBadge) {
      return null;
    }
    const phaseLabel = resolveStepPhaseWord(step, meta);
    if (!phaseLabel) {
      return null;
    }
    const phaseColor =
      PHASE_COLORS[phaseLabel] ?? getStepPhaseColor(step, meta);
    return (
      <span
        className="step-phase-word-badge"
        style={{ backgroundColor: phaseColor }}
        title={`Phase: ${phaseLabel}`}
      >
        {phaseLabel}
      </span>
    );
  }

  function renderRendersAsEmoji(
    step: ChecklistStep,
    displayFlags: ChecklistEnrichmentDisplay,
  ) {
    if (!displayFlags.rendersAsEmoji) {
      return null;
    }
    const emoji = resolveStepRendersAs(step);
    if (!emoji) {
      return null;
    }
    return (
      <span className="skill-renders-as-emoji" aria-hidden="true">
        {emoji}
      </span>
    );
  }

  function renderOfficialWording(
    step: ChecklistStep,
    displayText: string,
    displayFlags: ChecklistEnrichmentDisplay,
  ) {
    if (!displayFlags.detailedText) {
      return null;
    }
    const detailedText = resolveStepDetailedText(step);
    if (!detailedText || detailedText === displayText) {
      return null;
    }
    return (
      <p
        className="skill-step-official-wording print:text-black"
        role="note"
        aria-label={`Official evaluator wording for step ${step.id}`}
      >
        {detailedText}
      </p>
    );
  }

  return (
    <article
      className={`skill-checklist mx-auto max-w-3xl px-4 py-8 print:px-0 print:py-0 print:text-black ${compact ? "skill-checklist--compact" : ""} ${enrichmentDisplay.segmentBadges ? "skill-checklist--segment-badges" : ""} ${learnPolish ? "skill-checklist--learn-polish" : ""}`.trim()}
    >
      <p className="print-header mb-4 hidden text-sm font-semibold uppercase tracking-wide print:block print:text-black">
        LMCC — California CNA Skills Exam Prep
      </p>

      <header className="skill-checklist-header print:border-black">
        <h1 className="skill-checklist-title print:text-black">{title}</h1>
      </header>

      {showModeToggle ?
        <div
          className="skill-mode-toggle print:hidden"
          role="group"
          aria-label={CHECKLIST_VIEW_LABELS.groupAria}
        >
          <button
            type="button"
            className={`skill-mode-btn ${mode === "study" ? "skill-mode-btn--active" : ""}`}
            onClick={() => onModeChange?.("study")}
            aria-pressed={mode === "study"}
          >
            {CHECKLIST_VIEW_LABELS.full}
          </button>
          <button
            type="button"
            className={`skill-mode-btn ${mode === "quiz" ? "skill-mode-btn--active" : ""}`}
            onClick={() => onModeChange?.("quiz")}
            aria-pressed={mode === "quiz"}
          >
            {CHECKLIST_VIEW_LABELS.reveal}
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
            <span className="skill-checklist-progress-pct tnum">
              {progressPct}%
            </span>
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
            disabled={!anyMainChecked && !anySubChecked}
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
        {visibleSteps.map((step, stepIndex) => {
          const checklistSlug = organizerMeta?.slug ?? skillSlug;
          const mainLabel = mainStepAriaLabel(step, checklistSlug);
          const mainChecked = isMainStepChecked(step);
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
                totalSteps: visibleSteps.length,
                skillSlug: organizerMeta.slug,
              }
            : null;
          const stepSegment: StepSegment | null =
            segmentCtx ? resolveStepSegment(step, segmentCtx) : null;
          const prevStep = stepIndex > 0 ? visibleSteps[stepIndex - 1] : null;
          const prevSegment: StepSegment | null =
            prevStep && segmentCtx ?
              resolveStepSegment(prevStep, {
                ...segmentCtx,
                stepIndex: stepIndex - 1,
              })
            : null;
          const showCoreDivider =
            !learnPolish &&
            enrichmentDisplay.segmentBadges &&
            prevSegment === "open" &&
            stepSegment === "core";
          const showCloseDivider =
            !learnPolish &&
            enrichmentDisplay.segmentBadges &&
            prevSegment === "core" &&
            stepSegment === "close";
          const showLearnSegmentHeading =
            learnPolish && stepSegment !== null && stepSegment !== prevSegment;
          const phaseStartBadge =
            enrichmentDisplay.segmentBadges &&
            stepSegment !== null &&
            ((stepSegment === "core" && prevSegment === "open") ||
              (stepSegment === "close" && prevSegment === "core"));
          const organizerAttrs =
            organizerMeta && stepSegment ?
              stepOrganizerAttributes({
                meta: organizerMeta,
                step,
                stepSegment,
                skillName: title,
              })
            : {};

          const scorecardEntry =
            showScorecards && resolvedSkillSlug ?
              getExamScorecardForStep(resolvedSkillSlug, step)
            : undefined;
          const showInlineScorecard =
            scorecardEntry &&
            resolvedSkillSlug &&
            shouldShowInlineExamScorecard(scorecardEntry, {
              isQuiz,
              showMainText,
              slug: resolvedSkillSlug,
            });
          const resolvedSubSteps =
            enrichmentDisplay.subSteps ? (resolveStepSubSteps(step) ?? []) : [];
          const detailedText = resolveStepDetailedText(step);
          const rawClinicalNote = resolveStepClinicalNote(step);
          const showOfficialWording =
            enrichmentDisplay.detailedText &&
            detailedText &&
            detailedText !== displayText;
          const detailedTitle =
            showOfficialWording ? undefined
            : enrichmentDisplay.detailedText && detailedText ? detailedText
            : undefined;

          const stepCritical =
            enrichmentDisplay.criticalBadges &&
            isStepCritical(step, displayText);
          const criticalBodyClass =
            stepCritical ?
              learnPolish ? "step-critical"
              : "skill-step--critical"
            : "";

          if (learnPolish && isHandHygieneEmbedStep(step, checklistSlug)) {
            return (
              <Fragment key={step.id}>
                {showLearnSegmentHeading && stepSegment ?
                  <LearnSegmentHeading segment={stepSegment} />
                : null}
                <StepMotionItem
                  index={stepIndex}
                  enabled={learnPolish}
                  className="skill-step-item"
                >
                  <HandHygieneEmbedChip
                    stepId={step.id}
                    checked={mainChecked}
                    onToggle={() => toggleMainStep(step)}
                  />
                </StepMotionItem>
              </Fragment>
            );
          }

          return (
            <Fragment key={step.id}>
              {showLearnSegmentHeading && stepSegment ?
                <LearnSegmentHeading segment={stepSegment} />
              : null}
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
              <StepMotionItem
                index={stepIndex}
                enabled={learnPolish}
                className={`skill-step-item space-y-1 ${stepSegment ? stepSegmentClass(stepSegment) : ""}`}
                dataAttributes={organizerAttrs}
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
                        onChange={() => toggleMainStep(step)}
                        className="skill-checkbox mt-2 shrink-0 rounded border-gray-400 print:mt-0"
                      />
                      {renderSegmentBadge(
                        stepSegment,
                        phaseStartBadge,
                        enrichmentDisplay,
                      )}
                      <span
                        className={`skill-step-body leading-relaxed ${checkedTextClass(mainChecked)} ${criticalBodyClass}`}
                        title={detailedTitle}
                      >
                        <span className="skill-step-body__cue">
                          <strong className="skill-checklist-step-num tnum print:text-black">
                            {step.id}.
                          </strong>{" "}
                          {renderRendersAsEmoji(step, enrichmentDisplay)}
                          {displayText}
                        </span>
                        {learnPolish ?
                          <StepLearnMeta
                            step={step}
                            clinicalNote={rawClinicalNote}
                          />
                        : null}
                        {renderStepBodyBadges(
                          step,
                          displayText,
                          showMainText,
                          enrichmentDisplay,
                        )}
                      </span>
                    </label>
                  : <div className="skill-step-label flex min-h-[44px] min-w-0 flex-1 flex-col gap-2">
                      <div className="skill-step-row flex min-w-0 items-start gap-2">
                        {renderSegmentBadge(
                          stepSegment,
                          phaseStartBadge,
                          enrichmentDisplay,
                        )}
                        <div className="skill-step-body min-w-0 flex-1">
                          <strong className="skill-checklist-step-num skill-quiz-placeholder print:text-black">
                            {step.id}.
                          </strong>{" "}
                          {showMainText ?
                            <span
                              className={`leading-relaxed ${enrichmentDisplay.criticalBadges && isStepCritical(step, displayText) ? "skill-step--critical skill-step--critical-revealed" : ""}`}
                              title={detailedTitle}
                            >
                              {renderRendersAsEmoji(step, enrichmentDisplay)}
                              {displayText}
                              {organizerMeta ?
                                renderPhaseWordBadge(
                                  step,
                                  organizerMeta,
                                  enrichmentDisplay,
                                )
                              : null}
                              {renderTagCategoryBadge(step, enrichmentDisplay)}
                              {renderCriticalBadge(
                                step,
                                displayText,
                                true,
                                enrichmentDisplay,
                              )}
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

                {(
                  enrichmentDisplay.clinicalNote &&
                  rawClinicalNote &&
                  (!isQuiz || mainRevealed)
                ) ?
                  <StepClinicalNote
                    rawNote={rawClinicalNote}
                    instructorView={instructorViewActive}
                    instructorReady={instructorReady}
                  />
                : null}

                {renderOfficialWording(step, displayText, enrichmentDisplay)}

                {resolvedSubSteps.length > 0 ?
                  <ul
                    className="skill-step-substeps print:text-black"
                    aria-label={`Sub-steps for step ${step.id}`}
                  >
                    {resolvedSubSteps.map((subText, subIndex) => {
                      const subLabel = subStepAriaLabel(step.id, subText);
                      const subChecked = isChecked(subLabel);
                      const subKey = stepRevealKey(step.id, subIndex);
                      const subRevealed = isRevealed(subKey);
                      const showSubText = !isQuiz || subRevealed;

                      return (
                        <li key={subLabel} className="skill-step-substep">
                          {!isQuiz ?
                            <label className="skill-step-substep-label">
                              <input
                                type="checkbox"
                                aria-label={subLabel}
                                checked={subChecked}
                                onChange={() => toggle(subLabel)}
                                className="skill-substep-checkbox rounded border-gray-400"
                              />
                              <span
                                className={`skill-step-substep-text leading-relaxed ${subStepCheckedTextClass(subChecked)} ${enrichmentDisplay.criticalBadges && isStepCritical(step, subText) ? "skill-step--critical" : ""}`}
                              >
                                {subText}
                                {renderCriticalBadge(
                                  step,
                                  subText,
                                  true,
                                  enrichmentDisplay,
                                )}
                              </span>
                            </label>
                          : <div className="skill-step-substep-quiz flex min-h-[44px] flex-col gap-2">
                              {showSubText ?
                                <span
                                  className={`skill-step-substep-text leading-relaxed ${enrichmentDisplay.criticalBadges && isStepCritical(step, subText) ? "skill-step--critical skill-step--critical-revealed" : ""}`}
                                >
                                  {subText}
                                  {renderCriticalBadge(
                                    step,
                                    subText,
                                    true,
                                    enrichmentDisplay,
                                  )}
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
                                  Reveal sub-step
                                </button>
                              : null}
                            </div>
                          }
                        </li>
                      );
                    })}
                  </ul>
                : null}
              </StepMotionItem>
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
