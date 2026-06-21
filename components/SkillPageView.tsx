import Link from "next/link";

import SkillChecklist from "@/components/SkillChecklist";
import type { WebSkill } from "@/lib/skills";

type SkillPageViewProps = {
  skill: WebSkill;
  prev?: WebSkill;
  next?: WebSkill;
};

export default function SkillPageView({ skill, prev, next }: SkillPageViewProps) {
  return (
    <div className="site-shell">
      <nav className="skill-nav-top">
        <Link href="/" className="skill-nav-home">
          ← All skills
        </Link>
      </nav>

      <p className="exam-strip">{skill.examCardLabel}</p>

      {skill.rtcVideoUrl ?
        <div className="video-strip">
          <span className="video-strip-label">Demonstration video</span>
          <a href={skill.rtcVideoUrl} target="_blank" rel="noopener noreferrer">
            {skill.rtcVideoTitle ?? "RTC demonstration"}
          </a>
          <span className="video-strip-note"> — open before lab practice</span>
        </div>
      : null}

      <SkillChecklist
        title={skill.title}
        steps={skill.steps}
        storageKey={skill.storageKey}
      />

      <nav className="skill-nav-bottom" aria-label="Skill navigation">
        {prev ?
          <Link href={`/skills/${prev.slug}/`} className="skill-nav-link">
            ← {prev.title}
          </Link>
        : <span />}
        {next ?
          <Link href={`/skills/${next.slug}/`} className="skill-nav-link skill-nav-next">
            {next.title} →
          </Link>
        : null}
      </nav>
    </div>
  );
}
