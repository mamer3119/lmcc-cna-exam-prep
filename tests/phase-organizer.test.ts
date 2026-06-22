import { describe, expect, it } from "vitest";

import {
  curriculumModules,
  getCrossSkillTransitionAnchor,
  getCurriculumMeta,
  getPhaseWordForStep,
  skillCurriculumMeta,
} from "@/data/skillCurriculum";
import { CHECKLIST_BOILERPLATE } from "@/lib/checklist-boilerplate";
import {
  buildDivergenceMarker,
  CONFUSION_PAIRS,
  getConfusionPairForRtcIds,
  shouldShowDivergenceMarker,
} from "@/lib/divergence";
import { resolveOrganizerDensity } from "@/lib/organizer-density";
import {
  classifyStepSegment,
  findTemplateDivergenceIndex,
  getTemplateByRtcId,
  getTemplatePrefixSteps,
} from "@/lib/skill-templates";
import { getAllSkills } from "@/lib/skills";
import { deriveStudyState, type StudyState } from "@/lib/study-state";

describe("skillCurriculum", () => {
  it("defines 7 verb-spine modules in order", () => {
    expect(curriculumModules).toHaveLength(7);
    expect(curriculumModules.map((m) => m.verb)).toEqual([
      "Protect",
      "Observe",
      "Move",
      "Restore",
      "Clean",
      "Feed",
      "Eliminate",
    ]);
  });

  it("maps all 22 skills with curriculum meta", () => {
    expect(Object.keys(skillCurriculumMeta)).toHaveLength(22);
  });

  it("uses unlocks seam for position → transfer handoff", () => {
    const position = getCurriculumMeta("position-on-side")!;
    const transfer = getCurriculumMeta("bed-wheelchair-transfer")!;
    const anchor = getCrossSkillTransitionAnchor(position, transfer, 24, 22);
    expect(anchor.word).toBe("Transfer");
  });

  it("returns phase word for step ranges", () => {
    const meta = getCurriculumMeta("bed-wheelchair-transfer")!;
    expect(getPhaseWordForStep(meta, 4)).toBe("Transfer");
    expect(getPhaseWordForStep(meta, 1)).toBe("Approach");
  });
});

describe("skill-templates", () => {
  it("maps RTC IDs to templates per reference data", () => {
    expect(getTemplateByRtcId(17)?.id).toBe("T1+");
    expect(getTemplateByRtcId(6)?.id).toBe("T3");
    expect(getTemplateByRtcId(8)?.id).toBe("T5");
    expect(getTemplateByRtcId(4)?.id).toBe("T6");
  });

  it("detects T1 vs T1+ divergence at step 4", () => {
    const index = findTemplateDivergenceIndex("T1", "T1+");
    expect(index).toBe(4);
    expect(getTemplatePrefixSteps("T1+")[3].label).toContain("water");
  });

  it("classifies open steps for T1 bedside skills", () => {
    const segment = classifyStepSegment(
      "T1",
      0,
      "Introduce yourself and explain the procedure",
      24,
    );
    expect(segment).toBe("open");
  });

  it("classifies mouth care glove step as core (T1 openCount=3)", () => {
    const mouth = getAllSkills().find((s) => s.slug === "mouth-care");
    const gloveStep = mouth?.steps.find((s) => s.boilerplateId === "GLOVE_DON");
    expect(gloveStep).toBeDefined();
    const segment = classifyStepSegment(
      "T1",
      (gloveStep?.id ?? 1) - 1,
      gloveStep?.text ?? "",
      mouth?.stepCount ?? 0,
    );
    expect(segment).toBe("core");
  });

  it("lists four T6 OPEN prefix steps including hand hygiene", () => {
    const prefix = getTemplatePrefixSteps("T6");
    expect(prefix).toHaveLength(4);
    expect(prefix[3].label).toMatch(/hand hygiene/i);
  });

  it("classifies bedpan step 4 hand hygiene as OPEN (T6 openCount=4)", () => {
    const bedpan = getAllSkills().find((s) => s.slug === "bedpan-assist")!;
    const hhStep = bedpan.steps.find((s) => s.id === 4)!;
    expect(classifyStepSegment("T6", 3, hhStep.text, bedpan.stepCount)).toBe(
      "open",
    );
    const gloveStep = bedpan.steps.find((s) => s.id === 5)!;
    expect(classifyStepSegment("T6", 4, gloveStep.text, bedpan.stepCount)).toBe(
      "core",
    );
  });

  it("classifies T1+ foot and catheter steps 1–5 as OPEN", () => {
    for (const slug of [
      "foot-care-one-foot",
      "catheter-care-female",
    ] as const) {
      const skill = getAllSkills().find((s) => s.slug === slug)!;
      for (let i = 0; i < 5; i++) {
        const step = skill.steps[i];
        expect(
          classifyStepSegment(
            "T1+",
            i,
            step.text,
            skill.stepCount,
            slug,
            step.id,
          ),
          `${slug} step ${step.id}`,
        ).toBe("open");
      }
    }
  });

  it("classifies peri side rail as CORE via master DB segment (classifier alone would say open)", () => {
    const peri = getAllSkills().find((s) => s.slug === "perineal-care-female")!;
    const sideRail = peri.steps.find((s) => s.id === 5)!;
    const gloves = peri.steps.find((s) => s.id === 6)!;
    expect(sideRail.text).toMatch(/side rail/i);
    expect(gloves.text).toBe("Don clean gloves");

    expect(sideRail.segment).toBe("core");
    expect(gloves.segment).toBe("core");
    expect(classifyStepSegment("T1+", 4, sideRail.text, peri.stepCount)).toBe(
      "open",
    );
  });
});

