import type { ChecklistStep } from "@/lib/checklist-step";
import {
  resolveRegistryTokenId,
  getRegistryWording,
} from "@/lib/boilerplate-tokens";
import {
  resolveStepCoachingNote,
  resolveStepExamAuthority,
  resolveStepFailRule,
} from "@/lib/learn-mode-display";

/** Layer A — official scored wording (verbatim from data; never paraphrased). */
export function resolveStepHeaderText(step: ChecklistStep): string {
  const official = step.detailedText?.trim();
  if (official) {
    return official;
  }
  return step.text.trim();
}

/** Layer B — canonical registry expansion when longer than header. */
export function resolveStepDetailText(step: ChecklistStep): string | undefined {
  const header = resolveStepHeaderText(step);
  const tokenId = resolveRegistryTokenId(step.boilerplateId);
  if (!tokenId) {
    return undefined;
  }
  const registry = getRegistryWording(tokenId).trim();
  if (registry && registry !== header && registry.length > header.length) {
    return registry;
  }
  return undefined;
}

export type StepCoachingContent = {
  coachingNote?: string;
  failRule?: string;
  examScorecardLine?: string;
  authority?: "GWC" | "Credentia";
};

/** Layer C — tips, fail-traps, VIDEO WARNING, GWC rules (not the scored header). */
export function resolveStepCoachingContent(
  step: ChecklistStep,
  clinicalNote?: string,
): StepCoachingContent {
  const coachingNote = resolveStepCoachingNote(step, clinicalNote);
  const failRule = resolveStepFailRule(step);
  const authority = resolveStepExamAuthority(step);
  const examScorecardLine = step.examScorecard?.trim();

  const hasContent = coachingNote || failRule || examScorecardLine || authority;
  if (!hasContent) {
    return {};
  }

  return {
    coachingNote,
    failRule,
    examScorecardLine,
    authority,
  };
}

export function hasStepCoachingContent(
  step: ChecklistStep,
  clinicalNote?: string,
): boolean {
  const c = resolveStepCoachingContent(step, clinicalNote);
  return Boolean(
    c.coachingNote || c.failRule || c.examScorecardLine || c.authority,
  );
}

export function hasStepDetailLayer(step: ChecklistStep): boolean {
  return Boolean(resolveStepDetailText(step));
}

/** Bold operative / fail-critical phrases in detail text (markup-safe split). */
export function splitDetailWithBoldPhrases(
  text: string,
): Array<{ text: string; bold: boolean }> {
  const pattern =
    /(\d+\s*(?:sec(?:onds?)?|mmHg|mm Hg|beats(?:\/min)?|breaths(?:\/min)?)|≥\s*\d+[^.;,]*|±\d+[^.;,]*|at least \d+[^.;,]*|minimum of \d+[^.;,]*|do not[^.;,]*|never[^.;,]*|before[^.;,]*|after[^.;,]*|without[^.;,]*|inside out[^.;,]*|six-step[^.;,]*)/gi;

  const parts: Array<{ text: string; bold: boolean }> = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ text: text.slice(lastIndex, match.index), bold: false });
    }
    parts.push({ text: match[0], bold: true });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex), bold: false });
  }

  if (parts.length === 0) {
    return [{ text, bold: false }];
  }

  return parts;
}
