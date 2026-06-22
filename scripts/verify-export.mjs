import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "out");
const basePath = "/lmcc-cna-exam-prep";

function walk(dir) {
  const entries = [];
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, name.name);
    if (name.isDirectory()) entries.push(...walk(full));
    else if (name.name.endsWith(".html")) entries.push(full);
  }
  return entries;
}

function assetRefsFromHtml(html) {
  const refs = new Set();
  const patterns = [
    /href="(\/lmcc-cna-exam-prep\/_next\/static\/[^"]+)"/g,
    /src="(\/lmcc-cna-exam-prep\/_next\/static\/[^"]+)"/g,
  ];
  for (const pattern of patterns) {
    for (const match of html.matchAll(pattern)) {
      refs.add(match[1]);
    }
  }
  return refs;
}

function resolveAssetPath(ref) {
  const rel = ref.slice(basePath.length + 1);
  const decoded = decodeURIComponent(rel);
  const candidates = [rel, decoded].map((segment) =>
    path.join(outDir, ...segment.split("/")),
  );
  return candidates.find((candidate) => fs.existsSync(candidate));
}

const missing = new Set();

for (const htmlPath of walk(outDir)) {
  const html = fs.readFileSync(htmlPath, "utf8");
  if (/Internal Server Error/i.test(html)) {
    console.error(
      `Export verification failed. Error page HTML: ${path.relative(root, htmlPath)}`,
    );
    process.exit(1);
  }
  for (const ref of assetRefsFromHtml(html)) {
    if (!resolveAssetPath(ref)) {
      missing.add(ref);
    }
  }
}

if (missing.size > 0) {
  console.error("Export verification failed. Missing assets:");
  for (const item of missing) console.error(`  - ${item}`);
  console.error(
    "\nTip: run `pnpm build` (postbuild runs fix-export-paths). On GitHub Pages, deploy must include mirrored %5Bslug%5D folders.",
  );
  process.exit(1);
}

console.log(
  `Export OK — ${walk(outDir).length} HTML files, all _next assets present.`,
);
