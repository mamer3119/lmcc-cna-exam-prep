import type { TemplateId } from "@/data/skillCurriculum";

export type StepSegment = "open" | "core" | "close";

/** 2026.1 display labels for phase segment badges */
export const SEGMENT_DISPLAY_LABELS: Record<StepSegment, string> = {
  open: "Opening Phase",
  core: "Core Procedure",
  close: "Closing Phase",
};

export const SEGMENT_SHORT_LABELS: Record<StepSegment, string> = {
  open: "OPEN",
  core: "CORE",
  close: "CLOSE",
};

export type TemplateDefinition = {
  id: TemplateId;
  label: string;
  family: string;
  rtcIds: number[];
  openStepCount: number;
  /** Extra open steps beyond T1 base (T1+ water + gloves) */
  extraOpenSteps?: number;
};

export const TEMPLATE_DEFINITIONS: TemplateDefinition[] = [
  {
    id: "T1",
    label: "Standard Bedside",
    family: "bedside",
    rtcIds: [2, 3, 9, 11, 14, 15, 16, 19, 21],
    openStepCount: 3,
  },
  {
    id: "T1+",
    label: "Basin Hygiene",
    family: "basin",
    rtcIds: [17, 18, 20],
    openStepCount: 5,
    extraOpenSteps: 2,
  },
  {
    id: "T2",
    label: "Clinical / No-Privacy",
    family: "clinical",
    rtcIds: [5, 12, 13, 22],
    openStepCount: 2,
  },
  {
    id: "T3",
    label: "Vitals-Short",
    family: "vitals",
    rtcIds: [6, 7],
    openStepCount: 1,
  },
  {
    id: "T4",
    label: "Identify Variant",
    family: "identify",
    rtcIds: [1, 10],
    openStepCount: 1,
  },
  {
    id: "T5",
    label: "PPE Isolation",
    family: "ppe",
    rtcIds: [8],
    openStepCount: 0,
  },
  {
    id: "T6",
    label: "Bedpan Multi-Trigger",
    family: "bedpan",
    rtcIds: [4],
    openStepCount: 4,
  },
];

const CLOSE_PATTERNS = [
  /\bbed\s+(?:is\s+)?(?:in\s+)?low(?:\s+and\s+locked)?\b/i,
  /\blowest position\b/i,
  /\bbed brakes are locked\b/i,
  /\block(?:ed)?\b/i,
  /\bcall\s+light\b/i,
  /\bsign(?:al(?:ing)?)?\s+device\b/i,
  /\bhand\s+hygiene\b/i,
  /\bdocument\b/i,
  /\brecord\b/i,
];

const OPEN_PATTERNS = [
  /\bintroduce\b/i,
  /\bidentify\s+(?:the\s+)?patient\b/i,
  /\bverify the patient'?s identity\b/i,
  /\bexplain\b/i,
  /\bprivacy\b/i,
  /\bhand\s+hygiene\b/i,
  /\bwater\s+temp/i,
  /\bfill the basin with warm water\b/i,
  /\b(?:check|test|verify)\s+(?:the\s+)?(?:water\s+)?temp/i,
  /\bgloves?\b/i,
  /\bdon clean\b/i,
  /\bface\s+the\s+back\s+opening\b/i,
];

export function getTemplateByRtcId(
  rtcId: number,
): TemplateDefinition | undefined {
  return TEMPLATE_DEFINITIONS.find((t) => t.rtcIds.includes(rtcId));
}

export function getTemplateLabel(template: TemplateId): string {
  return TEMPLATE_DEFINITIONS.find((t) => t.id === template)?.label ?? template;
}

export function templatesShareFamily(a: TemplateId, b: TemplateId): boolean {
  const defA = TEMPLATE_DEFINITIONS.find((t) => t.id === a);
  const defB = TEMPLATE_DEFINITIONS.find((t) => t.id === b);
  if (!defA || !defB) {
    return false;
  }
  if (a === b) {
    return true;
  }
  if (a === "T1" && b === "T1+") {
    return true;
  }
  if (a === "T1+" && b === "T1") {
    return true;
  }
  return defA.family === defB.family;
}

/** Classify a main checklist step into open / core / close for template teaching */
export function classifyStepSegment(
  template: TemplateId,
  stepIndex: number,
  stepText: string,
  totalSteps: number,
  skillSlug?: string,
  stepId?: number,
): StepSegment {
  const def = TEMPLATE_DEFINITIONS.find((t) => t.id === template);
  const openCount = def?.openStepCount ?? 3;

  if (template === "T5") {
    if (stepIndex <= 0) {
      return "open";
    }
    if (stepIndex >= totalSteps - 2) {
      return "close";
    }
    return "core";
  }

  const isClose = CLOSE_PATTERNS.some((p) => p.test(stepText));

  if (stepIndex < openCount) {
    return "open";
  }
  if (isClose && stepIndex >= totalSteps - 4) {
    return "close";
  }
  if (stepIndex >= totalSteps - 3) {
    const trailingClose = CLOSE_PATTERNS.some((p) => p.test(stepText));
    if (trailingClose) {
      return "close";
    }
  }
  return "core";
}

/** Deterministic template prefix for divergence — shared open sequence per family */
export function getTemplatePrefixSteps(
  template: TemplateId,
): { index: number; label: string }[] {
  switch (template) {
    case "T1":
      return [
        { index: 1, label: "Introduce / explain" },
        { index: 2, label: "Provide for privacy" },
        { index: 3, label: "Hand hygiene" },
      ];
    case "T1+":
      return [
        { index: 1, label: "Introduce / explain" },
        { index: 2, label: "Provide for privacy" },
        { index: 3, label: "Hand hygiene" },
        { index: 4, label: "Get / check water temp" },
        { index: 5, label: "Gloves before CORE" },
      ];
    case "T2":
      return [
        { index: 1, label: "Introduce / explain" },
        { index: 2, label: "Hand hygiene" },
      ];
    case "T3":
      return [{ index: 1, label: "Introduce / explain" }];
    case "T4":
      return [{ index: 1, label: "Identify patient" }];
    case "T5":
      return [{ index: 0, label: "No patient intro — PPE sequence" }];
    case "T6":
      return [
        { index: 1, label: "Introduce / explain" },
        { index: 2, label: "Provide for privacy" },
        { index: 3, label: "Lower HOB" },
        { index: 4, label: "Hand hygiene" },
      ];
    default:
      return [];
  }
}

export function findTemplateDivergenceIndex(
  templateA: TemplateId,
  templateB: TemplateId,
): number | null {
  const prefixA = getTemplatePrefixSteps(templateA);
  const prefixB = getTemplatePrefixSteps(templateB);
  const max = Math.min(prefixA.length, prefixB.length);
  for (let i = 0; i < max; i++) {
    if (prefixA[i].label !== prefixB[i].label) {
      return i + 1;
    }
  }
  if (prefixA.length !== prefixB.length) {
    return max + 1;
  }
  return null;
}
