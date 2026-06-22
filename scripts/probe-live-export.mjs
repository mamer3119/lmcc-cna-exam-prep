#!/usr/bin/env node
/**
 * Probe GitHub Pages static export — index, all 22 skill routes, chunk assets.
 * Usage: node scripts/probe-live-export.mjs [--verbose]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const skillsPath = path.join(root, "data", "skills.json");
const base = "https://mamer3119.github.io";
const basePath = "/lmcc-cna-exam-prep";
const verbose = process.argv.includes("--verbose");

const { skills } = JSON.parse(fs.readFileSync(skillsPath, "utf8"));
const slugs = skills.map((s) => s.slug).sort();

const pages = [
  `${basePath}/`,
  `${basePath}/study/`,
  ...slugs.map((slug) => `${basePath}/skills/${slug}/`),
];

/** @type {{ path: string; status: number; assetsOk: boolean; bytes: number; fail?: string }[]} */
const results = [];

for (const page of pages) {
  const url = base + page;
  let res;
  try {
    res = await fetch(url);
  } catch (err) {
    results.push({
      path: page,
      status: 0,
      assetsOk: false,
      bytes: 0,
      fail: String(err),
    });
    continue;
  }

  const html = await res.text();
  const refs = [
    ...html.matchAll(
      /(?:href|src)="(\/lmcc-cna-exam-prep\/_next\/static\/[^"]+)"/g,
    ),
  ].map((m) => m[1]);

  let assetsOk = true;
  const assetFails = [];
  for (const ref of refs) {
    const asset = await fetch(base + ref, { method: "HEAD" });
    if (!asset.ok) {
      assetsOk = false;
      assetFails.push(`${asset.status} ${ref.slice(-56)}`);
    }
  }

  results.push({
    path: page,
    status: res.status,
    assetsOk,
    bytes: html.length,
    fail:
      res.status !== 200 ?
        `HTTP ${res.status}`
      : !assetsOk ?
        assetFails.join("; ")
      : undefined,
  });

  if (verbose) {
    console.log(`\n${page} (${res.status}) — ${refs.length} asset refs`);
    for (const ref of refs) {
      const asset = await fetch(base + ref, { method: "HEAD" });
      const flag = asset.ok ? "OK" : `FAIL ${asset.status}`;
      console.log(`  ${flag} ${ref.slice(-72)}`);
    }
  }
}

const skillResults = results.filter((r) => r.path.startsWith(`${basePath}/skills/`));
const skillOk = skillResults.filter((r) => r.status === 200 && r.assetsOk).length;

console.log("\n| Route | HTTP | Assets | Bytes |");
console.log("| --- | ---: | --- | ---: |");
for (const row of results) {
  const slug = row.path.replace(`${basePath}/skills/`, "").replace(/\/$/, "") || "(index)";
  const label =
    row.path === `${basePath}/` ? "index"
    : row.path === `${basePath}/study/` ? "study"
    : slug;
  const assets = row.assetsOk ? "OK" : "FAIL";
  const status = row.status || "ERR";
  console.log(`| ${label} | ${status} | ${assets} | ${row.bytes} |`);
}

console.log(`\nSkill routes: ${skillOk}/${slugs.length} OK (200 + chunks)`);

const failures = results.filter((r) => r.status !== 200 || !r.assetsOk);
if (failures.length > 0) {
  console.error("\nFailures:");
  for (const f of failures) {
    console.error(`  ${f.path}: ${f.fail ?? "unknown"}`);
  }
  process.exit(1);
}

console.log("probe-live-export: OK");
