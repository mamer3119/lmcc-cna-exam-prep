import TemplateChip, { TemplateTeachingNote } from "@/components/TemplateChip";
import {
  StudySkillChecklist,
  StudySkillDivergence,
  StudySkillMasteredButton,
} from "@/components/study/StudySkillControls";
import {
  curriculumModules,
  getCurriculumMeta,
  getModuleForSlug,
} from "@/data/skillCurriculum";
import type { WebSkill } from "@/lib/skills";

type StudyModulesStaticProps = {
  skills: WebSkill[];
};

function moduleSectionId(order: number): string {
  return `study-module-${order}`;
}

export default function StudyModulesStatic({
  skills,
}: StudyModulesStaticProps) {
  const slugToSkill = new Map(skills.map((s) => [s.slug, s]));

  const skillsByModule = curriculumModules.map((mod) => ({
    module: mod,
    skills: mod.skillSlugs
      .map((slug) => slugToSkill.get(slug))
      .filter((s): s is WebSkill => Boolean(s)),
  }));

  return (
    <>
      {skillsByModule.map(({ module, skills: moduleSkills }) => (
        <section
          key={module.order}
          id={moduleSectionId(module.order)}
          className="study-module-section"
          aria-labelledby={`module-heading-${module.order}`}
        >
          <header className="study-module-header">
            <p className="study-module-verb">{module.verb}</p>
            <h2
              id={`module-heading-${module.order}`}
              className="lmcc-section-title"
            >
              {module.title}
            </h2>
            <p className="lmcc-section-rationale">{module.rationale}</p>
          </header>

          {moduleSkills.map((skill) => {
            const meta = getCurriculumMeta(skill.slug);
            if (!meta) {
              return null;
            }

            const skillIndex = skills.findIndex((s) => s.slug === skill.slug);
            const priorSkill = skillIndex > 0 ? skills[skillIndex - 1] : null;
            const priorMeta =
              priorSkill ? getCurriculumMeta(priorSkill.slug) : null;
            const mod = getModuleForSlug(skill.slug);
            const firstPhase = meta.phases[0];

            return (
              <article
                key={skill.slug}
                id={`study-skill-${skill.slug}`}
                className="study-skill-block"
                data-study-skill="true"
                data-skill-slug={skill.slug}
                data-skill-name={skill.title}
                data-template-id={meta.template}
                data-module-verb={mod?.verb}
                data-phase-hint={`${meta.template} pattern · ${firstPhase?.word ?? mod?.verb} phase starts step ${firstPhase?.fromStep ?? 1}`}
              >
                <StudySkillDivergence
                  meta={meta}
                  priorMeta={priorMeta ?? null}
                />
                <div className="study-skill-head">
                  <div className="study-skill-head__title-row">
                    <h3 className="study-skill-title">{skill.title}</h3>
                    <TemplateChip
                      templateId={meta.template}
                      skillName={skill.title}
                      prominent
                    />
                  </div>
                  <StudySkillMasteredButton meta={meta} />
                </div>
                <TemplateTeachingNote templateId={meta.template} />
                <StudySkillChecklist skill={skill} meta={meta} />
              </article>
            );
          })}
        </section>
      ))}
    </>
  );
}
