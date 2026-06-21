# Deploy checklist — GitHub Pages

## Why the live URL 404s today

Checked via `gh repo view mamer3119/lmcc-cna-exam-prep`:

| Check                   | Status                         |
| ----------------------- | ------------------------------ |
| Repo exists             | Yes                            |
| Repo has code on `main` | **No — repo is empty**         |
| GitHub Pages enabled    | **No — Pages API returns 404** |
| Workflow runs           | **None**                       |

**The site URL cannot work until you push this folder and enable Pages.**

---

## One-time GitHub settings

1. Open https://github.com/mamer3119/lmcc-cna-exam-prep/settings/pages
2. **Build and deployment → Source:** select **GitHub Actions** (not “Deploy
   from a branch”)
3. Save

---

## Push from your PC (first deploy)

Run in PowerShell from this folder:

```powershell
cd "C:\Users\moham\Desktop\22 Skills TXT\local-checklist-preview"

git init
git branch -M main
git remote add origin https://github.com/mamer3119/lmcc-cna-exam-prep.git

git add .
git status   # confirm no .env or secrets
git commit -m "Initial deploy: Hand Hygiene interactive checklist for GitHub Pages"

git push -u origin main
```

If the remote already exists:

```powershell
git remote set-url origin https://github.com/mamer3119/lmcc-cna-exam-prep.git
git push -u origin main
```

---

## Verify deploy

1. **Actions:** https://github.com/mamer3119/lmcc-cna-exam-prep/actions
   - “Deploy to GitHub Pages” should be green (~2 min)
2. **Pages:** Settings → Pages → shows deployed URL
3. **Live:** https://mamer3119.github.io/lmcc-cna-exam-prep/

Local dev uses the same base path:

http://localhost:3000/lmcc-cna-exam-prep/

---

## If Actions fails

| Error                     | Fix                                                                             |
| ------------------------- | ------------------------------------------------------------------------------- |
| `pnpm install` / lockfile | Run `pnpm install` locally, commit `pnpm-lock.yaml`                             |
| Pages environment missing | Settings → Pages → Source = GitHub Actions                                      |
| Blank page after deploy   | `public/.nojekyll` is included so `_next/` assets are not stripped by Jekyll    |
| 404 on assets             | Confirm `basePath: '/lmcc-cna-exam-prep'` in `next.config.ts` matches repo name |

---

## Google Sites embed (after live)

```html
<iframe
  src="https://mamer3119.github.io/lmcc-cna-exam-prep/"
  width="100%"
  height="700"
  frameborder="0"
></iframe>
```
