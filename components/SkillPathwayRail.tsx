import Link from "next/link";

import railStyles from "@/components/SkillPathwayRail.module.css";
import { countHandHygieneSteps } from "@/lib/repeat-graph";
import { getAllSkills, getSections } from "@/lib/skills";

type SkillPathwayRailProps = {
  activeSlug: string;
  /** Desktop fixed sidebar — hidden below md breakpoint. */
  variant?: "desktop" | "inline";
};

function roomLabel(index: number): string {
  return String(index).padStart(2, "0");
}

export function SkillPathwayRail({
  activeSlug,
  variant = "inline",
}: SkillPathwayRailProps) {
  const sections = getSections();
  const allSkills = getAllSkills();

  const isDesktop = variant === "desktop";

  return (
    <aside
      className={`skill-pathway-rail${isDesktop ? ` ${railStyles.desktopRail}` : ""}`}
      aria-label="22-skill palace"
    >
      <div
        className={`skill-pathway-rail__inner${isDesktop ? ` ${railStyles.railInner}` : ""}`}
      >
        <div
          className={
            isDesktop ? railStyles.railHeader : "skill-pathway-rail__header"
          }
        >
          <p className="skill-pathway-rail__kicker">22-skill palace</p>
          <Link
            href="/study-method/"
            className="skill-pathway-rail__overview"
          >
            How the palace works →
          </Link>
        </div>
        <nav
          className={`skill-pathway-rail__nav${isDesktop ? ` ${railStyles.railNav}` : ""}`}
        >
          {sections.map(({ section, sectionIndex, skills }) => (
            <div key={section} className="skill-pathway-rail__group">
              <p className="skill-pathway-rail__section">
                <span className="skill-pathway-rail__room">
                  {roomLabel(sectionIndex)}
                </span>
                {section}
              </p>
              <ol className="skill-pathway-rail__list">
                {skills.map((skill) => {
                  const isActive = skill.slug === activeSlug;
                  const hhCount = countHandHygieneSteps(skill);
                  const isKey = skill.slug === "hand-hygiene";
                  return (
                    <li key={skill.slug}>
                      <Link
                        href={`/skills/${skill.slug}/`}
                        className={`skill-pathway-rail__link ${isActive ? "skill-pathway-rail__link--active" : ""}`}
                        aria-current={isActive ? "page" : undefined}
                      >
                        <span className="skill-pathway-rail__link-title">
                          {skill.title}
                        </span>
                        {isKey ? (
                          <span className="skill-pathway-rail__pill skill-pathway-rail__pill--key">
                            KEY
                          </span>
                        ) : hhCount > 0 ? (
                          <span className="skill-pathway-rail__pill">
                            HH×{hhCount}
                          </span>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </div>
          ))}
        </nav>
        <p
          className={`skill-pathway-rail__count${isDesktop ? ` ${railStyles.railCount}` : ""}`}
        >
          {allSkills.length} skills · Skill 1 repeats in the rooms
        </p>
      </div>
    </aside>
  );
}
