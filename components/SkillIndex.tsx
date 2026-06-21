"use client";

import Link from "next/link";

import type { WebSkill } from "@/lib/skills";

type SkillIndexProps = {
  sections: { section: string; skills: WebSkill[] }[];
};

export default function SkillIndex({ sections }: SkillIndexProps) {
  return (
    <div className="site-shell">
      <header className="site-hero">
        <p className="site-kicker">LMCC — California CNA Skills Exam Prep</p>
        <h1 className="site-title">Interactive Skill Checklists</h1>
        <p className="site-lead">
          Official evaluator step wording. Check boxes during lab practice —
          progress saves on this device.
        </p>
      </header>

      <div className="site-sections">
        {sections.map(({ section, skills }) => (
          <section key={section} className="site-section-block">
            <h2 className="site-section-title">{section}</h2>
            <ul className="skill-grid">
              {skills.map((skill) => (
                <li key={skill.slug}>
                  <Link href={`/skills/${skill.slug}/`} className="skill-card">
                    <span className="skill-card-order">
                      Study {String(skill.studyOrder).padStart(2, "0")}
                    </span>
                    <span className="skill-card-exam">
                      Exam skill {skill.examSkillNumber}
                    </span>
                    <span className="skill-card-title">{skill.title}</span>
                    <span className="skill-card-meta">
                      {skill.stepCount} steps
                      {skill.rtcVideoUrl ? " · video" : ""}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <footer className="site-footer">
        Step wording matches the state evaluator checklist. Self-paced — no
        fixed schedule.
      </footer>
    </div>
  );
}
