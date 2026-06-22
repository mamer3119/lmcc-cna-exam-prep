/**
 * ESM mirror of lib/checklist-step.ts + lib/skill-templates segment logic for sync scripts.
 */

import {
  CHECKLIST_BOILERPLATE,
  normalizeBoilerplateText,
} from "./checklist-boilerplate.mjs";
import { normalizeBoilerplateIdAlias } from "./boilerplate-id-aliases.mjs";

const OPEN_STEP_COUNTS = {
  T1: 3,
  "T1+": 5,
  T2: 2,
  T3: 1,
  T4: 1,
  T5: 0,
  T6: 4,
};

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

export function inferBoilerplateId(text) {
  const normalized = normalizeBoilerplateText(text ?? "");
  for (const [id, canonical] of Object.entries(CHECKLIST_BOILERPLATE)) {
    if (normalized === canonical) {
      return id;
    }
  }
  return undefined;
}

export function classifyStepSegment(
  template,
  stepIndex,
  stepText,
  totalSteps,
  skillSlug,
  stepId,
) {
  const openCount = OPEN_STEP_COUNTS[template] ?? 3;

  if (template === "T5") {
    if (stepIndex <= 0) {
      return "open";
    }
    if (stepIndex >= totalSteps - 2) {
      return "close";
    }
    return "core";
  }

  if (stepIndex < openCount) {
    return "open";
  }
  if (stepIndex >= totalSteps - 3) {
    const trailingClose = CLOSE_PATTERNS.some((p) => p.test(stepText));
    if (trailingClose) {
      return "close";
    }
  }
  if (
    CLOSE_PATTERNS.some((p) => p.test(stepText)) &&
    stepIndex >= totalSteps - 4
  ) {
    return "close";
  }
  return "core";
}

export function enrichChecklistStep(partial, ctx) {
  const skillSlug = ctx.skillSlug ?? ctx.slug;
  const fromDb = normalizeBoilerplateIdAlias(
    partial.boilerplateId ?? partial.boilerplate_id,
  );
  const inferred = inferBoilerplateId(partial.text);
  const boilerplateId =
    fromDb && CHECKLIST_BOILERPLATE[fromDb] ? fromDb : inferred;
  const text =
    boilerplateId ? CHECKLIST_BOILERPLATE[boilerplateId] : partial.text.trim();
  const segment =
    partial.segment ??
    classifyStepSegment(
      ctx.template,
      ctx.stepIndex,
      text,
      ctx.totalSteps,
      skillSlug,
      partial.id,
    );

  const out = {
    id: partial.id,
    text,
    segment,
  };
  if (boilerplateId) {
    out.boilerplateId = boilerplateId;
  }
  if (partial.note) {
    out.note = partial.note;
  }
  if (partial.subSteps?.length) {
    out.subSteps = partial.subSteps;
  }
  return out;
}

export function validateSkillStepSegments(slug, template, steps) {
  const issues = [];
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    if (!step.segment) {
      continue;
    }
    const inferred = classifyStepSegment(
      template,
      i,
      step.text,
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
      !step.boilerplateId.includes("|") &&
      step.text !== CHECKLIST_BOILERPLATE[step.boilerplateId]
    ) {
      const words = step.text.split(/\s+/).filter(Boolean).length;
      if (words > 6) {
        issues.push({
          slug,
          stepId: step.id,
          severity: "error",
          message: `boilerplateId ${step.boilerplateId} text drift`,
        });
      }
    }
  }
  return issues;
}
