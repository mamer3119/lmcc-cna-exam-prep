"use client";

import { useState } from "react";

import { SkillPathwayRail } from "@/components/SkillPathwayRail";

type SkillPathwayRailMobileProps = {
  activeSlug: string;
};

export function SkillPathwayRailMobile({
  activeSlug,
}: SkillPathwayRailMobileProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="skill-pathway-rail-mobile print:hidden">
      <button
        type="button"
        className="skill-pathway-rail-mobile__trigger"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="skill-pathway-sheet"
        aria-label={open ? "Close 22-skill palace" : "Browse 22-skill palace"}
      >
        <span className="skill-pathway-rail-mobile__kicker">
          22-skill palace
        </span>
        <span className="skill-pathway-rail-mobile__action">
          {open ? "Close" : "Browse rooms →"}
        </span>
      </button>
      {open ?
        <div
          id="skill-pathway-sheet"
          className="skill-pathway-rail-mobile__sheet"
          role="dialog"
          aria-label="22-skill palace"
        >
          <SkillPathwayRail activeSlug={activeSlug} />
        </div>
      : null}
    </div>
  );
}
