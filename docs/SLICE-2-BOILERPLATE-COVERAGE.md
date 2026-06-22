# Slice-2 Boilerplate Coverage Report

## Registry

- **Location:** `lib/practice-labels.ts` → `BOILERPLATE_TOKEN_REGISTRY`
- **10 distinct spec tokens:** Demo Boilerplate Library header counts **9 step
  templates**; registry lists **10 distinct tokens** — the difference is the
  intro family split (**INTRO_EXPLAIN** + **INTRO_IDENTIFY**). See
  `BOILERPLATE_REGISTRY_NOTE`. Spec token **IDENTIFY** is implemented as
  **INTRO_IDENTIFY**.
- **1of1-OPEN** (PPE-only, 1 occurrence, OPEN phase) is intentionally
  untagged/deferred in Slice-2 — single non-reusable occurrence; scheduled with
  the universal-tagging backlog slice.

| Token ID       | Phase | In `BOILERPLATE_TOKEN_REGISTRY` |
| -------------- | ----- | ------------------------------- |
| INTRO_EXPLAIN  | open  | yes                             |
| INTRO_IDENTIFY | open  | yes (spec: IDENTIFY)            |
| PRIVACY        | open  | yes                             |
| WATER_CHECK    | open  | yes                             |
| HAND_HYGIENE   | core  | yes                             |
| GLOVE_DON      | core  | yes                             |
| GLOVE_REMOVE   | core  | yes                             |
| BED_LOW        | close | yes                             |
| CALL_LIGHT     | close | yes                             |
| 1of1-OPEN      | open  | **deferred** (Slice-2 backlog)  |

## Bounded tagging (Slice-2 approved)

| Skill slug                 | Tokens tagged (pre-existing `boilerplateId`)                                                             | Wording verified                                                                          |
| -------------------------- | -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| hand-hygiene               | INTRO_IDENTIFY only (step 1)                                                                             | **Mismatch** — INTRO_IDENTIFY chip blocked; no HAND_HYGIENE tag (skill _is_ hand hygiene) |
| urinary-output-measurement | INTRO_EXPLAIN, HAND_HYGIENE, GLOVE_DON, GLOVE_REMOVE                                                     | Yes — matches registry                                                                    |
| bedpan-assist              | INTRO_EXPLAIN, PRIVACY, HAND_HYGIENE, GLOVE_DON, CALL_LIGHT (+ GLOVE_REMOVE_THEN_HH composite — no chip) | Yes for registry tokens                                                                   |

No new `boilerplateId` values were added in Slice-2; urinary and bedpan were
already tagged in `data/skills.json`.

## Render coverage

- **Chip renders when:** step has `boilerplateId` ∈ registry, not composite, and
  `detailedText`/`text` byte-matches registry wording
  (`lib/boilerplate-tokens.ts`).
- **Skills with registry chips on live skill page:** all steps across 22 skills
  that already carry matching `boilerplateId` (majority of bookend steps from
  prior enrichment passes).
- **Deferred (backlog):** universal tagging of ~128 occurrences; composite IDs
  (`GLOVE_REMOVE_THEN_HH`, `HAND_HYGIENE|VIDEO_WARNING`); steps whose prose
  differs from registry (report, do not alter wording); **1of1-OPEN** chip
  registry entry.

## Wording mismatches found

| Skill        | Step | boilerplateId  | Issue                                                                                                                                                                                        |
| ------------ | ---- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| hand-hygiene | 1    | INTRO_IDENTIFY | `detailedText` is legacy short form ("Introduce yourself and identify the patient.") — does not byte-match registry INTRO_IDENTIFY canonical wording. **No chip rendered** (per guardrails). |

All tagged steps on **urinary-output-measurement** and **bedpan-assist** match
registry wording via `detailedText`.
