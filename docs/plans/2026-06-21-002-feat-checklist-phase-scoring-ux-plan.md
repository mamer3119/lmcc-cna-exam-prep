---
title: "feat: Checklist phase scoring UX — ritual / performance / exam numbers"
type: feat
status: active
date: 2026-06-21
iteration: 2
origin: docs/brainstorms/2026-06-21-checklist-phase-scoring-ux-requirements.md
detail: comprehensive
replaces: docs/plans/2026-06-21-001-fix-phase-ux-exam-formula-callouts-plan.md
profile: next-app-router
---

# feat: Checklist phase scoring UX (v2.1)

## Recursive improvement log

| Iter     | Finding                                              | Plan change                                           |
| -------- | ---------------------------------------------------- | ----------------------------------------------------- |
| v2       | Education-first zones + prompt blocks                | Initial v2                                            |
| **v2.1** | Quiz mode hides all phase UI via `showSegmentBadges` | **R7 / Block C:** independent `showExamScorecards`    |
| v2.1     | BP step 8 = 2–3 mmHg/s, step 9 = 2 mmHg/s            | **8 scorecard rows**, not 7                           |
| v2.1     | Step 14 tolerance is CLOSE, not CORE                 | Scorecard works on close segment; no CORE-only filter |
| v2.1     | Summary card = 4 BP numbers                          | Block D uses `getExamScorecardsForSkill`              |
| v2.1     | Opacity fix must be **delete rules**, not 0.92 swap  | Block A: remove L508–517 de-emphasis entirely         |

**Stop recursion when:** Next pass would require OG PDF/card images or student
user-testing — not available in repo.

---

## Senior-frontend constraints

| Assumption     | Value                                            |
| -------------- | ------------------------------------------------ |
| Primary device | Desktop / lab tablet ≥1024px                     |
| LCP (p75)      | ≤2000 ms skill page                              |
| Deploy         | Static export (GitHub Pages)                     |
| WCAG           | **AA** all phase body + scorecards               |
| JS budget      | +≤3 KB gzip (scorecard component)                |
| Stack          | Next 14 App Router; client `SkillChecklist` only |

---

## Design spec (institutional editorial)

### Exam Scorecard anatomy

```
┌─────────────────────────────────────────────────────┐
│ EXAM TOLERANCE · Document BP                        │  ← eyebrow: 0.6875rem, --gold, uppercase
│ ±8 mmHg · systolic AND diastolic                    │  ← value: 1rem, tabular-nums, --primary
└─────────────────────────────────────────────────────┘
  border-left: 3px solid var(--gold)
  background: rgba(180, 83, 9, 0.06)
```

**Kind labels:** `Technique` | `Exam tolerance` (never “Critical”, never
“Formula”)

### Phase hierarchy (after Block A)

| Element     | open/close body         | core body                     |
| ----------- | ----------------------- | ----------------------------- |
| opacity     | **1**                   | **1**                         |
| font-style  | normal                  | normal                        |
| font-weight | 400                     | **500**                       |
| left rail   | optional `--panel` tint | `--primary-accent` (existing) |

### vs Critical badge

|       | Critical             | Scorecard                 |
| ----- | -------------------- | ------------------------- |
| Color | `--emphasis` red     | `--gold`                  |
| Steps | HH, privacy patterns | Measurement numerics only |
| Quiz  | With reveal          | **Always visible**        |

---

## Data layer schema (`lib/exam-scorecard.ts`)

```ts
export type ScorecardKind = "technique" | "tolerance";

export type ExamScorecardEntry = {
  slug: string;
  stepId: number;
  kind: ScorecardKind;
  eyebrow: string; // "Exam tolerance" | "Technique"
  headline: string; // short label
  value: string; // "±8 mmHg"
  detail?: string; // "systolic AND diastolic"
  ariaLabel: string; // full sentence for screen readers
};

export function getExamScorecard(
  slug: string,
  stepId: number,
): ExamScorecardEntry | undefined;
export function getExamScorecardsForSkill(slug: string): ExamScorecardEntry[];
export function skillHasExamScorecards(slug: string): boolean;
```

**Seed data:** 8 rows per requirements v1.1 R3 table (BP has 4 rows).

---

## Component contract

### `ExamScorecard.tsx`

- Props: `entry: ExamScorecardEntry`
- Pure presentational; no client state
- `role="note"`, `aria-label={entry.ariaLabel}`

### `SkillChecklist.tsx` changes (Block C)

1. New prop: `showExamScorecards?: boolean` (default `true` when any step has
   scorecard)
2. Render scorecard **before** step number, **outside** quiz hidden span
3. **Do not** gate scorecards on `showSegmentBadges`
4. `SkillPageClient`: pass `showExamScorecards={true}` always; keep
   `showSegmentBadges={mode === "study"}`

### `SkillExamNumbersSummary.tsx` (Block D)

- Props: `{ slug: string }`
- Maps `getExamScorecardsForSkill(slug)` — no duplicate strings

---

## Prompt blocks (paste verbatim — one thread each)

### Block A — Phase readability (CSS only)

