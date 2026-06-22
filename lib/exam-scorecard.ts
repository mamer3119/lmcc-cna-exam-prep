export type ScorecardKind = "technique" | "tolerance";

export type ExamScorecardEntry = {
  slug: string;
  stepId: number;
  kind: ScorecardKind;
  eyebrow: string;
  headline: string;
  value: string;
  detail?: string;
  ariaLabel: string;
};

const EXAM_SCORECARDS: ExamScorecardEntry[] = [
  {
    slug: "hand-hygiene",
    stepId: 5,
    kind: "technique",
    eyebrow: "Technique",
    headline: "Lather duration",
    value: "≥20 sec",
    detail: "repeat full sequence ≥2×",
    ariaLabel:
      "Exam scoring technique: lather all hand surfaces at least 20 seconds and repeat the full sequence at least two times.",
  },
  {
    slug: "hand-hygiene",
    stepId: 6,
    kind: "technique",
    eyebrow: "Technique",
    headline: "Fingertips down",
    value: "Throughout wash",
    ariaLabel:
      "Exam scoring technique: keep fingertips pointing downward throughout the entire handwashing process.",
  },
  {
    slug: "hand-hygiene",
    stepId: 7,
    kind: "technique",
    eyebrow: "Technique",
    headline: "Under nails",
    value: "Clean all fingernails",
    ariaLabel:
      "Exam scoring technique: clean under all fingernails during hand hygiene.",
  },
  {
    slug: "hand-hygiene",
    stepId: 8,
    kind: "technique",
    eyebrow: "Technique",
    headline: "Rinse",
    value: "Fingertips down",
    detail: "do not shake hands",
    ariaLabel:
      "Exam scoring technique: rinse with fingertips pointing down and do not shake water from hands.",
  },
  {
    slug: "hand-hygiene",
    stepId: 9,
    kind: "technique",
    eyebrow: "Technique",
    headline: "Dry",
    value: "Fingertip → wrist",
    detail: "paper towel or air dryer",
    ariaLabel:
      "Exam scoring technique: dry from fingertip to wrist using a paper towel or air dryer.",
  },
  {
    slug: "hand-hygiene",
    stepId: 10,
    kind: "technique",
    eyebrow: "Technique",
    headline: "Turn off faucet",
    value: "Clean paper towel",
    detail: "dispose immediately",
    ariaLabel:
      "Exam scoring technique: turn off the faucet with a clean paper towel and dispose of it immediately.",
  },
  {
    slug: "hand-hygiene",
    stepId: 11,
    kind: "technique",
    eyebrow: "Safety",
    headline: "Sink contact",
    value: "No contact",
    detail: "never lean or touch sink",
    ariaLabel:
      "Exam scoring safety: do not lean on or touch the sink at any time during handwashing.",
  },
  {
    slug: "manual-blood-pressure",
    stepId: 7,
    kind: "technique",
    eyebrow: "Technique",
    headline: "Inflate cuff",
    value: "160–180 mmHg",
    ariaLabel:
      "Exam scoring technique: inflate cuff to 160–180 mmHg before measuring blood pressure.",
  },
  {
    slug: "manual-blood-pressure",
    stepId: 8,
    kind: "technique",
    eyebrow: "Technique",
    headline: "Deflate rate",
    value: "2–3 mm Hg/second",
    detail: "systolic",
    ariaLabel:
      "Exam scoring technique: deflate cuff at 2–3 mm Hg per second for systolic measurement.",
  },
  {
    slug: "manual-blood-pressure",
    stepId: 9,
    kind: "technique",
    eyebrow: "Technique",
    headline: "Deflate rate",
    value: "2 mm Hg/second",
    detail: "diastolic",
    ariaLabel:
      "Exam scoring technique: continue deflating at 2 mm Hg per second for diastolic measurement.",
  },
  {
    slug: "manual-blood-pressure",
    stepId: 14,
    kind: "tolerance",
    eyebrow: "Exam tolerance",
    headline: "Document BP",
    value: "±8 mmHg",
    detail: "systolic AND diastolic",
    ariaLabel:
      "Exam scoring tolerance: document both systolic and diastolic blood pressure within plus or minus 8 mmHg of the evaluator reading.",
  },
  {
    slug: "radial-pulse-60-seconds",
    stepId: 6,
    kind: "tolerance",
    eyebrow: "Exam tolerance",
    headline: "Document pulse",
    value: "±4",
    detail: "beats/min vs evaluator",
    ariaLabel:
      "Exam scoring tolerance: document pulse within plus or minus 4 beats per minute of the evaluator result.",
  },
  {
    slug: "respirations-60-seconds",
    stepId: 5,
    kind: "tolerance",
    eyebrow: "Exam tolerance",
    headline: "Document respirations",
    value: "±4",
    detail: "breaths/min vs evaluator",
    ariaLabel:
      "Exam scoring tolerance: document respiratory rate within plus or minus 4 breaths per minute of the evaluator result.",
  },
  {
    slug: "weight-ambulatory-client",
    stepId: 12,
    kind: "tolerance",
    eyebrow: "Exam tolerance",
    headline: "Document weight",
    value: "±2 lb / 0.9 kg",
    ariaLabel:
      "Exam scoring tolerance: document weight within plus or minus 2 pounds or 0.9 kilograms of the evaluator reading.",
  },
  {
    slug: "urinary-output-measurement",
    stepId: 10,
    kind: "tolerance",
    eyebrow: "Exam tolerance",
    headline: "Record volume",
    value: "±25 mL",
    ariaLabel:
      "Exam scoring tolerance: record urinary output volume within plus or minus 25 milliliters of the actual volume.",
  },
];

const bySlugStep = new Map<string, ExamScorecardEntry>(
  EXAM_SCORECARDS.map((entry) => [`${entry.slug}:${entry.stepId}`, entry]),
);

const bySlug = new Map<string, ExamScorecardEntry[]>();
for (const entry of EXAM_SCORECARDS) {
  const list = bySlug.get(entry.slug) ?? [];
  list.push(entry);
  bySlug.set(entry.slug, list);
}

export function getExamScorecard(
  slug: string,
  stepId: number,
): ExamScorecardEntry | undefined {
  return bySlugStep.get(`${slug}:${stepId}`);
}

export function getExamScorecardsForSkill(slug: string): ExamScorecardEntry[] {
  return bySlug.get(slug) ?? [];
}

export function skillHasExamScorecards(slug: string): boolean {
  return bySlug.has(slug);
}

/** Skills with a page-level summary — no per-step inline strips in study or quiz */
export const EXAM_NUMBERS_SUMMARY_SLUGS = [
  "hand-hygiene",
  "manual-blood-pressure",
] as const;

export function skillHasExamNumbersSummary(slug: string): boolean {
  return (EXAM_NUMBERS_SUMMARY_SLUGS as readonly string[]).includes(slug);
}

/**
 * Inline scorecards only when step text is hidden (quiz recall).
 * Study mode + summary-card skills: never duplicate numbers already in prose or summary.
 */
export function shouldShowInlineExamScorecard(
  entry: ExamScorecardEntry,
  opts: { isQuiz: boolean; showMainText: boolean; slug: string },
): boolean {
  if (skillHasExamNumbersSummary(opts.slug)) {
    return false;
  }
  if (!opts.isQuiz) {
    return false;
  }
  return !opts.showMainText;
}
