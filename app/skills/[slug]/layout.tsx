import type { ReactNode } from "react";

import { SkillPathwayRail } from "@/components/SkillPathwayRail";
import { SkillPathwayRailMobile } from "@/components/SkillPathwayRailMobile";

type SkillSlugLayoutProps = {
  children: ReactNode;
  params: Promise<{ slug: string }>;
};

export default async function SkillSlugLayout({
  children,
  params,
}: SkillSlugLayoutProps) {
  const { slug } = await params;

  return (
    <div className="skill-page-layout">
      <div className="skill-page-layout__rail skill-page-layout__rail--desktop">
        <SkillPathwayRail activeSlug={slug} />
      </div>
      <div className="skill-page-layout__main">
        <SkillPathwayRailMobile activeSlug={slug} />
        {children}
      </div>
    </div>
  );
}
