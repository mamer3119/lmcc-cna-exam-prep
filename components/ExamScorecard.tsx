import type { ExamScorecardEntry } from "@/lib/exam-scorecard";

type ExamScorecardProps = {
  entry: ExamScorecardEntry;
};

export function ExamScorecard({ entry }: ExamScorecardProps) {
  const valueLine =
    entry.detail ? `${entry.value} · ${entry.detail}` : entry.value;

  return (
    <div
      className="exam-scorecard print:border-black"
      role="note"
      aria-label={entry.ariaLabel}
    >
      <p className="exam-scorecard__eyebrow">
        {entry.eyebrow.toUpperCase()}
        {entry.headline ? ` · ${entry.headline}` : ""}
      </p>
      <p className="exam-scorecard__value">{valueLine}</p>
    </div>
  );
}
