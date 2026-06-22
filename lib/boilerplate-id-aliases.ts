/**
 * Legacy / export alias → canonical CHECKLIST_BOILERPLATE keys (underscore form).
 * Used when diffing Headmaster exports (GLOVEDON) against skills.json (GLOVE_DON).
 */
export const BOILERPLATE_ID_ALIASES = {
  INTROEXPLAIN: "INTRO_EXPLAIN",
  INTRO_IDENTIFY: "INTRO_IDENTIFY",
  INTROIDENTIFY: "INTRO_IDENTIFY",
  HANDHYGIENE: "HAND_HYGIENE",
  GLOVEDON: "GLOVE_DON",
  GLOVEREMOVE: "GLOVE_REMOVE",
  GLOVEREMOVETHENHH: "GLOVE_REMOVE_THEN_HH",
  WATERCHECK: "WATER_CHECK",
  CALLLIGHT: "CALL_LIGHT",
  BEDLOW: "BED_LOW",
  PRIVACY: "PRIVACY",
} as const;

export type CanonicalBoilerplateId =
  (typeof BOILERPLATE_ID_ALIASES)[keyof typeof BOILERPLATE_ID_ALIASES];

/** Normalize legacy concat IDs (GLOVEDON) to canonical keys (GLOVE_DON). */
export function normalizeBoilerplateIdAlias(
  raw: string | undefined | null,
): string | undefined {
  if (!raw || typeof raw !== "string") {
    return undefined;
  }
  const trimmed = raw.trim();
  if (!trimmed) {
    return undefined;
  }
  if (trimmed in BOILERPLATE_ID_ALIASES) {
    return BOILERPLATE_ID_ALIASES[
      trimmed as keyof typeof BOILERPLATE_ID_ALIASES
    ];
  }
  const compact = trimmed.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (compact in BOILERPLATE_ID_ALIASES) {
    return BOILERPLATE_ID_ALIASES[
      compact as keyof typeof BOILERPLATE_ID_ALIASES
    ];
  }
  return trimmed;
}
