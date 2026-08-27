import type { FlameLetter } from "@/lib/flame";

type FlameBadgeProps = {
  letter: FlameLetter;
};

export default function FlameBadge({ letter }: FlameBadgeProps) {
  return (
    <span
      className={`mp-step__flame mp-flame--${letter.toLowerCase()}`}
      aria-label={`FLAME ${letter}`}
      title={`FLAME: ${letter}`}
    >
      {letter}
    </span>
  );
}
