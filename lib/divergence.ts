import type { TemplateId } from "@/data/skillCurriculum";
import {
  findTemplateDivergenceIndex,
  getTemplatePrefixSteps,
  templatesShareFamily,
} from "@/lib/skill-templates";

export type ConfusionPair = {
  id: string;
  rtcIds: number[];
  label: string;
};

/** Final confusion-pair groupings from curriculum reference */
export const CONFUSION_PAIRS: ConfusionPair[] = [
  { id: "basin", rtcIds: [17, 18, 20], label: "Basin trio" },
  { id: "vitals", rtcIds: [6, 7], label: "Vitals pair" },
  { id: "movement", rtcIds: [3, 21], label: "Movement pair" },
  { id: "rom", rtcIds: [14, 15], label: "ROM pair" },
  { id: "clothing", rtcIds: [2, 9], label: "Clothing pair" },
  { id: "washing", rtcIds: [11, 19], label: "Washing pair" },
];

export type DivergenceTrigger =
  | "basin-water-check"
  | "perineal-front-to-back"
  | "catheter-downhill"
  | "call-light-reach"
  | "bed-low-locked"
  | "vital-tolerance"
  | "generic-split";

const TRIGGER_COPY: Record<DivergenceTrigger, string> = {
  "basin-water-check":
    "from here, basin skills diverge: patient checks water temp before CORE",
  "perineal-front-to-back":
    "from here, Peri-Care diverges: clean front-to-back, away from urethra",
  "catheter-downhill":
    "from here, catheter care diverges: hold at urethra, tubing downhill",
  "call-light-reach": "from here, before leaving: call light in reach",
  "bed-low-locked": "from here, after bed procedure: bed low and locked",
  "vital-tolerance":
    "from here, after vital: document within tolerance (Pulse/Resp ±4, Weight ±2 lb, BP ±8 mmHg)",
  "generic-split": "from here, the checklist pattern splits",
};

export function getConfusionPairForRtcIds(
  rtcIdA: number,
  rtcIdB: number,
): ConfusionPair | null {
  for (const pair of CONFUSION_PAIRS) {
    if (pair.rtcIds.includes(rtcIdA) && pair.rtcIds.includes(rtcIdB)) {
      return pair;
    }
  }
  return null;
}

export function inferDivergenceTrigger(
  rtcIdA: number,
  rtcIdB: number,
  templateA: TemplateId,
  templateB: TemplateId,
  skillNameB: string,
): DivergenceTrigger {
  const pair = getConfusionPairForRtcIds(rtcIdA, rtcIdB);
  if (pair?.id === "basin") {
    return "basin-water-check";
  }
  if (pair?.id === "vitals") {
    return "vital-tolerance";
  }
  if (/perineal|peri-care/i.test(skillNameB)) {
    return "perineal-front-to-back";
  }
  if (/catheter/i.test(skillNameB)) {
    return "catheter-downhill";
  }
  if (templateA === "T1+" || templateB === "T1+") {
    return "basin-water-check";
  }
  if (/transfer|position|ambulate/i.test(skillNameB)) {
    return "bed-low-locked";
  }
  return "generic-split";
}

export type DivergenceMarkerData = {
  priorRtcId: number;
  nextRtcId: number;
  priorName: string;
  nextName: string;
  copy: string;
  yieldScore: number;
};

export function shouldShowDivergenceMarker(
  masteredStudyOrders: Set<number>,
  studyOrderA: number,
  studyOrderB: number,
  rtcIdA: number,
  rtcIdB: number,
  templateA: TemplateId,
  templateB: TemplateId,
): boolean {
  if (!masteredStudyOrders.has(studyOrderA) || !masteredStudyOrders.has(studyOrderB)) {
    return false;
  }
  const confusion = getConfusionPairForRtcIds(rtcIdA, rtcIdB);
  const sameFamily = templatesShareFamily(templateA, templateB);
  if (!confusion && !sameFamily) {
    return false;
  }
  const divergenceIndex = findTemplateDivergenceIndex(templateA, templateB);
  return divergenceIndex !== null || confusion !== null;
}

export function buildDivergenceMarker(
  priorStudyOrder: number,
  nextStudyOrder: number,
  priorRtcId: number,
  nextRtcId: number,
  priorName: string,
  nextName: string,
  templateA: TemplateId,
  templateB: TemplateId,
): DivergenceMarkerData | null {
  const confusion = getConfusionPairForRtcIds(priorRtcId, nextRtcId);
  const sameFamily = templatesShareFamily(templateA, templateB);
  if (!confusion && !sameFamily) {
    return null;
  }
  const divergenceIndex = findTemplateDivergenceIndex(templateA, templateB);
  if (!confusion && divergenceIndex === null) {
    return null;
  }

  const trigger = inferDivergenceTrigger(
    priorRtcId,
    nextRtcId,
    templateA,
    templateB,
    nextName,
  );
  const prefixB =
    divergenceIndex ?
      getTemplatePrefixSteps(templateB)[divergenceIndex - 1]?.label
    : undefined;
  const copy =
    prefixB ?
      `↳ from here, ${nextName.split("(")[0].trim()} diverges: ${TRIGGER_COPY[trigger].replace(/^from here,?\s*/i, "")}`
    : `↳ ${TRIGGER_COPY[trigger]}`;

  const yieldScore =
    confusion ?
      confusion.rtcIds.length * 10
    : divergenceIndex ?
      5
    : 1;

  return {
    priorRtcId,
    nextRtcId,
    priorName,
    nextName,
    copy,
    yieldScore,
  };
}

/** Collapse to highest-yield marker when multiple would appear in one viewport */
export function pickHighestYieldMarker(
  markers: DivergenceMarkerData[],
): DivergenceMarkerData | null {
  if (markers.length === 0) {
    return null;
  }
  return [...markers].sort((a, b) => b.yieldScore - a.yieldScore)[0];
}
