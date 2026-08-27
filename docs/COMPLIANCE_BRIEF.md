# Compliance Brief — CNA Navigator (LMCC-only variant)

**Date:** 2026-08-27
**Variant:** This copy is the LMCC-student-only build. The California school directory and non-LMCC pages are removed. See the parent project for the full public resource compliance brief.
**Scope:** LMCC-branded study resource for Lotus Medical Career College students and graduates, covering the 22 official California CNA skills and general testing guidance.
**Status:** Safe-default build-time guardrails only. Legal/compliance sign-off is deferred to a later phase as requested.

## 1. What this resource is allowed to state

### School directory
- **Publicly available identifiers** from the Golden West College Regional Testing Center (GWC RTC) candidate portal:
  - CDPH/GWC RTC alphanumeric code (e.g., `E28`, `S1642`)
  - School or facility name as it appears in the public dropdown
  - Link to the source portal: `https://crm.cccd.edu/register/gwc_rtc`
- **General testing context** that is true for all California CNA candidates:
  - California uses the National Nurse Aide Assessment Program (NNAAP) written and skills evaluation.
  - Candidates must complete a CDPH-approved training program before testing.
  - Registration for testing is handled through the GWC RTC portal for schools that use GWC RTC as their testing center.
- **LMCC-specific path** when the user self-identifies as an LMCC student:
  - Link to LMCC program details, schedule, or contact page on `lmccpomona.com`.
  - LMCC-specific study order or recommended skill sequence.

### Skill content
- Official step wording and exam numbers from the California CDPH/NNAAP skill checklist.
- Publicly available RTC demonstration video links (YouTube).
- Study tips and common mistake notes based on the `CNA-STATE-TEST-STUDY-GUIDE.md` and `CNA-SKILL-CLUSTERS.md` pedagogical content.
- Clear attribution that step wording is sourced from the official state evaluator checklist.

## 2. Red-line content — never include

| Category | Red-line | Safe replacement |
| --- | --- | --- |
| **Accreditation / approval** | “This school is CDPH-approved.” | “This code appears in the public GWC RTC registration dropdown as of [date].” |
| **Outcome guarantees** | “Study here and you will pass.” | “Practice the official steps; results depend on your preparation and evaluator scoring.” |
| **School comparison** | “LMCC is better than X.” or “X is the best school.” | No comparative language. List facts only. |
| **Legal advice** | “You must register with GWC RTC.” | “If your program uses GWC RTC for testing, registration is at [portal]. Verify with your program.” |
| **Tuition/funding claims about other schools** | “X school is free with WIOA.” | No tuition or funding claims about other schools. |
| **Logos / branding** | Other schools’ logos or proprietary images. | Text name only; no logos. |
| **Contact information not publicly sourced** | Phone, email, address scraped from unofficial sources. | Omit or use only information the school itself publishes or the user provides later. |
| **Stale data presented as current** | Any dateless claim about code mappings. | Always show a `lastUpdated` date and a source link. |

## 3. Required disclaimers

### Global footer / every page
```text
This is a free study and directory resource. It is not a California Department of Public Health (CDPH) or Regional Testing Center website. Always verify your program code, exam date, and registration requirements with your school and the official testing portal.
```

### School detail page
```text
Data source: Golden West College Regional Testing Center candidate registration portal. School codes and names change; verify directly with your program and the official portal before registering. Last updated: [DATE].
```

### Skill page
```text
Step wording reflects the official California CNA evaluator checklist used by LMCC students. Always follow the instructions given by your evaluator on exam day. Clinical notes are study aids, not a substitute for your training program.
```

### LMCC-specific page
```text
LMCC students: this study order is recommended by Lotus Medical Career College faculty. Non-LMCC visitors can use the same free resources, but follow your own program’s requirements first.
```

## 4. Data sourcing and freshness policy

1. **Primary source:** `GWC RTC CNA Training Programs.md` (exported from `https://crm.cccd.edu/register/gwc_rtc`).
2. **Secondary context:** CDPH public pages and NNAAP documentation for general testing requirements.
3. **Freshness:** Every school listing must include a `lastUpdated` field rendered on the page.
4. **Schema:** `public/data/schools.json` will carry a top-level `lastUpdated` ISO date and per-school `source` + `sourceUrl` fields.
5. **Updates:** When the user provides new school details (locations, etc.), append them; do not overwrite the existing public code/name pairs without a new export from the source portal.

## 5. LMCC vs. non-LMCC affiliation

- The site is branded as a Lotus Medical Career College resource.
- Non-LMCC graduates are explicitly welcomed (“free for all California CNA graduates”).
- No page should imply that LMCC endorses, accredits, or guarantees outcomes for any other school.
- The school directory is a **neutral lookup tool**, not a recommendation engine.

## 6. SEO / LLM crawlability guardrails

- Use factual, verifiable strings in titles and meta descriptions.
- Avoid superlatives (“best CNA school”, “top program”) for any school other than LMCC, and even for LMCC use only claims that are already present in LMCC-approved marketing copy.
- Include `EducationalOrganization` JSON-LD only for LMCC itself; for other schools, use a generic `ItemList` or `WebPage` structure, or omit structured data until legal review clears it.
- Always expose the disclaimer in visible HTML (not hidden behind a `<details>` default-closed block) so crawlers and users both see it.

## 7. Build-time compliance checklist (for every page)

- [ ] No absolute outcome or placement guarantee.
- [ ] No fabricated salary, pass rate, or completion statistic.
- [ ] No accreditation/approval claim about another school.
- [ ] No tuition or funding claim about another school.
- [ ] No other school logo or proprietary image.
- [ ] Every school listing has a `lastUpdated` date and source link.
- [ ] Global disclaimer appears in the footer.
- [ ] LMCC affiliation is clear but not overstated on non-LMCC pages.

## 8. Deferrals to later compliance review

- Final legal sign-off on listing other California schools.
- Determination of whether city/county/location data for other schools requires additional disclaimers.
- Whether structured data (`EducationalOrganization`) may be used for non-LMCC schools.
- Whether linking directly to individual school websites is permitted before verifying the links.