describe("divergence markers", () => {
  it("knows all six confusion pairs", () => {
    expect(CONFUSION_PAIRS).toHaveLength(6);
    expect(getConfusionPairForRtcIds(6, 7)?.id).toBe("vitals");
    expect(getConfusionPairForRtcIds(17, 18)?.id).toBe("basin");
  });

  it("suppresses marker when either skill is not mastered", () => {
    const mastered = new Set([3]);
    expect(shouldShowDivergenceMarker(mastered, 3, 4, 6, 7, "T3", "T3")).toBe(
      false,
    );
  });

  it("shows marker for mastered vitals pair", () => {
    const mastered = new Set([3, 4]);
    expect(shouldShowDivergenceMarker(mastered, 3, 4, 6, 7, "T3", "T3")).toBe(
      true,
    );
    const marker = buildDivergenceMarker(
      3,
      4,
      6,
      7,
      "Pulse",
      "Respirations",
      "T3",
      "T3",
    );
    expect(marker?.copy).toMatch(/↳/);
  });
});

describe("organizer density", () => {
  it("allows only one loud channel — divergence wins", () => {
    const state = resolveOrganizerDensity({
      hasDivergenceInView: true,
      stepFocused: false,
      pastTemplateOpen: true,
      phaseWordVisible: true,
      templateChipVisible: true,
    });
    expect(state.loudChannel).toBe("divergence");
    expect(state.phaseWordOpacity).toBeLessThan(0.2);
  });

  it("fades phase word when step focused", () => {
    const state = resolveOrganizerDensity({
      hasDivergenceInView: false,
      stepFocused: true,
      pastTemplateOpen: false,
      phaseWordVisible: true,
      templateChipVisible: true,
    });
    expect(state.loudChannel).toBe("none");
    expect(state.phaseWordOpacity).toBeLessThan(0.1);
  });
});

describe("study-state", () => {
  it("derives examSoon within 7 days", () => {
    const soon = new Date();
    soon.setDate(soon.getDate() + 3);
    const iso = soon.toISOString().slice(0, 10);
    const state: StudyState = {
      masteredIds: [1, 2],
      examDate: iso,
      studyDays: 5,
      lastVisitDate: iso,
    };
    expect(deriveStudyState(state, 22).examSoon).toBe(true);
  });

  it("parses masteredIds as unique sorted numbers", () => {
    const raw = { masteredIds: [3, 1, 3, 2], examDate: null, studyDays: 1 };
    const ids = [
      ...new Set(
        (raw.masteredIds as number[]).filter((n) => typeof n === "number"),
      ),
    ].sort((a, b) => a - b);
    expect(ids).toEqual([1, 2, 3]);
  });
});
