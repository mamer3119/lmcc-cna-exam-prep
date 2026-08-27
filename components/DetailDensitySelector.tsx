"use client";

import { useCallback, useSyncExternalStore } from "react";

import { DENSITY_LABELS, type DetailDensity } from "@/lib/practice-labels";
import {
  getDetailDensitySnapshot,
  setDetailDensity,
  subscribeDetailDensity,
} from "@/lib/detail-density-store";

export function useDetailDensity(): DetailDensity {
  return useSyncExternalStore(
    subscribeDetailDensity,
    () => getDetailDensitySnapshot().density,
    () => getDetailDensitySnapshot().density,
  );
}

type DetailDensitySelectorProps = {
  className?: string;
};

export function DetailDensitySelector({
  className,
}: DetailDensitySelectorProps) {
  const density = useDetailDensity();

  const select = useCallback((next: DetailDensity) => {
    setDetailDensity(next);
  }, []);

  return (
    <div
      className={`detail-density-selector print:hidden ${className ?? ""}`.trim()}
      role="group"
      aria-label={DENSITY_LABELS.groupAria}
      data-testid="detail-density-selector"
    >
      {(["quick", "standard", "coach"] as const).map((level) => (
        <button
          key={level}
          type="button"
          className={`detail-density-selector__btn ${density === level ? "detail-density-selector__btn--active" : ""}`}
          aria-pressed={density === level}
          onClick={() => select(level)}
        >
          {DENSITY_LABELS[level]}
        </button>
      ))}
    </div>
  );
}
