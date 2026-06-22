import Link from "next/link";

import { SitePrimaryNav } from "@/components/SitePrimaryNav";
import { getPathwayTagline, getSections } from "@/lib/skills";

export const metadata = {
  title: "22-Skill Pathway — Section Map",
  description:
    "All California CNA skills grouped by clinical pathway: Protect through Eliminate.",
};

export default function FrameworkPathwayPage() {
  const sections = getSections();
  const pathwayTagline = getPathwayTagline();

  return (
    <main>
      <div className="site-shell framework-page framework-pathway-page">
        <SitePrimaryNav />

        <header className="framework-hero framework-hero--compact">
          <p className="lmcc-cover-eyebrow">Pathway map</p>
          <h1 className="framework-hero__title">22 skills in clinical order</h1>
          <p className="framework-hero__pathway">{pathwayTagline}</p>
        </header>

        <div className="framework-pathway-sections">
          {sections.map(({ section, sectionIndex, rationale, skills }) => (
            <section
              key={section}
              className="framework-pathway-section"
              aria-labelledby={`pathway-section-${sectionIndex}`}
            >
              <header className="framework-pathway-section__head">
                <span className="framework-pathway-section__index">
                  {sectionIndex}
                </span>
                <div>
                  <h2
                    id={`pathway-section-${sectionIndex}`}
                    className="framework-pathway-section__title"
                  >
                    {section}
                  </h2>
                  <p className="framework-pathway-section__rationale">
                    {rationale}
                  </p>
                </div>
              </header>
              <ol className="framework-pathway-skills">
                {skills.map((skill) => (
                  <li key={skill.slug}>
                    <Link
                      href={`/skills/${skill.slug}/`}
                      className="framework-pathway-skill"
                    >
                      <span className="framework-pathway-skill__title">
                        {skill.title}
                      </span>
                      <span className="framework-pathway-skill__meta">
                        {skill.stepCount} steps
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>

        <p className="framework-pathway-back">
          <Link href="/framework/">← Back to Framework</Link>
        </p>
      </div>
    </main>
  );
}
