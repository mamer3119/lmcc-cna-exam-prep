"use client";

import { useState } from "react";

import { ExamAuthorityBadge } from "@/components/ExamAuthorityBadge";
import type { ChecklistStep } from "@/lib/checklist-step";
import type { DetailDensity } from "@/lib/practice-labels";
import { DENSITY_LABELS } from "@/lib/practice-labels";
import {
  hasStepCoachingContent,
  hasStepDetailLayer,
  resolveStepCoachingContent,
  resolveStepDetailText,
  resolveStepHeaderText,
  splitDetailWithBoldPhrases,
} from "@/lib/step-text-layers";

type StepCoachingBlockProps = {
  step: ChecklistStep;
  clinicalNote?: string;
  density: DetailDensity;
  /** Quick mode row accordion — force show coaching */
  forceExpanded?: boolean;
};

export function StepCoachingBlock({
  step,
  clinicalNote,
  density,
  forceExpanded = false,
}: StepCoachingBlockProps) {
  const content = resolveStepCoachingContent(step, clinicalNote);
  const hasCoaching = hasStepCoachingContent(step, clinicalNote);

  if (!hasCoaching) {
    return null;
  }

  const showOpen = density === "coach" || forceExpanded;
  const [manualOpen, setManualOpen] = useState(false);
  const expanded = showOpen || manualOpen;

  const examText =
    content.examScorecardLine ?
      content.examScorecardLine
        .replace(/^(Technique|Tolerance|Safety|Exam tolerance):\s*/i, "")
        .trim()
    : undefined;

  if (density === "standard" && !forceExpanded) {
    return (
      <div className="step-coaching-block print:hidden">
        <button
          type="button"
          className="step-coaching-block__toggle"
          aria-expanded={expanded}
          onClick={() => setManualOpen((v) => !v)}
        >
          {DENSITY_LABELS.whyAffordance}{" "}
          <span aria-hidden="true">{expanded ? "▴" : "▾"}</span>
        </button>
        {expanded ?
          <StepCoachingBody content={content} examText={examText} />
        : null}
      </div>
    );
  }

  if (!expanded && density === "quick") {
    return null;
  }

  return (
    <div className="step-coaching-block step-coaching-block--open print:hidden">
      <StepCoachingBody content={content} examText={examText} />
    </div>
  );
}

function StepCoachingBody({
  content,
  examText,
}: {
  content: ReturnType<typeof resolveStepCoachingContent>;
  examText?: string;
}) {
  return (
    <div className="step-coaching-block__body">
      {content.failRule ?
        <p className="step-coaching-block__fail-rule">{content.failRule}</p>
      : null}
      {content.coachingNote ?
        <p
          className="step-coaching-block__note"
          data-testid="step-coaching-note"
        >
          {content.coachingNote}
        </p>
      : null}
      {content.authority ?
        <ExamAuthorityBadge authority={content.authority} text={examText} />
      : content.examScorecardLine ?
        <p className="step-coaching-block__scorecard">
          {content.examScorecardLine}
        </p>
      : null}
    </div>
  );
}

type StepDetailBodyProps = {
  step: ChecklistStep;
  density: DetailDensity;
  forceShow?: boolean;
};

export function StepDetailBody({
  step,
  density,
  forceShow = false,
}: StepDetailBodyProps) {
  const detail = resolveStepDetailText(step);
  const header = resolveStepHeaderText(step);

  if (!detail) {
    return null;
  }

  const show = forceShow || density === "standard" || density === "coach";
  if (!show) {
    return null;
  }

  const parts = splitDetailWithBoldPhrases(detail);

  return (
    <p
      className="step-detail-body print:text-black"
      data-testid="step-detail-body"
      aria-label={`Method detail for step ${step.id}`}
    >
      {parts.map((part, i) =>
        part.bold ?
          <strong key={i}>{part.text}</strong>
        : <span key={i}>{part.text}</span>,
      )}
    </p>
  );
}

type StepHeaderTextProps = {
  step: ChecklistStep;
  checked?: boolean;
};

export function StepHeaderText({ step, checked }: StepHeaderTextProps) {
  const header = resolveStepHeaderText(step);
  return (
    <span
      className={`step-header-text ${checked ? "step-header-text--checked" : ""}`.trim()}
      data-testid="step-header-text"
    >
      {header}
    </span>
  );
}

export function stepHasExpandableContent(
  step: ChecklistStep,
  clinicalNote?: string,
): boolean {
  return hasStepDetailLayer(step) || hasStepCoachingContent(step, clinicalNote);
}
