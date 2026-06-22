/**
 * Canonical curriculum metadata — learning order and organizer seams are final.
 * Step text lives in skills.json; this file adds module verbs, phases, unlocks, tiers.
 */

export type TemplateId =
  | "T1"
  | "T1+"
  | "T2"
  | "T3"
  | "T4"
  | "T5"
  | "T6";

export type SkillPhase = {
  word: string;
  fromStep: number;
  toStep: number;
};

export type CurriculumSkillMeta = {
  rtcId: number;
  studyOrder: number;
  slug: string;
  name: string;
  template: TemplateId;
  tier: number;
  /** Phase word handed to the next skill at the dependency seam */
  unlocks?: string;
  phases: SkillPhase[];
};

export type Module = {
  order: number;
  verb: string;
  title: string;
  rationale: string;
  skillSlugs: string[];
};

/** Verb-spine modules — Protect → Observe → Move → Restore → Clean → Feed → Eliminate */
export const curriculumModules: Module[] = [
  {
    order: 1,
    verb: "Protect",
    title: "Infection Control",
    rationale:
      "Every clinical skill begins and ends with infection control. Students must internalize this as muscle memory before touching a patient.",
    skillSlugs: ["hand-hygiene", "ppe-gown-gloves"],
  },
  {
    order: 2,
    verb: "Observe",
    title: "Measurement and Recording",
    rationale:
      "Observation-only skills with no physical intervention. They train precision and documentation before students are trusted to act.",
    skillSlugs: [
      "radial-pulse-60-seconds",
      "respirations-60-seconds",
      "manual-blood-pressure",
      "weight-ambulatory-client",
      "urinary-output-measurement",
    ],
  },
  {
    order: 3,
    verb: "Move",
    title: "Mobility and Positioning",
    rationale:
      "Before personal care, students must move patients safely. Positioning and transfers prevent injury during bathing, dressing, and elimination.",
    skillSlugs: [
      "position-on-side",
      "bed-wheelchair-transfer",
      "ambulate-transfer-belt",
    ],
  },
  {
    order: 4,
    verb: "Restore",
    title: "Restorative and Support",
    rationale:
      "Once mobility is established, students learn to maintain and restore function — preventing deterioration, not just assisting movement.",
    skillSlugs: ["prom-shoulder", "prom-knee-ankle", "knee-high-stocking"],
  },
  {
    order: 5,
    verb: "Clean",
    title: "Personal Care",
    rationale:
      "The core of daily CNA work. Mobility skills are prerequisites for bathing, grooming, and dressing with dignity.",
    skillSlugs: [
      "modified-bed-bath",
      "mouth-care",
      "denture-cleaning",
      "foot-care-one-foot",
      "dress-weak-right-arm",
    ],
  },
  {
    order: 6,
    verb: "Feed",
    title: "Feeding and Nutrition",
    rationale:
      "Feeding follows hygiene and positioning. It is cognitively distinct — swallowing observation, aspiration risk, and dignity at the table.",
    skillSlugs: ["feed-client-dependence"],
  },
  {
    order: 7,
    verb: "Eliminate",
    title: "Elimination and Peri Care",
    rationale:
      "The most intimate care. Full confidence in infection control, mobility, and personal care comes first — then elimination.",
    skillSlugs: [
      "bedpan-assist",
      "perineal-care-female",
      "catheter-care-female",
    ],
  },
];

