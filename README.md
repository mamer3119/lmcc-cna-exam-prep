# LMCC CNA Exam Prep — Interactive Checklists

All **22 California CNA skills** with official evaluator step wording, interactive checkboxes, localStorage progress, and RTC video links where available.

**Live URL:** https://mamer3119.github.io/lmcc-cna-exam-prep/

> First deploy: push this repo to `main`, then enable **Settings → Pages → GitHub Actions**. See **`DEPLOY-GITHUB-PAGES.md`**.

## Google Sites embed (single skill or home)

Home (skill picker):

```html
<iframe src="https://mamer3119.github.io/lmcc-cna-exam-prep/" width="100%" height="800" frameborder="0"></iframe>
```

Hand Hygiene only:

```html
<iframe src="https://mamer3119.github.io/lmcc-cna-exam-prep/skills/hand-hygiene/" width="100%" height="900" frameborder="0"></iframe>
```

## Local development

```powershell
pnpm install
pnpm dev
```

Open http://localhost:3000/lmcc-cna-exam-prep/

## Commands

| Command | Purpose |
|---------|---------|
| `pnpm sync:skills` | Regenerate `data/skills.json` from monorepo DB (when present) |
| `pnpm test` | Vitest — 22 skills, step mapping |
| `pnpm build` | Static export to `out/` |

## Data source

`data/skills.json` is generated from `Educator_Mastermind/master_course_database.json` in the parent monorepo. Committed to this repo so GitHub Actions builds without the full skills TXT workspace.

## Features

- 22 skills grouped by section on the home page
- Per-skill checklist with nested sub-steps where the official checklist has them
- Inline notes (e.g. Hand Hygiene step 3)
- `localStorage` persistence per skill (`checklist-01-hand-hygiene`, etc.)
- Print stylesheet: ☐ boxes, LMCC header, black text
