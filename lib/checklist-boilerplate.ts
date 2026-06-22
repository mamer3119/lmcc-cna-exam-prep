/**
 * Canonical OPEN/CLOSE boilerplate — schema 2026.1 (Normalized & Standardized).
 * Single source of truth; render via boilerplateId + resolveStepDisplayText.
 */

export const CHECKLIST_BOILERPLATE = {
  INTRO_EXPLAIN:
    "Introduce yourself by name and title, explain the procedure to the patient in clear, plain language, and obtain verbal consent before proceeding.",
  INTRO_IDENTIFY:
    "Introduce yourself by name and title, and verify the patient's identity using two identifiers (name and date of birth or wristband ID).",
  PRIVACY:
    "Provide for patient privacy (close the curtain, door, or privacy screen).",
  HAND_HYGIENE:
    "Perform hand hygiene using the six-step technique for a minimum of 20 seconds with soap and water, or use an alcohol-based hand rub when hands are visibly clean.",
  GLOVE_DON: "Don clean, non-sterile gloves.",
  GLOVE_REMOVE:
    "Remove gloves by turning them inside out — grasp the outside of one glove at the wrist and peel it off, then slide the fingers of the ungloved hand under the remaining glove at the wrist and peel it off turning inside out. Dispose of both gloves in the appropriate waste container without touching the outer surface.",
  GLOVE_REMOVE_THEN_HH:
    "Remove gloves by turning them inside out — grasp the outside of one glove at the wrist and peel it off, then slide the fingers of the ungloved hand under the remaining glove at the wrist and peel it off turning inside out. Dispose of both gloves in the appropriate waste container without touching the outer surface. Then perform hand hygiene using the six-step technique for a minimum of 20 seconds with soap and water, or use an alcohol-based hand rub when hands are visibly clean.",
  CALL_LIGHT:
    "Place the call light (or signaling device) within reach of the patient and confirm the patient knows how to use it.",
  BED_LOW:
    "Lower the bed to its lowest position and verify the bed brakes are locked.",
  WATER_CHECK:
    "Fill the basin with warm water. Verify the temperature is safe and comfortable (approximately 105–110°F / 40–43°C) using a thermometer or by having the patient test with their hand or a wet washcloth placed on the back of their hand.",
} as const;

/** Legacy Headmaster / pre-2026 strings → 2026 canonical */
const EXACT_REPLACEMENTS = new Map<string, string>([
  [
    "Introduce self and explain the procedure to the patient.",
    CHECKLIST_BOILERPLATE.INTRO_EXPLAIN,
  ],
  [
    "Introduce yourself and explain the procedure to the patient.",
    CHECKLIST_BOILERPLATE.INTRO_EXPLAIN,
  ],
  [
    "Introduce yourself and explain the procedure the patient.",
    CHECKLIST_BOILERPLATE.INTRO_EXPLAIN,
  ],
  [
    "Introduce yourself and identify the patient.",
    CHECKLIST_BOILERPLATE.INTRO_IDENTIFY,
  ],
  ["Provide privacy.", CHECKLIST_BOILERPLATE.PRIVACY],
  ["Provide for privacy.", CHECKLIST_BOILERPLATE.PRIVACY],
  ["Perform hand hygiene.", CHECKLIST_BOILERPLATE.HAND_HYGIENE],
  ["Perform proper hand hygiene.", CHECKLIST_BOILERPLATE.HAND_HYGIENE],
  ["Put on gloves.", CHECKLIST_BOILERPLATE.GLOVE_DON],
  ["Put on gloves", CHECKLIST_BOILERPLATE.GLOVE_DON],
  ["Put on clean gloves.", CHECKLIST_BOILERPLATE.GLOVE_DON],
  ["Put on clean gloves", CHECKLIST_BOILERPLATE.GLOVE_DON],
  ["Don clean gloves.", CHECKLIST_BOILERPLATE.GLOVE_DON],
  ["Remove gloves", CHECKLIST_BOILERPLATE.GLOVE_REMOVE],
  ["Remove gloves.", CHECKLIST_BOILERPLATE.GLOVE_REMOVE],
  [
    "Remove the gloves, turning them inside out.",
    CHECKLIST_BOILERPLATE.GLOVE_REMOVE,
  ],
  [
    "Remove the gloves and perform hand hygiene.",
    CHECKLIST_BOILERPLATE.GLOVE_REMOVE_THEN_HH,
  ],
  [
    "Place the call light or signaling device within reach of the patient.",
    CHECKLIST_BOILERPLATE.CALL_LIGHT,
  ],
  [
    "Leave the call light within reach of the patient.",
    CHECKLIST_BOILERPLATE.CALL_LIGHT,
  ],
  ["Ensure the bed is low and locked.", CHECKLIST_BOILERPLATE.BED_LOW],
  [
    "Get water and check water temperature for safety.",
    CHECKLIST_BOILERPLATE.WATER_CHECK,
  ],
  ["Check water for safe temperature", CHECKLIST_BOILERPLATE.WATER_CHECK],
  [
    "Remove gown patient and place in designated hamper",
    "Remove gown from the patient and place in the designated hamper.",
  ],
  [
    "Remove gown from the patient and place in designated hamper",
    "Remove gown from the patient and place in the designated hamper.",
  ],
  [
    "Beginning with eyes, using a damp washcloth without soup, clean the eyes from inner to outer aspect using different sides of the washcloth.",
    "Beginning with eyes, using a damp washcloth without soap, clean the eyes from inner to outer aspect using different sides of the washcloth.",
  ],
  [
    "Measure the amount of urine at the eye level with the container on flat surface",
    "Measure the amount of urine at eye level with the container on a flat surface.",
  ],
  [
    "Rinse the measuring container with water and empty it to the toilet",
    "Rinse the measuring container with water and empty it into the toilet.",
  ],
  [
    "Record the volume within plus or minus 25 mL of the actual volume",
    "Record the volume within plus or minus 25 mL of the actual volume.",
  ],
  [
    "Proceed to the arm, expose one arm and place dry towel underneath",
    "Proceed to the arm, expose one arm and place a dry towel underneath.",
  ],
  [
    "Assist the patient to put on a clean gown",
    "Assist the patient to put on a clean gown.",
  ],
  [
    "Place nonskid footwear on the patient",
    "Place nonskid footwear on the patient.",
  ],
  [
    "Allow the patient to sit and dangle on the edge of the bed before standing to ambulate",
    "Allow the patient to sit and dangle on the edge of the bed before standing to ambulate.",
  ],
  [
    "Document weight (plus/minus 2 lbs. or 0.9 kg)",
    "Document weight (plus/minus 2 lbs. or 0.9 kg).",
  ],
]);

