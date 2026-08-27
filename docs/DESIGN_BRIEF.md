# Design Brief — CNA Navigator Simplification (LMCC-only variant)

**Date:** 2026-08-27
**Project:** `local-checklist-preview` (LMCC-student copy)
**Variant:** This is the Lotus Medical Career College (LMCC) student-only build. The California school directory and non-LMCC flows are intentionally removed and will be built as a separate "22 For California" variant.
**Goal:** Redesign the CNA skills study app so an LMCC student can understand the value and start practicing the 22 official skills in under 60 seconds.

## 1. Product thesis

A single, mobile-first, public study resource that helps any California CNA graduate find their school, see exactly what the state exam tests, and practice one skill at a time — with LMCC students getting a personalized, branded path.

## 2. Target user journeys

### Journey A — "I am an LMCC student"
1. Lands on the home page and sees the LMCC-branded primary card.
2. Clicks "I study at LMCC".
3. Sees the LMCC study path (recommended skill sequence, LMCC contact/support links, optional link to schedule).
4. Picks the first skill or resumes where they left off.
5. Practices the official checklist, marks it reviewed, and moves to the next skill.

### Journey B — "I graduated from another school"
1. Lands on the home page and clicks "I graduated from another school".
2. Searches or selects their school from the California directory.
3. Sees a school detail page with testing guidance and a clear disclaimer.
4. Clicks into the shared skills list and studies any of the 22 official skills.
5. Progress is saved locally; the student can share the link with classmates.

### Journey C — "I am looking for a CNA program"
1. Lands on the home page and clicks "Browse California CNA programs".
2. Sees the school directory with search and a short explanation of how training/testing works.
3. Clicks a school to see its GWC RTC code and public source link.
4. Can jump to the study skills list at any time from the header.

## 3. Information architecture

| Route | Purpose | Generation |
| --- | --- | --- |
| `/` | Home — three front-door paths, search, global disclaimer | Static |
| `/schools/` | School directory — search, filter, list | Static |
| `/schools/[slug]/` | School detail — code, name, testing guidance, source link, related skills | Static (`generateStaticParams`) |
| `/skills/` | All skills list (alternative entry) | Static |
| `/skills/[slug]/` | Simplified skill checklist page | Static (`generateStaticParams`) |
| `/for-graduates/` | Post-graduation onboarding hub — how to use the tool, find your school, start studying | Static |
| `/sitemap.xml` | SEO crawlability | Generated (`sitemap.ts`) |
| `/robots.txt` | SEO crawlability | Generated (`robots.ts`) |

## 4. Home page wireframe

Remove: progress bar, simulate-exam button, section-jump nav, framework/study dual links, reset-all button above the fold.

```
<main>
  <header class="hero">
    <p class="eyebrow">Free California CNA exam prep</p>
    <h1>Pass the CNA state exam by practicing the 22 official skills.</h1>
    <p class="subtitle">Pick your path. No signup. Works on your phone.</p>
  </header>

  <nav class="path-cards" aria-label="Choose your path">
    <a href="/skills/" class="path-card path-card--lmcc">
      <h2>I study at LMCC</h2>
      <p>LMCC's recommended study order and support links.</p>
      <span class="cta">Start studying →</span>
    </a>

    <a href="/schools/" class="path-card">
      <h2>I graduated from another school</h2>
      <p>Find your school, then practice the same 22 skills.</p>
      <span class="cta">Find my school →</span>
    </a>

    <a href="/schools/" class="path-card">
      <h2>Browse California CNA programs</h2>
      <p>Search schools that test through the GWC RTC portal.</p>
      <span class="cta">Browse schools →</span>
    </a>
  </nav>

  <section class="quick-search">
    <label for="skill-search">Or jump to a skill</label>
    <input id="skill-search" type="search" placeholder="e.g., Hand Hygiene" />
    <ul class="search-results" aria-live="polite" />
  </section>

  <footer class="global-disclaimer">
    <p>This is a free study resource. Verify all codes, dates, and registration details with your school and the official testing portal.</p>
  </footer>
</main>
```

## 5. Skill page wireframe

Default view is the official checklist. One primary action per step: check the box. Everything else is secondary.

