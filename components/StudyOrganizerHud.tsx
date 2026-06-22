"use client";

import { useEffect, useRef, useState } from "react";

import TemplateChip from "@/components/TemplateChip";

type StudyOrganizerHudProps = {
  moduleVerb: string;
  phaseWord: string;
  phaseHint: string | null;
  templateId: string | null;
  templateSkillName: string | null;
  phaseOpacity: number;
  templateOpacity: number;
  stepFocused: boolean;
};

export default function StudyOrganizerHud({
  moduleVerb,
  phaseWord,
  phaseHint,
  templateId,
  templateSkillName,
  phaseOpacity,
  templateOpacity,
  stepFocused,
}: StudyOrganizerHudProps) {
  const prevWordRef = useRef(phaseWord);
  const [outgoingWord, setOutgoingWord] = useState<string | null>(null);

  useEffect(() => {
    if (phaseWord === prevWordRef.current) {
      return;
    }
    setOutgoingWord(prevWordRef.current);
    prevWordRef.current = phaseWord;
    const timer = setTimeout(() => setOutgoingWord(null), 520);
    return () => clearTimeout(timer);
  }, [phaseWord]);

  const phaseVisible = Math.max(0.07, Math.min(0.22, phaseOpacity));
  const chipVisible = Math.max(0.35, Math.min(1, templateOpacity));

  return (
    <div
      className={`study-organizer-hud ${stepFocused ? "study-organizer-hud--focused" : ""}`}
      aria-hidden="true"
    >
      <p className="study-organizer-hud__module">
        <span className="study-organizer-hud__module-label">Module</span>
        {moduleVerb}
        <span className="study-organizer-hud__connector">→</span>
        <span className="study-organizer-hud__phase-label">Phase</span>
      </p>

      <div className="study-organizer-hud__phase-stack">
        {outgoingWord ?
          <span
            className="study-organizer-hud__phase study-organizer-hud__phase--out"
            style={{ opacity: phaseVisible * 0.4 }}
          >
            {outgoingWord}
          </span>
        : null}
        <span
          className="study-organizer-hud__phase study-organizer-hud__phase--in"
          style={{ opacity: phaseVisible }}
        >
          {phaseWord}
        </span>
      </div>

      {phaseHint ?
        <p className="study-organizer-hud__hint">{phaseHint}</p>
      : null}

      {templateId && templateSkillName ?
        <div
          className="study-organizer-hud__chip"
          style={{ opacity: chipVisible }}
        >
          <span className="study-organizer-hud__pattern-label">Pattern</span>
          <TemplateChip
            templateId={templateId}
            skillName={templateSkillName}
            opacity={1}
            showSkillName={false}
            prominent
          />
        </div>
      : null}
    </div>
  );
}
