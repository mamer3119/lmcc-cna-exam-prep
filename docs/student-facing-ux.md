# Student-Facing UX Notes — LMCC CNA Exam Prep

Living reference for UI/UX decisions. Update as we refine.

## Core principle (exam day)

**Evaluators call the official skill name aloud. The student performs it.**

- Lead with **official RTC skill names** everywhere students look first.
- **Do not** surface exam card numbers on the index or in card previews — they
  train the wrong mental model.
- Exam numbers may appear **once**, collapsed, on the skill detail page for
  instructor cross-reference only.

## Information hierarchy

| Layer         | Student sees                                                    | Hidden / secondary         |
| ------------- | --------------------------------------------------------------- | -------------------------- |
| Index         | Section name → skill name → step count                          | Study order index, RTC ID  |
| Skill page    | Official title → exam numbers (measurement) → checklist → video | Exam card # in `<details>` |
| Nav prev/next | Adjacent **skill names** only                                   | Slugs, file names          |

## Pedagogical structure (7 sections)

Order follows clinical logic: **protect → observe → move → restore → clean →
feed → eliminate**.

Canonical source: `data/pedagogical-order.json` (synced from
`Reasoned Ordering of Skills.md` + official RTC titles).

## Official titles

All display titles come from `officialTitle` in `pedagogical-order.json`, not
legacy DB shorthand. Re-sync with `pnpm sync:skills` after title edits.

## Phase + exam scoring UX (2026-06-21 — shipped)

Three learning zones on skill pages:

| Zone        | Phase                | UI treatment                                                      |
| ----------- | -------------------- | ----------------------------------------------------------------- |
| Ritual      | OPEN + CLOSE         | Full-contrast body text (no faded italic)                         |
| Performance | CORE                 | `font-weight: 500`; phase dividers in Study mode                  |
| Scoring     | Measurement numerics | Gold **Exam Scorecard** strip per step; summary card on Manual BP |

**Completed:**

- Phase readability — OPEN/CLOSE at opacity 1 (`FIX_LOG` #21a)
- Exam scorecards — 8 rows across 5 measurement skills; visible in Study **and**
  Quiz (`#21b`)
- Manual BP summary — `SkillExamNumbersSummary` above checklist (4 numbers:
  inflate, deflate systolic/diastolic, ±8 tolerance)

**Student mantra:** Autopilot OPEN/CLOSE · Drill CORE · Never miss the exam
number.

Scorecards use `--gold` (scoring), not red Critical badges (safety). Data
source: `lib/exam-scorecard.ts` — do not duplicate strings in components.

## UI refinements backlog

- [ ] Section progress (e.g. “3 of 5 skills in this section”) without showing
      global study numbers
- [ ] Search/filter by skill name for quick lab lookup
- [ ] “Practice this skill” focus mode — checklist only, no chrome
- [ ] Roll exam-numbers summary card to pulse, resp, weight, urinary (v2)
- [ ] Print stylesheet: official title header, no exam numbers on index
- [ ] Optional instructor mode toggle (shows RTC ID + exam card #)
- [ ] Confusion groups from master DB (PROM pair, pulse/resp pair) as subtle
      “often paired” hints — not numbers

## Dev stability

Stale `.next` cache causes `./153.js` errors. Always `pnpm dev:clean` — never
run `pnpm build` while dev is running.

## Compliance copy

Step wording matches state evaluator checklist. Avoid implying pass rates, job
placement, or guaranteed outcomes.
