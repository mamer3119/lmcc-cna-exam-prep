"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { SkillDrillPanel } from "@/components/SkillDrillPanel";
import SkillBadge from "@/components/SkillBadge";
import SkillChecklist from "@/components/SkillChecklist";
import { SkillExamNumbersSummary } from "@/components/SkillExamNumbersSummary";
import {
  SkillViewModeSelector,
  useSkillViewMode,
} from "@/components/SkillViewModeSelector";
import { SitePrimaryNav } from "@/components/SitePrimaryNav";
import { StudentFocusBanner } from "@/components/StudentFocusBanner";
import SkillVideoEmbed from "@/components/SkillVideoEmbed";
import { getCurriculumMeta } from "@/data/skillCurriculum";
import { getExamSkillBadge } from "@/lib/exam-meta";
import { skillHasExamNumbersSummary } from "@/lib/exam-scorecard";
import { resolveSkillPageSurfaceConfig } from "@/lib/skill-surface-config";
import { skillViewModeUsesCoreFilter } from "@/lib/skill-view-mode-store";
import {
  SKILL_PROGRESS_UPDATED_EVENT,
  getSkillProgressStatus,
  markSkillInProgress,
  markSkillReviewed,
  readSkillProgress,
  writeSkillProgress,
} from "@/lib/skill-progress";
import type { WebSkill } from "@/lib/skills";

type SkillPageClientProps = {
  skill: WebSkill;
  prev?: WebSkill;
  next?: WebSkill;
};

function notifyProgressUpdated(): void {
  window.dispatchEvent(new Event(SKILL_PROGRESS_UPDATED_EVENT));
}

export default function SkillPageClient({
  skill,
  prev,
  next,
}: SkillPageClientProps) {
  const skillViewMode = useSkillViewMode();
  const [progressStatus, setProgressStatus] = useState<
    "not-started" | "in-progress" | "reviewed"
  >("not-started");

  useEffect(() => {
    const progress = readSkillProgress();
    setProgressStatus(getSkillProgressStatus(progress, skill.slug));
  }, [skill.slug]);

  const handleAnyCheckedChange = useCallback(
    (anyChecked: boolean) => {
      if (!anyChecked) {
        return;
      }
      setProgressStatus((current) => {
        if (current === "reviewed") {
          return current;
        }
        const map = markSkillInProgress(readSkillProgress(), skill.slug);
        writeSkillProgress(map);
        notifyProgressUpdated();
        return "in-progress";
      });
    },
    [skill.slug],
  );

  const handleMarkReviewed = useCallback(() => {
    const map = markSkillReviewed(readSkillProgress(), skill.slug);
    writeSkillProgress(map);
    notifyProgressUpdated();
    setProgressStatus("reviewed");
  }, [skill.slug]);

  const badge = getExamSkillBadge(skill.slug);
  const organizerMeta = getCurriculumMeta(skill.slug);
  const surface = resolveSkillPageSurfaceConfig("study");
  const isSelfCheck = skillViewMode === "self-check";
  const segmentFilterMode =
    skillViewModeUsesCoreFilter(skillViewMode) ? "core" : "all";

  return (
    <div className="site-shell">
      <SitePrimaryNav />

      <nav className="skill-nav-top">
        <Link href="/" className="skill-nav-home">
          ← All skills
        </Link>
      </nav>

      <div className="skill-page-meta">
        <p className="lmcc-skill-page-section">{skill.section}</p>
        {badge ?
          <SkillBadge badge={badge} />
        : null}
        <span
          className={`skill-progress-badge skill-progress-badge--${progressStatus}`}
        >
          {progressStatus === "reviewed" ?
            "Reviewed"
          : progressStatus === "in-progress" ?
            "In progress"
          : "Not started"}
        </span>
      </div>

      {!isSelfCheck &&
      surface.showExamNumbersSummary &&
      skillHasExamNumbersSummary(skill.slug) ?
        <SkillExamNumbersSummary slug={skill.slug} slim />
      : null}

      {surface.showStudentFocus && skill.studentFocus ?
        <StudentFocusBanner focus={skill.studentFocus} />
      : null}

      <SkillViewModeSelector skillSlug={skill.slug} />

      {isSelfCheck ?
        <SkillDrillPanel
          steps={skill.steps}
          skillSlug={skill.slug}
          title={skill.title}
        />
      : <SkillChecklist
          title={skill.title}
          steps={skill.steps}
          storageKey={skill.storageKey}
          mode="study"
          showModeToggle={false}
          onAnyCheckedChange={handleAnyCheckedChange}
          organizerMeta={
            surface.showSegmentOrganizer ? organizerMeta : undefined
          }
          skillSlug={skill.slug}
          showSegmentBadges={surface.showSegmentBadges}
          showCriticalBadges={surface.showCriticalBadges}
          showExamScorecards={surface.showExamScorecards}
          display={surface.display}
          segmentFilterMode={segmentFilterMode}
        />
      }

      {!isSelfCheck ?
        <div className="skill-reviewed-row print:hidden">
          <button
            type="button"
            className="skill-mark-reviewed"
            onClick={handleMarkReviewed}
            disabled={progressStatus === "reviewed"}
          >
            {progressStatus === "reviewed" ?
              "✓ Marked as Reviewed"
            : "Mark as Reviewed"}
          </button>
        </div>
      : null}

      <details className="skill-exam-reference print:hidden">
        <summary>Exam card reference (optional)</summary>
        <p>
          RTC exam card lists this skill as{" "}
          <strong>Skill {skill.examSkillNumber}</strong>. On test day you will
          hear the official name — <strong>{skill.title}</strong> — not the
          number.
        </p>
      </details>

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
