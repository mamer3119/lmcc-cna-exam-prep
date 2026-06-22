#!/usr/bin/env node
/**
 * HTTP smoke probe — top routes must not 500 or return error HTML.
 * Also asserts SSR HTML contains expected markers (not just HTTP 200).
 * Usage: node scripts/probe-routes.mjs [baseUrl]
 * Default: http://localhost:3005
 *
 * Note: client hydration throws (e.g. Zustand snapshot loops) require
 * tests/skill-checklist-store-render.test.tsx — this probe catches SSR only.
 */

const base = process.argv[2]?.replace(/\/$/, "") ?? "http://localhost:3005";
const prefix = "/lmcc-cna-exam-prep";

const routes = [
  {
    path: `${prefix}/`,
    mustInclude: ["Interactive Skill Checklists", "Infection Control"],
  },
  {
    path: `${prefix}/study/`,
    mustInclude: ["study-page", "Official Checklist"],
  },
  {
    path: `${prefix}/study/?instructor=true`,
    mustInclude: ["study-page", "Official Checklist"],
  },
  {
    path: `${prefix}/framework/`,
    mustInclude: ["Clinical Field Guide", "OPEN"],
  },
  {
    path: `${prefix}/framework/pathway/`,
    mustInclude: ["22 skills", "Infection Control"],
  },
  {
    path: `${prefix}/skills/hand-hygiene/`,
    mustInclude: ["Hand Hygiene (Hand Washing)", "skill-checklist"],
  },
  {
    path: `${prefix}/skills/ppe-gown-gloves/`,
    mustNotInclude: ["/lmcc-cna-exam-prep/lmcc-cna-exam-prep/"],
    mustInclude: ["see Skill 1"],
  },
  {
    path: `${prefix}/skills/ppe-gown-gloves/?instructor=true`,
    mustInclude: ["Applying and Removing", "skill-checklist"],
  },
];

const errorPatterns = [
  /Internal Server Error/i,
  /Application error/i,
  /getServerSnapshot should be cached/i,
];

let failed = 0;

for (const { path: route, mustInclude = [], mustNotInclude = [] } of routes) {
  const url = `${base}${route}`;
  let routeFailed = false;
  try {
    const res = await fetch(url);
    const html = await res.text();
    if (!res.ok) {
      console.error(`FAIL ${url} — HTTP ${res.status}`);
      routeFailed = true;
    }
    for (const pattern of errorPatterns) {
      if (pattern.test(html)) {
        console.error(`FAIL ${url} — body matches ${pattern}`);
        routeFailed = true;
      }
    }
    if (html.length < 500) {
      console.error(
        `FAIL ${url} — suspiciously short body (${html.length} bytes)`,
      );
      routeFailed = true;
    }
    for (const needle of mustInclude) {
      if (!html.includes(needle)) {
        console.error(`FAIL ${url} — missing expected content: "${needle}"`);
        routeFailed = true;
      }
    }
    for (const forbidden of mustNotInclude) {
      if (html.includes(forbidden)) {
        console.error(
          `FAIL ${url} — forbidden content present: "${forbidden}"`,
        );
        routeFailed = true;
      }
    }
    if (!routeFailed) {
      console.log(`OK ${url} (${res.status}, ${html.length} bytes)`);
    }
  } catch (err) {
    console.error(`FAIL ${url} — ${err instanceof Error ? err.message : err}`);
    routeFailed = true;
  }
  if (routeFailed) {
    failed += 1;
  }
}

if (failed) {
  console.error(`${failed} route probe failure(s)`);
  process.exit(1);
}

console.log("probe-routes: all routes OK");
