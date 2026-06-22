import {
  CHECKLIST_BOILERPLATE,
  normalizeBoilerplateText,
} from "@/lib/checklist-boilerplate";
import { normalizeBoilerplateIdAlias } from "@/lib/boilerplate-id-aliases";
import type { TemplateId } from "@/data/skillCurriculum";
import { classifyStepSegment, type StepSegment } from "@/lib/skill-templates";

export type BoilerplateId = keyof typeof CHECKLIST_BOILERPLATE;

export type ChecklistStep = {
  id: number;
  text: string;
  note?: string;
  subSteps?: string[];
  /** Source-of-truth phase tag — set at sync time */
  segment?: StepSegment;
  /** Canonical key or FINAL-PASS composite (e.g. BED_LOW|CALL_LIGHT) */
  boilerplateId?: BoilerplateId | (string & {});
  /** FINAL-PASS "Detailed Tag Text" — full GWC rubric language */
  detailedText?: string;
  /** FINAL-PASS "Tag Category" — Opening | Key Procedure | Core | Closing */
  tagCategory?: string;
  /** FINAL-PASS critical tag — hand-hygiene | privacy | bed-call-light */
  criticalCategory?: string;
  /** FINAL-PASS exam scorecard strip text on scored steps */
  examScorecard?: string;
  /** Override computed phase label (Measure, Secure, …) */
  phaseWord?: string;
};

/** S01–S22 imported from FINAL-PASS use ≤6-word cue text in the checklist UI. */
export const FINAL_PASS_SLUGS = new Set([
  "hand-hygiene",
  "ppe-gown-gloves",
  "radial-pulse-60-seconds",
  "respirations-60-seconds",
  "manual-blood-pressure",
  "weight-ambulatory-client",
  "urinary-output-measurement",
  "position-on-side",
  "bed-wheelchair-transfer",
  "ambulate-transfer-belt",
  "prom-shoulder",
  "prom-knee-ankle",
  "knee-high-stocking",
  "modified-bed-bath",
  "mouth-care",
  "denture-cleaning",
  "foot-care-one-foot",
  "dress-weak-right-arm",
  "feed-client-dependence",
  "bedpan-assist",
  "perineal-care-female",
  "catheter-care-female",
]);

export function inferBoilerplateId(text: string): BoilerplateId | undefined {
  const normalized = normalizeBoilerplateText(text);
  for (const [id, canonical] of Object.entries(CHECKLIST_BOILERPLATE) as [
    BoilerplateId,
    string,
  ][]) {
    if (normalized === canonical) {
      return id;
    }
  }
  return undefined;
}

/** GWC FINAL-PASS merged call-light + bed-low on one close step (S10, S13). */
export const COMPOSITE_BOILERPLATE_IDS = new Set([
  "BED_LOW|CALL_LIGHT",
  "HAND_HYGIENE|VIDEO_WARNING",
]);

export function isCompositeBoilerplateId(id: string | undefined): id is string {
  return Boolean(id && COMPOSITE_BOILERPLATE_IDS.has(id));
}

export function resolveStepDisplayText(
  step: Pick<ChecklistStep, "text" | "boilerplateId">,
  options?: { slug?: string },
): string {
  if (step.boilerplateId && !isCompositeBoilerplateId(step.boilerplateId)) {
    const canonical =
      CHECKLIST_BOILERPLATE[
        step.boilerplateId as keyof typeof CHECKLIST_BOILERPLATE
      ];
    if (canonical) {
      if (step.text === canonical) {
        return canonical;
      }
      if (options?.slug && FINAL_PASS_SLUGS.has(options.slug)) {
        return step.text;
      }
      return canonical;
    }
  }
  return step.text;
}

export type StepSegmentContext = {
  template: TemplateId;
  stepIndex: number;
  totalSteps: number;
  skillSlug: string;
};

/** Prefer explicit step.segment; fall back to template classifier */
export function resolveStepSegment(
  step: Pick<ChecklistStep, "id" | "text" | "segment">,
  ctx: StepSegmentContext,
): StepSegment {
  if (step.segment) {
    return step.segment;
  }
  return classifyStepSegment(
    ctx.template,
    ctx.stepIndex,
    step.text,
    ctx.totalSteps,
    ctx.skillSlug,
    step.id,
  );
}

export type SegmentValidationIssue = {
  slug: string;
  stepId: number;
  severity: "warn" | "error";
  message: string;
};

export function validateSkillStepSegments(
  slug: string,
  template: TemplateId,
  steps: ChecklistStep[],
): SegmentValidationIssue[] {
  const issues: SegmentValidationIssue[] = [];

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    if (!step.segment) {
      continue;
    }

    const inferred = classifyStepSegment(
      template,
      i,
      resolveStepDisplayText(step),
      steps.length,
      slug,
      step.id,
    );
    if (inferred !== step.segment) {
      issues.push({
        slug,
        stepId: step.id,
        severity: "warn",
        message: `Stored segment "${step.segment}" differs from template inference "${inferred}"`,
      });
    }

    if (
      step.boilerplateId &&
      !isCompositeBoilerplateId(step.boilerplateId) &&
      step.boilerplateId in CHECKLIST_BOILERPLATE
    ) {
      const expected =
        CHECKLIST_BOILERPLATE[
          step.boilerplateId as keyof typeof CHECKLIST_BOILERPLATE
        ];
      if (step.text === expected) {
        continue;
      }
      const wordCount = step.text.split(/\s+/).filter(Boolean).length;
      if (wordCount > 6) {
        issues.push({
          slug,
          stepId: step.id,
          severity: "error",
          message: `boilerplateId ${step.boilerplateId} but text is "${step.text}"`,
        });
      }
    }
  }

  return issues;
}

export function enrichChecklistStep(
  partial: Omit<ChecklistStep, "segment" | "boilerplateId"> & {
    segment?: StepSegment;
    boilerplateId?: BoilerplateId;
  },
  ctx: StepSegmentContext,
): ChecklistStep {
  const fromDb = normalizeBoilerplateIdAlias(
    (partial as { boilerplate_id?: string }).boilerplate_id ??
      partial.boilerplateId,
  );
  const inferred = inferBoilerplateId(partial.text);
  const boilerplateId =
    fromDb && fromDb in CHECKLIST_BOILERPLATE ?
      (fromDb as BoilerplateId)
    : inferred;
  const text =
    boilerplateId ? CHECKLIST_BOILERPLATE[boilerplateId] : partial.text.trim();
  const segment =
    partial.segment ??
    classifyStepSegment(
      ctx.template,
      ctx.stepIndex,
      text,
      ctx.totalSteps,
      ctx.skillSlug,
      partial.id,
    );

  return {
    id: partial.id,
    text,
    ...(partial.note ? { note: partial.note } : {}),
    ...(partial.subSteps ? { subSteps: partial.subSteps } : {}),
    segment,
    ...(boilerplateId ? { boilerplateId } : {}),
  };
}
