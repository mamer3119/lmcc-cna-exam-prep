"use client";

import { DRILL_TYPE_LABELS, type DrillType } from "@/lib/practice-labels";

type DrillTypePickerProps = {
  active: DrillType;
  onChange: (type: DrillType) => void;
  toleranceCount: number;
  recallCount: number;
};

export function DrillTypePicker({
  active,
  onChange,
  toleranceCount,
  recallCount,
}: DrillTypePickerProps) {
  const items: { id: DrillType; label: string; disabled?: boolean }[] = [
    { id: "sequence", label: DRILL_TYPE_LABELS.sequence },
    {
      id: "tolerance",
      label: DRILL_TYPE_LABELS.tolerance(toleranceCount),
      disabled: toleranceCount === 0,
    },
    { id: "recall", label: DRILL_TYPE_LABELS.recall(recallCount) },
  ];

  return (
    <div
      className="drill-type-picker print:hidden"
      role="tablist"
      aria-label={DRILL_TYPE_LABELS.groupAria}
    >
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          role="tab"
          aria-selected={active === item.id}
          disabled={item.disabled}
          className={`drill-type-picker__btn ${active === item.id ? "drill-type-picker__btn--active" : ""}`}
          onClick={() => onChange(item.id)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
