
# ─── D: Implementation README ─────────────────────────────────────────────────
readme = """\
# LMCC CNA Exam Prep — Code-Addition Implementation Guide
Generated: 2026-06-22  |  Source: FINAL-PASS-S05-S22-COMPLETE.md + Skills-Multiple-occurance-list-TAGs.xlsx

---

## Deliverables in this zip

| File | Purpose |
|---|---|
| `checklist-step-2.ts` | Drop-in replacement — adds 5 new fields to `ChecklistStep` |
| `skillCurriculum-6-patch.ts` | New helpers: `getStepPhaseColor()`, `getStepPhaseLabel()` — wire `getPhaseWordForStep()` to render |
| `skills-7-enrichment-patch.json` | Data patch — 22 skills × all steps × 5 new fields (merge into skills-7.json) |

---

## A. checklist-step-2.ts — what changed

Five fields added to `ChecklistStep`:

| Field | Column in FINAL-PASS | UI use |
|---|---|---|
| `detailedText` | "Detailed Tag Text" | Expand panel, AI study mode |
| `tagCategory` | "Tag Category" | Filter chips (Opening / Core / etc.) |
| `criticalCategory` | "Critical Category" | Confusion-pair banner |
| `examScorecard` | "Exam Scorecard" | Yellow badge on scored steps |
| `phaseWord` | "Phase Word" | Phase badge (override computed value) |

No existing field was removed or renamed.  Fully backwards-compatible.

---

## B. skillCurriculum-6-patch.ts — what changed

Two new exported helpers that complete the wire-up of the already-existing
`getPhaseWordForStep()` function:

```ts
getStepPhaseLabel(step, skillId) → string   // "Measure", "Secure", …
getStepPhaseColor(step, skillId) → string   // hex colour
```

Phase badge colour scheme:
- 🔵 Blue (#3B82F6) = OPEN segment phase words (Approach, Prepare, Identify)
- 🟡 Amber (#F59E0B / #D97706) = CORE segment phase words
- 🟢 Green (#10B981) = CLOSE segment phase words (Record)

Resolution order per step:
1. `step.phaseWord` (explicit override from FINAL-PASS)
2. `getPhaseWordForStep(skillId, stepId)` (existing function)
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

### Merge strategy (Node.js example)

```js
const base = require('./skills-7.json');        // existing file
const patch = require('./skills-7-enrichment-patch.json');

for (const [skillId, patchData] of Object.entries(patch)) {
  const skill = base.skills.find(s => s.id === skillId);
  if (!skill) continue;

  if (patchData.confusionGroupLabel !== undefined)
    skill.confusionGroupLabel = patchData.confusionGroupLabel;
  if (patchData.studentFocus !== undefined)
    skill.studentFocus = patchData.studentFocus;

  for (const [stepIdStr, stepPatch] of Object.entries(patchData.steps ?? {})) {
    const stepId = parseInt(stepIdStr);
    const step = skill.checklistSteps?.find(s => s.id === stepId);
    if (!step) continue;
    Object.assign(step, stepPatch);   // merge new fields only
  }
}

require('fs').writeFileSync('./skills-7-updated.json', JSON.stringify(base, null, 2));
```

### Skills with `_importNote` (9 skills, S14–S22)

The 9 skills below have `confusionGroupLabel` and `studentFocus` populated,
but `steps` is empty `{}`.  The step-level data exists in the FINAL-PASS file
(FINAL-PASS-S05-S22-COMPLETE.md) — paste the TSV block for each skill into
your importer or provide the file and the step fields will be generated.

| Skill ID | FINAL-PASS Section | Step count |
|---|---|---|
| bed-bath-face-arm | S14 | 28 |
| denture-care | S15 | 19 |
| partial-bed-bath | S16 | 24 |
| foot-care | S17 | 24 |
| dress-weak-right-arm | S18 | 14 |
| hand-and-nail-care | S19 | 22 |
| oral-care-unconscious | S20 | 26 |
| perineal-care-female | S21 | 41 |
| catheter-care-female | S22 | 31 |

**To complete these 9:** share the FINAL-PASS sections S14–S22 as individual
TSV blocks (already in FINAL-PASS-S05-S22-COMPLETE.md → each skill's
PASTE-READY TSV section).  A single subsequent pass will output the remaining
step-level JSON.

---

## GitHub file locations you need to confirm

Before merging, verify these paths in your repo:

| File to edit | Expected repo path |
|---|---|
| ChecklistStep type | `src/types/checklist-step-2.ts` |
| Curriculum helpers | `src/lib/skillCurriculum-6.ts` |
| Skill data | `src/data/skills-7.json` |
| master_course_database | `src/data/master_course_database.json` |
| Step renderer component | `src/components/ChecklistRow.tsx` (or similar) |

**If the paths differ**, paste the correct paths and the merge script above
will be adjusted.

---

## confusionGroupLabel + studentFocus — source

Both fields are ported from `master_course_database.json` (`confusion_group`
and `student_focus` columns).  They are already present in that file; this
patch simply copies them into the parallel `skills-7.json` structure so the
confusion-pair banner can read them without a cross-file lookup.

Zero render weight — they are strings only rendered when the banner
condition is met.
"""

(out / "IMPLEMENTATION-GUIDE.md").write_text(readme)
print("README written:", (out / "IMPLEMENTATION-GUIDE.md").stat().st_size, "bytes")