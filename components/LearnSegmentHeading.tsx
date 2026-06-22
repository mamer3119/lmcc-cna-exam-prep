import type { StepSegment } from "@/lib/skill-templates";

type LearnSegmentHeadingProps = {
  segment: StepSegment;
};

const LABELS: Record<StepSegment, string> = {
  open: "OPENING",
  core: "CORE",
  close: "CLOSING",
};

export function LearnSegmentHeading({ segment }: LearnSegmentHeadingProps) {
  return (
    <li
      role="presentation"
      className={`learn-segment-heading learn-segment-heading--${segment} print:hidden`}
    >
      <span className="learn-segment-heading__label">{LABELS[segment]}</span>
    </li>
  );
}
