import { beforeEach, describe, expect, it } from "vitest";

import { getSkillBySlug } from "@/lib/skills";
import { masteryStepId } from "@/lib/scored-steps";
import {
  EMPTY_CHECKED_STEPS,
  selectSkillCheckedSteps,
} from "@/store/mastery-selectors";
import { MASTERY_STORE_KEY, useMasteryStore } from "@/store/useMasteryStore";

describe("useMasteryStore (Phase 1 mastery layer)", () => {
  beforeEach(() => {
    useMasteryStore.setState({ skills: {}, isHydrated: true });
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(MASTERY_STORE_KEY);
    }
  });

  it("toggleStep tracks checked main step ids per skill", () => {
    const hh = getSkillBySlug("hand-hygiene")!;
    const step2 = hh.steps[1];

    useMasteryStore.getState().toggleStep("hand-hygiene", masteryStepId(step2));
    expect(
      useMasteryStore
        .getState()
        .isStepChecked("hand-hygiene", masteryStepId(step2)),
    ).toBe(true);

    useMasteryStore.getState().toggleStep("hand-hygiene", masteryStepId(step2));
    expect(
      useMasteryStore
        .getState()
        .isStepChecked("hand-hygiene", masteryStepId(step2)),
    ).toBe(false);
  });

  it("countCheckedScoredSteps counts only core segment steps", () => {
    const hh = getSkillBySlug("hand-hygiene")!;
    const store = useMasteryStore.getState();
    store.toggleStep("hand-hygiene", masteryStepId(hh.steps[0]));
    store.toggleStep("hand-hygiene", masteryStepId(hh.steps[1]));

    const scored = hh.steps.filter((s) => s.segment === "core");
    expect(store.countCheckedScoredSteps("hand-hygiene", scored)).toBe(1);
  });

  it("resetSkill clears mastery for one skill", () => {
    useMasteryStore.getState().toggleStep("hand-hygiene", "2");
    useMasteryStore.getState().resetSkill("hand-hygiene");
    expect(
      useMasteryStore.getState().skills["hand-hygiene"]?.checkedSteps,
    ).toEqual([]);
  });

  it("selectSkillCheckedSteps returns stable empty reference", () => {
    const a = selectSkillCheckedSteps(useMasteryStore.getState(), "nope");
    const b = selectSkillCheckedSteps(useMasteryStore.getState(), "nope");
    expect(a).toBe(b);
    expect(a).toBe(EMPTY_CHECKED_STEPS);
  });
});
