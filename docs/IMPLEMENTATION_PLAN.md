# Implementation Plan — CNA Navigator Simplification (LMCC-only variant)

**Date:** 2026-08-27
**Project:** `C:\Users\moham\Desktop\22 LMCC Students\local-checklist-preview`
**Variant:** LMCC-student-only build. The California school directory and non-LMCC flows are removed; they will be built as the "22 For California" variant.
**Target public URL:** TBD — suggest a separate path under `lmccpomona.com` for LMCC students only (e.g., `/classroom/rtc-cna-navigator-lmcc`).
**Vercel team:** `lmcc-pomona`

## 1. Scope and goals

Build the LMCC-student-only variant inside a new copy of the project. This variant removes the California school directory and non-LMCC flows so the product is focused on Lotus Medical Career College students and graduates.

**Primary deliverables:**
- LMCC-focused home page
- Simplified skill checklist page
- Post-graduation onboarding hub
- SEO/LLM crawlability (sitemap, JSON-LD, semantic HTML)
- Global disclaimers and compliance-safe content

**Out of scope for this variant:**
- California school directory or non-LMCC school pages (see parent project and the planned "22 For California" variant)
- Marketing copy / keyword strategy
- Compliance/legal sign-off
- lmcc-website rewrite configuration

## 2. Architecture decisions

| Decision | Rationale |
| --- | --- |
| **Keep project separate** | Avoids merging two different Next.js conventions, package managers, and test suites. |
| **Static export remains default** | Existing build pipeline (`output: "export"`) and GitHub Pages deployment continue to work. |
| **Build-time basePath via env var** | `NEXT_PUBLIC_BASE_PATH` defaults to `/lmcc-cna-exam-prep` for GitHub Pages; can be empty for Vercel. |
| **School data committed as JSON** | Parse the GWC RTC markdown once into `public/data/schools.json`; future updates replace the file. |
| **Reuse existing skill data** | `data/skills.json` and `lib/skills.ts` stay unchanged. New pages consume them. |
| **New simplified checklist component** | The existing `SkillChecklist.tsx` is too complex for the default view; a new component handles the default case. |

## 3. Data preparation

### File: `data/schools.json`

Generate once from `C:\Users\moham\Desktop\22 Skills TXT\California School Directory\GWC RTC CNA Training Programs.md` and import at build time from `lib/schools.ts`.

Schema:

```json
{
  "lastUpdated": "2026-08-27",
  "source": "Golden West College Regional Testing Center candidate registration portal",
  "sourceUrl": "https://crm.cccd.edu/register/gwc_rtc",
  "schools": [
    {
      "slug": "lotus-medical-career-college",
      "codes": ["E28", "S1642", "S1643"],
      "name": "LOTUS MEDICAL CAREER COLLEGE",
      "region": "Southern California",
      "testingCenter": "Golden West College Regional Testing Center (GWC RTC)"
    }
  ]
}
```

Slug generation: lowercase, strip special characters, collapse spaces to hyphens, deduplicate if needed (e.g., append code suffix for duplicate names).

### File: `scripts/parse-school-directory.mjs` (optional)

A one-time script to parse the markdown table and emit `data/schools.json`. This is not required to run at build time; it is a development utility.

## 4. New library files

### `lib/schools.ts`

```typescript
export type School = {
  slug: string;
  codes: string[];
  name: string;
  region?: string;
  testingCenter: string;
};

export type SchoolDirectory = {
  lastUpdated: string;
  source: string;
  sourceUrl: string;
  schools: School[];
};

export function getSchoolDirectory(): SchoolDirectory;
export function getAllSchools(): School[];
export function getSchoolBySlug(slug: string): School | undefined;
export function searchSchools(query: string): School[];
```

### `lib/seo.ts`

Metadata helpers and JSON-LD builders:

