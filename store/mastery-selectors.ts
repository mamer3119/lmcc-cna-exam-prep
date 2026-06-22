import type { MasteryStore } from "@/store/useMasteryStore";

/** Stable empty arrays — selectors must never return fresh `[]` (useSyncExternalStore loop). */
export const EMPTY_CHECKED_STEPS: readonly string[] = [];
export const EMPTY_DRILLED_STEPS: readonly string[] = [];

/** Selector-safe checked steps for a skill (stable reference when empty). */
export function selectSkillCheckedSteps(
  state: MasteryStore,
  skillId: string | undefined,
): readonly string[] {
  if (!skillId) {
    return EMPTY_CHECKED_STEPS;
  }
  return state.skills[skillId]?.checkedSteps ?? EMPTY_CHECKED_STEPS;
}

/** Per-skill learn vs drill mode — stable `'learn'` default (never fresh object). */
export function selectSkillMode(
  state: MasteryStore,
  skillId: string | undefined,
): "learn" | "drill" {
  if (!skillId) {
    return "learn";
  }
  return state.skills[skillId]?.mode ?? "learn";
}
