## **What's delivered**

## **A —** `checklist-step-2.ts`

Drop-in replacement. Adds 5 new optional fields to `ChecklistStep`, all sourced from your FINAL-PASS 11-column tables:


| **New field**      | **FINAL-PASS column** | **Value examples**                                                 |
| ------------------ | --------------------- | ------------------------------------------------------------------ |
| `detailedText`     | Detailed Tag Text     | Full GWC rubric sentence                                           |
| `tagCategory`      | Tag Category          | `"Opening"` / `"Key Procedure"` / `"Core"` / `"Closing"`           |
| `criticalCategory` | Critical Category     | `"hand-hygiene"` / `"privacy"` / `"bed-call-light"`                |
| `examScorecard`    | Exam Scorecard        | `"Exam tolerance: Document BP ±8 mmHg (systolic AND diastolic)"`   |
| `phaseWord`        | Phase Word            | `"Measure"` / `"Secure"` (override only when differs from segment) |


No existing field removed. Zero breaking changes.

---

## **B —** `skillCurriculum-6-patch.ts`

Wires the already-written `getPhaseWordForStep()` to rendering. Exports:

- `getStepPhaseLabel(step, skillId)` → `"Measure"`, `"Secure"`, etc.
- `getStepPhaseColor(step, skillId)` → hex colour

Colour scheme: 🔵 Blue = OPEN · 🟡 Amber = CORE · 🟢 Green = CLOSE.

---

## **C —** `skills-7-enrichment-patch.json`

**13 skills fully populated** (S05–S13: `manual-blood-pressure` through `knee-high-stocking`) — every step has `detailedText`, `tagCategory`, `criticalCategory`, `examScorecard`, and `phaseWord` where applicable. Also includes `confusionGroupLabel` and `studentFocus` for all 22 skills.

**9 skills need your input** (S14–S22). They have stubs with `confusionGroupLabel` + `studentFocus` but empty `steps: {}`. The step data is in `FINAL-PASS-S05-S22-COMPLETE.md` under each skill's **PASTE-READY TSV** section.

---

## **What I need from GitHub to complete S14–S22**

Provide **any one** of:

1. The PASTE-READY TSV blocks for S14–S22 (copy from your FINAL-PASS file — each skill's `### PASTE-READY TSV` section)
2. The repo file `src/data/skills-7.json` — I'll output a merged `skills-7-updated.json` directly
3. Confirm the file path is different from `src/data/skills-7.json` and I'll adjust the merge script

Also confirm these two paths match your repo:

- `src/types/checklist-step-2.ts`
- `src/lib/skillCurriculum-6.ts`

