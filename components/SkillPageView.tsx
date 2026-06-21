import Link from "next/link";

import SkillChecklist from "@/components/SkillChecklist";
import SkillVideoEmbed from "@/components/SkillVideoEmbed";
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
  return (
    <div className="site-shell">
      <nav className="skill-nav-top">
        <Link href="/" className="skill-nav-home">
          ← All skills
        </Link>
      </nav>

      <p className="exam-strip">{skill.examCardLabel}</p>

      <SkillChecklist
        title={skill.title}
        steps={skill.steps}
        storageKey={skill.storageKey}
      />

      {skill.rtcVideoUrl ?
        <SkillVideoEmbed videoUrl={skill.rtcVideoUrl} title={skill.title} />
      : null}

      <nav className="skill-nav-bottom" aria-label="Skill navigation">
        {prev ?
          <Link href={`/skills/${prev.slug}/`} className="skill-nav-link">
            ← {prev.title}
          </Link>
        : <span />}
        {next ?
          <Link
            href={`/skills/${next.slug}/`}
            className="skill-nav-link skill-nav-next"
          >
            {next.title} →
          </Link>
        : null}
      </nav>
    </div>
  );
}
