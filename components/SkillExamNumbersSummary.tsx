import type { ExamScorecardEntry } from "@/lib/exam-scorecard";
import { getExamScorecardsForSkill } from "@/lib/exam-scorecard";

type SkillExamNumbersSummaryProps = {
  slug: string;
};

export function SkillExamNumbersSummary({
  slug,
}: SkillExamNumbersSummaryProps) {
  const entries = getExamScorecardsForSkill(slug);
  if (entries.length === 0) {
    return null;
  }

  const summaryLabel = entries
    .map((e) => `${e.headline} ${e.value}`)
    .join("; ");

  return (
    <section
      className="exam-numbers-summary print:border-black"
      aria-label={`Exam scoring numbers for this skill: ${summaryLabel}`}
    >
      <header className="exam-numbers-summary__header">
        <p className="exam-numbers-summary__eyebrow">Exam scoring</p>
        <h2 className="exam-numbers-summary__title">Numbers that fail you</h2>
        <p className="exam-numbers-summary__lead">
          These tolerances and rates are graded on test day — memorize them
          separately from the step wording below.
        </p>
      </header>
      <dl className="exam-numbers-summary__grid">
        {entries.map((entry) => (
          <ExamNumbersSummaryRow
            key={`${entry.slug}-${entry.stepId}`}
            entry={entry}
          />
        ))}
      </dl>
    </section>
  );
}

function ExamNumbersSummaryRow({ entry }: { entry: ExamScorecardEntry }) {
  const valueLine =
    entry.detail ? `${entry.value} · ${entry.detail}` : entry.value;

  return (
    <div className="exam-numbers-summary__row">
      <dt className="exam-numbers-summary__term">
        <span className="exam-numbers-summary__step">Step {entry.stepId}</span>
        <span className="exam-numbers-summary__label">{entry.headline}</span>
        <span className="exam-numbers-summary__kind">{entry.eyebrow}</span>
      </dt>
      <dd className="exam-numbers-summary__value">{valueLine}</dd>
    </div>
  );
}
