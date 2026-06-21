"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import "./skill-checklist.css";

export type ChecklistStep = {
  id: number;
  text: string;
  note?: string;
  subSteps?: string[];
};

export type SkillChecklistProps = {
  title: string;
  steps: ChecklistStep[];
  /** localStorage key for persisting checkbox state */
  storageKey?: string;
};

export function mainStepAriaLabel(step: ChecklistStep): string {
  return `Step ${step.id}: ${step.text}`;
}

export function subStepAriaLabel(stepId: number, subText: string): string {
  return `Step ${stepId} sub-step: ${subText}`;
}

function checkedTextClass(isChecked: boolean): string {
  return isChecked ?
      "step-text--checked line-through text-gray-400 print:text-black print:no-underline"
    : "";
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
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
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
}: SkillChecklistProps) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [hydrated, setHydrated] = useState(false);

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

  const anyChecked = allAriaLabels.some((label) => checked[label]);

  return (
    <article className="skill-checklist mx-auto max-w-3xl px-4 py-8 text-gray-900 print:px-0 print:py-0 print:text-black">
      <p className="print-header mb-4 hidden text-sm font-semibold uppercase tracking-wide text-gray-700 print:block print:text-black">
        LMCC — California CNA Skills Exam Prep
      </p>

      <header className="mb-6 border-b-2 border-emerald-800 pb-3 print:border-black">
        <h1 className="text-2xl font-semibold text-gray-900 print:text-black">
          {title}
        </h1>
      </header>

      <div className="mb-4 flex items-center justify-end print:hidden">
        <button
          type="button"
          onClick={resetAll}
          disabled={!anyChecked}
          className="reset-button rounded border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 print:hidden"
        >
          Reset checklist
        </button>
      </div>

      <h2 className="mb-3 border-b border-gray-300 pb-1 text-xs font-bold uppercase tracking-widest text-gray-600 print:border-black print:text-black">
        Official Checklist
      </h2>

      <ul className="list-none space-y-3 p-0">
        {steps.map((step) => {
          const mainLabel = mainStepAriaLabel(step);
          const mainChecked = isChecked(mainLabel);

          return (
            <li key={step.id} className="space-y-1">
              <label className="flex cursor-pointer items-start gap-2">
                <input
                  type="checkbox"
                  aria-label={mainLabel}
                  checked={mainChecked}
                  onChange={() => toggle(mainLabel)}
                  className="mt-1 h-4 w-4 shrink-0 rounded border-gray-400 accent-emerald-700 print:mt-0"
                />
                <span
                  className={`leading-relaxed ${checkedTextClass(mainChecked)}`}
                >
                  <strong className="text-emerald-800 print:text-black">
                    {step.id}.
                  </strong>{" "}
                  {step.text}
                </span>
              </label>

              {step.note ?
                <p className="note-text ml-6 text-sm italic text-amber-600 print:text-black">
                  {step.note}
                </p>
              : null}

              {step.subSteps && step.subSteps.length > 0 ?
                <ul className="ml-6 list-none space-y-2 p-0">
                  {step.subSteps.map((subText) => {
                    const subLabel = subStepAriaLabel(step.id, subText);
                    const subChecked = isChecked(subLabel);

                    return (
                      <li key={subLabel}>
                        <label className="flex cursor-pointer items-start gap-2">
                          <input
                            type="checkbox"
                            aria-label={subLabel}
                            checked={subChecked}
                            onChange={() => toggle(subLabel)}
                            className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-400 accent-emerald-700"
                          />
                          <span
                            className={`substep-text--checked text-sm leading-relaxed ${checkedTextClass(subChecked)}`}
                          >
                            {subText}
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              : null}
            </li>
          );
        })}
      </ul>

      <footer className="mt-8 border-t border-gray-200 pt-3 text-xs text-gray-500 print:border-black print:text-black">
        Check each box during lab practice. Step wording matches the state
        evaluator checklist.
      </footer>
    </article>
  );
}