```typescript
export const SITE_ORIGIN: string;
export function homeMetadata(): Metadata;
export function skillsListMetadata(): Metadata;
export function skillMetadata(skill: WebSkill): Metadata;
export function schoolsListMetadata(): Metadata;
export function schoolMetadata(school: School): Metadata;
export function graduatesMetadata(): Metadata;
export function jsonLdWebSite(): Record<string, unknown>;
export function jsonLdOrganization(): Record<string, unknown>;
export function jsonLdItemList(items: { name: string; url: string }[]): Record<string, unknown>;
export function jsonLdLearningResource(skill: WebSkill): Record<string, unknown>;
export function jsonLdWebPage(title: string, description: string, path: string): Record<string, unknown>;
```

### `lib/compliance.ts`

Disclaimer strings used across pages:

```typescript
export const GLOBAL_DISCLAIMER = "...";
export const SCHOOL_DETAIL_DISCLAIMER = (lastUpdated: string) => "...";
export const SKILL_DISCLAIMER = "...";
export const LMCC_STUDENT_NOTE = "...";
```

## 5. New components

### `components/PathwayCards.tsx` (client)

Three front-door cards. Accepts no props beyond children/links. Use existing Tailwind color tokens and fonts.

### `components/SkillSearch.tsx` (client)

Simple search input + filtered list of skill links. Uses `lib/skills.ts`.

### `components/SchoolCard.tsx`

Server-friendly card for a school listing. Displays name, codes, and a link.

### `components/SchoolSearch.tsx` (client)

Search/filter input for school directory. Filters the already-loaded schools client-side.

### `components/SchoolDetail.tsx`

Server component for school detail page content. Includes disclaimer.

### `components/SimplifiedSkillChecklist.tsx` (client)

Default skill checklist. Responsibilities:
- Render one checkbox per step.
- Show `detailedText` as helper text below the cue.
- Persist checked state to `localStorage` using the skill's `storageKey`.
- Emit a single "Mark as reviewed" action when all steps are checked.
- Do not render mode toggles, scorecards, phase badges, or drill controls in the default view.

Props:

```typescript
type SimplifiedSkillChecklistProps = {
  skill: WebSkill;
};
```

### `components/GlobalDisclaimer.tsx`

Server component that renders the global disclaimer footer. Included in every public page.

### `components/PracticeTools.tsx` (client)

Progressive-disclosure panel for advanced modes: self-check, quiz, sequence drill. Only rendered when the user expands it.

### `components/JsonLd.tsx` (server)

Renders `<script type="application/ld+json">` tags from structured data objects. Used by public pages for WebSite, Organization, ItemList, LearningResource, and WebPage JSON-LD.

## 6. Refactored pages

### `app/page.tsx`

Replace the current server component that renders `SkillIndexClient` with a new server component:

```tsx
import PathwayCards from "@/components/PathwayCards";
import SkillSearch from "@/components/SkillSearch";
import GlobalDisclaimer from "@/components/GlobalDisclaimer";
import JsonLd from "@/components/JsonLd";
import { homeMetadata, jsonLdOrganization, jsonLdWebSite } from "@/lib/seo";

export const metadata = homeMetadata();

export default function HomePage() {
  return (
    <>
      <JsonLd data={[jsonLdWebSite(), jsonLdOrganization()]} />
      <main>
        <PathwayCards />
        <SkillSearch />
        <GlobalDisclaimer />
      </main>
    </>
  );
}
```

### `app/layout.tsx`

