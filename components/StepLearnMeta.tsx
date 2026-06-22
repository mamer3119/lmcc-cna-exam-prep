import type { ChecklistStep } from "@/lib/checklist-step";
import {
  resolveStepCoachingNote,
  resolveStepExamAuthority,
  resolveStepFailRule,
} from "@/lib/learn-mode-display";
import { ExamAuthorityBadge } from "@/components/ExamAuthorityBadge";

type StepLearnMetaProps = {
  step: ChecklistStep;
  clinicalNote?: string;
};

export function StepLearnMeta({ step, clinicalNote }: StepLearnMetaProps) {
  const failRule = resolveStepFailRule(step);
  const coachingNote = resolveStepCoachingNote(step, clinicalNote);
  const authority = resolveStepExamAuthority(step);
  const examText =
    step.examScorecard ?
      step.examScorecard
        .replace(/^(Technique|Tolerance|Safety|Exam tolerance):\s*/i, "")
        .trim()
    : undefined;

  if (!failRule && !coachingNote && !authority) {
    return null;
  }

  return (
    <div className="step-learn-meta print:hidden">
      {failRule ?
        <span className="step-fail-rule-chip" data-testid="step-fail-rule">
          {failRule}
        </span>
      : null}
      {coachingNote ?
        <p className="step-coaching-note" data-testid="step-coaching-note">
          <span className="step-coach-tag">Coach</span>
          {coachingNote}
        </p>
      : null}
      {authority ?
        <ExamAuthorityBadge authority={authority} text={examText} />
      : null}
    </div>
  );
}
