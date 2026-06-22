import type { TemplateId } from "@/data/skillCurriculum";
import {
  getTemplateLabel,
  getTemplatePrefixSteps,
  SEGMENT_DISPLAY_LABELS,
  SEGMENT_SHORT_LABELS,
} from "@/lib/skill-templates";

type TemplateChipProps = {
  templateId: string;
  skillName?: string;
  opacity?: number;
  muted?: boolean;
  /** Inline on skill card — always full visibility */
  prominent?: boolean;
  showSkillName?: boolean;
};

export default function TemplateChip({
  templateId,
  skillName = "",
  opacity = 1,
  muted = false,
  prominent = false,
  showSkillName = true,
}: TemplateChipProps) {
  const label = getTemplateLabel(templateId as TemplateId);
  const prefix = getTemplatePrefixSteps(templateId as TemplateId);
  const openHint =
    prefix.length > 0 ?
      `Open: ${prefix
        .slice(0, 3)
        .map((p) => p.label.split("—")[0].trim())
        .join(" → ")}`
    : null;

  return (
    <div
      className={`template-chip ${muted ? "template-chip--muted" : ""} ${prominent ? "template-chip--prominent" : ""}`}
      style={
        prominent ? undefined : (
          { opacity: Math.max(0.35, Math.min(1, opacity)) }
        )
      }
      aria-label={`Pattern ${templateId} ${label}`}
      title={openHint ?? undefined}
    >
      <span className="template-chip__id">{templateId}</span>
      <span className="template-chip__sep">·</span>
      <span className="template-chip__label">{label}</span>
      {showSkillName && skillName ?
        <span className="template-chip__skill">{skillName}</span>
      : null}
    </div>
  );
}

export function TemplateTeachingNote({
  templateId,
}: {
  templateId: TemplateId;
}) {
  const prefix = getTemplatePrefixSteps(templateId);
  if (prefix.length === 0) {
    return null;
  }
  const openSteps = prefix.map((p) => p.label).join(" → ");
  return (
    <p className="template-teaching-note print:hidden">
      <strong>{templateId}</strong> — you already know: {openSteps}.{" "}
      <em>Memorize only the middle (CORE) steps.</em>
    </p>
  );
}

export function StepSegmentBadge({
  segment,
  phaseStart = false,
}: {
  segment: "open" | "core" | "close";
  /** First step of CORE or CLOSE — accent highlight for phase boundary */
  phaseStart?: boolean;
}) {
  const short = SEGMENT_SHORT_LABELS[segment];
  const full = SEGMENT_DISPLAY_LABELS[segment];
  const phaseStartClass =
    phaseStart ?
      segment === "core" ?
        "step-segment-badge--core-start"
      : "step-segment-badge--close-start"
    : "";
  return (
    <span
      className={`step-segment-badge step-segment-badge--${segment} ${phaseStartClass}`.trim()}
      title={full}
      aria-label={full}
    >
      {short}
    </span>
  );
}
