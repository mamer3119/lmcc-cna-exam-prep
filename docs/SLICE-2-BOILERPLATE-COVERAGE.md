# Slice-2 Boilerplate Coverage Report

## Registry

- **Location:** `lib/practice-labels.ts` → `BOILERPLATE_TOKEN_REGISTRY` (9 token IDs)
- **9 templates vs 10 tokens:** Demo Boilerplate Library counts intro as one template; registry splits **INTRO_EXPLAIN** + **INTRO_IDENTIFY** (see `BOILERPLATE_REGISTRY_NOTE`)

| Token ID | Phase |
|----------|-------|
| INTRO_EXPLAIN | open |
| INTRO_IDENTIFY | open |
| PRIVACY | open |
| WATER_CHECK | open |
| HAND_HYGIENE | core |
| GLOVE_DON | core |
| GLOVE_REMOVE | core |
| BED_LOW | close |
| CALL_LIGHT | close |

## Bounded tagging (Slice-2 approved)

| Skill slug | Tokens tagged (pre-existing `boilerplateId`) | Wording verified |
|------------|---------------------------------------------|------------------|
| hand-hygiene | INTRO_IDENTIFY only (step 1) | **Mismatch** — INTRO_IDENTIFY chip blocked; no HAND_HYGIENE tag (skill *is* hand hygiene) |
| urinary-output-measurement | INTRO_EXPLAIN, HAND_HYGIENE, GLOVE_DON, GLOVE_REMOVE | Yes — matches registry |
| bedpan-assist | INTRO_EXPLAIN, PRIVACY, HAND_HYGIENE, GLOVE_DON, CALL_LIGHT (+ GLOVE_REMOVE_THEN_HH composite — no chip) | Yes for registry tokens |

No new `boilerplateId` values were added in Slice-2; urinary and bedpan were already tagged in `data/skills.json`.

## Render coverage

- **Chip renders when:** step has `boilerplateId` ∈ registry, not composite, and `detailedText`/`text` byte-matches registry wording (`lib/boilerplate-tokens.ts`).
- **Skills with registry chips on live skill page:** all steps across 22 skills that already carry matching `boilerplateId` (majority of bookend steps from prior enrichment passes).
- **Deferred (backlog):** universal tagging of ~128 occurrences; composite IDs (`GLOVE_REMOVE_THEN_HH`, `HAND_HYGIENE|VIDEO_WARNING`); steps whose prose differs from registry (report, do not alter wording).

## Wording mismatches found

| Skill | Step | boilerplateId | Issue |
|-------|------|---------------|-------|
| hand-hygiene | 1 | INTRO_IDENTIFY | `detailedText` is legacy short form ("Introduce yourself and identify the patient.") — does not byte-match registry INTRO_IDENTIFY canonical wording. **No chip rendered** (per guardrails). |

All tagged steps on **urinary-output-measurement** and **bedpan-assist** match registry wording via `detailedText`.
