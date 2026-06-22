# LMCC CNA Exam Prep — Interactive Checklists

All **22 California CNA skills** with official evaluator step wording,
interactive checkboxes, localStorage progress, and RTC video links where
available.

**Live URL:** https://mamer3119.github.io/lmcc-cna-exam-prep/

> First deploy: push this repo to `main`, then enable **Settings → Pages →
> GitHub Actions**. See **`DEPLOY-GITHUB-PAGES.md`**.

## Google Sites embed (single skill or home)

Home (skill picker):

```html
<iframe
  src="https://mamer3119.github.io/lmcc-cna-exam-prep/"
  width="100%"
  height="800"
  frameborder="0"
></iframe>
```

Hand Hygiene only:

```html
<iframe
  src="https://mamer3119.github.io/lmcc-cna-exam-prep/skills/hand-hygiene/"
  width="100%"
  height="900"
  frameborder="0"
></iframe>
```

## Local development

**Use Node 22 LTS** (not Node 26). This repo pins `engines.node` to 22.x.

```powershell
# If you use Scoop — install/switch to LTS once:
scoop install nodejs-lts
scoop reset nodejs-lts

cd "C:\Users\moham\Desktop\22 Skills TXT\local-checklist-preview"
pnpm install
pnpm dev:clean
```

Open http://localhost:3005/lmcc-cna-exam-prep/

### Fix `a[d] is not a function` (Webpack runtime)

This almost always means **stale dev cache** (production `.next` reused after
`pnpm build`), **orphan `node` processes**, or **wrong Node major** (project
pins **Node 24 LTS** via `.node-version`).

```powershell
pnpm dev:clean
```

`predev` kills port 3005 and clears stale `.next` when `out/` or a production
webpack cache is detected. Use **`pnpm dev:clean`** after any `pnpm build` or if
you see `./153.js` / `a[d] is not a function`.

Hard-refresh the browser (**Ctrl+Shift+R**) — old chunk hashes in cache also
trigger this error even when the server is fixed.

Never run `pnpm build` while `pnpm dev` is still running.

**Production:** after push, run `pnpm verify:live` to confirm GitHub Pages
serves all `_next` chunks (especially `%5Bslug%5D`).

### Scoop `nodejs` update blocked

Close Cursor, dev servers, and any `node` processes before
`scoop update nodejs`, or use `nodejs-lts` for this project only.

## Commands

| Command            | Purpose                                                       |
| ------------------ | ------------------------------------------------------------- |
| `pnpm sync:skills` | Regenerate `data/skills.json` from monorepo DB (when present) |
| `pnpm test`        | Vitest — 22 skills, step mapping                              |
| `pnpm build`       | Static export to `out/`                                       |

## Data source

`data/skills.json` is generated from
`Educator_Mastermind/master_course_database.json` in the parent monorepo.
Committed to this repo so GitHub Actions builds without the full skills TXT
workspace.

## Features

- 22 skills grouped by section on the home page
- Per-skill checklist with nested sub-steps where the official checklist has
  them
- Inline notes (e.g. Hand Hygiene step 3)
- `localStorage` persistence per skill (`checklist-01-hand-hygiene`, etc.)
- Print stylesheet: ☐ boxes, LMCC header, black text
