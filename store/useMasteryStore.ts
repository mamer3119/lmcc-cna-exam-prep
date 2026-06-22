"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { masteryStepId } from "@/lib/scored-steps";
import type { ChecklistStep } from "@/lib/checklist-step";

export const MASTERY_STORE_KEY = "lmcc-cna-mastery-v1";

import {
  EMPTY_CHECKED_STEPS,
  EMPTY_DRILLED_STEPS,
} from "@/store/mastery-selectors";

/** Per-skill mastery — do NOT change this interface in Phase 1 (Phase 2 extends). */
export interface SkillMastery {
  checkedSteps: string[];
  drilledSteps: string[];
  mode: "learn" | "drill";
  lastSeen: number;
  selfMarkedGotIt: boolean;
}

export interface MasteryStore {
  skills: Record<string, SkillMastery>;
  isHydrated: boolean;
  toggleStep: (skillId: string, stepId: string) => void;
  markDrilled: (skillId: string, stepId: string) => void;
  setMode: (skillId: string, mode: "learn" | "drill") => void;
  setGotIt: (skillId: string, val: boolean) => void;
  resetSkill: (skillId: string) => void;
  isStepChecked: (skillId: string, stepId: string) => boolean;
  countCheckedScoredSteps: (
    skillId: string,
    scoredSteps: ChecklistStep[],
  ) => number;
  /** One-time import from legacy per-skill localStorage checklist keys */
  migrateLegacyChecklist: (
    skillId: string,
    storageKey: string,
    steps: ChecklistStep[],
    ariaLabelForStep: (step: ChecklistStep) => string,
  ) => void;
}

function emptySkillMastery(): SkillMastery {
  return {
    checkedSteps: EMPTY_CHECKED_STEPS as string[],
    drilledSteps: EMPTY_DRILLED_STEPS as string[],
    mode: "learn",
    lastSeen: 0,
    selfMarkedGotIt: false,
  };
}

function ensureSkill(
  skills: Record<string, SkillMastery>,
  skillId: string,
): SkillMastery {
  return skills[skillId] ?? emptySkillMastery();
}

function readLegacyChecked(storageKey: string): Record<string, boolean> | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return null;
    }
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      return null;
    }
    const state: Record<string, boolean> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === "boolean" && value) {
        state[key] = true;
      }
    }
    return state;
  } catch {
    return null;
  }
}

export const useMasteryStore = create<MasteryStore>()(
  persist(
    (set, get) => ({
      skills: {},
      isHydrated: false,

      toggleStep: (skillId, stepId) => {
        set((state) => {
          const current = ensureSkill(state.skills, skillId);
          const setIds = new Set(current.checkedSteps);
          if (setIds.has(stepId)) {
            setIds.delete(stepId);
          } else {
            setIds.add(stepId);
          }
          return {
            skills: {
              ...state.skills,
              [skillId]: {
                ...current,
                checkedSteps: [...setIds],
                lastSeen: Date.now(),
              },
            },
          };
        });
      },

      markDrilled: (skillId, stepId) => {
        set((state) => {
          const current = ensureSkill(state.skills, skillId);
          const setIds = new Set(current.drilledSteps);
          setIds.add(stepId);
          return {
            skills: {
              ...state.skills,
              [skillId]: {
                ...current,
                drilledSteps: [...setIds],
                lastSeen: Date.now(),
              },
            },
          };
        });
      },

      setMode: (skillId, mode) => {
        set((state) => {
          const current = ensureSkill(state.skills, skillId);
          return {
            skills: {
              ...state.skills,
              [skillId]: { ...current, mode, lastSeen: Date.now() },
            },
          };
        });
      },

      setGotIt: (skillId, val) => {
        set((state) => {
          const current = ensureSkill(state.skills, skillId);
          return {
            skills: {
              ...state.skills,
              [skillId]: {
                ...current,
                selfMarkedGotIt: val,
                lastSeen: Date.now(),
              },
            },
          };
        });
      },

      resetSkill: (skillId) => {
        set((state) => ({
          skills: {
            ...state.skills,
            [skillId]: emptySkillMastery(),
          },
        }));
      },

      isStepChecked: (skillId, stepId) => {
        const skill = get().skills[skillId];
        return skill?.checkedSteps.includes(stepId) ?? false;
      },

      countCheckedScoredSteps: (skillId, scoredSteps) => {
        const skill = get().skills[skillId];
        if (!skill) {
          return 0;
        }
        const checked = new Set(skill.checkedSteps);
        return scoredSteps.filter((step) => checked.has(masteryStepId(step)))
          .length;
      },

      migrateLegacyChecklist: (
        skillId,
        storageKey,
        steps,
        ariaLabelForStep,
      ) => {
        const existing = get().skills[skillId];
        if (existing?.checkedSteps.length) {
          return;
        }
        const legacy = readLegacyChecked(storageKey);
        if (!legacy) {
          return;
        }
        const imported = steps
          .filter((step) => legacy[ariaLabelForStep(step)])
          .map((step) => masteryStepId(step));
        if (imported.length === 0) {
          return;
        }
        set((state) => ({
          skills: {
            ...state.skills,
            [skillId]: {
              ...ensureSkill(state.skills, skillId),
              checkedSteps: imported,
              lastSeen: Date.now(),
            },
          },
        }));
      },
    }),
    {
      name: MASTERY_STORE_KEY,
      skipHydration: true,
      partialize: (state) => ({ skills: state.skills }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isHydrated = true;
        }
      },
    },
  ),
);

/** Call once on client mount (study / skill pages). */
export function rehydrateMasteryStore(): void {
  const result = useMasteryStore.persist.rehydrate();
  const finish = () => {
    useMasteryStore.setState({ isHydrated: true });
  };
  if (result instanceof Promise) {
    void result.then(finish);
  } else {
    finish();
  }
}
