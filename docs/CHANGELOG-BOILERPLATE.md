# Checklist Boilerplate Normalization — Change Log

**Date:** 2026-06-21  
**Scope:** OPEN/CLOSE boilerplate strings across 22 CNA skills  
**Source of truth:** `Educator_Mastermind/master_course_database.json` → `pnpm sync:skills` → `data/skills.json`

## Why

Template T1–T6 dedup ("you already know OPEN/CLOSE") requires **identical canonical strings**. Audit found data-entry drift, not intentional variants.

## Official reference (Headmaster CA)

| Step | Headmaster handbook phrasing | Our canonical (RTC patient wording) |
|------|------------------------------|-------------------------------------|
| Intro | Explain the procedure to the resident | Introduce yourself and explain the procedure to the patient. |
| Privacy | **Provide for resident's privacy** | **Provide for privacy.** |
| Hand hygiene | Perform hand hygiene | Perform hand hygiene. |

Sources: [CA Candidate Handbook (Headmaster, 2024)](https://www.hdmaster.com/testing/cnatesting/California/forms/CA%20Candidate%20Handbook%209.2024.pdf), [CA Mock Skills (2025)](https://hdmaster.com/testing/cnatesting/California/forms/CA%20Mock%20Skills%2010.2025.pdf)

## Decisions

| Issue | Before | After | Rationale |
|-------|--------|-------|-----------|
| Privacy | Mixed `Provide privacy` / `Provide for privacy` | **`Provide for privacy.`** | Matches Headmaster "Provide **for** … privacy" |
| Intro (T1) | `Introduce self` in bed bath only | **`Introduce yourself and explain…`** | Typo; dominant form elsewhere |
| Urinary output OPEN1 | Missing "to" | Fixed via intro-explain canonical | Grammar |
| Bed bath step 8 | `Remove gown patient` | **`Remove gown from the patient…`** | Grammar |
| Bed bath step 10 | `without soup` | **`without soap`** | Obvious typo |
| Hand hygiene (standalone) | Mixed with/without period | **`Perform hand hygiene.`** | Consistent OPEN3 |
| T4 identify (skills 1, 10) | Unchanged | **`Introduce yourself and identify the patient.`** | Intentional template variant |

## Tooling

- `lib/checklist-boilerplate.ts` — canonical strings + `normalizeBoilerplateText()`
- `scripts/checklist-boilerplate.mjs` — same rules for Node sync scripts
- `scripts/normalize-master-db.mjs` — one-shot patch of master DB
- `scripts/sync-skills.mjs` — normalizes on every sync (regression guard)
- `tests/checklist-boilerplate.test.ts` — invariant tests

## Verify

```bash
pnpm normalize:boilerplate
pnpm test
```

## Pass 2 — Glove + audit fixes (2026-06-21)

| Issue | After |
|-------|-------|
| Glove don drift (`Put on gloves` / missing period) | **`Put on clean gloves.`** everywhere |
| Urinary CORE9 `Remove gloves` | **`Remove the gloves, turning them inside out.`** |
| Mouth care glove step tagged OPEN5 | **CORE** via `classifyStepSegment` (T1 `openStepCount=3`; glove is step 5) |
| BP CLOSE13 `Perform proper hand hygiene` | **`Perform hand hygiene.`** |
| Weight duplicate HH before document | Removed step 11 HH; document then final HH |
| Urinary CORE6/8/CLOSE10 grammar | Articles, `into the toilet`, periods |
| Bed bath CORE8/13/19 | `the designated hamper`, `a dry towel`, periods |
| Peri OPEN4 water check | **`Get water and check water temperature for safety.`** |
| Ambulate / knee-high merged CLOSE | Split → bed low + call light (two steps) |

Structural fixes live in `applyStructuralChecklistFixes()` (weight, ambulate, knee-high); string fixes in `normalizeBoilerplateText()`.

**After normalize:** run `pnpm dev:clean` (not a stale `pnpm dev` session). Verify with `pnpm probe:dev-skills --live http://localhost:3005/lmcc-cna-exam-prep/study/`.
