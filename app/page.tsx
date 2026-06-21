import SkillIndex from "@/components/SkillIndex";
import { getSections } from "@/lib/skills";

export default function HomePage() {
  const sections = getSections();
  return (
    <main>
      <SkillIndex sections={sections} />
    </main>
  );
}
