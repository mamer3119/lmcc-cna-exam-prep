import type { ChecklistStep } from "@/lib/checklist-step";
import {
  BOILERPLATE_TOKEN_REGISTRY,
  type BoilerplateTokenId,
} from "@/lib/practice-labels";
import { resolveRegistryTokenId } from "@/lib/boilerplate-tokens";
import { resolveStepRendersAs } from "@/lib/skill-step-meta";

/** Phase segment circles from boilerplate_tags.json — not shown in UI chips. */
const PHASE_CIRCLE_PREFIX = /^[🟢🔵🔴]+/u;

/** Strip open/core/close circle prefixes; keep meaningful emoji only. */
export function stripPhaseCirclePrefix(rendersAs: string): string {
  return rendersAs.replace(PHASE_CIRCLE_PREFIX, "").trim();
}

export function resolveStepDisplayEmoji(step: ChecklistStep): string | null {
  const raw = resolveStepRendersAs(step);
  if (raw) {
    const stripped = stripPhaseCirclePrefix(raw);
    if (stripped) {
      return stripped;
    }
  }

  const tokenId = resolveRegistryTokenId(step.boilerplateId);
  if (tokenId) {
    return BOILERPLATE_TOKEN_REGISTRY[tokenId].emoji;
  }

  return null;
}

export function registryDisplayEmoji(
  tokenId: BoilerplateTokenId,
): string | null {
  return BOILERPLATE_TOKEN_REGISTRY[tokenId].emoji;
}
