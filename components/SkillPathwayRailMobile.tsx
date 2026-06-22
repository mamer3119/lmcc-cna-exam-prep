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
      >
        {open ? "Close skill list" : "Browse 22 skills"}
      </button>
      {open ?
        <div
          id="skill-pathway-sheet"
          className="skill-pathway-rail-mobile__sheet"
          role="dialog"
          aria-label="Skill pathway"
        >
          <SkillPathwayRail activeSlug={activeSlug} />
        </div>
      : null}
    </div>
  );
}
