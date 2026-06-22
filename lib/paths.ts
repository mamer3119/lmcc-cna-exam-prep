/** Must match `basePath` in next.config.ts */
export const BASE_PATH = "/lmcc-cna-exam-prep";

export function assetPath(relativePath: string): string {
  const clean = relativePath.replace(/^\/+/, "");
  return `${BASE_PATH}/${clean}`;
}
