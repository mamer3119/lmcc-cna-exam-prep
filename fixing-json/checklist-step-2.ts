// checklist-step-2.ts — extended with FINAL-PASS columns
// Drop-in replacement. No existing field removed or renamed.

export type StepSegment = "open" | "core" | "close";
export type BoilerplateId = "INTRO_IDENTIFY"|"INTRO_EXPLAIN"|"PRIVACY"|"HAND_HYGIENE"|"GLOVE_DON"|"GLOVE_REMOVE"|"GLOVE_REMOVE_THEN_HH"|"CALL_LIGHT"|"BED_LOW"|"WATER_CHECK";
export type CompoundBoilerplateId = "BED_LOW|CALL_LIGHT";

export type ChecklistStep = {
  id: number;
  text: string;
  note?: string;
  subSteps?: string[];
  segment?: StepSegment;
  boilerplateId?: BoilerplateId | CompoundBoilerplateId | (string & {});

  // New fields from FINAL-PASS 11-column tables
  detailedText?: string;        // "Detailed Tag Text" — full GWC rubric language
  tagCategory?: string;         // "Tag Category"    — Opening | Key Procedure | Core | Closing
  criticalCategory?: string;    // "Critical Category" — hand-hygiene | privacy | bed-call-light
  examScorecard?: string;       // "Exam Scorecard"  — yellow badge text on scored steps
  phaseWord?: string;           // "Phase Word"      — override computed phase label
};