```
Project: local-checklist-preview.
Read: docs/plans/2026-06-21-002-feat-checklist-phase-scoring-ux-plan.md (Block A)
Read: docs/brainstorms/2026-06-21-checklist-phase-scoring-ux-requirements.md (R1)

Edit app/phase-organizer.css ONLY:
- DELETE opacity 0.55/0.6 and font-style italic on .skill-step-segment--open|close .leading-relaxed / .text-sm
- Set open/close body to opacity: 1; font-style: normal; font-weight: 400
- KEEP .skill-step-segment--core font-weight: 500
- KEEP phase dividers, --core-start, --close-start badges unchanged

Add tests/phase-readability.test.ts (or extend phase-organizer.test.ts):
- Read phase-organizer.css as text; assert no "opacity: 0.55" or "opacity: 0.6" under skill-step-segment--open|close

pnpm test. FIX_LOG row #21a (phase readability only).
Do NOT add scorecard components.
```

**Exit gate:** Human readability test — OPEN step 1 = CLOSE step 14 legibility
vs CORE step 7.

---

### Block B — Scorecard data layer

```
Project: local-checklist-preview. Block B — v2.1 plan.

Create lib/exam-scorecard.ts per schema in plan (8 entries, BP steps 7,8,9,14).
Export getExamScorecard, getExamScorecardsForSkill, skillHasExamScorecards.

tests/exam-scorecard.test.ts:
- 8 entries total across 5 slugs
- BP step 14: tolerance, mentions ±8 and diastolic/systolic
- BP steps 8 AND 9 both exist (different deflate rates)
- weight step 11, urinary step 10, pulse step 6, resp step 5

No CSS/components. pnpm test green.
```

---

### Block C — Component + wire-up (includes R7)

```
Project: local-checklist-preview. Block C — v2.1.

Create components/ExamScorecard.tsx (design spec in plan).
Wire SkillChecklist.tsx:
- showExamScorecards prop (default true)
- Render scorecard independent of showSegmentBadges
- Quiz mode: scorecard visible when step text hidden

SkillPageClient.tsx: showExamScorecards={true} always.

Styles: phase-organizer.css — .exam-scorecard* using --gold, tabular-nums.

Manual: /skills/manual-blood-pressure/ — Quiz mode — ±8 visible without revealing step 14 text.
pnpm test.
```

**Exit gate:** 5-second ±8 mmHg test passes in Study AND Quiz mode.

---

### Block D — BP summary card

```
Project: local-checklist-preview. Block D.

components/SkillExamNumbersSummary.tsx using getExamScorecardsForSkill(slug).
SkillPageClient: render above SkillChecklist when slug === "manual-blood-pressure".
4 rows (inflate, deflate systolic, deflate diastolic, tolerance).

pnpm test.
```

---

### Block E — Ship gate

```
Project: local-checklist-preview. Block E.

pnpm test (all files including post-patch-canonical-verify 132 bookends).
Update docs/student-facing-ux.md — add completed: phase readability + exam scorecards.
FIX_LOG #21 complete entry with invariants.
Optional: Playwright — manual-blood-pressure quiz mode scorecard visible.
```

---

## Acceptance criteria (v2.1)

- [ ] Removed open/close opacity de-emphasis (CSS grep test)
- [ ] CORE still weight 500; dividers + phase-start badges intact
- [ ] 8 scorecard rows; all R3 slugs/steps
- [ ] Scorecards in **Quiz + Study** (R7)
- [ ] Step 14 scorecard on CLOSE segment
- [ ] BP summary: 4 numbers above checklist
- [ ] Scorecard ≠ Critical visually
- [ ] 5-second ±8 test (human)
- [ ] `pnpm test`; 132 bookends
- [ ] FIX_LOG #21

---

## Recursive improvement — when to run pass 3

Run **only if** after Block E:

| Signal                                 | Pass 3 action                                       |
| -------------------------------------- | --------------------------------------------------- |
| 5-second test fails                    | UX iteration on scorecard size/placement only       |
| Students confuse Critical vs scorecard | Add legend once above checklist                     |
| OG audit finds wrong ±                 | Update `exam-scorecard.ts` only — no UI redesign    |
| Context window exhausted mid-block     | **New thread**, same block prompt — do not continue |

**Do not recurse** into: new fonts, dark mode, 22-skill expansion, study HUD —
without new brainstorm.

---

## Restart schedule

| #   | Thread     | Attach                    | Block                                  |
| --- | ---------- | ------------------------- | -------------------------------------- |
| 0   | You, 5 min | `mcp.json`                | Fix seq-thinking → nodejs-lts → Reload |
| 1   | Fresh      | `@plan v2.1` + screenshot | **A**                                  |
| 2   | Fresh      | `@plan v2.1`              | **B**                                  |
| 3   | Fresh      | `@plan` + `@requirements` | **C**                                  |
| 4   | Fresh      | `@plan v2.1`              | **D + E**                              |

**Optimal start:** New thread immediately after MCP reload. **Stop thread** at
~12–15 turns or when exit gate passes.

---

## Appendix — MCP (infra only)

`~/.cursor/mcp.json` → `nodejs-lts` npx for `sequential-thinking`. Not part of
Blocks A–E.

---

## Sources

- Requirements v1.1 (same folder `/brainstorms/`)
- `app/phase-organizer.css` L508–517
- `components/SkillPageClient.tsx` L135
- `components/SkillChecklist.tsx` quiz branch ~L384
- `data/skills.json` measurement skills
- `lib/critical-steps.ts`
- `lib/divergence.ts` vital-tolerance (wording reference)
