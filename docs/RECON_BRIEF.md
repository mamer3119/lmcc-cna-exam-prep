# Reconnaissance Brief — CNA Navigator Redesign

**Date:** 2026-08-27  
**Project:** `C:\Users\moham\Desktop\22 Skills TXT\local-checklist-preview`  
**Target public URL:** `https://www.lmccpomona.com/classroom/rtc-cna-navigator#start-here`  
**Vercel team:** `lmcc-pomona`  

## 1. Current product state

### Stack
- **Framework:** Next.js 15.5.19, React 19.1.0, TypeScript 5.9.3, Tailwind 3.4.17
- **Package manager:** pnpm 9.15.9
- **Node pin:** 24.x
- **Build:** Static export (`output: "export"`) to `out/` with `basePath: "/lmcc-cna-exam-prep"`
- **Current live URL:** GitHub Pages — `https://mamer3119.github.io/lmcc-cna-exam-prep/`
- **Tests:** Vitest (266+ pass), Playwright e2e, custom export verification scripts
- **State:** Zustand mastery store + legacy `localStorage` checkbox state

### Data assets
- **`data/skills.json`** — 22 California CNA skills, each with official steps, detailed rubric text, phase tags, critical categories, exam scorecards, RTC video links, and study order.
- **`data/pedagogical-order.json`** — 7 clinical sections (Infection Control → Elimination).
- **`imports/final-pass/`** — source-of-truth staging files for step enrichment.
- **`California School Directory/GWC RTC CNA Training Programs.md`** — 700+ CDPH-approved CNA training entities mapped to the Golden West College Regional Testing Center (GWC RTC) portal. Codes are prefixed `DHS99`, `E*`, `S*`. Includes multi-code institutions and multi-facility code sharing.

### Current UI flow
1. **Home** (`app/page.tsx`) → `SkillIndexClient` shows all 22 skills grouped by section, progress bar, search, simulate-exam button, section jump buttons, framework/study links.
2. **Skill page** (`app/skills/[slug]/`) → `SkillPageClient` + `SkillChecklist` + pathway rail + mode selector (Full View / Core Only / Self-Check) + progress badge + video embed + exam reference + prev/next nav.
3. **Study page** (`app/study/`) → phase-organizer with modules and HUD.

## 2. Cognitive overload findings

The user’s stated problem is confirmed by the code and architecture:

| Clutter source | Evidence |
| --- | --- |
| **Too many modes on the skill page** | `SkillViewModeSelector` exposes Full View / Core Only / Self-Check; each changes checklist display, segment filters, and scorecard visibility. |
| **Dense checklist component** | `SkillChecklist.tsx` is ~1,060 lines and mixes rendering, state, storage, quiz logic, sub-steps, scorecards, phase badges, clinical notes, boilerplate chips, and text-layer density toggles. |
| **Heavy prop drilling** | `SkillChecklist` accepts ~15 props (`showModeToggle`, `showCriticalBadges`, `organizerMeta`, `showSegmentBadges`, `showExamScorecards`, `display`, `segmentFilterMode`, etc.). |
| **Multiple overlapping learning features** | Study mode, exam simulation, sequence drill, tolerance drill, free-recall drill, progress tracking, mastery store, boilerplate chips, video embeds, phase dividers, learn segment headings. |
| **Two different progress systems** | Legacy `localStorage` per skill + Zustand mastery store coexist. |
| **Home page competing CTAs** | Progress bar, search, simulate exam, section jump buttons, framework link, study link, 22 skill cards, reset-all button. |
| **Google Sites embed legacy** | README still frames usage as iframe embeds, not a first-class shareable link. |

**Core user goal that is buried:**  
> *“I need to pass the CNA state test for my school.”*  

The current UI asks students to choose between modes, sections, and study strategies before they have even picked a skill.

## 3. School directory data shape

From `GWC RTC CNA Training Programs.md`:

- **Format:** Markdown table with `Code | School Name` pairs.
- **Rows:** ~700 entries.
- **Code taxonomy:**
  - `DHS99` — CDPH Form 932 competency evaluation approval letter (out-of-state, military, equivalent education).
  - `E*` — Employer-based / facility-based training (SNFs, long-term care, healthcare systems).
  - `S*` — Educational institutions, community colleges, ROPs, private vocational schools, adult schools.