```
<main>
  <nav class="breadcrumbs">
    <a href="/">Home</a> / <a href="/skills/">Skills</a> / <span>Hand Hygiene</span>
  </nav>

  <header class="skill-header">
    <h1>Hand Hygiene</h1>
    <p>California Skills Exam — Skill 1</p>
    <p class="skill-context">11 official steps. Master this first; every other skill starts and ends with clean hands.</p>
  </header>

  <section class="skill-checklist" aria-label="Official checklist">
    <ul>
      <li>
        <label>
          <input type="checkbox" />
          <span>1. Introduce and identify the patient</span>
        </label>
        <p class="rubric">Introduce yourself and identify the patient.</p>
      </li>
      <!-- ... remaining steps ... -->
    </ul>
  </section>

  <div class="progress-row">
    <span>3 of 11 steps checked</span>
    <a href="/skills/ppe-gown-gloves/">Next: PPE →</a>
  </div>

  <details class="advanced-tools">
    <summary>Practice tools</summary>
    <nav>
      <a href="?mode=self-check">Self-check mode</a>
      <a href="?mode=quiz">Quiz mode</a>
      <a href="?mode=drill">Sequence drill</a>
    </nav>
  </details>

  <details class="video-help">
    <summary>RTC video</summary>
    <YouTubeEmbed url="..." />
  </details>

  <footer class="global-disclaimer">...</footer>
</main>
```

## 6. School directory wireframe

```
<main>
  <header>
    <h1>California CNA training programs</h1>
    <p>Search by school name or code. Data is sourced from the public GWC RTC registration portal.</p>
  </header>

  <section class="search-bar">
    <input type="search" placeholder="Search schools..." />
    <p class="meta">Last updated: [date] · Source: GWC RTC portal</p>
  </section>

  <section class="school-list">
    <article class="school-card">
      <h2>LOTUS MEDICAL CAREER COLLEGE</h2>
      <p class="code">E28 · S1642 · S1643</p>
      <a href="/schools/lotus-medical-career-college/">Testing guidance →</a>
    </article>
    <!-- ... -->
  </section>
</main>
```

School detail page:

```
<main>
  <h1>LOTUS MEDICAL CAREER COLLEGE</h1>
  <p class="code">GWC RTC codes: E28, S1642, S1643</p>
  <p class="testing-note">If your program uses Golden West College Regional Testing Center, you will register at the GWC RTC portal.</p>
  <a href="https://crm.cccd.edu/register/gwc_rtc" target="_blank" rel="noopener">Open GWC RTC portal →</a>
  <a href="/skills/">Start studying the 22 skills →</a>
  <p class="disclaimer">Verify your code and registration with your school. Last updated: [date].</p>
</main>
```

## 7. Component map

### Reuse from current app
- `lib/skills.ts` — keep as skill loader; add a simple search helper if needed.
- `data/skills.json` — unchanged.
- `components/SkillVideoEmbed.tsx` — keep, but hide behind a `<details>` disclosure by default.
- `components/SkillBadge.tsx` — keep for critical/always-tested badges, but reduce visual weight.
- `lib/skill-progress.ts` — keep localStorage progress tracking; defer Zustand mastery store for advanced modes only.

### New components
- `components/PathwayCards.tsx` — three front-door cards on the home page.
- `components/SkillSearch.tsx` — simple client-side skill search on the home page.
- `components/SchoolCard.tsx` — school list item.
- `components/SchoolSearch.tsx` — client-side school search/filter.
- `components/SchoolDetail.tsx` — school detail page content.
- `components/SimplifiedSkillChecklist.tsx` — a stripped-down checklist component for the default skill view. It should support the same `steps` data shape but render only the checkbox + step text + optional rubric, without mode toggles, scorecards, or phase badges in the default view.
- `components/GlobalDisclaimer.tsx` — footer disclaimer used on every page.
- `components/SeoMeta.tsx` or `lib/seo.ts` — metadata helpers.
- `lib/schools.ts` — load and validate `public/data/schools.json`, provide search helpers.
- `lib/compliance.ts` — disclaimer text templates.

### Pages to add/rewrite
- `app/page.tsx` — replace current `SkillIndexClient` with new three-path home page.
- `app/schools/page.tsx` — school directory.
- `app/schools/[slug]/page.tsx` — school detail.
- `app/skills/page.tsx` — optional simple skills list.
- `app/skills/[slug]/page.tsx` — simplified skill page using new checklist component.
- `app/for-graduates/page.tsx` — graduate onboarding hub.
- `app/layout.tsx` — update global metadata for public, SEO-friendly titles.
- `app/sitemap.ts` and `app/robots.ts` — SEO helpers.

### Files to remove or de-emphasize
- `components/SkillIndexClient.tsx` — replace with simpler home page.
- `components/SkillPageClient.tsx` — replace with simplified skill page; keep only for advanced modes if needed.
- `components/SkillChecklist.tsx` — keep for advanced modes, but default view uses a new simplified checklist.
- Heavy mode selectors, exam simulation, sequence drills, tolerance drills — move behind a single "Practice tools" disclosure or a separate `/skills/[slug]/practice/` route.

