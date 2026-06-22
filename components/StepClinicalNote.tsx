"use client";

import {
  buildInstructorSourceChip,
  getStudentNote,
} from "@/lib/clinical-note-display";
import { SourceChip } from "@/components/SourceChip";

export type StepClinicalNoteProps = {
  rawNote: string | undefined;
  /** When true and ready, provenance renders as SourceChip (not inline). */
  instructorView: boolean;
  instructorReady?: boolean;
};

export function StepClinicalNote({
  rawNote,
  instructorView,
  instructorReady = true,
}: StepClinicalNoteProps) {
  const body = getStudentNote(rawNote);
  if (!body) {
    return null;
  }

  const showChip =
    instructorView &&
    instructorReady &&
    rawNote &&
    buildInstructorSourceChip(rawNote);

  return (
    <p className="skill-checklist-note note-text print:text-black">
      {body}
      {showChip ?
        <SourceChip label={showChip} />
      : null}
    </p>
  );
}
