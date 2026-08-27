import FlameBadge from "@/components/FlameBadge";
import type { ChecklistStep } from "@/lib/checklist-step";
import { getFlameLetter, type FlameLetter } from "@/lib/flame";
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
    <section className={`mp-band mp-band--${segment}`} aria-label={`${SEGMENT_LABELS[segment]} steps`}>
      <div className="mp-band__header">
        <span className="mp-band__label">{SEGMENT_LABELS[segment]}</span>
        <span className="mp-band__count">{steps.length} steps</span>
      </div>
      <ul className="mp-band__list">
        {steps.map((step, index) => {
          const isChecked = Boolean(checked[step.id]);
          const detailedText = resolveStepDetailedText(step);
          const flame = getFlameLetter(step, {
            slug: skillSlug,
            stepIndex: step.id - 1,
            totalSteps,
          });

          return (
            <li key={step.id} className="mp-step">
              <div className="mp-step__row">
                <label className="mp-step__label">
                  <input
                    type="checkbox"
                    className="mp-step__checkbox"
                    checked={isChecked}
                    onChange={() => onToggle(step.id)}
                    aria-label={`Step ${step.id}: ${step.text}`}
                  />
                  <span className="mp-step__text">
                    <strong>{step.id}.</strong> {step.text}
                  </span>
                  {flame && <FlameBadge letter={flame as FlameLetter} />}
                </label>
              </div>
              {detailedText && detailedText !== step.text && (
                <p className="mp-step__rubric">{detailedText}</p>
              )}
              {step.subSteps && step.subSteps.length > 0 && (
                <ul className="mp-step__rubric list-disc pl-5">
                  {step.subSteps.map((sub, i) => (
                    <li key={i}>{sub}</li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
