"use client";

import type { ReactNode } from "react";

import FlameBadge from "@/components/FlameBadge";
import type { FlameLetter } from "@/lib/flame";

type ChecklistStepCardProps = {
  stepId: number;
  text: string;
  detailedText?: string | null;
  subSteps?: string[];
  checked: boolean;
  onToggle: () => void;
  flame?: FlameLetter | null;
  reveal?: boolean;
  children?: ReactNode;
};

export default function ChecklistStepCard({
  stepId,
  text,
  detailedText,
  subSteps,
  checked,
  onToggle,
  flame,
  reveal = false,
  children,
}: ChecklistStepCardProps) {
  const showRubric = Boolean(detailedText && detailedText !== text);

  return (
    <li
      className={`journal-card${checked ? " journal-card--done" : ""}`}
      data-journal-reveal={reveal ? "item" : undefined}
    >
      <label className="journal-card__row">
        <input
          type="checkbox"
          className="journal-mark"
          checked={checked}
          onChange={onToggle}
          aria-label={`Step ${stepId}: ${text}`}
        />
        <span className="journal-stamp" aria-hidden="true">
          {stepId}
        </span>
        <span
          className={`journal-card__text${checked ? " journal-card__text--done" : ""}`}
        >
          {text}
        </span>
        {checked ?
          <span className="journal-card__done">Done</span>
        : null}
        {flame ?
          <FlameBadge letter={flame} />
        : null}
      </label>
      {showRubric ?
        <p className="journal-card__rubric">{detailedText}</p>
      : null}
      {subSteps && subSteps.length > 0 ?
        <ul className="journal-card__subs">
          {subSteps.map((sub) => (
            <li key={sub}>{sub}</li>
          ))}
        </ul>
      : null}
      {children}
    </li>
  );
}
