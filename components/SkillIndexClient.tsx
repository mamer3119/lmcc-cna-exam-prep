"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import ExamRealityBanner from "@/components/ExamRealityBanner";
import ExamSimulationModal from "@/components/ExamSimulationModal";
import SkillBadge from "@/components/SkillBadge";
import {
  SECTION_NAV_ITEMS,
  getExamSkillBadge,
  sectionAnchorId,
} from "@/lib/exam-meta";
import {
  generateExamSimulation,
  readStoredExamSimulation,
  reshuffleExamSimulation,
  writeStoredExamSimulation,
} from "@/lib/exam-simulation";
import type { SkillProgressMap } from "@/lib/skill-progress";
import {
  SKILL_PROGRESS_UPDATED_EVENT,
  countReviewedSkills,
  getSkillProgressStatus,
  readSkillProgress,
  resetAllSkillProgress,
} from "@/lib/skill-progress";
import type { WebSkill } from "@/lib/skills";

type SkillIndexClientProps = {
  pathwayTagline: string;
  sections: {
    section: string;
    sectionIndex: number;
    rationale: string;
    skills: WebSkill[];
  }[];
  allSlugs: string[];
  allSkills: WebSkill[];
  totalSkills: number;
};

export default function SkillIndexClient({
  pathwayTagline,
  sections,
  allSlugs,
  allSkills,
  totalSkills,
}: SkillIndexClientProps) {
  const [search, setSearch] = useState("");
  const [progressMap, setProgressMap] = useState<SkillProgressMap>({});
  const [simOpen, setSimOpen] = useState(false);
  const [simSlugs, setSimSlugs] = useState<string[]>([]);
  const [pendingAnchor, setPendingAnchor] = useState<string | null>(null);

  useEffect(() => {
    const refreshProgress = () => setProgressMap(readSkillProgress());
    refreshProgress();
    const stored = readStoredExamSimulation();
    if (stored) {
      setSimSlugs(stored.slugs);
    }

    window.addEventListener("focus", refreshProgress);
    window.addEventListener(SKILL_PROGRESS_UPDATED_EVENT, refreshProgress);
    return () => {
      window.removeEventListener("focus", refreshProgress);
      window.removeEventListener(SKILL_PROGRESS_UPDATED_EVENT, refreshProgress);
    };
  }, []);

  useEffect(() => {
    if (!pendingAnchor || search.trim()) {
      return;
    }
    document.getElementById(pendingAnchor)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    setPendingAnchor(null);
  }, [pendingAnchor, search]);

  const reviewedCount = useMemo(
    () => countReviewedSkills(progressMap, totalSkills),
    [progressMap, totalSkills],
  );

  const reviewedPct = Math.round((reviewedCount / totalSkills) * 100);

  const filteredSections = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return sections;
    }
    return sections
      .map((block) => ({
        ...block,
        skills: block.skills.filter((skill) =>
          skill.title.toLowerCase().includes(query),
        ),
      }))
      .filter((block) => block.skills.length > 0);
  }, [sections, search]);

  const simSkills = useMemo(
    () =>
      simSlugs
        .map((slug) => allSkills.find((skill) => skill.slug === slug))
        .filter((skill): skill is WebSkill => Boolean(skill)),
    [simSlugs, allSkills],
  );

  const startSimulation = useCallback(() => {
    const sim = generateExamSimulation(allSlugs);
    writeStoredExamSimulation(sim);
    setSimSlugs(sim.slugs);
    setSimOpen(true);
  }, [allSlugs]);

  const reshuffleSimulation = useCallback(() => {
    const current = readStoredExamSimulation();
    const sim =
      current ?
        reshuffleExamSimulation(current, allSlugs)
      : generateExamSimulation(allSlugs);
    writeStoredExamSimulation(sim);
    setSimSlugs(sim.slugs);
  }, [allSlugs]);

  const handleResetAllProgress = useCallback(() => {
    const confirmed = window.confirm(
      "Reset all skill progress? This clears reviewed and in-progress status for all 22 skills.",
    );
    if (!confirmed) {
      return;
    }
    resetAllSkillProgress();
    setProgressMap({});
  }, []);

  const scrollToSection = useCallback(
    (anchorId: string) => {
      if (search.trim()) {
        setSearch("");
        setPendingAnchor(anchorId);
        return;
      }
      document.getElementById(anchorId)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    },
    [search],
  );

  return (
    <>
      <ExamRealityBanner />

      <div className="site-shell">
        <header className="site-intro">
          <p className="lmcc-cover-eyebrow">
            LMCC — California CNA Skills Exam Prep
          </p>
          <h1 className="lmcc-cover-title">Interactive Skill Checklists</h1>
          <p className="lmcc-cover-subtitle">Learn by official skill name</p>
          <p className="lmcc-pathway">{pathwayTagline}</p>
          <p className="index-study-link print:hidden">
            <Link href="/study/" className="index-study-link__anchor">
              Open continuous study path →
            </Link>
          </p>
        </header>

        <div
          className="index-progress-overview print:hidden"
          role="progressbar"
          aria-valuenow={reviewedCount}
          aria-valuemin={0}
          aria-valuemax={totalSkills}
          aria-label={`${reviewedCount} of ${totalSkills} skills reviewed`}
        >
          <div className="index-progress-meta">
            <span>
              {reviewedCount} of {totalSkills} skills reviewed
            </span>
            <span>{reviewedPct}%</span>
          </div>
          <div className="index-progress-track">
            <div
              className="index-progress-fill"
              style={{ width: `${reviewedPct}%` }}
            />
          </div>
        </div>

        <div className="index-toolbar print:hidden">
          <label className="index-search-label">
            <span className="sr-only">Search skills</span>
            <input
              type="search"
              className="index-search-input"
              placeholder="Search by skill name…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <button
            type="button"
            className="index-simulate-btn"
            onClick={startSimulation}
          >
            🎲 Simulate My Exam
          </button>
        </div>

        <nav
          className="index-section-jump print:hidden"
          aria-label="Jump to category"
        >
          {SECTION_NAV_ITEMS.map((item) => (
            <button
              key={item.anchorId}
              type="button"
              className="index-section-jump-btn"
              onClick={() => scrollToSection(item.anchorId)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="site-sections">
          {filteredSections.map(({ section, rationale, skills }) => (
            <section
              key={section}
              id={sectionAnchorId(section)}
              className="site-section-block index-section-anchor"
            >
              <div className="lmcc-section-head">
                <h2 className="lmcc-section-title">{section}</h2>
                <p className="lmcc-section-rationale">{rationale}</p>
              </div>
              <ul className="skill-grid">
                {skills.map((skill) => {
                  const badge = getExamSkillBadge(skill.slug);
                  const status = getSkillProgressStatus(progressMap, skill.slug);
                  const cardClass = [
                    "lmcc-skill-card",
                    badge === "always-tested" ? "lmcc-skill-card--always-tested" : "",
                    badge === "measurement-pool" ?
                      "lmcc-skill-card--measurement"
                    : "",
                  ]
                    .filter(Boolean)
                    .join(" ");

                  return (
                    <li key={skill.slug}>
                      <Link href={`/skills/${skill.slug}/`} className={cardClass}>
                        <div className="lmcc-skill-card-badges">
                          {badge ?
                            <SkillBadge badge={badge} />
                          : null}
                          <span
                            className={`skill-progress-badge skill-progress-badge--${status}`}
                          >
                            {status === "reviewed" ?
                              "Reviewed"
                            : status === "in-progress" ?
                              "In progress"
                            : "Not started"}
                          </span>
                        </div>
                        <span className="lmcc-skill-card-title">{skill.title}</span>
                        <span className="lmcc-skill-card-meta">
                          {skill.stepCount} checklist steps
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>

        {filteredSections.length === 0 ?
          <p className="index-no-results">No skills match your search.</p>
        : null}

        <footer className="site-footer">
          <p>
            On exam day, the evaluator reads the skill name aloud — practice each
            checklist by name. Step wording matches the state evaluator
            checklist.
          </p>
          <button
            type="button"
            className="index-reset-progress print:hidden"
            onClick={handleResetAllProgress}
          >
            Reset All Progress
          </button>
        </footer>
      </div>

      <ExamSimulationModal
        open={simOpen}
        skills={simSkills}
        onClose={() => setSimOpen(false)}
        onReshuffle={reshuffleSimulation}
      />
    </>
  );
}
