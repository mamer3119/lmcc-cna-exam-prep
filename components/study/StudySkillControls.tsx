"use client";

import DivergenceMarker from "@/components/DivergenceMarker";
import SkillChecklist from "@/components/SkillChecklist";
import {
  isMastered,
  useStudyStateContext,
} from "@/components/study/StudyStateProvider";
import type { CurriculumSkillMeta } from "@/data/skillCurriculum";
import {
  buildDivergenceMarker,
  shouldShowDivergenceMarker,
} from "@/lib/divergence";
import type { WebSkill } from "@/lib/skills";

type StudySkillControlsProps = {
  skill: WebSkill;
  meta: CurriculumSkillMeta;
  priorMeta: CurriculumSkillMeta | null;
};

export function StudySkillDivergence({
  meta,
  priorMeta,
}: Pick<StudySkillControlsProps, "meta" | "priorMeta">) {
  const { masteredSet } = useStudyStateContext();

  if (!priorMeta) {
    return null;
  }

  const show = shouldShowDivergenceMarker(
    masteredSet,
    priorMeta.studyOrder,
    meta.studyOrder,
    priorMeta.rtcId,
    meta.rtcId,
    priorMeta.template,
    meta.template,
  );
  if (!show) {
    return null;
  }

  const marker = buildDivergenceMarker(
    priorMeta.studyOrder,
    meta.studyOrder,
    priorMeta.rtcId,
    meta.rtcId,
    priorMeta.name,
    meta.name,
    priorMeta.template,
    meta.template,
  );
  if (!marker) {
    return null;
  }

  return <DivergenceMarker copy={marker.copy} />;
}

export function StudySkillMasteredButton({
  meta,
}: {
  meta: CurriculumSkillMeta;
}) {
  const { studyState, toggleMasteredForOrder } = useStudyStateContext();
  const mastered = isMastered(studyState, meta.studyOrder);

  return (
    <button
      type="button"
      className={`study-mastered-btn ${mastered ? "study-mastered-btn--on" : ""}`}
      onClick={() => toggleMasteredForOrder(meta.studyOrder)}
      aria-pressed={mastered}
    >
      {mastered ? "✓ I've got this" : "I've got this"}
    </button>
  );
}

export function StudySkillChecklist({
  skill,
  meta,
}: Pick<StudySkillControlsProps, "skill" | "meta">) {
  return (
    <SkillChecklist
      title={skill.title}
      steps={skill.steps}
      storageKey={skill.storageKey}
      compact
      hideFooter
      organizerMeta={meta}
      skillSlug={skill.slug}
      showExamScorecards={true}
      display={{ preset: "studyCompact" }}
    />
  );
}
