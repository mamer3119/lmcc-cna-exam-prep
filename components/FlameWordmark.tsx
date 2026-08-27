import {
  FLAME_MEANINGS,
  FLAME_ORDER,
  type FlameLetter,
} from "@/lib/flame";

type FlameWordmarkProps = {
  active: Iterable<FlameLetter>;
};

export default function FlameWordmark({ active }: FlameWordmarkProps) {
  const marked = active instanceof Set ? active : new Set(active);

  return (
    <div
      className="journal-flame"
      role="group"
      aria-label="FLAME"
      data-testid="flame-wordmark"
      data-journal-reveal="band"
    >
      <span className="sr-only">FLAME self-check</span>
      {FLAME_ORDER.map((letter) => {
        const meaning = FLAME_MEANINGS[letter];
        const isActive = marked.has(letter);
        return (
          <span
            key={letter}
            title={`FLAME ${letter}: ${meaning}`}
            aria-label={`FLAME ${letter}: ${meaning}`}
            aria-current={isActive ? "true" : undefined}
            className={`journal-flame__slot${
              isActive ? " journal-flame__slot--active" : ""
            }`}
          >
            {letter}
          </span>
        );
      })}
    </div>
  );
}
