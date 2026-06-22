"use client";

import type { ExamSkillBadge } from "@/lib/exam-meta";
import { getExamBadgeLabel } from "@/lib/exam-meta";

type SkillBadgeProps = {
  badge: ExamSkillBadge;
  className?: string;
};

export default function SkillBadge({ badge, className = "" }: SkillBadgeProps) {
  return (
    <span
      className={`skill-exam-badge skill-exam-badge--${badge} ${className}`.trim()}
    >
      {getExamBadgeLabel(badge)}
    </span>
  );
}
