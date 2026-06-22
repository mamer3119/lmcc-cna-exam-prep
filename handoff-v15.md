# Handoff v15 — LMCC CNA Exam Prep (`local-checklist-preview`)

**Date:** 2026-06-22 **Branch/context:** `fixing-json` enrichment + single
accessor layer (sessions ending ~15% context) **Tests:** `pnpm test` → 144
passed, 1 skipped

---

## What this session shipped

### 1. FINAL-PASS step enrichment in `data/skills.json`

All **22 skills** carry optional step fields (from `imports/final-pass/`
staging):

| Field              | Source column     |
| ------------------ | ----------------- |
| `detailedText`     | Detailed Tag Text |
| `tagCategory`      | Tag Category      |
| `criticalCategory` | Critical Category |
| `examScorecard`    | Exam Scorecard    |
| `phaseWord`        | Phase Word        |

**Build path:** `imports/final-pass/*.json` → `scripts/merge-final-pass.mjs`
(`mapStagingStepToChecklist`) → overlaid by `scripts/sync-skills.mjs` on every
`predev`/`prebuild`.

### 2. Boilerplate tag metadata

| Authored                            | Runtime                      | Import                         |
| ----------------------------------- | ---------------------------- | ------------------------------ |
| `fixing-json/boilerplate_tags.json` | `data/boilerplate-tags.json` | `pnpm import:boilerplate-tags` |

14 tag rows from xlsx (HAND_HYGIENE open/middle/last, WATER_CHECK, GLOVE_REMOVE
**sub_steps**, etc.). **Do not** use
`fixing-json/skills-7-enrichment-patch.json` for S14–S22 — wrong slugs; use
`imports/final-pass/`.

### 3. Single accessor hub — `lib/skill-step-meta.ts`

**Read enrichment here only** (not scattered across libs):

```
step field in skills.json  →  boilerplate-tags.json fallback  →  legacy regex (critical only)
```

| Function                      | Purpose                                      |
| ----------------------------- | -------------------------------------------- |
| `resolveStepDetailedText`     | Full GWC rubric text                         |
| `resolveStepTagCategory`      | Opening / Key Procedure / Core / Closing     |
| `resolveStepSubSteps`         | Sub-steps (incl. GLOVE_REMOVE from tags)     |
| `resolveStepClinicalNote`     | Clinical note                                |
| `resolveStepCriticalCategory` | hand-hygiene / privacy / bed-call-light      |
| `resolveStepPhaseWord`        | Per-step phase badge word                    |
| `resolveStepExamScorecardRaw` | Raw scorecard string                         |
| `pickBoilerplateTag`          | Segment-aware variant (HH first/middle/last) |

### 4. `lib/exam-scorecard.ts` — no longer hardcoded

Scorecard index is **built at module load** from `skills.json` via
`resolveStepExamScorecardRaw` + `parseExamScorecardString`.

### 5. UI wiring (partial)

| Wired                                                               | Not wired yet                                                                  |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `SkillChecklist` → critical badges via `skill-step-meta`            | `detailedText` tooltip / expandable rubric                                     |
| `SkillChecklist` → exam scorecards via `getExamScorecardForStep`    | `tagCategory` badge in checklist                                               |
| `useScrollOrganizers` → `resolveStepPhaseWord` on `data-phase-word` | Per-step **coloured** phase badges (`lib/step-phase.ts` exists, unused in JSX) |
| `SkillExamNumbersSummary` → scorecards from skills.json             | `studentFocus` banner on skill page                                            |
|                                                                     | `resolveStepSubSteps` in **SkillChecklist** (still reads `step.subSteps` raw)  |

### 6. Removed this session

- **`confusionGroupLabel`** — removed from `WebSkill` type, `sync-skills.mjs`,
  `export-skills-xlsm-data.mjs`, and regenerated `data/skills.json`. Confusion
  groups still exist in `Educator_Mastermind/master_course_database.json`
  (`confusion_groups` array) if needed later under a different UX.

---

## Data flow (canonical)

```
fixing-json/boilerplate_tags.json ──pnpm import:boilerplate-tags──► data/boilerplate-tags.json
imports/final-pass/manifest.json + thread-{A,B,C,D}/*.json
        └── merge-final-pass / sync-skills ──► data/skills.json
                                                      │
                      lib/skills.ts ◄─────────────────┘
                              │
              lib/skill-step-meta.ts ◄── data/boilerplate-tags.json
                      │
        ┌─────────────┼─────────────┬──────────────────┐
        ▼             ▼             ▼                  ▼
 SkillChecklist  exam-scorecard  useScrollOrganizers  export-skills-xlsm-data.mjs
 SkillPageClient SkillExamNumbersSummary
 app/skills/[slug]  app/study/
```

**Loader:** `lib/skills.ts` static-imports `@/data/skills.json`. **Display text
(≤6-word cues):** `lib/checklist-step.ts` → `resolveStepDisplayText`.
**Curriculum phases (fallback):** `data/skillCurriculum.ts` →
`getPhaseWordForStep`.

---

## Path map (Perplexity vs repo)

| Perplexity said                        | Actual repo                                     |
| -------------------------------------- | ----------------------------------------------- |
| `src/types/checklist-step-2.ts`        | `lib/checklist-step.ts`                         |
| `src/lib/skillCurriculum-6.ts`         | `data/skillCurriculum.ts` + `lib/step-phase.ts` |
| `src/data/skills-7.json`               | `data/skills.json`                              |
| `skills-7-enrichment-patch.json` stubs | **Ignore** — use `imports/final-pass/`          |

---

## Commands the next agent must know

