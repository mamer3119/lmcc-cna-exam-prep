/** Must match `basePath` in next.config.ts */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "/lmcc-cna-exam-prep";

export function assetPath(relativePath: string): string {
  const clean = relativePath.replace(/^\/+/, "");
  if (!BASE_PATH) {
    return `/${clean}`;
  }
  return `${BASE_PATH}/${clean}`;
}

/**
 * For `next/link` href — Next.js prepends `basePath` automatically.
 * Do not use `assetPath()` here or links double-prefix on GitHub Pages.
 */
export function appPath(relativePath: string): string {
  const clean = relativePath.replace(/^\/+/, "");
  return `/${clean}`;
}

/**
 * For sitemaps, canonical URLs, and JSON-LD.
 * Includes the basePath so the generated URL matches the actual public path.
 */
export function canonicalPath(relativePath: string): string {
  const clean = relativePath.replace(/^\/+/, "");
  if (!BASE_PATH) {
    return `/${clean}`;
  }
  return clean ? `${BASE_PATH}/${clean}` : `${BASE_PATH}/`;
}
