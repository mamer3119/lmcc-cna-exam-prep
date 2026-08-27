"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import ChecklistReveal from "@/components/ChecklistReveal";
import ChecklistStepCard from "@/components/ChecklistStepCard";
import FlameWordmark from "@/components/FlameWordmark";
import HandHygieneReuseMap from "@/components/HandHygieneReuseMap";
import PatternToggle, { type ChecklistView } from "@/components/PatternToggle";
import ReplayTutorialButton from "@/components/ReplayTutorialButton";
import SeeSkillOneLink from "@/components/SeeSkillOneLink";
import StepBand from "@/components/StepBand";
import TutorialOverlay from "@/components/TutorialOverlay";
import { collectFlameLetters } from "@/lib/flame";
import { isHandHygieneEmbedStep } from "@/lib/learn-mode-display";
import { resetTutorial } from "@/lib/tutorial-store";
import type { WebSkill } from "@/lib/skills";
import {
  markSkillReviewed,
  readSkillProgress,
  writeSkillProgress,
} from "@/lib/skill-progress";
import { resolveStepDetailedText } from "@/lib/skill-step-meta";

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
  const [replayNonce, setReplayNonce] = useState(0);

  const isHandHygiene = skill.slug === "hand-hygiene";

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

  const flameLetters = useMemo(
    () =>
      collectFlameLetters(skill.steps, {
        slug: skill.slug,
        totalSteps: skill.steps.length,
      }),
    [skill.slug, skill.steps],
  );

  function replayTutorial() {
    resetTutorial();
    setReplayNonce((value) => value + 1);
  }

  return (
    <div className="simplified-skill-checklist">
      {isHandHygiene ? (
        <TutorialOverlay
          key={replayNonce}
          onOpenPattern={() => setView("pattern")}
        />
      ) : null}

      <div
        className="simplified-skill-checklist__progress"
        role="status"
        aria-live="polite"
      >
        <span>
          {completedCount} of {skill.steps.length} steps checked
        </span>
        {allChecked && !reviewed ? (
          <button
            type="button"
            className="simplified-skill-checklist__mark-reviewed"
            onClick={handleMarkReviewed}
          >
            Mark as reviewed
          </button>
        ) : null}
        {reviewed ? (
          <span className="simplified-skill-checklist__reviewed">Reviewed</span>
        ) : null}
      </div>

      <div className="simplified-skill-checklist__toolbar">
        <PatternToggle view={view} onChange={setView} />
        <Link href="/study-method/" className="simplified-skill-checklist__study">
          How to study →
        </Link>
      </div>

      <ChecklistReveal replayKey={`${skill.slug}:${view}`}>
        {view === "list" ? (
          <ul className="simplified-skill-checklist__list">
            {skill.steps.map((step) => {
              const showSkillOne = isHandHygieneEmbedStep(step, skill.slug);

              return (
                <ChecklistStepCard
                  key={step.id}
                  stepId={step.id}
                  text={step.text}
                  detailedText={resolveStepDetailedText(step)}
                  subSteps={step.subSteps}
                  checked={Boolean(checked[step.id])}
                  onToggle={() => toggleStep(step.id)}
                  reveal
                >
                  {showSkillOne ? <SeeSkillOneLink /> : null}
                </ChecklistStepCard>
              );
            })}
          </ul>
        ) : (
          <div className="journal-pattern">
            <FlameWordmark active={flameLetters} />
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
            {isHandHygiene ? <HandHygieneReuseMap /> : null}
          </div>
        )}
      </ChecklistReveal>

      {isHandHygiene ? (
        <ReplayTutorialButton onReplay={replayTutorial} />
      ) : null}
    </div>
  );
}
