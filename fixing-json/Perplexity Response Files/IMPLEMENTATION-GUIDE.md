# LMCC CNA Exam Prep — Code-Addition Package
Generated: 2026-06-22
Sources: FINAL-PASS-S05-S22-COMPLETE.md · Skills-Multiple-occurance-list-TAGs.xlsx

## Files

| File | Purpose |
|---|---|
| checklist-step-2.ts | Drop-in replacement — adds 5 new fields to ChecklistStep |
| skillCurriculum-6-patch.ts | Wires getPhaseWordForStep() to per-step phase badges |
| skills-7-enrichment-patch.json | Data patch for skills-7.json (13 full + 9 stubs) |

## A — checklist-step-2.ts

Five new fields added to ChecklistStep (all optional, backwards-compatible):

  detailedText    — "Detailed Tag Text" — full GWC rubric language
  tagCategory     — "Tag Category"      — Opening | Key Procedure | Core | Closing
  criticalCategory— "Critical Category" — hand-hygiene | privacy | bed-call-light
  examScorecard   — "Exam Scorecard"    — yellow badge text on scored steps
  phaseWord       — "Phase Word"        — override for computed phase label

## B — skillCurriculum-6-patch.ts

getPhaseWordForStep() was already written in skillCurriculum-6.ts but never
called during render. This patch exports two new helpers:

  getStepPhaseLabel(step, skillId) -> string   // "Measure", "Secure", …
  getStepPhaseColor(step, skillId) -> string   // hex colour

Phase badge colour scheme:
  Blue  #3B82F6 = OPEN segment (Approach, Prepare, Identify)
  Amber #F59E0B = CORE segment (all task-specific phase words)
  Green #10B981 = CLOSE segment (Record)

Resolution order: step.phaseWord > getPhaseWordForStep() > segment fallback

## C — skills-7-enrichment-patch.json

### Merge script (Node.js)

  const base  = require('./skills-7.json');
  const patch = require('./skills-7-enrichment-patch.json');
  for (const [id, p] of Object.entries(patch)) {
    const skill = base.skills.find(s => s.id === id);
    if (!skill) continue;
    if (p.confusionGroupLabel !== undefined) skill.confusionGroupLabel = p.confusionGroupLabel;
    if (p.studentFocus !== undefined) skill.studentFocus = p.studentFocus;
    for (const [stepId, stepPatch] of Object.entries(p.steps ?? {})) {
      const step = skill.checklistSteps?.find(s => s.id === +stepId);
      if (step) Object.assign(step, stepPatch);
    }
  }
  require('fs').writeFileSync('./skills-7-updated.json', JSON.stringify(base, null, 2));

### 9 skills with empty steps{} (S14–S22)

  bed-bath-face-arm     S14  28 steps
  denture-care          S15  19 steps
  partial-bed-bath      S16  24 steps
  foot-care             S17  24 steps
  dress-weak-right-arm  S18  14 steps
  hand-and-nail-care    S19  22 steps
  oral-care-unconscious S20  26 steps
  perineal-care-female  S21  41 steps
  catheter-care-female  S22  31 steps

To complete these: paste the PASTE-READY TSV blocks from FINAL-PASS-S05-S22-COMPLETE.md
into the next message and step-level JSON will be generated.

## GitHub paths to confirm

  src/types/checklist-step-2.ts         ← drop-in replace
  src/lib/skillCurriculum-6.ts          ← import patch helpers here
  src/data/skills-7.json                ← merge target
  src/data/master_course_database.json  ← source of confusionGroupLabel/studentFocus

## confusionGroupLabel + studentFocus

Both ported from master_course_database.json (confusion_group / student_focus).
Zero render weight — strings, only shown when banner condition is met.
