type PhaseDividerProps = {
  label: string;
};

export function PhaseDivider({ label }: PhaseDividerProps) {
  return (
    <div className="phase-divider" role="separator" aria-label={label}>
      <span className="phase-divider__rule" aria-hidden="true" />
      <span className="phase-divider__label">✦ {label}</span>
      <span className="phase-divider__rule" aria-hidden="true" />
    </div>
  );
}
