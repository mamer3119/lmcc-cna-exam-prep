---
title: "fix: Phase UX readability + exam formula callouts (skill checklist)"
type: fix
status: active
date: 2026-06-21
origin: user-screenshot-manual-blood-pressure + phase-divider session
detail: standard
status: superseded
superseded_by: docs/plans/2026-06-21-002-feat-checklist-phase-scoring-ux-plan.md
---

# fix: Phase UX readability + exam formula callouts

## Overview / problem statement

The phase-organizer layer on skill pages (`/skills/[slug]/`, Study mode)
successfully renders OPEN · CORE · CLOSE badges and phase dividers, but the
**student experience regresses** on two axes visible on Manual Blood Pressure
(Skill 22):

1. **OPEN and CLOSE steps are visually de-emphasized too aggressively** — step
   text runs at **55–60% opacity** with italic styling (`phase-organizer.css`
   `.skill-step-segment--open|close`). Boilerplate students must still perform
   on exam day (intro, hand hygiene, documentation tolerance) reads as
   “optional” or broken.
2. **Exam-scoring numerics are not surfaced as scannable formulas** — tolerances
   and rates are buried inside long CORE step prose:
   - Inflate **160–180 mmHg** (step 7)
   - Deflate **2–3 mm Hg/second** (steps 8–9)
   - Document within **±8 mmHg** of evaluator (step 14)

   Pulse (±4), respirations (±4), weight (±2 lb), urinary output (±25 mL) have
   the same problem. `lib/divergence.ts` already documents a **vital-tolerance**
   string but it only appears on `/study/` cross-skill transition markers — not
   on individual skill pages.

**Sequential Thinking MCP** is currently **non-functional** in this workspace
(blocks `/c-seq`, `/c-peak` COMPLEX gate, and this planning workflow). Root
cause diagnosed below; fix is a prerequisite for agent workflows, not student
UI.

---

## Sequential Thinking MCP — diagnosis (verified 2026-06-21)

| Check                                        | Result                                                                           |
| -------------------------------------------- | -------------------------------------------------------------------------------- |
| Cursor MCP folder `user-sequential-thinking` | `STATUS.md`: **"The MCP server errored"**                                        |
| Agent tool call `sequentialthinking`         | **Error: MCP server does not exist** (not in enabled server list)                |
| `~/.cursor/mcp.json` command                 | `C:\Users\moham\scoop\apps\nodejs\current\npx.cmd`                               |
| Path exists?                                 | **`False`** — Scoop `nodejs` (Current) not installed                             |
| `nodejs-lts` npx                             | **`True`** — manual run prints `Sequential Thinking MCP Server running on stdio` |

**Fix (config only — do before `/ce:work`):**

Update `~/.cursor/mcp.json` `sequential-thinking` block to mirror the working
`playwright` pattern:

```json
"sequential-thinking": {
  "command": "C:\\Users\\moham\\scoop\\apps\\nodejs-lts\\current\\npx.cmd",
  "args": ["-y", "@modelcontextprotocol/server-sequential-thinking@2025.12.18"],
  "env": {
    "PATH": "C:\\Users\\moham\\scoop\\apps\\nodejs-lts\\current;C:\\Users\\moham\\scoop\\shims;${env:PATH}"
  }
}
```

**Verify after Reload Window:**

1. Cursor Settings → MCP → `sequential-thinking` shows green / tools listed
2. Agent can call `sequentialthinking` on server `user-sequential-thinking`
3. `& "$env:USERPROFILE\.cursor\scripts\Test-Context7CursorStack.ps1"` (optional
   stack health)

Context7 MCP is **healthy** (`user-context7` resolve/query succeeded). Pin
remains `@modelcontextprotocol/server-sequential-thinking@2025.12.18` per
`~/.cursor/docs/sequential-thinking-cursor-exact.md`.

---

## Frontend design direction (`frontend-design` skill)

**Audience:** CNA students in lab prep — high stress, need scan-first numerics,
not prose parsing.

**Tone:** Institutional clarity (matches existing LMCC navy/gold, Crimson Pro +
Source Sans). Not playful; **editorial callout bands** for formulas.

**Hierarchy (revised):**

| Layer                          | Treatment                                                                                                  |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| OPEN / CLOSE boilerplate       | **Full opacity (0.92–1.0)**, normal (not italic). Subtle left border tint only — “known ritual,” not faded |
| CORE procedure                 | **Full weight**, primary reading color — still the memorization target                                     |
| Phase dividers                 | Keep `✦ Core Procedure Begins` / `Closing Phase Begins` — increase contrast slightly                       |
| First CORE / first CLOSE badge | Keep accent (`--core-start`, `--close-start`)                                                              |
| **Exam formula callout**       | New component: monospace numerics in a gold/navy inset **above or beside** qualifying steps                |

**Differentiation:** One memorable element — **“Exam tolerance” pill** on
measurement skills that shows the exact ± rule in large tabular figures before
the student reads step 14.

**Anti-patterns to avoid:** Further opacity reduction; purple gradients; generic
Inter; hiding OPEN/CLOSE in quiz mode without a “show boilerplate” toggle.

---

## Technical approach

### A. Phase contrast fix (CSS + optional prop)

**Files:** `app/phase-organizer.css`, possibly `components/SkillChecklist.tsx`

- Remove or gate
  `.skill-step-segment--open|close { opacity: 0.55|0.6; font-style: italic }` on
  `/skills/` routes OR globally replace with:
  - `opacity: 0.92` + `font-style: normal` for boilerplate segments
  - Keep **background left-border** phase tint (existing
    `.skill-step-segment--*` wrappers)
- Add `.skill-step-segment--core` emphasis without making OPEN/CLOSE illegible
- **Study page** (`/study/`): optional `organizerDensity` prop — “focus core” vs
  “full readability” toggle later; default to readable for v1

