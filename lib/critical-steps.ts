export type CriticalStepCategory =
  | "hand-hygiene"
  | "identification"
  | "privacy"
  | "bed-call-light";

const IDENTIFICATION_PATTERN =
  /introduce yourself and identify|introduce and identify|identify the patient|verify the patient'?s identity using two identifiers/i;

const HAND_HYGIENE_PATTERN =
  /^perform (proper )?hand hygiene|^perform hand hygiene using the six-step technique|^wash hands$/i;

const PRIVACY_PATTERN =
  /provide (for )?(patient )?privacy|cover.*privacy|wait nearby allowing for patient privacy/i;

const BED_CALL_LIGHT_PATTERN =
  /ensure the bed is low|bed in low position|lowest position|bed brakes are locked|lower the head of the bed|place the call light|leave the call light|call lights within reach|call light within reach|signaling device|call light;\s*bed low and locked/i;

export function getCriticalStepCategory(
  text: string,
): CriticalStepCategory | null {
  const normalized = text.trim();
  if (!normalized) {
    return null;
  }
  if (HAND_HYGIENE_PATTERN.test(normalized)) {
    return "hand-hygiene";
  }
  if (IDENTIFICATION_PATTERN.test(normalized)) {
    return "identification";
  }
  if (PRIVACY_PATTERN.test(normalized)) {
    return "privacy";
  }
  if (BED_CALL_LIGHT_PATTERN.test(normalized)) {
    return "bed-call-light";
  }
  return null;
}

export function isCriticalStepText(text: string): boolean {
  return getCriticalStepCategory(text) !== null;
}

export function criticalStepBadgeLabel(text: string): string | null {
  const category = getCriticalStepCategory(text);
  if (!category) {
    return null;
  }
  return "⚠️ Critical";
}
