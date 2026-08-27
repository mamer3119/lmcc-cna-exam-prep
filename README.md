# LMCC CNA Skills Navigator — LMCC Student Edition

This is the **LMCC-student-only** build of the CNA skills study app. It contains
all **22 California CNA skills** with official evaluator step wording,
interactive checkboxes, localStorage progress, and RTC video links where
available. The California school directory and non-LMCC flows are intentionally
removed; they will be built as a separate "22 For California" variant.

**Live URL:** https://mamer3119.github.io/lmcc-cna-exam-prep/

> For deployment, push this repo to `main` and configure the target host. See
> **`DEPLOY-GITHUB-PAGES.md`** for GitHub Pages instructions.

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

**Use Node 24 LTS** (this project pins `engines.node` to `>=24.0.0 <25.0.0`).

```powershell
cd "C:\Users\moham\Desktop\22 LMCC Students\local-checklist-preview"
pnpm install
pnpm dev:clean
```

Open http://localhost:3005/lmcc-cna-exam-prep/

### Fix `a[d] is not a function` (Webpack runtime)

This almost always means **stale dev cache** (production `.next` reused after
`pnpm build`), **orphan `node` processes**, or **wrong Node major**.

```powershell
pnpm dev:clean
```

`predev` kills port 3005 and clears stale `.next` when `out/` or a production
webpack cache is detected. Use **`pnpm dev:clean`** after any `pnpm build` or if
you see `./153.js` / `a[d] is not a function`.

Hard-refresh the browser (**Ctrl+Shift+R**) — old chunk hashes in cache also
trigger this error even when the server is fixed.

Never run `pnpm build` while `pnpm dev` is still running.

## Commands

| Command            | Purpose                                                       |
| ------------------ | ------------------------------------------------------------- |
| `pnpm sync:skills` | Regenerate `data/skills.json` from monorepo DB (when present) |
| `pnpm test`        | Vitest — 22 skills, step mapping, simplified UI               |
| `pnpm test:e2e`    | Playwright — home, skill, and SEO smoke tests                  |
| `pnpm build`       | Static export to `out/` (GitHub Pages profile)                |

## Data source

`data/skills.json` is generated from
`Educator_Mastermind/master_course_database.json` in the parent monorepo.
Committed to this repo so builds do not require the full skills TXT workspace.

## Features

- LMCC-focused home page with one front door: "I study at LMCC"
- Per-skill simplified checklist with nested sub-steps where the official checklist has
  them
- Practice-tools disclosure and inline RTC video where available
- `localStorage` persistence per skill
- Print stylesheet: ☐ boxes, LMCC header, black text
- SEO/LLM-friendly: sitemap, JSON-LD, semantic HTML, Open Graph, canonical URLs
