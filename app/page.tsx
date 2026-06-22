import SkillIndexClient from "@/components/SkillIndexClient";
import { getAllSkills, getPathwayTagline, getSections } from "@/lib/skills";

export default function HomePage() {
  const allSkills = getAllSkills();
  return (
    <main>
      <SkillIndexClient
        pathwayTagline={getPathwayTagline()}
        sections={getSections()}
        allSlugs={allSkills.map((skill) => skill.slug)}
        allSkills={allSkills}
        totalSkills={allSkills.length}
      />
    </main>
  );
}
