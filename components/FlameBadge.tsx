import { FLAME_MEANINGS, type FlameLetter } from "@/lib/flame";

type FlameBadgeProps = {
  letter: FlameLetter;
};

export default function FlameBadge({ letter }: FlameBadgeProps) {
  const meaning = FLAME_MEANINGS[letter];

  return (
    <span
      className="journal-flame-badge"
      aria-label={`FLAME ${letter}: ${meaning}`}
      title={`FLAME ${letter}: ${meaning}`}
    >
      {letter}
    </span>
  );
}
