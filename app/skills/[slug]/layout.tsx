import type { ReactNode } from "react";

import railStyles from "@/components/SkillPathwayRail.module.css";
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
      <SkillPathwayRail activeSlug={slug} variant="desktop" />
      <div className={`skill-page-layout__main ${railStyles.mainWithRail}`}>
        <SkillPathwayRailMobile activeSlug={slug} />
        {children}
      </div>
    </div>
  );
}