- **Data quality notes:**
  - Some schools have multiple codes (e.g., San Diego Medical College has 12 S-codes).
  - Some codes map to multiple facilities (joint training agreements).
  - No city, county, or contact info in the file yet; user will provide location data later.
  - All data is sourced from the public GWC RTC registration portal (`crm.cccd.edu/register/gwc_rtc`).

## 4. lmcc-website context

- **Location:** `C:\Users\moham\Desktop\lmcc-website`
- **Stack:** Next.js, npm, Tailwind, Vitest, Husky pre-push, Unlighthouse, strict lint/format and compliance rules (`BPPE/CDPH/WIOA` guardrails).
- **Route situation:** No `/classroom/rtc-cna-navigator` route exists yet. The app has many marketing/program pages (`/programs`, `/cna-training-inland-empire`, `/wioa-check`, etc.) but no student-facing exam-prep or school-directory tool.
- **Integration complexity:** Very high. The `local-checklist-preview` app has its own build pipeline, pnpm workspace, ~40+ components, custom scripts, and static-export path hacks. Dropping it into `lmcc-website` would require rewriting components, aligning lint/format, migrating data scripts, and passing the existing `lmcc-website` test/quality gates.

## 5. Deployment / routing recommendation

**Recommended path:** keep the CNA navigator as a **separate project** (`local-checklist-preview`), deploy it under the `lmcc-pomona` Vercel team as a new project (e.g., `lmcc-cna-navigator`), and add a **rewrite** in `lmcc-website` so that `https://www.lmccpomona.com/classroom/rtc-cna-navigator` serves it under the LMCC domain.

**Why this wins:**
- Preserves the existing 266+ tests and build pipeline.
- Avoids a risky monorepo merge into the marketing site.
- Allows the app to use its own static-export or serverless deployment profile optimized for student interactivity.
- Delivers the requested public URL and a single shareable link for Google Classroom.
- Can be reversed later if a full integration becomes desirable.

**Alternative considered:** fully merge the app into `lmcc-website` as a route. Rejected for this phase because it would turn a product-simplification task into a multi-week platform migration.

## 6. Top 3 design constraints

1. **One primary action per screen.** The redesigned skill page should show the checklist first; advanced modes (self-check, quiz, tolerance drills) become secondary tabs or progressive-disclosure options.
2. **Mobile-first.** Students will use this on phones in lab, on transit, and during breaks. The current desktop rail and dense chip layout must be simplified.
3. **School-aware but not school-exclusive.** LMCC students should land on a personalized path, but the same link must be usable by graduates from any California school without friction.

## 7. Preliminary target architecture

```
app/
  page.tsx                    # Three-path entry + school search
  layout.tsx                  # Global metadata, JSON-LD, fonts
  schools/
    page.tsx                  # Directory listing with search/filter
    [slug]/
      page.tsx                # School detail + testing guidance + linked skills
  skills/
    [slug]/
      page.tsx                # Simplified single-column checklist
  for-graduates/
    page.tsx                  # Post-graduation onboarding hub

lib/
  schools.ts                  # Load + validate school data
  skills.ts                   # Refactored existing skill loader
  seo.ts                      # Metadata + JSON-LD helpers
  compliance.ts               # Disclaimer templates

public/data/
  schools.json                # Normalized school directory (initial seed from GWC file)
```

## 8. Open questions moving into design

1. Should the home page default to **LMCC student mode** or to a **neutral chooser**? (Neutral chooser is safer for a public link shared by non-LMCC students.)
2. What is the exact Vercel project name under `lmcc-pomona`? (e.g., `lmcc-cna-navigator`, `lmcc-cna-exam-prep`, `cna-skills`)
3. Will the `lmcc-website` rewrite be implemented in this phase or by a separate task? (The app can ship on its own domain first, then rewrite later.)
4. What school data fields will be added later beyond name/code? (City, county, exam vendor, testing-region notes, etc.)