/** Per-skill organizer metadata keyed by slug */
export const skillCurriculumMeta: Record<string, CurriculumSkillMeta> = {
  "hand-hygiene": {
    rtcId: 1,
    studyOrder: 1,
    slug: "hand-hygiene",
    name: "Hand Hygiene (Hand Washing)",
    template: "T4",
    tier: 1,
    unlocks: "Barrier",
    phases: [
      { word: "Identify", fromStep: 1, toStep: 1 },
      { word: "Wash", fromStep: 2, toStep: 9 },
      { word: "Finish", fromStep: 10, toStep: 11 },
    ],
  },
  "ppe-gown-gloves": {
    rtcId: 8,
    studyOrder: 2,
    slug: "ppe-gown-gloves",
    name: "Donning and Removing PPE (Gown and Gloves)",
    template: "T5",
    tier: 1,
    unlocks: "Observe",
    phases: [
      { word: "Don", fromStep: 1, toStep: 7 },
      { word: "Work", fromStep: 8, toStep: 12 },
      { word: "Doff", fromStep: 13, toStep: 16 },
    ],
  },
  "radial-pulse-60-seconds": {
    rtcId: 6,
    studyOrder: 3,
    slug: "radial-pulse-60-seconds",
    name: "Counts and Records Radial Pulse",
    template: "T3",
    tier: 2,
    unlocks: "Count",
    phases: [
      { word: "Introduce", fromStep: 1, toStep: 1 },
      { word: "Count", fromStep: 2, toStep: 3 },
      { word: "Record", fromStep: 4, toStep: 6 },
    ],
  },
  "respirations-60-seconds": {
    rtcId: 7,
    studyOrder: 4,
    slug: "respirations-60-seconds",
    name: "Counts and Records Respirations",
    template: "T3",
    tier: 2,
    unlocks: "Measure",
    phases: [
      { word: "Introduce", fromStep: 1, toStep: 1 },
      { word: "Count", fromStep: 2, toStep: 2 },
      { word: "Record", fromStep: 3, toStep: 5 },
    ],
  },
  "manual-blood-pressure": {
    rtcId: 22,
    studyOrder: 5,
    slug: "manual-blood-pressure",
    name: "Measures and Records Manual Blood Pressure",
    template: "T2",
    tier: 2,
    unlocks: "Weigh",
    phases: [
      { word: "Prepare", fromStep: 1, toStep: 4 },
      { word: "Measure", fromStep: 5, toStep: 11 },
      { word: "Record", fromStep: 12, toStep: 14 },
    ],
  },
  "weight-ambulatory-client": {
    rtcId: 13,
    studyOrder: 6,
    slug: "weight-ambulatory-client",
    name: "Measures and Records Weight of Ambulatory Client",
    template: "T2",
    tier: 2,
    unlocks: "Output",
    phases: [
      { word: "Prepare", fromStep: 1, toStep: 4 },
      { word: "Weigh", fromStep: 5, toStep: 10 },
      { word: "Record", fromStep: 11, toStep: 13 },
    ],
  },
  "urinary-output-measurement": {
    rtcId: 12,
    studyOrder: 7,
    slug: "urinary-output-measurement",
    name: "Measures and Records Urinary Output",
    template: "T2",
    tier: 2,
    unlocks: "Position",
    phases: [
      { word: "Prepare", fromStep: 1, toStep: 3 },
      { word: "Measure", fromStep: 4, toStep: 8 },
      { word: "Record", fromStep: 9, toStep: 11 },
    ],
  },
  "position-on-side": {
    rtcId: 16,
    studyOrder: 8,
    slug: "position-on-side",
    name: "Positions on Side",
    template: "T1",
    tier: 3,
    unlocks: "Transfer",
    phases: [
      { word: "Approach", fromStep: 1, toStep: 3 },
      { word: "Position", fromStep: 4, toStep: 18 },
      { word: "Secure", fromStep: 19, toStep: 24 },
    ],
  },
  "bed-wheelchair-transfer": {
    rtcId: 21,
    studyOrder: 9,
    slug: "bed-wheelchair-transfer",
    name: "Transfers from Bed to Wheelchair Using Transfer Belt",
    template: "T1",
    tier: 3,
    unlocks: "Ambulate",
    phases: [
      { word: "Approach", fromStep: 1, toStep: 3 },
      { word: "Transfer", fromStep: 4, toStep: 17 },
      { word: "Secure", fromStep: 18, toStep: 22 },
    ],
  },
  "ambulate-transfer-belt": {
    rtcId: 3,
    studyOrder: 10,
    slug: "ambulate-transfer-belt",
    name: "Assists to Ambulate Using Transfer Belt",
    template: "T1",
    tier: 3,
    unlocks: "Restore",
    phases: [
      { word: "Approach", fromStep: 1, toStep: 3 },
      { word: "Ambulate", fromStep: 4, toStep: 14 },
      { word: "Secure", fromStep: 15, toStep: 18 },
    ],
  },
  "prom-shoulder": {
    rtcId: 15,
    studyOrder: 11,
    slug: "prom-shoulder",
    name: "Performs Modified PROM for One Shoulder",
    template: "T1",
    tier: 4,
    unlocks: "Lower",
    phases: [
      { word: "Approach", fromStep: 1, toStep: 3 },
      { word: "Shoulder", fromStep: 4, toStep: 14 },
      { word: "Secure", fromStep: 15, toStep: 18 },
    ],
  },
  "prom-knee-ankle": {
    rtcId: 14,
    studyOrder: 12,
    slug: "prom-knee-ankle",
    name: "Performs Modified PROM for One Knee and One Ankle",
    template: "T1",
    tier: 4,
    unlocks: "Support",
    phases: [
      { word: "Approach", fromStep: 1, toStep: 3 },
      { word: "Lower", fromStep: 4, toStep: 6 },
      { word: "Secure", fromStep: 7, toStep: 9 },
    ],
  },
  "knee-high-stocking": {
    rtcId: 2,
    studyOrder: 13,
    slug: "knee-high-stocking",
    name: "Applies One Knee-High Elastic Stocking",
    template: "T1",
    tier: 4,
    unlocks: "Clean",
    phases: [
      { word: "Approach", fromStep: 1, toStep: 3 },
      { word: "Apply", fromStep: 4, toStep: 8 },
      { word: "Secure", fromStep: 9, toStep: 11 },
    ],
  },
  "modified-bed-bath": {
    rtcId: 11,
    studyOrder: 14,
    slug: "modified-bed-bath",
    name: "Gives Modified Bed Bath (Face and One Arm, Hand and Underarm)",
    template: "T1",
    tier: 5,
    unlocks: "Mouth",
    phases: [
      { word: "Approach", fromStep: 1, toStep: 3 },
      { word: "Bathe", fromStep: 4, toStep: 22 },
      { word: "Secure", fromStep: 23, toStep: 28 },
    ],
  },
  "mouth-care": {
    rtcId: 19,
    studyOrder: 15,
    slug: "mouth-care",
    name: "Provides Mouth Care",
    template: "T1",
    tier: 5,
    unlocks: "Denture",
    phases: [
      { word: "Approach", fromStep: 1, toStep: 3 },
      { word: "Mouth", fromStep: 4, toStep: 18 },
      { word: "Secure", fromStep: 19, toStep: 24 },
    ],
  },
  "denture-cleaning": {
    rtcId: 5,
    studyOrder: 16,
    slug: "denture-cleaning",
    name: "Cleans Upper or Lower Denture",
    template: "T2",
    tier: 5,
    unlocks: "Foot",
    phases: [
      { word: "Approach", fromStep: 1, toStep: 2 },
      { word: "Clean", fromStep: 3, toStep: 15 },
      { word: "Finish", fromStep: 16, toStep: 19 },
    ],
  },
  "foot-care-one-foot": {
    rtcId: 18,
    studyOrder: 17,
    slug: "foot-care-one-foot",
    name: "Provides Foot Care on One Foot",
    template: "T1+",
    tier: 5,
    unlocks: "Dress",
    phases: [
      { word: "Approach", fromStep: 1, toStep: 5 },
      { word: "Foot", fromStep: 6, toStep: 18 },
      { word: "Secure", fromStep: 19, toStep: 24 },
    ],
  },
  "dress-weak-right-arm": {
    rtcId: 9,
    studyOrder: 18,
    slug: "dress-weak-right-arm",
    name: "Dresses Client with Affected (Weak) Right Arm",
    template: "T1",
    tier: 5,
    unlocks: "Feed",
    phases: [
      { word: "Approach", fromStep: 1, toStep: 3 },
      { word: "Dress", fromStep: 4, toStep: 10 },
      { word: "Secure", fromStep: 11, toStep: 14 },
    ],
  },
  "feed-client-dependence": {
    rtcId: 10,
    studyOrder: 19,
    slug: "feed-client-dependence",
    name: "Feeds Client Who Cannot Feed Self",
    template: "T4",
    tier: 6,
    unlocks: "Eliminate",
    phases: [
      { word: "Identify", fromStep: 1, toStep: 2 },
      { word: "Feed", fromStep: 3, toStep: 17 },
      { word: "Secure", fromStep: 18, toStep: 22 },
    ],
  },
  "bedpan-assist": {
    rtcId: 4,
    studyOrder: 20,
    slug: "bedpan-assist",
    name: "Assists With Use of Bedpan",
    template: "T6",
    tier: 7,
    unlocks: "Peri",
    phases: [
      { word: "Approach", fromStep: 1, toStep: 4 },
      { word: "Assist", fromStep: 5, toStep: 20 },
      { word: "Clean", fromStep: 21, toStep: 26 },
    ],
  },
  "perineal-care-female": {
    rtcId: 20,
    studyOrder: 21,
    slug: "perineal-care-female",
    name: "Provides Perineal Care (Peri-Care) for Female",
    template: "T1+",
    tier: 7,
    unlocks: "Catheter",
    phases: [
      { word: "Approach", fromStep: 1, toStep: 5 },
      { word: "Peri", fromStep: 6, toStep: 32 },
      { word: "Secure", fromStep: 33, toStep: 41 },
    ],
  },
  "catheter-care-female": {
    rtcId: 17,
    studyOrder: 22,
    slug: "catheter-care-female",
    name: "Provides Catheter Care for Female",
    template: "T1+",
    tier: 7,
    phases: [
      { word: "Approach", fromStep: 1, toStep: 5 },
      { word: "Catheter", fromStep: 6, toStep: 24 },
      { word: "Secure", fromStep: 25, toStep: 31 },
    ],
  },
};