- Keep existing fonts and viewport.
- Update `metadata.title` and `metadata.description` to the public-facing positioning.
- Add `jsonLdWebSite()` script on the home page only (or in layout with `dangerouslySetInnerHTML` if Next.js metadata doesn't support it directly).
- Keep `ClientProviders` only if required by existing components that are reused.

### `app/skills/[slug]/page.tsx`

Replace `SkillPageView` with a new simplified server component:

```tsx
import { notFound } from "next/navigation";
import { getAllSkills, getSkillBySlug } from "@/lib/skills";
import SimplifiedSkillChecklist from "@/components/SimplifiedSkillChecklist";
import PracticeTools from "@/components/PracticeTools";
import GlobalDisclaimer from "@/components/GlobalDisclaimer";
import { skillMetadata } from "@/lib/seo";

export const dynamic = "force-static";

export function generateStaticParams() {
  return getAllSkills().map((skill) => ({ slug: skill.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const skill = getSkillBySlug(slug);
  if (!skill) return { title: "Skill not found" };
  return skillMetadata(skill);
}

export default async function SkillPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const skill = getSkillBySlug(slug);
  if (!skill) notFound();

  return (
    <main>
      <h1>{skill.title}</h1>
      <p>{skill.examCardLabel}</p>
      <SimplifiedSkillChecklist skill={skill} />
      <PracticeTools skill={skill} />
      <GlobalDisclaimer />
    </main>
  );
}
```

The old `SkillPageView` and `SkillPageClient` are no longer imported here but remain in the repo for advanced modes if needed later.

### `app/skills/page.tsx` (new)

Simple list of all 22 skills with links. Static metadata.

### `app/schools/page.tsx` (new)

Server component loads `getAllSchools()` and renders `SchoolSearch` + `SchoolCard` grid. Static metadata.

### `app/schools/[slug]/page.tsx` (new)

```tsx
export const dynamic = "force-static";

export function generateStaticParams() {
  return getAllSchools().map((school) => ({ slug: school.slug }));
}

export async function generateMetadata({ params }) {
  const school = getSchoolBySlug((await params).slug);
  return schoolMetadata(school);
}

export default async function SchoolPage({ params }) {
  const school = getSchoolBySlug((await params).slug);
  if (!school) notFound();
  return <SchoolDetail school={school} />;
}
```

### `app/for-graduates/page.tsx` (new)

Post-graduation onboarding hub. Explains the three paths, links to schools and skills. Static metadata.

### `app/sitemap.ts` (new)

Generate sitemap entries for home, skills, schools, and for-graduates.

### `app/robots.ts` (new)

Allow all, point to sitemap.

## 7. Configuration changes

### `next.config.ts`

Introduce `NEXT_PUBLIC_BASE_PATH`:

```typescript
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "/lmcc-cna-exam-prep";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",
  basePath,
  assetPrefix: basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  redirects() { ... },
};
```

For GitHub Pages (default): keep `/lmcc-cna-exam-prep` and `NEXT_PUBLIC_SITE_ORIGIN=https://mamer3119.github.io`.
For Vercel rewrite under `lmcc-website`: set `NEXT_PUBLIC_BASE_PATH=/classroom/rtc-cna-navigator` and `NEXT_PUBLIC_SITE_ORIGIN=https://www.lmccpomona.com` during build. This keeps asset paths under the rewrite prefix so the `lmcc-website` rewrite catches everything and canonical URLs point to the public path.

### `package.json`

Add a convenience script for Vercel build:

```json
{
  "build:vercel": "cross-env NEXT_PUBLIC_BASE_PATH=/classroom/rtc-cna-navigator NEXT_PUBLIC_SITE_ORIGIN=https://www.lmccpomona.com next build"
}
```

Add `cross-env` as a dev dependency if not already present.

## 8. Styling approach

- Use the existing Tailwind config and CSS variables.
- Keep the existing white + navy + gold institutional palette.
- Add minimal new utility classes for the three-path cards and simplified checklist.
- Avoid glassmorphism, heavy shadows, or overly decorative gradients.
- Ensure touch targets are at least 44px.

## 9. Testing plan

### Unit tests

- `tests/lib/schools.test.ts` — validate directory parsing, slug uniqueness, search.
- `tests/lib/seo.test.ts` — validate metadata output and JSON-LD shape.
- `tests/components/SimplifiedSkillChecklist.test.tsx` — checkbox interaction, localStorage, "mark reviewed" flow.
- Update or remove tests that assert the old home page structure (e.g., `tests/branding.test.ts` if it checks for old CTAs).

### E2E / smoke tests

- `e2e/home-paths.spec.ts` — verify three front-door paths render.
- `e2e/skill-simplified.spec.ts` — verify default checklist renders, no advanced mode UI by default.
- `e2e/school-directory.spec.ts` — verify search and detail page.
- `e2e/seo.spec.ts` — verify sitemap, robots, meta tags, JSON-LD.

### Build verification

- `pnpm build` with default basePath.
- `pnpm build:vercel` with empty basePath.
- `pnpm test` (all existing tests that still apply).
- `pnpm verify:export`.

## 10. Deployment plan

1. **Local verification:** Run `pnpm dev:clean`, `pnpm test`, `pnpm build`.
2. **GitHub Pages (existing):** Continue deploying to `https://mamer3119.github.io/lmcc-cna-exam-prep/` with default basePath.
3. **Vercel project:** Create a new project under `lmcc-pomona` team, connect the repo, set build command to `pnpm build:vercel` and output directory to `out/`.
4. **Custom domain:** Configure `cna-navigator.lmccpomona.com` or similar to point to the Vercel project.
5. **lmcc-website rewrite:** In `C:\Users\moham\Desktop\lmcc-website\next.config.ts` or `vercel.json`, add a rewrite from `/classroom/rtc-cna-navigator` to the Vercel deployment URL. This is a separate task and can be done after the app is live.

## 11. Migration and rollback

- The old home page components (`SkillIndexClient`, `SkillPageClient`, `SkillPageView`) remain in the repo but are no longer imported by the default pages. They can be deleted in a later cleanup PR if desired.
- The `/study/` page and advanced drill components remain untouched for now.
- If a rollback is needed, revert `app/page.tsx` and `app/skills/[slug]/page.tsx` to their previous imports.

## 12. Risks and mitigation

| Risk | Mitigation |
| --- | --- |
| Existing tests break | Run full test suite before and after; update tests that assert old page structure. |
| Static export fails with 700 school pages | `generateStaticParams` is fine; verify build time. |
| basePath mismatch on Vercel | Use `NEXT_PUBLIC_BASE_PATH` env var; test both build profiles. |
| School slugs collide | Deduplicate by appending a code suffix in the parser. |
| Compliance claim slips through | Add a build-time content scan for red-line phrases; include disclaimers in every page component. |
| lmcc-website rewrite delayed | App can ship on its own Vercel URL first; rewrite is additive. |

## 13. File change summary

### New files
- `data/schools.json`
- `scripts/parse-school-directory.mjs` (development utility)
- `lib/schools.ts`
- `lib/seo.ts`
- `lib/compliance.ts`
- `components/PathwayCards.tsx`
- `components/SkillSearch.tsx`
- `components/SchoolCard.tsx`
- `components/SchoolSearch.tsx`
- `components/SchoolDetail.tsx`
- `components/SimplifiedSkillChecklist.tsx`
- `components/PracticeTools.tsx`
- `components/GlobalDisclaimer.tsx`
- `components/JsonLd.tsx`
- `app/skills/page.tsx`
- `app/schools/page.tsx`
- `app/schools/[slug]/page.tsx`
- `app/for-graduates/page.tsx`
- `app/sitemap.ts`
- `app/robots.ts`
- `tests/lib/schools.test.ts`
- `tests/lib/seo.test.ts`
- `tests/lib/paths.test.ts`
- `tests/components/PathwayCards.test.tsx`
- `tests/components/SkillSearch.test.tsx`
- `tests/components/SchoolCard.test.tsx`
- `tests/components/SchoolSearch.test.tsx`
- `tests/components/SimplifiedSkillChecklist.test.tsx`
- `tests/components/PracticeTools.test.tsx`
- `tests/app/for-graduates.test.tsx`
- `e2e/navigator-flows.spec.ts`
- `e2e/seo.spec.ts`

### Modified files
- `app/page.tsx`
- `app/layout.tsx`
- `app/skills/[slug]/page.tsx`
- `lib/paths.ts` (added `canonicalPath` for SEO URLs)
- `next.config.ts` (basePath from env var)
- `package.json` (new `build:vercel` script + `cross-env` dependency)
- `app/globals.css` (minimal new utilities)

### De-emphasized (not deleted yet)
- `components/SkillIndexClient.tsx`
- `components/SkillPageClient.tsx`
- `components/SkillPageView.tsx`
- `components/SkillChecklist.tsx` (still used by advanced modes if kept)
