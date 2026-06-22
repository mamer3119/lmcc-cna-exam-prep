# fixing-json — reference only (not in build)

**Do not import these files into the Next.js app or `sync-skills` pipeline.**

## Canonical paths (use these)

| Concern                    | Canonical location                                                                                  |
| -------------------------- | --------------------------------------------------------------------------------------------------- |
| Runtime skills             | `data/skills.json` (via `pnpm sync:skills`)                                                         |
| Step enrichment staging    | `imports/final-pass/` + `pnpm merge:final-pass`                                                     |
| Boilerplate tag metadata   | `fixing-json/boilerplate_tags.json` → `pnpm import:boilerplate-tags` → `data/boilerplate-tags.json` |
| Accessor hub (UI + export) | `lib/skill-step-meta.ts`                                                                            |
| Display toggles            | `lib/checklist-display.ts`                                                                          |
| Checklist step types       | `lib/checklist-step.ts`                                                                             |
| Curriculum phases          | `data/skillCurriculum.ts` + `lib/step-phase.ts`                                                     |

## Ignore for builds

- `skills-7-enrichment-patch.json` — wrong slugs for S14–S22
- `checklist-step-2.ts`, `skillCurriculum-6-patch.ts` — Perplexity stubs
- `Perplexity Response Files/` — historical only

See `local-checklist-preview/handoff-v15.md` for full data-flow diagram.