export function getCurriculumMeta(slug: string): CurriculumSkillMeta | undefined {
  return skillCurriculumMeta[slug];
}

export function getModuleForSlug(slug: string): Module | undefined {
  return curriculumModules.find((m) => m.skillSlugs.includes(slug));
}

export function getPhaseWordForStep(
  meta: CurriculumSkillMeta,
  stepNumber: number,
): string {
  const phase = meta.phases.find(
    (p) => stepNumber >= p.fromStep && stepNumber <= p.toStep,
  );
  return phase?.word ?? meta.phases[0]?.word ?? meta.unlocks ?? "Study";
}

/** Cross-skill seam: prior skill's unlocks word, or midpoint between step counts */
export function getCrossSkillTransitionAnchor(
  priorMeta: CurriculumSkillMeta,
  nextMeta: CurriculumSkillMeta,
  priorStepCount: number,
  nextStepCount: number,
): { word: string; anchorRatio: number } {
  if (priorMeta.unlocks) {
    return { word: priorMeta.unlocks, anchorRatio: 1 };
  }
  const midpoint =
    priorStepCount + nextStepCount > 0 ?
      priorStepCount / (priorStepCount + nextStepCount)
    : 0.5;
  return { word: nextMeta.phases[0]?.word ?? "Next", anchorRatio: midpoint };
}