### B. Exam formula callout system

**New data layer** — `lib/exam-formulas.ts` (or extend `lib/critical-steps.ts`):

```ts
type ExamFormula = {
  skillSlug: string;
  stepId: number;
  label: string; // e.g. "Documentation tolerance"
  formula: string; // e.g. "±8 mmHg (systolic AND diastolic)"
  shortHint?: string; // e.g. "Both values must pass"
};
```

**Seed rules (measurement section):**

| Skill                      | Step             | Formula                                         |
| -------------------------- | ---------------- | ----------------------------------------------- |
| manual-blood-pressure      | 7                | Inflate cuff to **160–180 mmHg**                |
| manual-blood-pressure      | 8–9              | Deflate **2–3 mm Hg/second**                    |
| manual-blood-pressure      | 14               | Document **±8 mmHg** vs evaluator (both values) |
| radial-pulse-60-seconds    | 6                | **±4** vs evaluator                             |
| respirations-60-seconds    | 5                | **±4** vs evaluator                             |
| weight-ambulatory-client   | (close doc step) | **±2 lb / 0.9 kg**                              |
| urinary-output-measurement | 10               | **±25 mL**                                      |

**New component:** `components/ExamFormulaCallout.tsx`

- Renders when `getExamFormula(skill.slug, step.id)` returns a rule
- Visually distinct from `⚠️ Critical` badge (critical = safety; formula =
  scoring)
- Accessible: `aria-label="Exam scoring: ±8 mmHg"`

**Wire in:** `SkillChecklist.tsx` step renderer (study + quiz modes — formulas
should show even when step text hidden in quiz, or on reveal)

### C. Optional — skill-level formula summary card

Above checklist on T1 measurement skills: compact card listing **all numerics
for this skill** (BP example: inflate range, deflate rate, doc tolerance).
Single glance before practice.

### D. Tests

- `tests/exam-formulas.test.ts` — slug/step lookup, BP ±8 on step 14
- `tests/phase-organizer.test.ts` or visual regression note — OPEN/CLOSE steps
  not below 0.9 opacity (computed style in Playwright if available)
- Existing `post-patch-canonical-verify.test.ts` must still pass (132 bookends)

---

## Acceptance criteria

- [ ] **Seq MCP:** `sequential-thinking` server enabled; `sequentialthinking`
      tool callable after config fix + reload
- [ ] OPEN and CLOSE step text on `/skills/manual-blood-pressure/` is **clearly
      readable** (no sub-70% opacity on step body)
- [ ] CORE steps remain visually primary (weight, divider, badge accent
      unchanged)
- [ ] Manual BP step 14 shows an **Exam formula callout** with **±8 mmHg** (both
      systolic and diastolic called out)
- [ ] Manual BP steps 7–9 show **inflate range** and **deflate rate** callouts
      (or one grouped “Technique numbers” callout on step 7)
- [ ] Pulse, respiration, weight, urinary output skills show their ± tolerance
      callouts on document steps
- [ ] Quiz mode: formula callouts visible on reveal (or always visible above
      hidden step text)
- [ ] `pnpm test` passes; no regression to 132 bookend post-patch counts
- [ ] Print stylesheet: formula callouts print legibly (no opacity hacks)
- [ ] FIX_LOG entry appended after implementation

---

## Out of scope (this plan)

- Changing canonical step text in `skills.json`
- Merging OPEN/CLOSE steps
- Full `/study/` HUD redesign
- Instructor mode toggle (backlog in `docs/student-facing-ux.md`)

---

## Implementation phases (for `/ce:work`)

| Phase | Task                                                                          | Risk              |
| ----- | ----------------------------------------------------------------------------- | ----------------- |
| 0     | Fix `~/.cursor/mcp.json` sequential-thinking → nodejs-lts; reload; verify MCP | Low — user config |
| 1     | CSS phase readability (remove harmful opacity)                                | Low               |
| 2     | `lib/exam-formulas.ts` + unit tests                                           | Low               |
| 3     | `ExamFormulaCallout` component + SkillChecklist wire-up                       | Medium            |
| 4     | Skill-level summary card (BP pilot)                                           | Medium            |
| 5     | Playwright spot-check manual-blood-pressure page                              | Low               |
| 6     | FIX_LOG + `docs/student-facing-ux.md` backlog tick                            | Low               |

---

## Sources & references

- Screenshot: manual-blood-pressure skill page (OPEN/CLOSE faded, CORE readable)
- `app/phase-organizer.css` L507–523 — opacity source
- `components/SkillPageClient.tsx` — `showSegmentBadges={mode === "study"}`
- `lib/divergence.ts` — `vital-tolerance` copy (Pulse/Resp ±4, Weight ±2 lb, BP
  ±8 mmHg)
- `data/skills.json` — manual-blood-pressure steps 7–9, 14
- `FIX_LOG.md` #20 — phase dividers shipped
- `~/.cursor/docs/sequential-thinking-cursor-exact.md` — MCP pin + workflow
- Context7 `/modelcontextprotocol/modelcontextprotocol` — npx stdio server
  pattern
- `docs/student-facing-ux.md` — exam-day naming hierarchy

---

## Post-plan options

1. **`/ce:work`** — implement phases 0→5 (recommended order: MCP fix first, then
   CSS, then formulas)
2. **Deepen plan** — add Playwright visual baselines + quiz-mode UX spec
3. **Review and refine** — adjust formula data model before coding
4. **Create GitHub Issue** —
   `gh issue create --title "fix: phase UX readability + exam formula callouts" --body-file docs/plans/2026-06-21-001-fix-phase-ux-exam-formula-callouts-plan.md`
5. **Done for now** — plan only (current state)
