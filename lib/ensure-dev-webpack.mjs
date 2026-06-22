/** @typedef {{ nextExists: boolean; outExists: boolean; exportStampExists: boolean; hasProductionWebpackCache: boolean }} DevWebpackClearInput */

/**
 * @param {DevWebpackClearInput} input
 */
export function shouldClearNextForDev(input) {
  return (
    (input.outExists && input.nextExists) ||
    (input.exportStampExists && input.nextExists) ||
    input.hasProductionWebpackCache
  );
}

/**
 * @param {string} nextDirPath
 * @returns {string[]}
 */
export function productionWebpackCacheMarkers(nextDirPath) {
  return [
    `${nextDirPath}/cache/webpack/client-production`,
    `${nextDirPath}/cache/webpack/server-production`,
    `${nextDirPath}/export-detail.json`,
  ];
}

/**
 * @param {string} nextDirPath
 * @param {(path: string) => boolean} exists
 */
export function detectProductionWebpackCache(nextDirPath, exists) {
  if (!exists(nextDirPath)) {
    return false;
  }
  return productionWebpackCacheMarkers(nextDirPath).some(exists);
}
