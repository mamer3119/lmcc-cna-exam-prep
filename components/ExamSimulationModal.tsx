"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

import SkillChecklist from "@/components/SkillChecklist";
import type { WebSkill } from "@/lib/skills";

type ExamSimulationModalProps = {
  open: boolean;
  skills: WebSkill[];
  onClose: () => void;
  onReshuffle: () => void;
};

export default function ExamSimulationModal({
  open,
  skills,
  onClose,
  onReshuffle,
}: ExamSimulationModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    lastFocusRef.current = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !modalRef.current) {
        return;
      }

      const focusable = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) {
        return;
      }

      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      lastFocusRef.current?.focus();
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="exam-sim-overlay print:hidden">
      <div
        ref={modalRef}
        className="exam-sim-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="exam-sim-title"
      >
        <header className="exam-sim-header">
          <div>
            <h2 id="exam-sim-title" className="exam-sim-title">
              Your Simulated Exam — 5 Skills
            </h2>
            <p className="exam-sim-subtitle">
              Hand Hygiene is locked. Steps are hidden — use Quiz Mode reveals to
              practice recall.
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            className="exam-sim-close"
            onClick={onClose}
            aria-label="Close simulation"
          >
            ✕
          </button>
        </header>

        <div className="exam-sim-actions">
          <button type="button" className="exam-sim-reshuffle" onClick={onReshuffle}>
            🔀 Reshuffle (Hand Hygiene stays locked)
          </button>
        </div>

        <div className="exam-sim-skills">
          {skills.map((skill, index) => (
            <section key={skill.slug} className="exam-sim-skill-block">
              <div className="exam-sim-skill-head">
                <span className="exam-sim-skill-num">Skill {index + 1}</span>
                <Link href={`/skills/${skill.slug}/`} className="exam-sim-skill-link">
                  Open full checklist →
                </Link>
              </div>
              <SkillChecklist
                title={skill.title}
                steps={skill.steps}
                mode="quiz"
                showCriticalBadges
                compact
                hideFooter
                hideProgress
                hideReset
              />
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
