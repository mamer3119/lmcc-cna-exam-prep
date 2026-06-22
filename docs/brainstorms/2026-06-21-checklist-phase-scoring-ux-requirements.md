---
date: 2026-06-21
topic: checklist-phase-scoring-ux
scope: standard
status: requirements-v1.1
iteration: 2
supersedes: requirements-v1
---

# Checklist Phase + Exam Scoring UX — Requirements (v1.1)

## Iteration log

| Pass     | Change                                                                                                                                                         |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| v1       | Initial problem frame + R1–R6                                                                                                                                  |
| **v1.1** | R7 quiz-mode independence; canonical scorecard copy table from `skills.json`; BP step 8/9 deflate note; 5-second QA protocol; weight `close` segment confirmed |

---

## Problem frame

**Who:** CNA students using `local-checklist-preview` in lab prep
(desktop/tablet primary, phone secondary).

**What is broken:** The phase-organizer layer teaches the right _structure_
(OPEN → CORE → CLOSE) but the _presentation_ undermines learning:

1. OPEN/CLOSE boilerplate is styled at **55–60% opacity + italic**
   (`phase-organizer.css` L508–517) — students infer “skip these,” yet
   evaluators fail candidates on intro, hand hygiene, bed/call-light, and
   **documentation tolerance**.
2. **Scoring numerics** are buried in long step sentences — the exact values
   that fail measurement skills are not scannable.
3. **Critical** badges (`⚠️ Critical`) conflate _safety_ with _scoring_ — step
   13 HH is Critical; step 14 ±8 mmHg is not.

**Student mantra the UI must reinforce:**

> Autopilot OPEN/CLOSE · Drill CORE · Never miss the exam number.

---

## Requirements

### R1 — Phase readability (non-negotiable)

- OPEN and CLOSE step **body text**: **≥4.5:1 contrast**, **opacity 1** (remove
  0.55/0.6 rules), **no italic** on body text.
- CORE remains visual anchor: `font-weight: 500`, dividers, first-CORE badge
  accent — via **typography**, not by fading other phases.
- Phase dividers remain; may increase divider label contrast.
- Applies wherever `showSegmentBadges` is true: `/skills/[slug]/` Study mode +
  `/study/`.

### R2 — Three learning zones (UI must encode)

| Zone            | Phase                    | Message                 | Treatment                                   |
| --------------- | ------------------------ | ----------------------- | ------------------------------------------- |
| **Ritual**      | OPEN + CLOSE boilerplate | “Perform every time”    | Full contrast; optional `--panel` left rail |
| **Performance** | CORE                     | “Memorize _this_ skill” | Strongest weight; divider entry             |
| **Scoring**     | Steps with exam numerics | “Wrong number = fail”   | **Exam Scorecard** strip                    |

### R3 — Exam Scorecard entries (v1 — canonical copy)

Source of truth: `data/skills.json` (OG cross-verify deferred to v2).

| slug                         | step | kind      | headline              | value (display)      | notes                                              |
| ---------------------------- | ---- | --------- | --------------------- | -------------------- | -------------------------------------------------- |
| `manual-blood-pressure`      | 7    | technique | Inflate cuff          | **160–180 mmHg**     |                                                    |
| `manual-blood-pressure`      | 8    | technique | Deflate rate          | **2–3 mm Hg/second** | systolic                                           |
| `manual-blood-pressure`      | 9    | technique | Deflate rate          | **2 mm Hg/second**   | diastolic; OG text differs from step 8 — show both |
| `manual-blood-pressure`      | 14   | tolerance | Document BP           | **±8 mmHg**          | **Both** systolic and diastolic                    |
| `radial-pulse-60-seconds`    | 6    | tolerance | Document pulse        | **±4**               | beats/min vs evaluator                             |
| `respirations-60-seconds`    | 5    | tolerance | Document respirations | **±4**               | breaths/min vs evaluator                           |
| `weight-ambulatory-client`   | 11   | tolerance | Document weight       | **±2 lb / 0.9 kg**   |                                                    |
| `urinary-output-measurement` | 10   | tolerance | Record volume         | **±25 mL**           |                                                    |

- Scorecards are **additive UI** — do not edit `skills.json` step text.
- Display may use `±` for scanability; `aria-label` must match official wording
  intent.

### R4 — Skill-level Exam Numbers summary (BP pilot)

- Component lists **all scorecards for slug** via
  `getExamScorecardsForSkill(slug)` — 4 rows for BP (steps 7, 8, 9, 14).
- Render on `SkillPageClient` for `manual-blood-pressure` only in v1.
- Reusable for measurement section v2.

### R5 — Accessibility + print

- Scorecard: `role="note"`, `aria-label` includes kind + value + “exam scoring”.
- Print: scorecards and all phase text at full opacity.

### R6 — Product out of scope

- Changing bookend counts (132 invariant).
- Instructor mode; index exam numbers.
- Full 22-skill taxonomy.

### R7 — Quiz mode independence (v1.1 — critical)

**Gap found in code review:** `SkillPageClient` sets
`showSegmentBadges={mode === "study"}`, which hides dividers/badges in Quiz
mode.

- **Exam Scorecards must render in both Study and Quiz modes** when a step has a
  scorecard entry.
- Implement via `showExamScorecards={true}` (or derive from slug) — **not**
  gated on `showSegmentBadges`.
- Quiz: scorecard visible **above** hidden step text; tolerance numbers are
  drill targets.

---

## Success criteria

### Automated

- `pnpm test` pass; `post-patch-canonical-verify.test.ts` → 132 bookends
  unchanged.
- `tests/exam-scorecard.test.ts` covers all 8 rows in R3 table.
- CSS grep / test: no rule sets
  `.skill-step-segment--open|close .leading-relaxed { opacity: < 0.92 }`.

### Human — 5-second test (Manual BP, Study mode)

1. Open `/skills/manual-blood-pressure/`
2. Without scrolling to step 14 body: student states **±8 mmHg, both values**
3. Pass if answer comes from **summary card OR step-14 scorecard** visible in
   viewport

### Human — readability test

- Side-by-side: OPEN step 1, CORE step 7, CLOSE step 14 — body text equally
  legible (no “ghost” appearance).

### Design

- Scorecard distinguishable from red `⚠️ Critical` at 3 ft on laptop.

---

## Key decisions

| Decision                   | Rationale                                              |
| -------------------------- | ------------------------------------------------------ |
| Scoring ≠ Critical         | Step 13 HH keeps Critical; step 14 gets gold scorecard |
| Separate quiz flag         | Badges optional in quiz; numbers always drillable      |
| BP steps 8 & 9 both scored | OG uses 2–3 vs 2 — don’t merge; students memorize both |
| CSS before components      | Block A ships value without bundle increase            |

---

## Deferred (v2 — do not plan further without OG)

- OG `.txt` tolerance audit
- Water **105–110°F** safety callouts (basin skills — not ± tolerance)
- “Focus CORE only” density toggle
- Playwright visual baselines
- Roll summary card to pulse/resp/weight/urinary

---

## Next steps

Plan v2.1: `docs/plans/2026-06-21-002-feat-checklist-phase-scoring-ux-plan.md`
