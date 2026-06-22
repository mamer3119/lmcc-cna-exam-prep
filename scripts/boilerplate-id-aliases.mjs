/** ESM mirror of lib/boilerplate-id-aliases.ts */

export const BOILERPLATE_ID_ALIASES = {
  INTROEXPLAIN: "INTRO_EXPLAIN",
  INTRO_IDENTIFY: "INTRO_IDENTIFY",
  INTROIDENTIFY: "INTRO_IDENTIFY",
  HANDHYGIENE: "HAND_HYGIENE",
  GLOVEDON: "GLOVE_DON",
  GLOVEREMOVE: "GLOVE_REMOVE",
  WATERCHECK: "WATER_CHECK",
  CALLLIGHT: "CALL_LIGHT",
  BEDLOW: "BED_LOW",
  PRIVACY: "PRIVACY",
};

export function normalizeBoilerplateIdAlias(raw) {
  if (!raw || typeof raw !== "string") {
    return undefined;
  }
  const trimmed = raw.trim();
  if (!trimmed) {
    return undefined;
  }
  if (Object.hasOwn(BOILERPLATE_ID_ALIASES, trimmed)) {
    return BOILERPLATE_ID_ALIASES[trimmed];
  }
  const compact = trimmed.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (Object.hasOwn(BOILERPLATE_ID_ALIASES, compact)) {
    return BOILERPLATE_ID_ALIASES[compact];
  }
  return trimmed;
}
