export type ChecklistStep = {
  id: number;
  text: string;
  note?: string;
  subSteps?: string[];
};

export type DbChecklistStep = {
  number: number;
  text: string;
  sub_lines?: string[];
  note_lines?: string[];
  wrap_lines?: string[];
  display_lead?: string;
};

export function mapDbStepToChecklistStep(step: DbChecklistStep): ChecklistStep {
  if (step.sub_lines?.length) {
    const lead =
      step.display_lead ??
      (step.text.includes(":") ?
        step.text.slice(0, step.text.indexOf(":") + 1)
      : step.text);
    return {
      id: step.number,
      text: lead.trim(),
      subSteps: step.sub_lines,
    };
  }

  const notes = step.note_lines ?? step.wrap_lines;
  if (notes?.length && step.display_lead) {
    return {
      id: step.number,
      text: step.display_lead.trim(),
      note: notes[0],
    };
  }

  return {
    id: step.number,
    text: step.text.trim(),
  };
}