## 8. SEO / LLM strategy (technical only)

- **Static generation:** Use `generateStaticParams` for `/skills/[slug]/` and `/schools/[slug]/`. Pre-render all 22 skill pages and all school pages.
- **Metadata:** Export `metadata` from every page with absolute titles and descriptions.
- **JSON-LD:**
  - Home page: `WebSite` + `Organization` for LMCC only.
  - Skills list: `ItemList` of the 22 skills.
  - Skill pages: `Course` or `LearningResource` with name, description, and educationalUse.
  - School directory: generic `ItemList` or `WebPage`; do not use `EducationalOrganization` for non-LMCC schools until legal review clears it.
- **Sitemap:** Generate from skills and schools slugs.
- **Robots:** Allow all, point to sitemap.
- **Semantic HTML:** One `<h1>` per page, proper heading hierarchy, landmark regions (`<main>`, `<nav>`, `<section>`), descriptive link text.
- **Open Graph:** Unique `og:title` and `og:description` for skills and schools; shared image for LMCC brand.
- **Performance:** No new heavy dependencies; lazy-load YouTube embed; keep the JS bundle small.

## 9. Content policy summary

- **Say:** Public school code and name; general NNAAP/California testing process; official skill step wording; public GWC RTC portal link; LMCC-branded study order for LMCC students.
- **Avoid:** Any claim that another school is CDPH-approved, accredited, or recommended; any outcome or pass-rate guarantee; tuition or funding claims for other schools; other schools' logos; scraped contact details; dateless data claims.
- **Always include:** Global disclaimer in the footer; school-page source and `lastUpdated`; skill-page note that step wording matches the official evaluator checklist and students should follow their evaluator's instructions.
- See `COMPLIANCE_BRIEF.md` for full red-line content and disclaimer templates.

## 10. Open questions for implementation

1. Should the home page default to the neutral chooser, or should LMCC-student mode be the most prominent card?
2. What is the exact Vercel project name under `lmcc-pomona`? (e.g., `lmcc-cna-navigator`)
3. Will the `lmcc-website` rewrite at `/classroom/rtc-cna-navigator` be implemented in this phase or later?
4. What school fields (city, county, exam vendor) will be added later, and where will they be sourced?
5. Should the simplified skill checklist support the existing Zustand mastery store, or only the legacy `localStorage` progress for the first version?
6. Should the advanced modes (self-check, quiz, drill) live on the same page as query params, or on separate routes like `/skills/[slug]/practice/`?

## 11. Implementation decisions (post-Phase 5)

| Question | Decision | Rationale |
| --- | --- | --- |
| Home page default | Neutral chooser with the LMCC card visually emphasized (`pathway-card--lmcc`). | Keeps the resource welcoming to non-LMCC graduates while still funneling LMCC students first. |
| Vercel project name | TBD — suggested `lmcc-cna-navigator`. | Exact project name is deferred to deployment phase; the build profile is configured for the rewrite path. |
| `lmcc-website` rewrite | Deferred to a later phase. | Out of scope per user direction; the build profile is already set for `/classroom/rtc-cna-navigator` so the rewrite can be added without code changes. |
| School fields | Location data (city, county, etc.) will be provided later and appended to the existing schema. | The parser normalizes names/codes now; richer fields can be added without breaking existing slugs. |
| Progress store | Simplified checklist uses its own per-skill localStorage key and writes the legacy `skill-progress` map for "reviewed" status. | A full store collapse is deferred to a later cleanup pass; it would touch many existing tests and the study page. |
| Advanced modes | A single `<details>` disclosure (`PracticeTools`) on the skill page, not query params. | Faster first version; query-param modes can be introduced later without URL changes for the default view. |

### Blockers resolved
- **Canonical/basePath:** `NEXT_PUBLIC_BASE_PATH=/classroom/rtc-cna-navigator` and `NEXT_PUBLIC_SITE_ORIGIN=https://www.lmccpomona.com` are set in the `build:vercel` profile; the default profile keeps `/lmcc-cna-exam-prep` for GitHub Pages.
- **School slug collisions:** The parser already deduplicates by appending a numeric suffix (e.g., `academy-of-health-careers-inc`), and multi-code schools are merged into one record (e.g., `san-diego-medical-college` with 12 codes). All 469 slugs are unique.

### Residual items
- Unify the legacy `skill-progress` map and the Zustand mastery store into one source of truth.
- Replace the `PracticeTools` disclosure with crawlable `?mode=` query-param links if analytics show students share drill URLs.
- Decide whether to add `noindex,follow` to school detail pages until location/accreditation fields are added.
- Final legal review of school-directory content and structured-data policy.
