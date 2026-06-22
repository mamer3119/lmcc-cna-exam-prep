"use client";

import Link from "next/link";

import { assetPath } from "@/lib/paths";

type HandHygieneEmbedChipProps = {
  stepId: number;
  checked: boolean;
  onToggle: () => void;
};

export function HandHygieneEmbedChip({
  stepId,
  checked,
  onToggle,
}: HandHygieneEmbedChipProps) {
  return (
    <div className="skill-hh-embed">
      <div className="skill-hh-embed__row">
        <label className="skill-hh-embed__label">
          <input
            type="checkbox"
            checked={checked}
            onChange={onToggle}
            aria-label={`Step ${stepId}: Hand hygiene — see Skill 1`}
            className="skill-checkbox rounded border-gray-400"
          />
          <span className="skill-hh-embed__chip">
            <span className="skill-hh-embed__icon" aria-hidden>
              🧼
            </span>
            Hand hygiene —{" "}
            <Link
              href={assetPath("skills/hand-hygiene/")}
              className="skill-hh-embed__link"
            >
              see Skill 1
            </Link>
          </span>
        </label>
      </div>
    </div>
  );
}
