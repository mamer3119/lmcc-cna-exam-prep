import StudyModulesStatic from "@/components/study/StudyModulesStatic";
import StudyPageInteractive from "@/components/study/StudyPageInteractive";
import { getAllSkills } from "@/lib/skills";

export const dynamic = "force-static";

export const metadata = {
  title: "CNA Skills Study — Phase Organizers",
  description:
    "Continuous CNA skills study path with verb-spine navigation, phase words, template patterns, and divergence markers.",
};

export default function StudyPage() {
  const skills = getAllSkills();

  return (
    <main>
      <StudyPageInteractive skills={skills}>
        <StudyModulesStatic skills={skills} />
      </StudyPageInteractive>
    </main>
  );
}
