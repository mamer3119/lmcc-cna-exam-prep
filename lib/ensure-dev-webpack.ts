export type DevWebpackClearInput = {
  nextExists: boolean;
  outExists: boolean;
  exportStampExists: boolean;
  hasProductionWebpackCache: boolean;
};

export function shouldClearNextForDev(input: DevWebpackClearInput): boolean {
  return (
    (input.outExists && input.nextExists) ||
    (input.exportStampExists && input.nextExists) ||
    input.hasProductionWebpackCache
  );
}

/** Paths that indicate a static export / production build touched `.next`. */
export function productionWebpackCacheMarkers(nextDirPath: string): string[] {
  return [
    `${nextDirPath}/cache/webpack/client-production`,
    `${nextDirPath}/cache/webpack/server-production`,
    `${nextDirPath}/export-detail.json`,
  ];
}

export function detectProductionWebpackCache(
  nextDirPath: string,
  exists: (path: string) => boolean,
): boolean {
  if (!exists(nextDirPath)) {
    return false;
  }
  return productionWebpackCacheMarkers(nextDirPath).some(exists);
}
