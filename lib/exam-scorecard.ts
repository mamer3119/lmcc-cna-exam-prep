import { getAllSkills } from "@/lib/skills";
import { resolveStepExamScorecardRaw } from "@/lib/skill-step-meta";
import type { ChecklistStep } from "@/lib/checklist-step";

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

/** Parse "Technique: …" / "Exam tolerance: …" strings from skills.json. */
export function parseExamScorecardString(
  raw: string,
  slug: string,
  stepId: number,
): ExamScorecardEntry {
  const colon = raw.indexOf(":");
  const eyebrowRaw = colon >= 0 ? raw.slice(0, colon).trim() : "Technique";
  let body = colon >= 0 ? raw.slice(colon + 1).trim() : raw;

  const kind: ScorecardKind =
    /tolerance|exam tolerance/i.test(eyebrowRaw) ? "tolerance" : "technique";

  const eyebrow = eyebrowRaw === "Tolerance" ? "Exam tolerance" : eyebrowRaw;

  let detail: string | undefined;
  const semi = body.indexOf(";");
  if (semi >= 0) {
    detail = body.slice(semi + 1).trim();
    body = body.slice(0, semi).trim();
  }

  const paren = body.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
  if (paren && !detail) {
    body = paren[1].trim();
    detail = paren[2].trim();
  }

  const tol = body.match(
    /±\s*[\d.]+\s*(?:mmHg|mm\s*Hg\/second|beats\/min|breaths\/min|mL|lb(?:\s*\/\s*[\d.]+\s*kg)?)/i,
  );
  let headline = "";
  let value = body;

  if (tol) {
    value = tol[0].replace(/\s+/g, " ");
    headline = body.replace(tol[0], "").trim();
  } else {
    const rate = body.match(
      /^(.*?)\s+(\d+[–-]\d+\s*mmHg|\d+\s*mm\s*Hg\/second.*|≥\s*.+)$/i,
    );
    if (rate) {
      headline = rate[1].trim();
      value = rate[2].trim();
    } else {
      const words = body.split(/\s+/);
      if (words.length > 3) {
        headline = words.slice(0, 2).join(" ");
        value = words.slice(2).join(" ");
      }
    }
  }

  const ariaLabel = `Exam scoring ${kind}: ${body}${detail ? `; ${detail}` : ""}`;

  return {
    slug,
    stepId,
    kind,
    eyebrow,
    headline,
    value,
    ...(detail ? { detail } : {}),
    ariaLabel,
  };
}

function buildExamScorecardIndex(): ExamScorecardEntry[] {
  const entries: ExamScorecardEntry[] = [];
  for (const skill of getAllSkills()) {
    for (const step of skill.steps) {
      const raw = resolveStepExamScorecardRaw(step);
      if (!raw) {
        continue;
      }
      entries.push(parseExamScorecardString(raw, skill.slug, step.id));
    }
  }
  return entries;
}

const EXAM_SCORECARDS = buildExamScorecardIndex();

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

/** Scorecard for a step object (uses skills.json field + tag fallback). */
export function getExamScorecardForStep(
  slug: string,
  step: ChecklistStep,
): ExamScorecardEntry | undefined {
  const raw = resolveStepExamScorecardRaw(step);
  if (!raw) {
    return undefined;
  }
  return parseExamScorecardString(raw, slug, step.id);
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
