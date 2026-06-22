# GitHub + Live Review Brief (Perplexity Comet / external reviewers)

**Public repo:** https://github.com/mamer3119/lmcc-cna-exam-prep  
**Live site (GitHub Pages):** https://mamer3119.github.io/lmcc-cna-exam-prep/  
**Local dev:** `pnpm dev:clean` → http://localhost:3005/lmcc-cna-exam-prep/

## What changed since last GitHub commit (verify on `main` after merge)

Phase 1 milestones M1–M4: mastery store, Learn polish, Sequence/Tolerance/Recall drills,
`useSyncExternalStore` instructor view, centralized practice labels, Playwright hydration smoke.

## Gap matrix (feature → verify in repo)

| Feature | Exists? | Primary files |
|---------|---------|---------------|
| Boilerplate token library | Yes | `lib/checklist-boilerplate.ts`, `data/skills.json` (`boilerplateId`) |
| OPEN/CORE/CLOSE segments | Yes | `segment` on steps, `LearnSegmentHeading`, `PhaseDivider` |
| Template taxonomy T1–T6 (+T1+) | Yes | `lib/skill-templates.ts`, `data/skillCurriculum.ts` |
| Learn \| Test Yourself toggle | Yes | `components/SkillPracticeToggle.tsx`, `lib/practice-labels.ts` |
| Checklist view (not practice) | Yes | `All steps \| Hide & reveal` in `SkillChecklist.tsx` |
| Sequence / Tolerance / Recall drills | Yes | `components/SkillDrillPanel.tsx`, `SequenceDrill`, etc. |
| Framework landing page | **No** | Planned — demo merge slice 1 |
| Persistent 22-skill rail | **No** | Study page uses modules, not global rail |
| Recall missed-step persistence | **No** | Session state only in `FreeRecallDrill.tsx` |
| Template T0–T6 demo mnemonics | **No** | Demo taxonomy ≠ localhost T1–T6; needs translation table |

## Tests / CI

- `pnpm test` — 229 pass (pre-push gate)
- `pnpm test:e2e` — hydration smoke; keyboard DnD is `test.fixme`
- Push to `main` runs `.github/workflows/deploy.yml` → GitHub Pages

## Label drift check (Perplexity browser audit)

On `/skills/hand-hygiene/` and `/skills/ppe-gown-gloves/` after hard refresh:

1. **Top:** `Learn` | `Test Yourself` (`skill-practice-toggle`)
2. **Inside Learn only:** `All steps` | `Hide & reveal` (`skill-mode-toggle`)

Legacy `Study Mode` / `Quiz Mode` strings must **not** appear (grep gate: `tests/practice-labels.test.ts`).
