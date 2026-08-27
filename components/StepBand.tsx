import ChecklistStepCard from "@/components/ChecklistStepCard";
import type { ChecklistStep } from "@/lib/checklist-step";
import { getFlameLetter } from "@/lib/flame";
import { resolveStepDetailedText } from "@/lib/skill-step-meta";

type StepBandProps = {
  segment: "open" | "core" | "close";
  steps: ChecklistStep[];
  checked: Record<number, boolean>;
  onToggle: (stepId: number) => void;
  skillSlug: string;
  totalSteps: number;
};

const SEGMENT_LABELS: Record<StepBandProps["segment"], string> = {
  open: "OPEN",
  core: "CORE",
  close: "CLOSE",
};

export default function StepBand({
  segment,
  steps,
  checked,
  onToggle,
  skillSlug,
  totalSteps,
}: StepBandProps) {
  if (steps.length === 0) return null;

  return (
    <section
      className="journal-band"
      aria-label={`${SEGMENT_LABELS[segment]} steps`}
      data-journal-reveal="band"
    >
      <div className="journal-band__head">
        <span className="journal-band__kicker">{SEGMENT_LABELS[segment]}</span>
        <span className="journal-band__count">
          {steps.length === 1 ? "1 step" : `${steps.length} steps`}
        </span>
      </div>
      <ul className="journal-band__list">
        {steps.map((step) => {
          const flame = getFlameLetter(step, {
            slug: skillSlug,
            stepIndex: step.id - 1,
            totalSteps,
          });

          return (
            <ChecklistStepCard
              key={step.id}
              stepId={step.id}
              text={step.text}
              detailedText={resolveStepDetailedText(step)}
              subSteps={step.subSteps}
              checked={Boolean(checked[step.id])}
              onToggle={() => onToggle(step.id)}
              flame={flame}
            />
          );
        })}
      </ul>
    </section>
  );
}
