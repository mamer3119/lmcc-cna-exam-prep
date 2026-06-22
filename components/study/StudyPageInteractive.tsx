"use client";

import Link from "next/link";
import { useCallback, useMemo } from "react";

import StudyOrganizerHud from "@/components/StudyOrganizerHud";
import {
  StudyStateProvider,
  useStudyStateContext,
} from "@/components/study/StudyStateProvider";
import VerbSpineRail from "@/components/VerbSpineRail";
import { curriculumModules } from "@/data/skillCurriculum";
import { useScrollOrganizers } from "@/hooks/useScrollOrganizers";
import type { WebSkill } from "@/lib/skills";

type StudyPageInteractiveProps = {
  skills: WebSkill[];
  children: React.ReactNode;
};

function moduleSectionId(order: number): string {
  return `study-module-${order}`;
}

function StudyPageChrome({
  skills,
  children,
}: {
  skills: WebSkill[];
  children: React.ReactNode;
}) {
  const moduleSectionIds = useMemo(
    () => curriculumModules.map((m) => moduleSectionId(m.order)),
    [],
  );

  const scrollState = useScrollOrganizers({ moduleSectionIds });
  const { studyState, derived, masteredByModule, setExamDateValue } =
    useStudyStateContext();

  const handleJumpModule = useCallback((order: number) => {
    document.getElementById(moduleSectionId(order))?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  return (
    <div className="study-page">
      <VerbSpineRail
        modules={curriculumModules}
        activeModuleOrder={scrollState.activeModuleOrder}
        masteredByModule={masteredByModule}
        onJump={handleJumpModule}
      />

      <StudyOrganizerHud
        moduleVerb={scrollState.moduleVerb}
        phaseWord={scrollState.phaseWord}
        phaseHint={scrollState.phaseHint}
        templateId={scrollState.templateId}
        templateSkillName={scrollState.templateSkillName}
        phaseOpacity={scrollState.phaseWordOpacity}
        templateOpacity={scrollState.templateChipOpacity}
        stepFocused={scrollState.stepFocused}
      />

      <div className="site-shell study-page-shell">
        <header className="study-page-header">
          <Link href="/" className="skill-nav-home">
            ← Skill index
          </Link>
          <p className="lmcc-cover-eyebrow">Continuous study path</p>
          <h1 className="lmcc-cover-title">CNA Skills Study</h1>
          <p className="lmcc-pathway">
            Protect → Observe → Move → Restore → Clean → Feed → Eliminate
          </p>

          <div className="study-state-bar print:hidden">
            <div className="study-state-stat">
              <span className="study-state-stat__label">Mastered</span>
              <span className="study-state-stat__value">
                {derived.masteredCount}/{skills.length}
              </span>
            </div>
            <div className="study-state-stat">
              <span className="study-state-stat__label">Study days</span>
              <span className="study-state-stat__value">
                {studyState.studyDays}
              </span>
            </div>
            <div className="study-state-stat">
              <span className="study-state-stat__label">Band</span>
              <span className="study-state-stat__value study-state-stat__value--band">
                {derived.currentBand.replace("-", " ")}
                {derived.examSoon ? " · exam soon" : ""}
              </span>
            </div>
            <label className="study-exam-date">
              <span>Exam date</span>
              <input
                type="date"
                value={studyState.examDate ?? ""}
                onChange={(e) => setExamDateValue(e.target.value)}
              />
            </label>
          </div>
        </header>

        {children}
      </div>
    </div>
  );
}

export default function StudyPageInteractive({
  skills,
  children,
}: StudyPageInteractiveProps) {
  return (
    <StudyStateProvider skills={skills}>
      <StudyPageChrome skills={skills}>{children}</StudyPageChrome>
    </StudyStateProvider>
  );
}
