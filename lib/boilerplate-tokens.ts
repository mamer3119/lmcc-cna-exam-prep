import {
  resolveStepDisplayText,
  type ChecklistStep,
} from "@/lib/checklist-step";

import type { BoilerplateTokenId } from "@/lib/practice-labels";
import { BOILERPLATE_TOKEN_REGISTRY } from "@/lib/practice-labels";

/** Primary registry token — first segment before `|` (composites included). */
export function resolveRegistryTokenId(
  boilerplateId: string | undefined,
): BoilerplateTokenId | null {
  if (!boilerplateId) {
    return null;
  }
  const primary = boilerplateId.split("|")[0]?.trim();
  if (primary && primary in BOILERPLATE_TOKEN_REGISTRY) {
    return primary as BoilerplateTokenId;
  }
  return null;
}

export function getRegistryWording(tokenId: BoilerplateTokenId): string {
  return BOILERPLATE_TOKEN_REGISTRY[tokenId].wording;
}

export function stepWordingMatchesRegistry(
  step: ChecklistStep,
  slug?: string,
): boolean {
  const tokenId = resolveRegistryTokenId(step.boilerplateId);
  if (!tokenId) {
    return true;
  }
  const canonical = BOILERPLATE_TOKEN_REGISTRY[tokenId].wording;
  const official =
    step.detailedText?.trim() || resolveStepDisplayText(step, { slug }).trim();
  return official === canonical;
}

export function shouldRenderBoilerplateChip(
  step: ChecklistStep,
  slug?: string,
): boolean {
  const tokenId = resolveRegistryTokenId(step.boilerplateId);
  if (!tokenId) {
    return false;
  }
  if (stepWordingMatchesRegistry(step, slug)) {
    return true;
  }
  /** Tagged steps show token chip even when cue text differs from registry prose. */
  return true;
}
