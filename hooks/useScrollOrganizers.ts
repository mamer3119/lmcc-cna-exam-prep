"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  curriculumModules,
  getCurriculumMeta,
  type CurriculumSkillMeta,
} from "@/data/skillCurriculum";
import { resolveOrganizerDensity } from "@/lib/organizer-density";
import type { ChecklistStep } from "@/lib/checklist-step";
import { resolveStepPhaseWord } from "@/lib/skill-step-meta";
import type { StepSegment } from "@/lib/skill-templates";

export type ScrollOrganizerState = {
  activeModuleOrder: number;
  moduleVerb: string;
  phaseWord: string;
  phaseHint: string | null;
  phaseWordOpacity: number;
  templateSlug: string | null;
  templateId: string | null;
  templateSkillName: string | null;
  templateChipOpacity: number;
  stepFocused: boolean;
  pastTemplateOpen: boolean;
  activeSegment: StepSegment | null;
};

const INITIAL: ScrollOrganizerState = {
  activeModuleOrder: 1,
  moduleVerb: "Protect",
  phaseWord: "Protect",
  phaseHint: "Infection control foundation",
  phaseWordOpacity: 0.18,
  templateSlug: null,
  templateId: null,
  templateSkillName: null,
  templateChipOpacity: 0.85,
  stepFocused: false,
  pastTemplateOpen: false,
  activeSegment: null,
};

type UseScrollOrganizersOptions = {
  moduleSectionIds: string[];
  enabled?: boolean;
};

function phaseHintFor(
  meta: CurriculumSkillMeta,
  stepNumber: number,
): string | null {
  const phase = meta.phases.find(
    (p) => stepNumber >= p.fromStep && stepNumber <= p.toStep,
  );
  if (!phase) {
    return null;
  }
  if (phase.fromStep === phase.toStep) {
    return `Step ${phase.fromStep} · ${phase.word} phase`;
  }
  return `Steps ${phase.fromStep}–${phase.toStep} · ${phase.word} phase`;
}

export function useScrollOrganizers({
  moduleSectionIds,
  enabled = true,
}: UseScrollOrganizersOptions) {
  const [state, setState] = useState<ScrollOrganizerState>(INITIAL);
  const rafRef = useRef<number | null>(null);

  const updateFromDom = useCallback(() => {
    if (!enabled || typeof window === "undefined") {
      return;
    }

    const centerY = window.innerHeight * 0.4;
    const stepEls = document.querySelectorAll<HTMLElement>(
      "[data-organizer-step]",
    );
    let focusedStep: HTMLElement | null = null;
    let bestDist = Infinity;

    stepEls.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const mid = rect.top + rect.height / 2;
      const dist = Math.abs(mid - centerY);
      if (
        dist < bestDist &&
        rect.top < window.innerHeight * 0.85 &&
        rect.bottom > window.innerHeight * 0.1
      ) {
        bestDist = dist;
        focusedStep = el;
      }
    });

    let phaseWord = INITIAL.phaseWord;
    let phaseHint: string | null = INITIAL.phaseHint;
    let templateSlug: string | null = null;
    let templateId: string | null = null;
    let templateSkillName: string | null = null;
    let pastTemplateOpen = false;
    let stepFocused = false;
    let activeSegment: StepSegment | null = null;

    if (focusedStep) {
      const el = focusedStep as HTMLElement;
      phaseWord = el.dataset.phaseWord ?? phaseWord;
      templateSlug = el.dataset.skillSlug ?? null;
      templateId = el.dataset.templateId ?? null;
      templateSkillName = el.dataset.skillName ?? null;
      pastTemplateOpen =
        el.dataset.stepSegment === "core" || el.dataset.stepSegment === "close";
      activeSegment = (el.dataset.stepSegment as StepSegment) ?? null;
      stepFocused = bestDist < 100;

      const meta = templateSlug ? getCurriculumMeta(templateSlug) : undefined;
      const stepNum = Number(el.dataset.stepNumber);
      if (meta && Number.isFinite(stepNum)) {
        phaseHint = phaseHintFor(meta, stepNum);
      }
    } else {
      const skillBlocks =
        document.querySelectorAll<HTMLElement>("[data-study-skill]");
      skillBlocks.forEach((block) => {
        const rect = block.getBoundingClientRect();
        if (rect.top <= centerY && rect.bottom >= centerY) {
          phaseWord = block.dataset.moduleVerb ?? phaseWord;
          templateSlug = block.dataset.skillSlug ?? null;
          templateId = block.dataset.templateId ?? null;
          templateSkillName = block.dataset.skillName ?? null;
          phaseHint = block.dataset.phaseHint ?? null;
        }
      });
    }

    let activeModuleOrder = 1;
    let moduleVerb = curriculumModules[0]?.verb ?? "Protect";
    for (let i = moduleSectionIds.length - 1; i >= 0; i--) {
      const section = document.getElementById(moduleSectionIds[i]);
      if (section) {
        const rect = section.getBoundingClientRect();
        if (rect.top <= centerY + 60) {
          activeModuleOrder = i + 1;
          moduleVerb = curriculumModules[i]?.verb ?? moduleVerb;
          if (!focusedStep && rect.top <= centerY) {
            phaseWord = moduleVerb;
            phaseHint = curriculumModules[i]?.title ?? phaseHint;
          }
          break;
        }
      }
    }

    const hasDivergenceInView = Boolean(
      document.querySelector(".divergence-marker--in-view"),
    );

    const density = resolveOrganizerDensity({
      hasDivergenceInView,
      stepFocused,
      pastTemplateOpen,
      phaseWordVisible: Boolean(phaseWord),
      templateChipVisible: Boolean(templateId),
    });

    setState({
      activeModuleOrder,
      moduleVerb,
      phaseWord,
      phaseHint,
      phaseWordOpacity:
        density.loudChannel === "phase-word" ? 0.2
        : stepFocused ? 0.09
        : 0.14,
      templateSlug,
      templateId,
      templateSkillName,
      templateChipOpacity:
        density.loudChannel === "template-chip" ? 1
        : templateId ? 0.75
        : 0.4,
      stepFocused: density.stepFocused,
      pastTemplateOpen: density.pastTemplateOpen,
      activeSegment,
    });
  }, [enabled, moduleSectionIds]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const onScroll = () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = requestAnimationFrame(updateFromDom);
    };

    updateFromDom();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target.classList.contains("divergence-marker")) {
            entry.target.classList.toggle(
              "divergence-marker--in-view",
              entry.isIntersecting && entry.intersectionRatio > 0.35,
            );
          }
        });
        onScroll();
      },
      { threshold: [0, 0.35, 0.6], rootMargin: "-20% 0px -20% 0px" },
    );

    document.querySelectorAll(".divergence-marker").forEach((el) => {
      observer.observe(el);
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
      observer.disconnect();
    };
  }, [enabled, updateFromDom]);

  return state;
}

export function stepOrganizerAttributes(input: {
  meta: CurriculumSkillMeta;
  step: ChecklistStep;
  stepSegment: StepSegment;
  skillName: string;
}): Record<string, string> {
  return {
    "data-organizer-step": "true",
    "data-phase-word": resolveStepPhaseWord(input.step, input.meta),
    "data-skill-slug": input.meta.slug,
    "data-skill-name": input.skillName,
    "data-template-id": input.meta.template,
    "data-step-number": String(input.step.id),
    "data-step-segment": input.stepSegment,
  };
}
