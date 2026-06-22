/** Hand Hygiene is guaranteed on every California CNA skills exam. */
export const HAND_HYGIENE_SLUG = "hand-hygiene";

/** At least one measurement skill is drawn on every exam. */
export const MEASUREMENT_SKILL_SLUGS = [
  "radial-pulse-60-seconds",
  "respirations-60-seconds",
  "manual-blood-pressure",
  "weight-ambulatory-client",
  "urinary-output-measurement",
] as const;

export type MeasurementSkillSlug = (typeof MEASUREMENT_SKILL_SLUGS)[number];

export type ExamSkillBadge = "always-tested" | "measurement-pool";

export function getExamSkillBadge(slug: string): ExamSkillBadge | null {
  if (slug === HAND_HYGIENE_SLUG) {
    return "always-tested";
  }
  if (MEASUREMENT_SKILL_SLUGS.includes(slug as MeasurementSkillSlug)) {
    return "measurement-pool";
  }
  return null;
}

export function getExamBadgeLabel(badge: ExamSkillBadge): string {
  if (badge === "always-tested") {
    return "🔒 Always Tested";
  }
  return "📏 Always Included (1 drawn)";
}

export const EXAM_REALITY_BANNER_DISMISS_KEY = "exam-reality-banner-dismissed";

export const LAST_EXAM_SIMULATION_KEY = "last-exam-simulation";

export const SKILL_PROGRESS_KEY = "skill-progress";

export type SectionNavItem = {
  label: string;
  sectionTitle: string;
  anchorId: string;
};

/** Jump-nav labels mapped to pedagogical section titles (all 7 sections). */
export const SECTION_NAV_ITEMS: SectionNavItem[] = [
  {
    label: "Infection Control",
    sectionTitle: "Infection Control",
    anchorId: "section-infection-control",
  },
  {
    label: "Vital Signs",
    sectionTitle: "Measurement and Recording",
    anchorId: "section-vital-signs",
  },
  {
    label: "Mobility",
    sectionTitle: "Mobility and Positioning",
    anchorId: "section-mobility",
  },
  {
    label: "Other",
    sectionTitle: "Restorative and Support",
    anchorId: "section-restorative",
  },
  {
    label: "Personal Care",
    sectionTitle: "Personal Care",
    anchorId: "section-personal-care",
  },
  {
    label: "Nutrition",
    sectionTitle: "Feeding and Nutrition",
    anchorId: "section-nutrition",
  },
  {
    label: "Elimination",
    sectionTitle: "Elimination and Peri Care",
    anchorId: "section-elimination",
  },
];

export function sectionAnchorId(sectionTitle: string): string {
  const match = SECTION_NAV_ITEMS.find((item) => item.sectionTitle === sectionTitle);
  return match?.anchorId ?? `section-${sectionTitle.toLowerCase().replace(/\s+/g, "-")}`;
}
