/** Must match `basePath` in next.config.ts */
export const BASE_PATH = "/lmcc-cna-exam-prep";

export function assetPath(relativePath: string): string {
  const clean = relativePath.replace(/^\/+/, "");
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
