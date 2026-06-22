"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { SkillDrillPanel } from "@/components/SkillDrillPanel";
import SkillBadge from "@/components/SkillBadge";
import SkillChecklist from "@/components/SkillChecklist";
import type { ChecklistMode } from "@/components/SkillChecklist";
import { SkillExamNumbersSummary } from "@/components/SkillExamNumbersSummary";
import { SkillPracticeToggle } from "@/components/SkillPracticeToggle";
import {
  SegmentFilterToggle,
  useSegmentFilterMode,
} from "@/components/SegmentFilterToggle";
import { SitePrimaryNav } from "@/components/SitePrimaryNav";
import { StudentFocusBanner } from "@/components/StudentFocusBanner";
import SkillVideoEmbed from "@/components/SkillVideoEmbed";
import { getCurriculumMeta } from "@/data/skillCurriculum";
import { getExamSkillBadge } from "@/lib/exam-meta";
import { skillHasExamNumbersSummary } from "@/lib/exam-scorecard";
import { resolveSkillPageSurfaceConfig } from "@/lib/skill-surface-config";
import { selectSkillMode } from "@/store/mastery-selectors";
import {
  rehydrateMasteryStore,
  useMasteryStore,
} from "@/store/useMasteryStore";
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

function quizModeStorageKey(slug: string): string {
  return `quiz-mode-${slug}`;
}

export default function SkillPageClient({
  skill,
  prev,
  next,
}: SkillPageClientProps) {
  const [mode, setMode] = useState<ChecklistMode>("study");
  const [progressStatus, setProgressStatus] = useState<
    "not-started" | "in-progress" | "reviewed"
  >("not-started");

  const storeHydrated = useMasteryStore((s) => s.isHydrated);
  const storeMode = useMasteryStore((s) => selectSkillMode(s, skill.slug));
  const setStoreMode = useMasteryStore((s) => s.setMode);
  const practiceMode = storeMode === "drill" ? "test-yourself" : "learn";
  const segmentFilterMode = useSegmentFilterMode();

  useEffect(() => {
    rehydrateMasteryStore();
  }, []);

  useEffect(() => {
    const progress = readSkillProgress();
    setProgressStatus(getSkillProgressStatus(progress, skill.slug));
    try {
      const stored = window.localStorage.getItem(
        quizModeStorageKey(skill.slug),
      );
      if (stored === "quiz" || stored === "study") {
        setMode(stored);
      }
    } catch {
      // Ignore private-mode errors
    }
  }, [skill.slug]);

  const handlePracticeModeChange = useCallback(
    (next: "learn" | "test-yourself") => {
      if (!storeHydrated) {
        return;
      }
      setStoreMode(skill.slug, next === "test-yourself" ? "drill" : "learn");
    },
    [skill.slug, setStoreMode, storeHydrated],
  );

  const handleModeChange = useCallback(
    (nextMode: ChecklistMode) => {
      setMode(nextMode);
      try {
        window.localStorage.setItem(quizModeStorageKey(skill.slug), nextMode);
      } catch {
        // Ignore private-mode errors
      }
    },
    [skill.slug],
  );

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
  const surface = resolveSkillPageSurfaceConfig(mode);

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

      {(
        surface.showExamNumbersSummary && skillHasExamNumbersSummary(skill.slug)
      ) ?
        <SkillExamNumbersSummary slug={skill.slug} />
      : null}

      {surface.showStudentFocus && skill.studentFocus ?
        <StudentFocusBanner focus={skill.studentFocus} />
      : null}

      <SkillPracticeToggle
        mode={practiceMode}
        onChange={handlePracticeModeChange}
      />

      {practiceMode === "test-yourself" ?
        <SkillDrillPanel
          steps={skill.steps}
          skillSlug={skill.slug}
          title={skill.title}
        />
      : <>
          <SegmentFilterToggle skillSlug={skill.slug} />
          <SkillChecklist
            title={skill.title}
            steps={skill.steps}
            storageKey={skill.storageKey}
            mode={mode}
            onModeChange={handleModeChange}
            showModeToggle={surface.showModeToggle}
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
        </>
      }

      {practiceMode === "learn" ?
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
