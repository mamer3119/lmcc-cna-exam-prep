import type { ChecklistStep } from "@/lib/checklist-step";

/** Tolerance / timing chip text derived from exam scorecard. */
export function resolveStepFailRule(step: ChecklistStep): string | undefined {
  const sc = step.examScorecard?.trim();
  if (!sc) {
    return undefined;
  }

  const tolerance = sc.match(/Tolerance:[^.;]+/i);
  if (tolerance) {
    return tolerance[0].replace(/^Tolerance:\s*/i, "").trim();
  }

  const examTolerance = sc.match(/Exam tolerance:[^.;]+/i);
  if (examTolerance) {
    return examTolerance[0].replace(/^Exam tolerance:\s*/i, "").trim();
  }

  const numericParts = sc.match(/(?:≥|>=|±|repeat)[^.;]*/gi);
  if (numericParts?.length) {
    return numericParts.map((part) => part.trim()).join("; ");
  }

  if (/≥|>=|repeat|±|\d+\s*(?:sec|s|mmHg|beats|breaths)/i.test(sc)) {
    const afterLabel =
      sc.includes(":") ? sc.split(":").slice(1).join(":").trim() : sc;
    return afterLabel.length <= 72 ? afterLabel : undefined;
  }

  return undefined;
}

/** Coaching copy — step.note when present and not identical to clinical tag text. */
export function resolveStepCoachingNote(
  step: ChecklistStep,
  clinicalNote?: string,
): string | undefined {
  const note = step.note?.trim();
  if (!note || note === clinicalNote?.trim()) {
    return undefined;
  }
  if (note.match(/REGIONAL-TESTING|ALL-TRANSCRIPTS|Michelle's exact phrase/i)) {
    return undefined;
  }
  return note;
}

export type ExamAuthority = "GWC" | "Credentia";

export function resolveStepExamAuthority(
  step: ChecklistStep,
): ExamAuthority | undefined {
  const haystack = [step.note, step.examScorecard, step.detailedText]
    .filter(Boolean)
    .join(" ");
  if (/Credentia/i.test(haystack)) {
    return "Credentia";
  }
  if (/GWC/i.test(haystack)) {
    return "GWC";
  }
  return undefined;
}

export function isHandHygieneEmbedStep(
  step: ChecklistStep,
  skillSlug?: string,
): boolean {
  if (!skillSlug || skillSlug === "hand-hygiene") {
    return false;
  }
  const id = step.boilerplateId ?? "";
  return (
    id === "HAND_HYGIENE" ||
    id === "HAND_HYGIENE|VIDEO_WARNING" ||
    id.startsWith("HAND_HYGIENE")
  );
}

export function segmentPhaseLabel(
  segment: "open" | "core" | "close" | null | undefined,
): "OPENING" | "CORE" | "CLOSING" | null {
  if (segment === "open") {
    return "OPENING";
  }
  if (segment === "core") {
    return "CORE";
  }
  if (segment === "close") {
    return "CLOSING";
  }
  return null;
}
