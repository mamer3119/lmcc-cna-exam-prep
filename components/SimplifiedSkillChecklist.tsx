"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { WebSkill } from "@/lib/skills";
import {
  markSkillReviewed,
  readSkillProgress,
  writeSkillProgress,
} from "@/lib/skill-progress";
import { resolveStepDetailedText } from "@/lib/skill-step-meta";

import PatternToggle, { type ChecklistView } from "@/components/PatternToggle";
import StepBand from "@/components/StepBand";

type SimplifiedSkillChecklistProps = {
  skill: WebSkill;
};

function storageKey(skill: WebSkill): string {
  return `simplified-checklist-${skill.slug}`;
}

function readStoredState(skill: WebSkill): Record<number, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(storageKey(skill));
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return {};
    }
    const state: Record<number, boolean> = {};
    for (const [key, value] of Object.entries(parsed)) {
      const stepId = Number(key);
      if (!Number.isNaN(stepId) && typeof value === "boolean") {
        state[stepId] = value;
      }
    }
    return state;
  } catch {
    return {};
  }
}

function writeStoredState(skill: WebSkill, state: Record<number, boolean>): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey(skill), JSON.stringify(state));
  } catch {
    // Ignore quota / private-mode errors
  }
}

export default function SimplifiedSkillChecklist({
  skill,
}: SimplifiedSkillChecklistProps) {
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [hydrated, setHydrated] = useState(false);
  const [reviewed, setReviewed] = useState(false);
  const [view, setView] = useState<ChecklistView>("list");

  useEffect(() => {
    setChecked(readStoredState(skill));
    setHydrated(true);
    const progress = readSkillProgress();
    if (progress[skill.storageKey] === "reviewed") {
      setReviewed(true);
    }
  }, [skill]);

  useEffect(() => {
    if (!hydrated) return;
    writeStoredState(skill, checked);
  }, [checked, hydrated, skill]);

  const toggleStep = useCallback((stepId: number) => {
    setChecked((prev) => ({ ...prev, [stepId]: !prev[stepId] }));
  }, []);

  const allChecked = useMemo(() => {
    return skill.steps.every((step) => checked[step.id]);
  }, [checked, skill.steps]);

  const completedCount = useMemo(() => {
    return skill.steps.filter((step) => checked[step.id]).length;
  }, [checked, skill.steps]);

  const handleMarkReviewed = useCallback(() => {
    const progress = markSkillReviewed(readSkillProgress(), skill.storageKey);
    writeSkillProgress(progress);
    setReviewed(true);
  }, [skill.storageKey]);

  const stepsBySegment = useMemo(() => {
    const grouped: Record<"open" | "core" | "close", typeof skill.steps> = {
      open: [],
      core: [],
      close: [],
    };
    for (const step of skill.steps) {
      const segment = step.segment ?? "core";
      grouped[segment].push(step);
    }
    return grouped;
  }, [skill.steps]);

  return (
    <div className="simplified-skill-checklist">
      <div className="simplified-skill-checklist__progress" role="status" aria-live="polite">
        <span>
          {completedCount} of {skill.steps.length} steps checked
        </span>
        {allChecked && !reviewed && (
          <button
            type="button"
            className="simplified-skill-checklist__mark-reviewed"
            onClick={handleMarkReviewed}
          >
            Mark as reviewed
          </button>
        )}
        {reviewed && (
          <span className="simplified-skill-checklist__reviewed">Reviewed</span>
        )}
      </div>

      <div className="mb-4 flex items-center justify-between gap-4">
        <PatternToggle view={view} onChange={setView} />
        <Link
          href="/study-method/"
          className="text-sm font-semibold text-[var(--primary-accent)] hover:underline"
        >
          How to study →
        </Link>
      </div>

      {view === "list" ? (
        <ul className="simplified-skill-checklist__list">
          {skill.steps.map((step) => {
            const detailedText = resolveStepDetailedText(step);
            const isChecked = Boolean(checked[step.id]);

            return (
              <li
                key={step.id}
                className={`simplified-skill-checklist__item ${
                  isChecked ? "simplified-skill-checklist__item--checked" : ""
                }`}
              >
                <label className="simplified-skill-checklist__label">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleStep(step.id)}
                    className="simplified-skill-checklist__checkbox"
                    aria-label={`Step ${step.id}: ${step.text}`}
                  />
                  <span className="simplified-skill-checklist__text">
                    <strong>{step.id}.</strong> {step.text}
                  </span>
                </label>
                {detailedText && detailedText !== step.text && (
                  <p className="simplified-skill-checklist__rubric">{detailedText}</p>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="memory-palace">
          <StepBand
            segment="open"
            steps={stepsBySegment.open}
            checked={checked}
            onToggle={toggleStep}
            skillSlug={skill.slug}
            totalSteps={skill.steps.length}
          />
          <StepBand
            segment="core"
            steps={stepsBySegment.core}
            checked={checked}
            onToggle={toggleStep}
            skillSlug={skill.slug}
            totalSteps={skill.steps.length}
          />
          <StepBand
            segment="close"
            steps={stepsBySegment.close}
            checked={checked}
            onToggle={toggleStep}
            skillSlug={skill.slug}
            totalSteps={skill.steps.length}
          />
        </div>
      )}
    </div>
  );
}
