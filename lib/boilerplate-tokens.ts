import {
  isCompositeBoilerplateId,
  resolveStepDisplayText,
  type ChecklistStep,
} from "@/lib/checklist-step";

import type { BoilerplateTokenId } from "@/lib/practice-labels";
import { BOILERPLATE_TOKEN_REGISTRY } from "@/lib/practice-labels";

export function resolveRegistryTokenId(
  boilerplateId: string | undefined,
): BoilerplateTokenId | null {
  if (!boilerplateId || isCompositeBoilerplateId(boilerplateId)) {
    return null;
  }
  if (boilerplateId in BOILERPLATE_TOKEN_REGISTRY) {
    return boilerplateId as BoilerplateTokenId;
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
    step.detailedText?.trim() ||
    resolveStepDisplayText(step, { slug }).trim();
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
  return stepWordingMatchesRegistry(step, slug);
}