/**
 * Normalize known boilerplate drift. Returns trimmed text.
 */
export function normalizeBoilerplateText(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) {
    return trimmed;
  }

  const exact = EXACT_REPLACEMENTS.get(trimmed);
  if (exact) {
    return exact;
  }

  if (
    /^Introduce yourself and explain the procedure to the patient\.?$/i.test(
      trimmed,
    )
  ) {
    return CHECKLIST_BOILERPLATE.INTRO_EXPLAIN;
  }
  if (/^Introduce yourself and identify the patient\.?$/i.test(trimmed)) {
    return CHECKLIST_BOILERPLATE.INTRO_IDENTIFY;
  }
  if (/^Provide (for )?(patient )?privacy\.?$/i.test(trimmed)) {
    return CHECKLIST_BOILERPLATE.PRIVACY;
  }
  if (/^Perform (proper )?hand hygiene\.?$/i.test(trimmed)) {
    return CHECKLIST_BOILERPLATE.HAND_HYGIENE;
  }
  if (
    /^(Put on clean gloves|Put on gloves|Don clean gloves)\.?$/i.test(trimmed)
  ) {
    return CHECKLIST_BOILERPLATE.GLOVE_DON;
  }
  if (/^Remove gloves\.?$/i.test(trimmed)) {
    return CHECKLIST_BOILERPLATE.GLOVE_REMOVE;
  }
  if (/^Remove the gloves, turning them inside out\.?$/i.test(trimmed)) {
    return CHECKLIST_BOILERPLATE.GLOVE_REMOVE;
  }
  if (
    /^Place the call light or signaling device within reach of the patient\.?$/i.test(
      trimmed,
    )
  ) {
    return CHECKLIST_BOILERPLATE.CALL_LIGHT;
  }
  if (/^Ensure the bed is low and locked\.?$/i.test(trimmed)) {
    return CHECKLIST_BOILERPLATE.BED_LOW;
  }
  if (/^Get water and check water temperature for safety\.?$/i.test(trimmed)) {
    return CHECKLIST_BOILERPLATE.WATER_CHECK;
  }

  return trimmed;
}

export function isCanonicalBoilerplate(text: string): boolean {
  const n = normalizeBoilerplateText(text);
  return Object.values(CHECKLIST_BOILERPLATE).includes(
    n as (typeof CHECKLIST_BOILERPLATE)[keyof typeof CHECKLIST_BOILERPLATE],
  );
}
