import type { ExamAuthority } from "@/lib/learn-mode-display";

type ExamAuthorityBadgeProps = {
  authority: ExamAuthority;
  text?: string;
};

export function ExamAuthorityBadge({
  authority,
  text,
}: ExamAuthorityBadgeProps) {
  return (
    <span
      className={`exam-authority-badge exam-authority-badge--${authority.toLowerCase()}`}
    >
      {authority}
      {text ? `: ${text}` : null}
    </span>
  );
}
