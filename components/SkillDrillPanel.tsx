"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { DrillTypePicker } from "@/components/DrillTypePicker";
import type { DrillType } from "@/lib/practice-labels";
import { FreeRecallDrill } from "@/components/FreeRecallDrill";
import { SequenceDrill } from "@/components/SequenceDrill";
import { ToleranceDrill } from "@/components/ToleranceDrill";
import type { ChecklistStep } from "@/lib/checklist-step";
import { countScoredSteps } from "@/lib/scored-steps";
import { getToleranceSteps } from "@/lib/tolerance-drill";

type SkillDrillPanelProps = {
  steps: ChecklistStep[];
  skillSlug: string;
  title: string;
};

function drillTypeStorageKey(slug: string): string {
  return `drill-type-${slug}`;
}

export function SkillDrillPanel({
  steps,
  skillSlug,
  title,
}: SkillDrillPanelProps) {
  const toleranceCount = useMemo(
    () => getToleranceSteps(steps).length,
    [steps],
  );
  const recallCount = useMemo(() => countScoredSteps(steps), [steps]);

  const [drillType, setDrillType] = useState<DrillType>("sequence");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(
        drillTypeStorageKey(skillSlug),
      );
      if (
        stored === "sequence" ||
        stored === "tolerance" ||
        stored === "recall"
      ) {
        if (stored === "tolerance" && toleranceCount === 0) {
          setDrillType("sequence");
        } else {
          setDrillType(stored);
        }
      }
    } catch {
      // private mode
    }
  }, [skillSlug, toleranceCount]);

  const handleDrillTypeChange = useCallback(
    (next: DrillType) => {
      setDrillType(next);
      try {
        window.localStorage.setItem(drillTypeStorageKey(skillSlug), next);
      } catch {
        // private mode
      }
    },
    [skillSlug],
  );

  return (
    <div className="skill-drill-panel">
      <DrillTypePicker
        active={drillType}
        onChange={handleDrillTypeChange}
        toleranceCount={toleranceCount}
        recallCount={recallCount}
      />
      {drillType === "sequence" ?
        <SequenceDrill steps={steps} skillSlug={skillSlug} title={title} />
      : drillType === "tolerance" ?
        <ToleranceDrill steps={steps} skillSlug={skillSlug} title={title} />
      : <FreeRecallDrill steps={steps} skillSlug={skillSlug} title={title} />}
    </div>
  );
}
