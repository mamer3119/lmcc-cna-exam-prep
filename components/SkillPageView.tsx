import SkillPageClient from "@/components/SkillPageClient";
import type { WebSkill } from "@/lib/skills";

type SkillPageViewProps = {
  skill: WebSkill;
  prev?: WebSkill;
  next?: WebSkill;
};

export default function SkillPageView({
  skill,
  prev,
  next,
}: SkillPageViewProps) {
  return <SkillPageClient skill={skill} prev={prev} next={next} />;
}
