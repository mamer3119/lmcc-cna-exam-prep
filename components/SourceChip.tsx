type SourceChipProps = {
  label: string;
};

/** Instructor-only provenance chip (transcript IDs, filenames, attributions). */
export function SourceChip({ label }: SourceChipProps) {
  return (
    <span className="skill-source-chip" data-testid="source-chip">
      {label}
    </span>
  );
}
