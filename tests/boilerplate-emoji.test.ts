import { describe, expect, it } from "vitest";

import { getSkillBySlug } from "@/lib/skills";
import {
  resolveStepDisplayEmoji,
  stripPhaseCirclePrefix,
} from "@/lib/boilerplate-emoji";
import { pickBoilerplateTag } from "@/lib/skill-step-meta";

describe("boilerplate-emoji", () => {
  it("strips phase circle prefixes from renders_as", () => {
    expect(stripPhaseCirclePrefix("🟢🧼")).toBe("🧼");
    expect(stripPhaseCirclePrefix("🔵🧤👋")).toBe("🧤👋");
    expect(stripPhaseCirclePrefix("🔴🔔")).toBe("🔔");
    expect(stripPhaseCirclePrefix("🟢🌡️")).toBe("🌡️");
  });

  it("PPE step 11 composite resolves 🧼 from HAND_HYGIENE middle variant", () => {
    const skill = getSkillBySlug("ppe-gown-gloves")!;
    const step = skill.steps.find((s) => s.id === 11)!;
    expect(resolveStepDisplayEmoji(step)).toBe("🧼");
  });

  it("bedpan GLOVE_REMOVE_THEN_HH shows combo emoji", () => {
    const skill = getSkillBySlug("bedpan-assist")!;
    const step = skill.steps.find((s) => s.id === 8)!;
    expect(resolveStepDisplayEmoji(step)).toBe("🧤👋🧼");
  });

  it("INTRO_EXPLAIN tagged step shows 🗣️", () => {
    const skill = getSkillBySlug("manual-blood-pressure")!;
    const step = skill.steps.find((s) => s.id === 1)!;
    expect(resolveStepDisplayEmoji(step)).toBe("🗣️");
  });

  it("pickBoilerplateTag resolves composite HAND_HYGIENE|VIDEO_WARNING", () => {
    const tag = pickBoilerplateTag("HAND_HYGIENE|VIDEO_WARNING", "core");
    expect(tag?.boilerplateId).toBe("HAND_HYGIENE");
    expect(stripPhaseCirclePrefix(tag?.rendersAs ?? "")).toBe("🧼");
  });
});