```powershell
cd "C:\Users\moham\Desktop\22 Skills TXT\local-checklist-preview"

pnpm import:boilerplate-tags   # after editing fixing-json/boilerplate_tags.json
pnpm merge:final-pass          # after editing imports/final-pass staging
pnpm sync:skills               # full rebuild skills.json (runs on predev/prebuild)
pnpm test                      # 144+ tests; gate before done
pnpm dev:clean                 # http://localhost:3005/lmcc-cna-exam-prep/
pnpm build                     # static export + verify
```

---

## Roadmap — remaining work (priority order)

### P0 — Complete UI hydration (accessor → visible)

1. **SkillChecklist sub-steps** — Replace `step.subSteps` with
   `resolveStepSubSteps(step)` so GLOVE_REMOVE tag sub_steps appear when
   skills.json has no `subSteps`.
2. **detailedText** — Add `title={resolveStepDetailedText(step)}` or `<details>`
   rubric block on each step (study mode).
3. **tagCategory** — Optional small badge via `resolveStepTagCategory(step)`
   (Opening / Key Procedure / Core / Closing).
4. **Phase colour badges** — Use `getStepPhaseLabel` + `getStepPhaseColor` from
   `lib/step-phase.ts` in checklist or study HUD (replaces or supplements
   OPEN/CORE/CLOSE segment badges).
5. **studentFocus** — Banner on `SkillPageClient` / study leaf when
   `skill.studentFocus` is set (from master DB via sync).

### P1 — Tests for new UI

- `tests/skill-checklist-hydration.test.ts` — GLOVE_REMOVE shows 2 sub-steps
  from tag fallback.
- Snapshot or DOM test for detailedText tooltip presence on BP step 7.

### P2 — Export parity

- Run `node --experimental-strip-types scripts/export-skills-xlsm-data.mjs`
  after UI changes; confirm `exports/skills-xlsm-payload.json` matches checklist
  display.

### P3 — Cleanup / docs

- Archive or add README in `fixing-json/` pointing to canonical paths (avoid
  future Perplexity slug confusion).
- Update `FIX_LOG.md` entry #27 if accessor layer changes.
- `fixing-json/Perplexity Response Files/` — reference only; do not import into
  build.

### P4 — Optional product

- Confusion-group UX (if desired later): read `master_course_database.json` →
  `confusion_groups` at render time — **do not** re-add `confusionGroupLabel` to
  skills.json without explicit spec.
- Wire `resolveStepRendersAs` (emoji from tags) in study organizer or export
  only.

---

## Files touched this session (grep before revert)

| File                                  | Role                                                        |
| ------------------------------------- | ----------------------------------------------------------- |
| `lib/checklist-step.ts`               | +5 optional ChecklistStep fields                            |
| `lib/skill-step-meta.ts`              | **Accessor hub**                                            |
| `lib/step-phase.ts`                   | Phase label/colour helpers                                  |
| `lib/exam-scorecard.ts`               | Dynamic from skills.json                                    |
| `lib/skills.ts`                       | WebSkill type; `studentFocus` only (no confusionGroupLabel) |
| `data/boilerplate-tags.json`          | Committed runtime tag bundle                                |
| `data/skills.json`                    | 22 skills enriched                                          |
| `scripts/import-boilerplate-tags.mjs` | boilerplate_tags.json → boilerplate-tags.json               |
| `scripts/merge-final-pass.mjs`        | Staging → step enrichment mapping                           |
| `scripts/sync-skills.mjs`             | Master DB + FINAL-PASS overlay                              |
| `scripts/export-skills-xlsm-data.mjs` | Uses skill-step-meta                                        |
| `components/SkillChecklist.tsx`       | critical + scorecard via accessors                          |
| `hooks/useScrollOrganizers.ts`        | phase word via accessor                                     |
| `tests/checklist-enrichment.test.ts`  | Merge verification                                          |
| `tests/skill-step-meta.test.ts`       | Accessor + GLOVE_REMOVE sub_steps                           |
| `FIX_LOG.md`                          | Entries #26, #27                                            |

---

## Invariants (FIX_LOG — do not break)

Read `FIX_LOG.md` rows **#1–#27** before behavior changes. Critical ones:

- FINAL-PASS overlay permanent via `sync-skills.mjs` +
  `imports/final-pass/manifest.json`
- `pnpm test` in `prebuild` + CI
- GitHub Pages base path `/lmcc-cna-exam-prep/`
- Exam scorecards independent of segment badges (R7)
- BP summary card + quiz ±8 test paths

---

## Risks for next agent

1. **Dual phase systems** — `step.phaseWord` / tags vs `skillCurriculum.phases`
   vs OPEN/CORE/CLOSE segments. Resolution order is documented in
   `skill-step-meta.ts`; do not add a fourth source.
2. **sync-skills overwrites skills.json** — Any hand-edits to `data/skills.json`
   are lost on `pnpm sync:skills`; edit staging or master DB instead.
3. **boilerplate_tags.json vs xlsx** — xlsx is export convenience; **committed
   JSON** is `fixing-json/boilerplate_tags.json`.
4. **Subagent billing** — `code-architect` / `code-reviewer` Task tool may fail;
   do analysis in-thread.
5. **Context7** — Not needed for this repo's data layer; needed only for
   Next.js/React API changes.

---

## Suggested first prompt for next thread

```
Continue from handoff-v15.md in local-checklist-preview.
P0: Wire SkillChecklist to resolveStepSubSteps, detailedText tooltip, and studentFocus banner.
Run pnpm test when done.
```

---

## Verify before declaring done

```powershell
pnpm test
pnpm build          # if UI changed
grep -r confusionGroupLabel data/ lib/ components/ scripts/  # should be empty in app code
```
