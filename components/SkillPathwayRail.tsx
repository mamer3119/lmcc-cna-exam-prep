import Link from "next/link";

import { getAllSkills, getSections } from "@/lib/skills";

type SkillPathwayRailProps = {
  activeSlug: string;
};

export function SkillPathwayRail({ activeSlug }: SkillPathwayRailProps) {
  const sections = getSections();
  const allSkills = getAllSkills();

  return (
    <aside className="skill-pathway-rail" aria-label="22-skill pathway">
      <div className="skill-pathway-rail__inner">
        <p className="skill-pathway-rail__kicker">Pathway</p>
        <Link
          href="/framework/pathway/"
          className="skill-pathway-rail__overview"
        >
          All sections →
        </Link>
        <nav className="skill-pathway-rail__nav">
          {sections.map(({ section, skills }) => (
            <div key={section} className="skill-pathway-rail__group">
              <p className="skill-pathway-rail__section">{section}</p>
              <ol className="skill-pathway-rail__list">
                {skills.map((skill) => {
                  const isActive = skill.slug === activeSlug;
                  return (
                    <li key={skill.slug}>
                      <Link
                        href={`/skills/${skill.slug}/`}
                        className={`skill-pathway-rail__link ${isActive ? "skill-pathway-rail__link--active" : ""}`}
                        aria-current={isActive ? "page" : undefined}
                      >
                        {skill.title}
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </div>
          ))}
        </nav>
        <p className="skill-pathway-rail__count">{allSkills.length} skills</p>
      </div>
    </aside>
  );
}
