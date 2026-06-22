
from pathlib import Path
import json, os

out = Path.home() / "output" / "lmcc-code-additions"
out.mkdir(parents=True, exist_ok=True)

readme = """\
# LMCC CNA Exam Prep — Code-Addition Implementation Guide
Generated: 2026-06-22  |  Source: FINAL-PASS-S05-S22-COMPLETE.md + Skills-Multiple-occurance-list-TAGs.xlsx

---

## Deliverables in this zip

| File | Purpose |
|---|---|
| `checklist-step-2.ts` | Drop-in replacement — adds 5 new fields to `ChecklistStep` |
| `skillCurriculum-6-patch.ts` | New helpers: `getStepPhaseColor()`, `getStepPhaseLabel()` — wires `getPhaseWordForStep()` to rendering |
| `skills-7-enrichment-patch.json` | Data patch — 22 skills × all steps × 5 new fields (merge into skills-7.json) |

---

## A. checklist-step-2.ts — what changed

Five fields added to `ChecklistStep`:

| Field | FINAL-PASS column | UI use |
|---|---|---|
| `detailedText` | "Detailed Tag Text" | Expand panel, AI study mode |
| `tagCategory` | "Tag Category" | Filter chips (Opening / Core / Closing) |
| `criticalCategory` | "Critical Category" | Confusion-pair banner |
| `examScorecard` | "Exam Scorecard" | Yellow badge on scored steps |
| `phaseWord` | "Phase Word" | Phase badge (override computed value) |

No existing field removed or renamed. Fully backwards-compatible.

---

## B. skillCurriculum-6-patch.ts — what changed

Two new exported helpers that complete the wire-up of the already-existing
`getPhaseWordForStep()` function:

```ts
getStepPhaseLabel(step, skillId) -> string   // "Measure", "Secure", etc.
getStepPhaseColor(step, skillId) -> string   // hex colour
```

Phase badge colour scheme:
- Blue  (#3B82F6) = OPEN segment  (Approach, Prepare, Identify)
- Amber (#F59E0B) = CORE segment  (all task-specific phase words)
- Green (#10B981) = CLOSE segment (Record)

Resolution order per step:
  1. step.phaseWord (explicit override from FINAL-PASS)
  2. getPhaseWordForStep(skillId, stepId)  (existing curriculum fn)
  3. Segment-level fallback

Usage in your step-row component:
```tsx
import { getStepPhaseLabel, getStepPhaseColor } from "./skillCurriculum-6-patch";

function StepRow({ step, skillId }) {
  return (
    <span style={{ background: getStepPhaseColor(step, skillId) }}>
      {getStepPhaseLabel(step, skillId)}
    </span>
  );
}
```

---

## C. skills-7-enrichment-patch.json — merge instructions

### Merge script (Node.js)

```js
const base  = require('./skills-7.json');
const patch = require('./skills-7-enrichment-patch.json');

for (const [skillId, patchData] of Object.entries(patch)) {
  const skill = base.skills.find(s => s.id === skillId);
  if (!skill) continue;
  if (patchData.confusionGroupLabel !== undefined)
    skill.confusionGroupLabel = patchData.confusionGroupLabel;
  if (patchData.studentFocus !== undefined)
    skill.studentFocus = patchData.studentFocus;
  for (const [stepIdStr, stepPatch] of Object.entries(patchData.steps ?? {})) {
    const step = skill.checklistSteps?.find(s => s.id === +stepIdStr);
    if (step) Object.assign(step, stepPatch);
  }
}
require('fs').writeFileSync('./skills-7-updated.json', JSON.stringify(base, null, 2));
```

### Skills with _importNote (9 skills — S14-S22)

These 9 skills have confusionGroupLabel + studentFocus populated but steps:{}.
The step-level data is in FINAL-PASS-S05-S22-COMPLETE.md under each skill's
PASTE-READY TSV section. Provide that file and the step fields can be generated
in one more pass.

| Skill ID              | FINAL-PASS section | Step count |
|-----------------------|--------------------|------------|
| bed-bath-face-arm     | S14                | 28         |
| denture-care          | S15                | 19         |
| partial-bed-bath      | S16                | 24         |
| foot-care             | S17                | 24         |
| dress-weak-right-arm  | S18                | 14         |
| hand-and-nail-care    | S19                | 22         |
| oral-care-unconscious | S20                | 26         |
| perineal-care-female  | S21                | 41         |
| catheter-care-female  | S22                | 31         |

---

## GitHub paths to confirm

| File to edit | Expected path |
|---|---|
| ChecklistStep type | `src/types/checklist-step-2.ts` |
| Curriculum helpers | `src/lib/skillCurriculum-6.ts` |
| Skill data | `src/data/skills-7.json` |
| master_course_database | `src/data/master_course_database.json` |
| Step renderer | `src/components/ChecklistRow.tsx` (or similar) |

If paths differ, share the actual paths and the merge script will be adjusted.

---

## confusionGroupLabel + studentFocus source

Both ported from master_course_database.json (confusion_group / student_focus).
Already present there — this patch copies them into skills-7.json so the
confusion-pair banner reads them without a cross-file lookup.
"""

(out / "IMPLEMENTATION-GUIDE.md").write_text(readme)

# Verify all 4 files exist
for f in out.iterdir():
    print(f.name, f.stat().st_size, "bytes")