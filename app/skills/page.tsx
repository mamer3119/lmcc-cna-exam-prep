import Link from "next/link";
import GlobalDisclaimer from "@/components/GlobalDisclaimer";
import JsonLd from "@/components/JsonLd";
import { getAllSkills } from "@/lib/skills";
import {
  jsonLdItemList,
  jsonLdWebPage,
  skillsListMetadata,
} from "@/lib/seo";
import { canonicalPath } from "@/lib/paths";

export const metadata = skillsListMetadata();

export default function SkillsListPage() {
  const skills = getAllSkills();
  const title = "All 22 official CNA skills";
  const description =
    "Practice the California state exam skills. Click a skill to open its checklist.";

  const skillListItems = skills.map((skill) => ({
    name: skill.title,
    url: `${process.env.NEXT_PUBLIC_SITE_ORIGIN ?? "https://mamer3119.github.io"}${canonicalPath(`/skills/${skill.slug}/`)}`,
  }));

  return (
    <>
      <JsonLd
        data={[
          jsonLdWebPage(title, description, "/skills/"),
          jsonLdItemList(skillListItems),
        ]}
      />
      <main className="site-shell">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true"> / </span>
          <span>Skills</span>
        </nav>

        <header className="skills-list__header">
          <h1 className="lmcc-cover-title">All 22 official CNA skills</h1>
          <p className="skills-list__intro">
            Practice the California state exam skills. Click a skill to open its
            checklist.
          </p>
        </header>

        <ul className="skills-list">
          {skills.map((skill) => (
            <li key={skill.slug} className="skills-list__item">
              <Link href={`/skills/${skill.slug}/`}>
                <span className="skills-list__title">{skill.title}</span>
                <span className="skills-list__meta">{skill.examCardLabel}</span>
              </Link>
            </li>
          ))}
        </ul>

        <GlobalDisclaimer />
      </main>
    </>
  );
}
